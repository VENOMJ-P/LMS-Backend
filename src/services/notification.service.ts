import { Notification, INotification } from '../models/notification';
import { NotFoundError, ForbiddenError } from '../utils/Error';
import logger from '../utils/logger';

export class NotificationService {
  async getNotifications(
    page: number,
    limit: number,
    userId: string,
    isRead?: boolean
  ): Promise<{ notifications: INotification[]; total: number }> {
    const filter: any = { user: userId };
    if (isRead !== undefined) filter.isRead = isRead;

    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      Notification.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Notification.countDocuments(filter)
    ]);
    return { notifications, total };
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    const notification = await Notification.findById(id);
    if (!notification) throw new NotFoundError('Notification not found');
    if (!notification.user.equals(userId)) throw new ForbiddenError('Access denied');

    notification.isRead = true;
    await notification.save();
    logger.info(`Notification marked as read: ${id} by ${userId}`);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    logger.info(`All notifications marked as read for user: ${userId}`);
  }
}

export default new NotificationService();
