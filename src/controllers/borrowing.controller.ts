import { Request, Response } from 'express';
import borrowingService from '../services/borrowing.service';
import { ApiResponse } from '../utils/api_response';
import asyncHandler from '../utils/async_handler';
import { UserRole } from '../models/user';

export class BorrowingController {
  // Create a new borrowing (individual or group)(individual or group)
  createBorrowing = asyncHandler(async (req: Request, res: Response) => {
    const borrowing = await borrowingService.createBorrowing(req.body, req.user!.userId);
    return ApiResponse.success(res, { borrowing }, 'Book borrowed successfully', 201);
  });

  getBorrowings = asyncHandler(async (req: Request, res: Response) => {
    const { page = '1', limit = '20', status, borrowType } = req.query;
    const result = await borrowingService.getBorrowings(
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      status as string,
      borrowType as string,
      req.user!.role === UserRole.ADMIN ? undefined : req.user!.userId
    );
    return ApiResponse.paginated(
      res,
      result.borrowings,
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      result.total,
      'Borrowings retrieved successfully'
    );
  });

  getBorrowing = asyncHandler(async (req: Request, res: Response) => {
    const borrowing = await borrowingService.getBorrowing(
      req.params.id,
      req.user!.userId,
      req.user!.role as UserRole
    );
    return ApiResponse.success(res, { borrowing }, 'Borrowing retrieved successfully');
  });

  // Return a borrowed book (admin or user)
  returnBook = asyncHandler(async (req: Request, res: Response) => {
    const { damageLevel } = req.body;
    const borrowing = await borrowingService.returnBook(
      req.params.id,
      req.user!.userId,
      req.user!.role as UserRole,
      damageLevel
    );
    return ApiResponse.success(res, { borrowing }, 'Book returned successfully');
  });

  // Extend borrowing deadline (admin only)
  extendDeadline = asyncHandler(async (req: Request, res: Response) => {
    const { newDueDate } = req.body;
    const borrowing = await borrowingService.extendDeadline(req.params.id, newDueDate);
    return ApiResponse.success(res, { borrowing }, 'Deadline extended successfully');
  });

  // Mark book as lost (admin only)
  markAsLost = asyncHandler(async (req: Request, res: Response) => {
    const borrowing = await borrowingService.markAsLost(req.params.id, req.user!.userId);
    return ApiResponse.success(res, { borrowing }, 'Book marked as lost');
  });
}

export default new BorrowingController();
