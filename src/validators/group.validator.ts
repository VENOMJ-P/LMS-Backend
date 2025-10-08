import { z } from 'zod';

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Group name is required'),
    memberIds: z.array(z.string()).min(1, 'At least one member required')
  })
});

export const updateGroupSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    memberIds: z.array(z.string()).min(1).optional()
  })
});
