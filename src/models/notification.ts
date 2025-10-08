import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.INFO
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

notificationSchema.index({ user: 1 });
notificationSchema.index({ isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
