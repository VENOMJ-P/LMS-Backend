import { User, IUser, UserStatus, UserRole } from '../models/user';
import { NotFoundError, BadRequestError } from '../utils/Error';
import logger from '../utils/logger';
import { sendNotification } from '../utils/notifications';
import { NotificationType } from '../models/notification';

interface UpdateUserData {
  fullName?: string;
  status?: UserStatus;
  role?: UserRole;
}

export class UserService {
  async getAllUsers(
    page = 1,
    limit = 20,
    role?: UserRole,
    status?: UserStatus
  ): Promise<{ users: Partial<IUser>[]; total: number }> {
    const filter: any = {};

    if (role) filter.role = role;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(filter)
    ]);

    return { users, total };
  }

  async getUserById(userId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId).select('-password -refreshToken');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateUser(userId: string, data: UpdateUserData): Promise<Partial<IUser>> {
    const user: IUser | null = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (data.fullName) user.fullName = data.fullName;
    if (data.status) user.status = data.status;
    if (data.role) user.role = data.role;

    await user.save();

    logger.info(`User updated: ${userId}`);
    return user.toSafeObject();
  }

  async suspendUser(userId: string, adminId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new BadRequestError('User is already suspended');
    }

    user.status = UserStatus.SUSPENDED;
    user.refreshToken = undefined;
    await user.save();

    await sendNotification(
      user,
      'Account Suspended',
      'Your account has been suspended',
      NotificationType.WARNING
    );
    logger.info(`User suspended: ${userId} by ${adminId}`);
    return user.toSafeObject();
  }

  async activateUser(userId: string, adminId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestError('User is already active');
    }

    user.status = UserStatus.ACTIVE;
    await user.save();

    await sendNotification(
      user,
      'Account Activated',
      'Your account has been activated',
      NotificationType.INFO
    );
    logger.info(`User activated: ${userId} by ${adminId}`);
    return user.toSafeObject();
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await User.findByIdAndDelete(userId);
    logger.info(`User deleted: ${userId}`);
  }
}

export default new UserService();
