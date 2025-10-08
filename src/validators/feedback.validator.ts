import { z } from 'zod';

export const createFeedbackSchema = z.object({
  body: z.object({
    bookId: z.string().min(1, 'Book ID is required'),
    title: z.string().min(5, 'Title must be at least 5 characters'),
    comment: z.string().min(10, 'Comment must be at least 10 characters'),
    rating: z.number().min(1).max(5)
  })
});
