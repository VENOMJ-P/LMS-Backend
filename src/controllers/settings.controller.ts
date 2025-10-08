import { Request, Response } from 'express';
import settingsService from '../services/settings.service';
import { ApiResponse } from '../utils/api_response';
import asyncHandler from '../utils/async_handler';

export class SettingsController {
  getSettings = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.getSettings();
    return ApiResponse.success(res, { settings }, 'Settings retrieved successfully');
  });

  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.updateSettings(req.body);
    return ApiResponse.success(res, { settings }, 'Settings updated successfully');
  });
}

export default new SettingsController();
