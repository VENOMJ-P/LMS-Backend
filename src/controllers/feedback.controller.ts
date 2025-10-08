import { Request, Response } from 'express';
import feedbackService from '../services/feedback.service';
import { ApiResponse } from '../utils/api_response';
import asyncHandler from '../utils/async_handler';
import { UserRole } from '../models/user';

export class FeedbackController {
  createFeedback = asyncHandler(async (req: Request, res: Response) => {
    const imageUrl = req.file ? req.file.path : undefined;
    const feedback = await feedbackService.createFeedback(
      { ...req.body, image: imageUrl },
      req.user!.userId
    );
    return ApiResponse.success(res, { feedback }, 'Feedback submitted successfully', 201);
  });

  getFeedbacks = asyncHandler(async (req: Request, res: Response) => {
    const { page = '1', limit = '20', bookId } = req.query;
    const result = await feedbackService.getFeedbacks(
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      bookId as string
    );
    return ApiResponse.paginated(
      res,
      result.feedbacks,
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      result.total,
      'Feedbacks retrieved successfully'
    );
  });

  getFeedback = asyncHandler(async (req: Request, res: Response) => {
    const feedback = await feedbackService.getFeedback(
      req.params.id,
      req.user!.userId,
      req.user!.role as UserRole
    );
    return ApiResponse.success(res, { feedback }, 'Feedback retrieved successfully');
  });

  deleteFeedback = asyncHandler(async (req: Request, res: Response) => {
    await feedbackService.deleteFeedback(
      req.params.id,
      req.user!.userId,
      req.user!.role as UserRole
    );
    return ApiResponse.success(res, null, 'Feedback deleted successfully');
  });

  getFeedbackAnalytics = asyncHandler(async (_req: Request, res: Response) => {
    const analytics = await feedbackService.getFeedbackAnalytics();
    return ApiResponse.success(res, { analytics }, 'Feedback analytics retrieved successfully');
  });
}

export default new FeedbackController();
