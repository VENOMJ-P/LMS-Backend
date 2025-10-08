import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  category: string;
  ISBN: string;
  price: number;
  totalCopies: number;
  availableCopies: number;
  coverImage?: string;
  description?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    ISBN: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    totalCopies: {
      type: Number,
      default: 3,
      min: [1, 'At least one copy required']
    },
    availableCopies: {
      type: Number,
      default: function () {
        return this.totalCopies;
      }
    },
    coverImage: String,
    description: String,
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

bookSchema.index({ ISBN: 1 });
bookSchema.index({ category: 1 });
bookSchema.index({ isDeleted: 1 });

export const Book = mongoose.model<IBook>('Book', bookSchema);
export default Book;
