import cron from 'node-cron';
import { Borrowing, BorrowingStatus } from '../models/borrowing';
import { Fine, FineType } from '../models/fine';
import { Settings } from '../models/settings';
import { User } from '../models/user';
import { sendNotification } from '../utils/notifications';
import logger from '../utils/logger';
import { NotificationType } from '../models/notification';
import { IBook } from '../models/book';
import { Group } from '../models/group';
import { Types } from 'mongoose';

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('Running overdue check job');
    const settings = (await Settings.findOne()) || new Settings();
    const now = new Date();

    const overdueBorrowings = await Borrowing.find({
      status: BorrowingStatus.BORROWED,
      dueDate: { $lt: now }
    }).populate<{ book: IBook }>('book');

    for (const borrowing of overdueBorrowings) {
      borrowing.status = BorrowingStatus.OVERDUE;
      await borrowing.save();

      let user;
      if (borrowing.borrowType === 'individual') {
        user = await User.findById(borrowing.borrower);
      } else {
        const group = await Group.findById(borrowing.group);
        user = await User.findById(group?.leader);
      }

      if (!user) continue;

      // Create or update fine
      let fine = await Fine.findOne({ borrowing: borrowing._id });
      if (!fine) {
        fine = new Fine({
          borrowing: borrowing._id,
          user: user._id,
          fineType: FineType.LATE,
          lateFee: 0,
          totalFine: 0
        });
      }

      const daysLate = Math.ceil(
        (now.getTime() - borrowing.dueDate.getTime()) / (1000 * 3600 * 24)
      );
      fine.daysLate = daysLate;
      fine.lateFee = daysLate * settings.lateFeePerDay;
      fine.totalFine = fine.lateFee + (fine.damageFine || 0) + (fine.missingFine || 0);
      await fine.save();

      borrowing.fine = fine._id as Types.ObjectId;
      await borrowing.save();

      if (!user.fines.includes(fine._id as Types.ObjectId)) {
        user.fines.push(fine._id as Types.ObjectId);
        await user.save();
      }

      // Notify
      await sendNotification(
        user,
        'Overdue Book',
        `Your borrowing of ${borrowing.book?.title} is overdue by ${daysLate} days. Fine: ₹${fine.totalFine}`,
        NotificationType.WARNING
      );
    }

    logger.info('Overdue check completed');
  } catch (error) {
    logger.error('Overdue job failed:', error);
  }
});

// Reminder cron: run daily for reminders 3 days before due
cron.schedule('0 9 * * *', async () => {
  try {
    logger.info('Running reminder job');
    // const settings = (await Settings.findOne()) || new Settings();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const upcomingDue = await Borrowing.find({
      status: BorrowingStatus.BORROWED,
      dueDate: { $lte: threeDaysFromNow, $gt: new Date() }
    }).populate<{ book: IBook }>('book');

    for (const borrowing of upcomingDue) {
      let user;
      if (borrowing.borrowType === 'individual') {
        user = await User.findById(borrowing.borrower);
      } else {
        const group = await Group.findById(borrowing.group);
        user = await User.findById(group?.leader);
      }

      if (!user) continue;

      const daysLeft = Math.ceil(
        (borrowing.dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
      );
      await sendNotification(
        user,
        'Borrowing Reminder',
        `Your borrowing of ${borrowing.book.title} is due in ${daysLeft} days.`,
        NotificationType.INFO
      );
    }

    logger.info('Reminder job completed');
  } catch (error) {
    logger.error('Reminder job failed:', error);
  }
});

// Daily late fee update for overdue
cron.schedule('0 1 * * *', async () => {
  try {
    logger.info('Running late fee update job');
    const settings = (await Settings.findOne()) || new Settings();

    const overdueFines = await Fine.find({
      fineType: FineType.LATE,
      isPaid: false
    }).populate('borrowing');

    for (const fine of overdueFines) {
      const borrowing = fine.borrowing as any;
      if (borrowing.status !== BorrowingStatus.OVERDUE) continue;

      const now = new Date();
      const daysLate = Math.ceil(
        (now.getTime() - borrowing.dueDate.getTime()) / (1000 * 3600 * 24)
      );
      fine.daysLate = daysLate;
      fine.lateFee = daysLate * settings.lateFeePerDay;
      fine.totalFine = fine.lateFee + (fine.damageFine || 0) + (fine.missingFine || 0);
      await fine.save();

      const user = await User.findById(fine.user);
      if (user) {
        await sendNotification(
          user,
          'Updated Fine',
          `Your fine for ${borrowing.book.title} has been updated to ₹${fine.totalFine}.`,
          NotificationType.WARNING
        );
      }
    }

    logger.info('Late fee update completed');
  } catch (error) {
    logger.error('Late fee update job failed:', error);
  }
});
