import mongoose, { Document, Schema } from 'mongoose';

export enum FineType {
  LATE = 'late',
  MISSING = 'missing',
  DAMAGE = 'damage'
}

export interface IFine extends Document {
  borrowing: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  fineType: FineType;
  missingFine?: number;
  lateFee?: number;
  damageFine?: number;
  totalFine: number;
  daysLate?: number;
  isPaid: boolean;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const fineSchema = new Schema<IFine>(
  {
    borrowing: {
      type: Schema.Types.ObjectId,
      ref: 'Borrowing',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fineType: {
      type: String,
      enum: Object.values(FineType),
      required: true
    },
    missingFine: Number,
    lateFee: Number,
    damageFine: Number,
    totalFine: {
      type: Number,
      required: true
    },
    daysLate: Number,
    isPaid: {
      type: Boolean,
      default: false
    },
    paidDate: Date
  },
  {
    timestamps: true,
    versionKey: false
  }
);

fineSchema.index({ borrowing: 1 });
fineSchema.index({ user: 1 });
fineSchema.index({ isPaid: 1 });

export const Fine = mongoose.model<IFine>('Fine', fineSchema);
export default Fine;
