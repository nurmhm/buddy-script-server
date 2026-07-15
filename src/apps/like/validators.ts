import { z } from "zod";

export const ZToggleLike = z.object({
  targetType: z.enum(["POST", "COMMENT"]),
  targetId: z.string(),
});
