import { z } from 'zod';

export const createBookSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    category: z.string().min(1),
    ISBN: z.string().min(1),
    price: z.number().min(0),
    totalCopies: z.number().min(1).optional(),
    coverImage: z.string().optional(),
    description: z.string().optional()
  })
});

export const updateBookSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    category: z.string().optional(),
    price: z.number().optional(),
    totalCopies: z.number().optional(),
    coverImage: z.string().optional(),
    description: z.string().optional()
  })
});
