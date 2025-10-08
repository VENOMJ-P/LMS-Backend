import cron from 'node-cron';
import { MongoClient } from 'mongodb';
import { config } from '../configs';
import logger from '../utils/logger';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import Borrowing from '../models/borrowing';
import Fine from '../models/fine';
import Notification from '../models/notification';

// Run weekly backup on Sunday at 2 AM
cron.schedule('0 2 * * 0', async () => {
  try {
    logger.info('Running database backup job');
    const client = new MongoClient(config.mongodb.uri);
    await client.connect();
    const db = client.db();

    const collections = await db.listCollections().toArray();
    const backup: any = {};

    for (const collection of collections) {
      const data = await db.collection(collection.name).find().toArray();
      backup[collection.name] = data;
    }

    const backupFile = `backup_${new Date().toISOString().replace(/:/g, '-')}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(backupFile, {
      resource_type: 'raw',
      folder: 'lms_backups'
    });

    fs.unlinkSync(backupFile);
    logger.info(`Backup completed and uploaded: ${result.secure_url}`);
    await client.close();
  } catch (error) {
    logger.error('Backup job failed:', error);
  }
});

// Cleanup old records (older than 1 year) - run monthly
cron.schedule('0 0 1 * *', async () => {
  try {
    logger.info('Running cleanup job');
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    await Borrowing.deleteMany({ returnDate: { $lt: oneYearAgo } });
    await Fine.deleteMany({ paidDate: { $lt: oneYearAgo } });
    await Notification.deleteMany({ createdAt: { $lt: oneYearAgo }, isRead: true });

    logger.info('Cleanup job completed');
  } catch (error) {
    logger.error('Cleanup job failed:', error);
  }
});
