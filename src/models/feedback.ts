import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  user: mongoose.Types.ObjectId;
  book: mongoose.Types.ObjectId;
  title: string;
  comment: string;
  rating: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: [5, 'Title must be at least 5 characters'],
      trim: true
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      minlength: [10, 'Comment must be at least 10 characters'],
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    image: String
  },
  {
    timestamps: true,
    versionKey: false
  }
);

feedbackSchema.index({ book: 1 });
feedbackSchema.index({ user: 1 });

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
export default Feedback;
