import { asyncHandler } from "@/utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { ZToggleLike } from "./validators";
import prisma from "@/infrastructure/database/connection";
import { AppError } from "@/utils/AppError";

export class LikeController {
  toggleLike = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { targetType, targetId } = ZToggleLike.parse(req.body);

    if (!req.user) {
      throw AppError.unauthorized("User not authenticated");
    }

    const userId = req.user.userId;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId,
        },
      },
    });

    if (existingLike) {
      await prisma.$transaction(async (tx) => {
        await tx.like.delete({
          where: { id: existingLike.id },
        });

        if (targetType === "POST") {
          await tx.post.update({
            where: { id: targetId },
            data: { likeCount: { decrement: 1 } },
          });
        } else {
          await tx.comment.update({
            where: { id: targetId },
            data: { likeCount: { decrement: 1 } },
          });
        }
      });

      return res.status(200).json({
        success: true,
        message: "Like removed",
        data: { liked: false },
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.like.create({
        data: {
          userId,
          targetType,
          targetId,
        },
      });

      if (targetType === "POST") {
        await tx.post.update({
          where: { id: targetId },
          data: { likeCount: { increment: 1 } },
        });
      } else {
        await tx.comment.update({
          where: { id: targetId },
          data: { likeCount: { increment: 1 } },
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: "Like added",
      data: { liked: true },
    });
  });
}
