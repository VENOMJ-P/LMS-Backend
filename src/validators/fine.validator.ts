import { z } from 'zod';

export const updateFineSchema = z.object({
  body: z.object({
    totalFine: z.number().min(0).optional(),
    lateFee: z.number().min(0).optional(),
    damageFine: z.number().min(0).optional(),
    missingFine: z.number().min(0).optional()
  })
});
