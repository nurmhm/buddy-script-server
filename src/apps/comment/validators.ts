import { z } from "zod";

export const ZCreateComment = z.object({
  postId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
  content: z.string().trim().min(1).max(1000),
});