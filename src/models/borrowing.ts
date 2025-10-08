import mongoose, { Document, Schema } from 'mongoose';

export enum BorrowType {
  INDIVIDUAL = 'individual',
  GROUP = 'group'
}

export enum BorrowingStatus {
  BORROWED = 'borrowed',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost'
}

export enum DamageLevel {
  NONE = 'none',
  MINOR = 'minor',
  MAJOR = 'major'
}

export interface IBorrowing extends Document {
  book: mongoose.Types.ObjectId;
  borrower?: mongoose.Types.ObjectId;
  group?: mongoose.Types.ObjectId;
  borrowType: BorrowType;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: BorrowingStatus;
  damageLevel?: DamageLevel;
  fine?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const borrowingSchema = new Schema<IBorrowing>(
  {
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    borrower: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group'
    },
    borrowType: {
      type: String,
      enum: Object.values(BorrowType),
      required: true
    },
    borrowDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    returnDate: Date,
    status: {
      type: String,
      enum: Object.values(BorrowingStatus),
      default: BorrowingStatus.BORROWED
    },
    damageLevel: {
      type: String,
      enum: Object.values(DamageLevel)
    },
    fine: {
      type: Schema.Types.ObjectId,
      ref: 'Fine'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

borrowingSchema.index({ book: 1 });
borrowingSchema.index({ borrower: 1 });
borrowingSchema.index({ group: 1 });
borrowingSchema.index({ status: 1 });

export const Borrowing = mongoose.model<IBorrowing>('Borrowing', borrowingSchema);
export default Borrowing;
