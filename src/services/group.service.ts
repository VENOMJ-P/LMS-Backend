import { Group, GroupStatus, IGroup } from '../models/group';
import { User, UserRole } from '../models/user';
import { Settings } from '../models/settings';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/Error';
import logger from '../utils/logger';
import { Types } from 'mongoose';


interface GroupData {
  name: string;
  memberIds: string[];
}

export class GroupService {
  async createGroup(data: GroupData, userId: string): Promise<IGroup> {
    const settings = (await Settings.findOne()) || new Settings();
    if (
      data.memberIds.length < settings.groupMinMembers ||
      data.memberIds.length > settings.groupMaxMembers
    ) {
      throw new BadRequestError(
        `Group must have between ${settings.groupMinMembers} and ${settings.groupMaxMembers} members`
      );
    }

    const existing = await Group.findOne({ name: data.name });
    if (existing) throw new BadRequestError('Group name already exists');

    const users = await User.find({ _id: { $in: data.memberIds } });
    if (users.length !== data.memberIds.length) throw new BadRequestError('Invalid member IDs');

    const group = await Group.create({
      name: data.name,
      leader: userId,
      members: data.memberIds,
      status: GroupStatus.PENDING
    });


    logger.info(`Group created: ${data.name} by ${userId}`);
    return group;
  }

  async getGroups(
    page: number,
    limit: number,
    status?: string,
    userId?: string
  ): Promise<{ groups: IGroup[]; total: number }> {
    const filter: any = {};
    if (status) filter.status = status;
    if (userId) filter.$or = [{ leader: userId }, { members: userId }];

    const skip = (page - 1) * limit;
    const [groups, total] = await Promise.all([
      Group.find(filter)
        .populate('leader members currentBorrowing')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Group.countDocuments(filter)
    ]);
    return { groups, total };
  }

  async getGroup(id: string, userId: string, role: UserRole): Promise<IGroup> {
    const group = await Group.findById(id).populate('leader members currentBorrowing');
    if (!group) throw new NotFoundError('Group not found');
    if (
      role !== UserRole.ADMIN &&
      !group.leader.equals(userId) &&
      !group.members.some(m => m.equals(userId))
    ) {
      throw new ForbiddenError('Access denied');
    }
    return group;
  }

  async updateGroup(
    id: string,
    data: Partial<GroupData>,
    userId: string,
    role: UserRole
  ): Promise<IGroup> {
    const group = await Group.findById(id);
    if (!group) throw new NotFoundError('Group not found');
    if (role !== UserRole.ADMIN && !group.leader.equals(userId))
      throw new ForbiddenError('Only leader or admin can update');

    const settings = (await Settings.findOne()) || new Settings();
    if (
      data.memberIds &&
      (data.memberIds.length < settings.groupMinMembers ||
        data.memberIds.length > settings.groupMaxMembers)
    ) {
      throw new BadRequestError(
        `Group must have between ${settings.groupMinMembers} and ${settings.groupMaxMembers} members`
      );
    }

    if (data.name) group.name = data.name;
    if (data.memberIds) {
      const users = await User.find({ _id: { $in: data.memberIds } });
      if (users.length !== data.memberIds.length) throw new BadRequestError('Invalid member IDs');
      group.members = data.memberIds.map(id => new Types.ObjectId(id));
    }

    await group.save();
    logger.info(`Group updated: ${id} by ${userId}`);
    return group;
  }

  async approveGroup(id: string): Promise<IGroup> {
    const group = await Group.findById(id).populate('leader members');
    if (!group) throw new NotFoundError('Group not found');
    if (group.status !== GroupStatus.PENDING) throw new BadRequestError('Group is not pending');

    group.status = GroupStatus.APPROVED;
    await group.save();

    logger.info(`Group approved: ${id}`);
    return group;
  }

  async rejectGroup(id: string): Promise<IGroup> {
    const group = await Group.findById(id).populate('leader members');
    if (!group) throw new NotFoundError('Group not found');
    if (group.status !== GroupStatus.PENDING) throw new BadRequestError('Group is not pending');

    group.status = GroupStatus.REJECTED;
    await group.save();


    logger.info(`Group rejected: ${id}`);
    return group;
  }

  async dissolveGroup(id: string): Promise<void> {
    const group = await Group.findById(id);
    if (!group) throw new NotFoundError('Group not found');
    if (group.currentBorrowing)
      throw new BadRequestError('Cannot dissolve group with active borrowing');

    group.status = GroupStatus.DISSOLVED;
    await group.save();
    logger.info(`Group dissolved: ${id}`);
  }
}

export default new GroupService();
