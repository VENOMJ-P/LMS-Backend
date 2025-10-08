import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    individualBorrowDays: z.number().min(1).optional(),
    groupBorrowDays: z.number().min(1).optional(),
    lateFeePerDay: z.number().min(0).optional(),
    missingFineMultiplier: z.number().min(0).optional(),
    groupMinMembers: z.number().min(1).optional(),
    groupMaxMembers: z.number().min(1).optional(),
    maxBooksPerUser: z.number().min(1).optional(),
    copiesPerBook: z.number().min(1).optional()
  })
});
