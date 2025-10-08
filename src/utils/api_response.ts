import { Response } from 'express';

interface ApiResponseData {
  success: boolean;
  message: string;
  data?: any;
  errors?: any[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ApiResponse {
  static success(res: Response, data: any = null, message = 'Success', statusCode = 200) {
    const response: ApiResponseData = {
      success: true,
      message,
      data
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message = 'Error',
    statusCode = 500,
    errors?: any[],
    data: any = null
  ) {
    const response: ApiResponseData = {
      success: false,
      message
    };

    if (errors) response.errors = errors;
    if (data) response.data = data;

    return res.status(statusCode).json(response);
  }

  static paginated(
    res: Response,
    data: any[],
    page: number,
    limit: number,
    total: number,
    message = 'Success'
  ) {
    const response: ApiResponseData = {
      success: true,
      message,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
    return res.status(200).json(response);
  }
}

export default ApiResponse;
