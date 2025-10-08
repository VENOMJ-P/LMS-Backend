import mongoose, { Document, Schema } from 'mongoose';

export enum GroupStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISSOLVED = 'dissolved'
}

export interface IGroup extends Document {
  name: string;
  leader: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  currentBorrowing?: mongoose.Types.ObjectId;
  status: GroupStatus;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      unique: true,
      trim: true
    },
    leader: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    currentBorrowing: {
      type: Schema.Types.ObjectId,
      ref: 'Borrowing'
    },
    status: {
      type: String,
      enum: Object.values(GroupStatus),
      default: GroupStatus.PENDING
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

groupSchema.index({ leader: 1 });
groupSchema.index({ status: 1 });

export const Group = mongoose.model<IGroup>('Group', groupSchema);
export default Group;
