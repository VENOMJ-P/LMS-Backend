import { z } from 'zod';
import { BorrowType } from '../models/borrowing';

export const createBorrowingSchema = z.object({
  body: z.object({
    bookId: z.string().min(1, 'Book ID is required'),
    borrowType: z.enum([BorrowType.INDIVIDUAL, BorrowType.GROUP]),
    groupId: z.string().optional()
  })
});

export const returnBookSchema = z.object({
  body: z.object({
    damageLevel: z.enum(['none', 'minor', 'major']).optional()
  })
});

export const extendDeadlineSchema = z.object({
  body: z.object({
    newDueDate: z
      .string()
      .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
  })
});
