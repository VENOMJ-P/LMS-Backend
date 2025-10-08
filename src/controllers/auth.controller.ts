import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { ApiResponse } from '../utils/api_response';
import asyncHandler from '../utils/async_handler';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { user, tokens } = await authService.register(req.body);

    return ApiResponse.success(res, { user, tokens }, 'User registered successfully', 201);
  });

  login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { user, tokens } = await authService.login(req.body);

    return ApiResponse.success(res, { user, tokens }, 'Login successful');
  });

  refreshToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);

    return ApiResponse.success(res, { tokens }, 'Token refreshed successfully');
  });

  logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await authService.logout(req.user!.userId);

    return ApiResponse.success(res, null, 'Logout successful');
  });

  changePassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.userId, currentPassword, newPassword);

    return ApiResponse.success(res, null, 'Password changed successfully');
  });

  getProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    return ApiResponse.success(res, { user: req.user }, 'Profile retrieved successfully');
  });
}

export default new AuthController();
