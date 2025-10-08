import connectDatabase from '../configs/database';
import { User, UserRole } from '../models/user';
import { Book } from '../models/book';
import { Group } from '../models/group';
import { Settings } from '../models/settings';
import logger from '../utils/logger';

async function seed() {
  await connectDatabase();

  await Settings.create({});

  await User.create({
    email: 'jay63837@gmail.com',
    password: 'admin123',
    fullName: 'Jay Prakash',
    role: UserRole.ADMIN
  });

  await User.create({
    email: 'xjay63837@gmail.com',
    password: 'user123',
    fullName: 'Jay Prakash'
  });

  await Book.create({
    title: 'The White Tiger',
    author: 'Aravind Adiga',
    category: 'Fiction',
    ISBN: '1234567890',
    price: 100
  });

  const leader = await User.findOne({ email: 'xjay63837@gmail.com' });
  await Group.create({
    name: 'Sample Group',
    leader: leader?._id,
    members: [leader?._id],
    status: 'approved'
  });

  logger.info('Seed data inserted');
  process.exit(0);
}

seed().catch(error => {
  logger.error('Seed failed:', error);
  process.exit(1);
});
