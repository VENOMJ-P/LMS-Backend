import { Request, Response } from 'express';
import groupService from '../services/group.service';
import { ApiResponse } from '../utils/api_response';
import asyncHandler from '../utils/async_handler';
import { UserRole } from '../models/user';

export class GroupController {
  createGroup = asyncHandler(async (req: Request, res: Response) => {
    const group = await groupService.createGroup(req.body, req.user!.userId);
    return ApiResponse.success(res, { group }, 'Group created successfully', 201);
  });

  getGroups = asyncHandler(async (req: Request, res: Response) => {
    const { page = '1', limit = '20', status } = req.query;
    const result = await groupService.getGroups(
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      status as string,
      req.user!.role === 'admin' ? undefined : req.user!.userId
    );
    return ApiResponse.paginated(
      res,
      result.groups,
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      result.total,
      'Groups retrieved successfully'
    );
  });

  getGroup = asyncHandler(async (req: Request, res: Response) => {
    const group = await groupService.getGroup(
      req.params.id,
      req.user!.userId,
      req.user!.role as UserRole
    );
    return ApiResponse.success(res, { group }, 'Group retrieved successfully');
  });

  updateGroup = asyncHandler(async (req: Request, res: Response) => {
    const group = await groupService.updateGroup(
      req.params.id,
      req.body,
      req.user!.userId,
      req.user!.role as UserRole
    );
    return ApiResponse.success(res, { group }, 'Group updated successfully');
  });

  approveGroup = asyncHandler(async (req: Request, res: Response) => {
    const group = await groupService.approveGroup(req.params.id);
    return ApiResponse.success(res, { group }, 'Group approved successfully');
  });

  rejectGroup = asyncHandler(async (req: Request, res: Response) => {
    const group = await groupService.rejectGroup(req.params.id);
    return ApiResponse.success(res, { group }, 'Group rejected successfully');
  });

  dissolveGroup = asyncHandler(async (req: Request, res: Response) => {
    await groupService.dissolveGroup(req.params.id);
    return ApiResponse.success(res, null, 'Group dissolved successfully');
  });
}

export default new GroupController();
