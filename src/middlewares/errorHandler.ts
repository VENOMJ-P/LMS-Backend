import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/Error';

const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
};

export default errorHandler;
