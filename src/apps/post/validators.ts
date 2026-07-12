import { z } from "zod";

export const ZPost = z.object({
  content: z.string().min(2, 'Content must be at least 2 characters'),
  imageUrl: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
});
