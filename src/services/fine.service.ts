import { Fine, IFine } from '../models/fine';
import { UserRole } from '../models/user';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/Error';
import { sendNotification } from '../utils/notifications';
import logger from '../utils/logger';
import { NotificationType } from '../models/notification';

interface UpdateFineData {
  totalFine?: number;
  damageFine?: number;
  lateFee?: number;
  missingFine?: number;
}

export class FineService {
  async getFines(
    page: number,
    limit: number,
    isPaid?: boolean,
    userId?: string
  ): Promise<{ fines: IFine[]; total: number }> {
    const filter: any = {};
    if (isPaid !== undefined) filter.isPaid = isPaid;
    if (userId) filter.user = userId;

    const skip = (page - 1) * limit;
    const [fines, total] = await Promise.all([
      Fine.find(filter).populate('borrowing user').skip(skip).limit(limit).sort({ createdAt: -1 }),
      Fine.countDocuments(filter)
    ]);
    return { fines, total };
  }

  async getFine(id: string, userId: string, role: UserRole): Promise<IFine> {
    const fine = await Fine.findById(id).populate('borrowing user');
    if (!fine) throw new NotFoundError('Fine not found');
    if (role !== UserRole.ADMIN && !fine.user.equals(userId))
      throw new ForbiddenError('Access denied');
    return fine;
  }

  async payFine(id: string, userId: string, role: UserRole): Promise<IFine> {
    const fine = await Fine.findById(id).populate('user');
    if (!fine) throw new NotFoundError('Fine not found');
    if (role !== UserRole.ADMIN && !fine.user.equals(userId))
      throw new ForbiddenError('Access denied');
    if (fine.isPaid) throw new BadRequestError('Fine already paid');

    fine.isPaid = true;
    fine.paidDate = new Date();
    await fine.save();

    await sendNotification(
      fine.user as any,
      'Fine Paid',
      `Your fine of ₹${fine.totalFine} has been paid`,
      NotificationType.INFO
    );
    logger.info(`Fine paid: ${id} by ${userId}`);
    return fine;
  }

  async waiveFine(id: string): Promise<IFine> {
    const fine = await Fine.findById(id).populate('user');
    if (!fine) throw new NotFoundError('Fine not found');
    if (fine.isPaid) throw new BadRequestError('Cannot waive paid fine');

    fine.totalFine = 0;
    fine.lateFee = 0;
    fine.damageFine = 0;
    fine.missingFine = 0;
    fine.isPaid = true;
    fine.paidDate = new Date();
    await fine.save();

    await sendNotification(
      fine.user as any,
      'Fine Waived',
      `Your fine of ₹${fine.totalFine} has been waived`,
      NotificationType.INFO
    );
    logger.info(`Fine waived: ${id}`);
    return fine;
  }

  async updateFine(id: string, data: UpdateFineData): Promise<IFine> {
    const fine = await Fine.findById(id).populate('user');
    if (!fine) throw new NotFoundError('Fine not found');
    if (fine.isPaid) throw new BadRequestError('Cannot update paid fine');

    if (data.totalFine !== undefined) fine.totalFine = data.totalFine;
    if (data.lateFee !== undefined) fine.lateFee = data.lateFee;
    if (data.damageFine !== undefined) fine.damageFine = data.damageFine;
    if (data.missingFine !== undefined) fine.missingFine = data.missingFine;

    fine.totalFine = (fine.lateFee || 0) + (fine.damageFine || 0) + (fine.missingFine || 0);
    await fine.save();

    await sendNotification(
      fine.user as any,
      'Fine Updated',
      `Your fine has been updated to ₹${fine.totalFine}`,
      NotificationType.WARNING
    );
    logger.info(`Fine updated: ${id}`);
    return fine;
  }
}

export default new FineService();
