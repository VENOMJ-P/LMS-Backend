import { Request, Response } from 'express';
import reportService from '../services/report.service';
import { ApiResponse } from '../utils/api_response';
import asyncHandler from '../utils/async_handler';

export class ReportController {
  generateReport = asyncHandler(async (req: Request, res: Response) => {
    const { type, format } = req.query;
    const report = await reportService.generateReport(type as string, format as string);

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_report.pdf`);
      report.pipe(res);
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_report.csv`);
      res.send(report);
    } else {
      return ApiResponse.success(res, report, 'Report generated successfully');
    }
  });
}

export default new ReportController();
