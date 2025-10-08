import { Request, Response } from 'express';
import fineService from '../services/fine.service';
import { ApiResponse } from '../utils/api_response';
import asyncHandler from '../utils/async_handler';
import { UserRole } from '../models/user';

export class FineController {
  getFines = asyncHandler(async (req: Request, res: Response) => {
    const { page = '1', limit = '20', isPaid } = req.query;
    const result = await fineService.getFines(
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      isPaid ? isPaid === 'true' : undefined,
      req.user!.role === 'admin' ? undefined : req.user!.userId
    );
    return ApiResponse.paginated(
      res,
      result.fines,
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      result.total,
      'Fines retrieved successfully'
    );
  });

  getFine = asyncHandler(async (req: Request, res: Response) => {
    const fine = await fineService.getFine(
      req.params.id,
      req.user!.userId,
      req.user!.role as UserRole
    );
    return ApiResponse.success(res, { fine }, 'Fine retrieved successfully');
  });

  payFine = asyncHandler(async (req: Request, res: Response) => {
    const fine = await fineService.payFine(
      req.params.id,
      req.user!.userId,
      req.user!.role as UserRole
    );
    return ApiResponse.success(res, { fine }, 'Fine paid successfully');
  });

  waiveFine = asyncHandler(async (req: Request, res: Response) => {
    const fine = await fineService.waiveFine(req.params.id);
    return ApiResponse.success(res, { fine }, 'Fine waived successfully');
  });

  updateFine = asyncHandler(async (req: Request, res: Response) => {
    const fine = await fineService.updateFine(req.params.id, req.body);
    return ApiResponse.success(res, { fine }, 'Fine updated successfully');
  });
}

export default new FineController();
