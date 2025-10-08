import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { ApiResponse } from '../utils/api_response';
import asyncHandler from '../utils/async_handler';
import { UserRole, UserStatus } from '../models/user';

export class UserController {
  getAllUsers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page = '1', limit = '20', role, status } = req.query;

    const result = await userService.getAllUsers(
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      role as UserRole,
      status as UserStatus
    );

    return ApiResponse.paginated(
      res,
      result.users,
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      result.total,
      'Users retrieved successfully'
    );
  });

  getUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.getUserById(req.params.id);
    return ApiResponse.success(res, { user }, 'User retrieved successfully');
  });

  updateUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.updateUser(req.params.id, req.body);
    return ApiResponse.success(res, { user }, 'User updated successfully');
  });

  blockUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.blockUser(req.params.id, req.user!.userId);
    return ApiResponse.success(res, { user }, 'User blocked successfully');
  });

  unblockUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.unblockUser(req.params.id, req.user!.userId);
    return ApiResponse.success(res, { user }, 'User unblocked successfully');
  });

  deleteUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await userService.deleteUser(req.params.id);
    return ApiResponse.success(res, null, 'User deleted successfully');
  });
}

export default new UserController();
