import { Request, Response } from 'express';
import notificationService from '../services/notification.service';
import { ApiResponse } from '../utils/api_response';
import asyncHandler from '../utils/async_handler';

export class NotificationController {
  getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const { page = '1', limit = '20', isRead } = req.query;
    const result = await notificationService.getNotifications(
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      req.user!.userId,
      isRead ? isRead === 'true' : undefined
    );
    return ApiResponse.paginated(
      res,
      result.notifications,
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      result.total,
      'Notifications retrieved successfully'
    );
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAsRead(req.params.id, req.user!.userId);
    return ApiResponse.success(res, null, 'Notification marked as read');
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllAsRead(req.user!.userId);
    return ApiResponse.success(res, null, 'All notifications marked as read');
  });
}

export default new NotificationController();
