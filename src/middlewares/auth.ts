import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/Error';
import { JWTUtil } from '../utils/jwt';
import { User, UserRole, UserStatus } from '../models/user';
import asyncHandler from '../utils/async_handler';

declare module 'express' {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: string;
    };
  }
}

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);

    const decoded = JWTUtil.verifyToken(token);

    const user = await User.findById(decoded.userId).select('_id email role status');

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenError('User account is not active');
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    next();
  }
);

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role as UserRole)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};

export default { authenticate, authorize };
