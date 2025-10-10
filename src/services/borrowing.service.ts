import {
  Borrowing,
  BorrowingStatus,
  BorrowType,
  DamageLevel,
  IBorrowing
} from '../models/borrowing';
import { Book } from '../models/book';
import { User, UserRole } from '../models/user';
import { Group, GroupStatus } from '../models/group';
import { Fine, FineType } from '../models/fine';
import { Settings } from '../models/settings';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/Error';
import { sendNotification } from '../utils/notifications';
import logger from '../utils/logger';
import { NotificationType } from '../models/notification';
import { Types } from 'mongoose';

interface BorrowingData {
  bookId: string;
  borrowType: BorrowType;
  groupId?: string;
}

type ObjectId = Types.ObjectId;

export class BorrowingService {
  async createBorrowing(data: BorrowingData, userId: string): Promise<IBorrowing> {
    const settings = (await Settings.findOne()) || new Settings();
    const book = await Book.findById(data.bookId);
    if (!book || book.isDeleted) throw new NotFoundError('Book not found');
    if (book.availableCopies < 1) throw new BadRequestError('No copies available');

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    // Validate borrowing limits
    if (data.borrowType === BorrowType.INDIVIDUAL) {
      console.log(user.currentBorrowings.length, settings.maxBooksPerUser);
      if (user.currentBorrowings.length >= settings.maxBooksPerUser) {
        throw new BadRequestError('Borrowing limit reached');
      }
    } else {
      const group = await Group.findById(data.groupId);
      if (!group || group.status !== GroupStatus.APPROVED)
        throw new BadRequestError('Invalid or unapproved group');
      if (group.leader.toString() !== userId)
        throw new ForbiddenError('Only group leader can borrow');
      if (group.currentBorrowing)
        throw new BadRequestError('Group already has an active borrowing');
    }

    // Calculate due date
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(
      borrowDate.getDate() +
        (data.borrowType === BorrowType.INDIVIDUAL
          ? settings.individualBorrowDays
          : settings.groupBorrowDays)
    );

    const borrowing = await Borrowing.create({
      book: data.bookId,
      borrower: data.borrowType === BorrowType.INDIVIDUAL ? userId : undefined,
      group: data.borrowType === BorrowType.GROUP ? data.groupId : undefined,
      borrowType: data.borrowType,
      borrowDate,
      dueDate,
      status: BorrowingStatus.BORROWED
    });

    // Update related models
    book.availableCopies -= 1;
    await book.save();

    if (data.borrowType === BorrowType.INDIVIDUAL) {
      user.currentBorrowings.push(borrowing._id as ObjectId);
      user.borrowingHistory.push(borrowing._id as ObjectId);
      await user.save();
    } else {
      const group = await Group.findById(data.groupId);
      group!.currentBorrowing = borrowing._id as ObjectId;
      await group!.save();
    }

    await sendNotification(
      user,
      'Book Borrowed',
      `You have borrowed "${book.title}". Due date: ${dueDate.toDateString()}`,
      NotificationType.INFO
    );
    logger.info(`Book borrowed: ${book.title} by ${user.email}`);
    return borrowing;
  }

  async getBorrowings(
    page: number,
    limit: number,
    status?: string,
    borrowType?: string,
    userId?: string
  ): Promise<{ borrowings: IBorrowing[]; total: number }> {
    const filter: any = {};
    if (status) filter.status = status;
    if (borrowType) filter.borrowType = borrowType;
    if (userId) {
      filter.$or = [
        { borrower: userId },
        { group: { $in: await Group.find({ members: userId }).distinct('_id') } }
      ];
    }

    const skip = (page - 1) * limit;
    const [borrowings, total] = await Promise.all([
      Borrowing.find(filter)
        .populate('book borrower group')
        .skip(skip)
        .limit(limit)
        .sort({ borrowDate: -1 }),
      Borrowing.countDocuments(filter)
    ]);
    return { borrowings, total };
  }

  async getBorrowing(id: string, userId: string, role: UserRole): Promise<IBorrowing> {
    const borrowing = await Borrowing.findById(id).populate('book borrower group');
    if (!borrowing) throw new NotFoundError('Borrowing not found');
    if (role !== UserRole.ADMIN) {
      const group = await Group.findOne({ _id: borrowing.group, members: userId });
      if (!borrowing.borrower?.equals(userId) && !group) throw new ForbiddenError('Access denied');
    }
    return borrowing;
  }

  async returnBook(
    id: string,
    userId: string,
    role: UserRole,
    damageLevel?: DamageLevel
  ): Promise<IBorrowing> {
    const borrowing = await Borrowing.findById(id).populate('book');
    if (!borrowing) throw new NotFoundError('Borrowing not found');

    if (role !== UserRole.ADMIN) {
      const group = await Group.findOne({ _id: borrowing.group, leader: userId });
      if (!borrowing.borrower?.equals(userId) && !group) throw new ForbiddenError('Access denied');
    }

    if (borrowing.status === BorrowingStatus.RETURNED)
      throw new BadRequestError('Book already returned');

    const book = borrowing.book as any;
    const settings = (await Settings.findOne()) || new Settings();
    borrowing.status = BorrowingStatus.RETURNED;
    borrowing.returnDate = new Date();
    if (damageLevel) borrowing.damageLevel = damageLevel;

    // Calculate fines
    let totalFine = 0;
    const fineType = FineType.LATE;
    let damageFine = 0;
    if (damageLevel === DamageLevel.MINOR) damageFine = book.price * 0.5;
    if (damageLevel === DamageLevel.MAJOR) damageFine = book.price;

    if (borrowing.dueDate < new Date()) {
      const daysLate = Math.ceil(
        (new Date().getTime() - borrowing.dueDate.getTime()) / (1000 * 3600 * 24)
      );
      totalFine += daysLate * settings.lateFeePerDay;
    }

    if (damageFine > 0) totalFine += damageFine;

    if (totalFine > 0) {
      const fine = await Fine.create({
        borrowing: borrowing._id,
        user: borrowing.borrower || (await Group.findById(borrowing.group))?.leader,
        fineType,
        lateFee: totalFine - damageFine,
        damageFine,
        totalFine,
        daysLate:
          borrowing.dueDate < new Date()
            ? Math.ceil((new Date().getTime() - borrowing.dueDate.getTime()) / (1000 * 3600 * 24))
            : 0
      });
      borrowing.fine = fine._id as ObjectId;
      const user = await User.findById(
        borrowing.borrower || (await Group.findById(borrowing.group))?.leader
      );
      user!.fines.push(fine._id as ObjectId);
      await user!.save();
      await sendNotification(
        user!,
        'Book Returned with Fine',
        `Book "${book.title}" returned. Fine: ₹${totalFine}`,
        NotificationType.WARNING
      );
    } else {
      await sendNotification(
        await User.findById(borrowing.borrower || (await Group.findById(borrowing.group))?.leader),
        'Book Returned',
        `Book "${book.title}" returned successfully`,
        NotificationType.INFO
      );
    }

    book.availableCopies += 1;
    await book.save();

    if (borrowing.borrowType === BorrowType.INDIVIDUAL) {
      const user = await User.findById(borrowing.borrower);
      user!.currentBorrowings = user!.currentBorrowings.filter(
        b => !b.equals(borrowing._id as ObjectId)
      );
      await user!.save();
    } else {
      const group = await Group.findById(borrowing.group);
      group!.currentBorrowing = undefined;
      await group!.save();
    }

    await borrowing.save();
    logger.info(`Book returned: ${book.title} by ${userId}`);
    return borrowing;
  }

  async extendDeadline(id: string, newDueDate: string): Promise<IBorrowing> {
    const borrowing = await Borrowing.findById(id);
    if (!borrowing) throw new NotFoundError('Borrowing not found');
    if (borrowing.status !== BorrowingStatus.BORROWED)
      throw new BadRequestError('Cannot extend non-active borrowing');
    const dueDate = new Date(newDueDate);
    if (dueDate <= borrowing.dueDate)
      throw new BadRequestError('New due date must be later than current');
    borrowing.dueDate = dueDate;
    await borrowing.save();
    const user = await User.findById(
      borrowing.borrower || (await Group.findById(borrowing.group))?.leader
    );
    await sendNotification(
      user!,
      'Borrowing Extended',
      `Due date for "${(await Book.findById(borrowing.book))?.title}" extended to ${dueDate.toDateString()}`,
      NotificationType.INFO
    );
    return borrowing;
  }

  async markAsLost(id: string, adminId: string): Promise<IBorrowing> {
    const borrowing = await Borrowing.findById(id).populate('book');
    if (!borrowing) throw new NotFoundError('Borrowing not found');
    if (borrowing.status === BorrowingStatus.LOST)
      throw new BadRequestError('Book already marked as lost');

    const settings = (await Settings.findOne()) || new Settings();
    const book = borrowing.book as any;
    borrowing.status = BorrowingStatus.LOST;

    const fine = await Fine.create({
      borrowing: borrowing._id,
      user: borrowing.borrower || (await Group.findById(borrowing.group))?.leader,
      fineType: FineType.MISSING,
      missingFine: book.price * settings.missingFineMultiplier,
      totalFine: book.price * settings.missingFineMultiplier
    });

    book.availableCopies -= 1;
    book.totalCopies -= 1;
    await book.save();

    const user = await User.findById(
      borrowing.borrower || (await Group.findById(borrowing.group))?.leader
    );
    user!.fines.push(fine._id as ObjectId);
    user!.currentBorrowings = user!.currentBorrowings.filter(
      b => !b.equals(borrowing._id as ObjectId)
    );
    await user!.save();

    if (borrowing.group) {
      const group = await Group.findById(borrowing.group);
      group!.currentBorrowing = undefined;
      await group!.save();
    }

    borrowing.fine = fine._id as ObjectId;
    await borrowing.save();

    await sendNotification(
      user!,
      'Book Lost',
      `Book "${book.title}" marked as lost. Fine: ₹${fine.totalFine}`,
      NotificationType.ERROR
    );
    logger.info(`Book marked as lost: ${book.title} by admin ${adminId}`);
    return borrowing;
  }
}

export default new BorrowingService();
