import { Feedback, IFeedback } from '../models/feedback';
import { User, UserRole } from '../models/user';
import { Book } from '../models/book';
import { NotFoundError, ForbiddenError } from '../utils/Error';
import { sendNotification } from '../utils/notifications';
import logger from '../utils/logger';
import { NotificationType } from '../models/notification';

interface FeedbackData {
  bookId: string;
  title: string;
  comment: string;
  rating: number;
  image?: string;
}

export class FeedbackService {
  async createFeedback(data: FeedbackData, userId: string): Promise<IFeedback> {
    const book = await Book.findById(data.bookId);
    if (!book || book.isDeleted) throw new NotFoundError('Book not found');

    const feedback = await Feedback.create({
      user: userId,
      book: data.bookId,
      title: data.title,
      comment: data.comment,
      rating: Number(data.rating),
      image: data.image
    });

    await sendNotification(
      await User.findById(userId),
      'Feedback Submitted',
      `Your feedback for "${book.title}" has been submitted`,
      NotificationType.INFO
    );
    logger.info(`Feedback created for book ${data.bookId} by ${userId}`);
    return feedback;
  }

  async getFeedbacks(
    page: number,
    limit: number,
    bookId?: string
  ): Promise<{ feedbacks: IFeedback[]; total: number }> {
    const filter: any = {};
    if (bookId) filter.book = bookId;

    const skip = (page - 1) * limit;
    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter).populate('user book').skip(skip).limit(limit).sort({ createdAt: -1 }),
      Feedback.countDocuments(filter)
    ]);
    return { feedbacks, total };
  }

  async getFeedback(id: string, userId: string, role: UserRole): Promise<IFeedback> {
    const feedback = await Feedback.findById(id).populate('user book');
    if (!feedback) throw new NotFoundError('Feedback not found');
    if (role !== UserRole.ADMIN && !feedback.user.equals(userId))
      throw new ForbiddenError('Access denied');
    return feedback;
  }

  async deleteFeedback(id: string, userId: string, role: UserRole): Promise<void> {
    const feedback = await Feedback.findById(id).populate('user book');
    if (!feedback) throw new NotFoundError('Feedback not found');
    if (role !== UserRole.ADMIN && !feedback.user.equals(userId))
      throw new ForbiddenError('Access denied');

    await Feedback.findByIdAndDelete(id);
    await sendNotification(
      feedback.user as any,
      'Feedback Deleted',
      `Your feedback for "${(feedback.book as any).title}" has been deleted`,
      NotificationType.WARNING
    );
    logger.info(`Feedback deleted: ${id} by ${userId}`);
  }

  async getFeedbackAnalytics(): Promise<any> {
    const averageRatings = await Feedback.aggregate([
      { $group: { _id: '$book', averageRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $project: { bookTitle: '$book.title', averageRating: 1, count: 1 } }
    ]);

    return averageRatings;
  }
}

export default new FeedbackService();
