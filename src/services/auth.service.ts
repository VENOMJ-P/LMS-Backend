import { IUser, User, UserRole, UserStatus } from '../models/user';
import { JWTUtil } from '../utils/jwt';
import { ConflictError, UnauthorizedError, BadRequestError, NotFoundError } from '../utils/Error';
import logger from '../utils/logger';

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(data: RegisterData): Promise<{ user: Partial<IUser>; tokens: AuthTokens }> {
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const user = await User.create({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: UserRole.PATRON,
      status: UserStatus.ACTIVE
    });

    const tokens = this.generateTokens(user);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    logger.info(`New user registered: ${user.email}`);

    return {
      user: user.toSafeObject(),
      tokens
    };
  }

  async login(data: LoginData): Promise<{ user: Partial<IUser>; tokens: AuthTokens }> {
    const user = await User.findOne({ email: data.email }).select('+password +refreshToken');

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Account is not active');
    }

    const isPasswordValid = await user.comparePassword(data.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = this.generateTokens(user);

    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${user.email}`);

    return {
      user: user.toSafeObject(),
      tokens
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    const decoded = JWTUtil.verifyToken(refreshToken);

    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Account is not active');
    }

    const tokens = this.generateTokens(user);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.refreshToken = undefined;
    await user.save();

    logger.info(`User logged out: ${user.email}`);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    user.password = newPassword;
    user.refreshToken = undefined;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);
  }

  private generateTokens(user: IUser): AuthTokens {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    return {
      accessToken: JWTUtil.generateAccessToken(payload),
      refreshToken: JWTUtil.generateRefreshToken(payload)
    };
  }
}

export default new AuthService();
