import { User, IUser, UserStatus, UserRole } from '../models/user';
import { NotFoundError, BadRequestError } from '../utils/Error';
import logger from '../utils/logger';

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
    const user = await User.findById(userId);

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

  async blockUser(userId: string, adminId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new BadRequestError('User is already blocked');
    }

    user.status = UserStatus.BLOCKED;
    user.refreshToken = undefined;
    await user.save();

    logger.info(`User blocked: ${userId} by ${adminId}`);

    return user.toSafeObject();
  }

  async unblockUser(userId: string, adminId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status !== UserStatus.BLOCKED) {
      throw new BadRequestError('User is not blocked');
    }

    user.status = UserStatus.ACTIVE;
    await user.save();

    logger.info(`User unblocked: ${userId} by ${adminId}`);

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
