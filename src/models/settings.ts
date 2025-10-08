import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  individualBorrowDays: number;
  groupBorrowDays: number;
  lateFeePerDay: number;
  missingFineMultiplier: number;
  groupMinMembers: number;
  groupMaxMembers: number;
  maxBooksPerUser: number;
  copiesPerBook: number;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    individualBorrowDays: {
      type: Number,
      default: 30
    },
    groupBorrowDays: {
      type: Number,
      default: 180
    },
    lateFeePerDay: {
      type: Number,
      default: 50
    },
    missingFineMultiplier: {
      type: Number,
      default: 2 // 200%
    },
    groupMinMembers: {
      type: Number,
      default: 3
    },
    groupMaxMembers: {
      type: Number,
      default: 6
    },
    maxBooksPerUser: {
      type: Number,
      default: 1
    },
    copiesPerBook: {
      type: Number,
      default: 3
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
export default Settings;
