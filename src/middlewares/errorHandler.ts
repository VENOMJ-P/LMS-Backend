import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/Error';
import logger from '../utils/logger';
import { config } from '../configs';

const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    logger.error({
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      isOperational: err.isOperational
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      ...(config.env === 'development' && { stack: err.stack })
    });
  }

  if (err instanceof Error && err.name === 'ValidationError') {
    logger.error({ message: 'Mongoose validation error', error: err });
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values((err as any).errors).map((e: any) => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  if (err instanceof Error && err.name === 'CastError') {
    logger.error({ message: 'Mongoose cast error', error: err });
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  if ((err as any).code === 11000) {
    logger.error({ message: 'Mongoose duplicate key error', error: err });
    const field = Object.keys((err as any).keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    });
  }

  logger.error({
    message: 'Unexpected error',
    error: err,
    stack: err instanceof Error ? err.stack : undefined
  });

  return res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    ...(config.env === 'development' && {
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    })
  });
};

export default errorHandler;
