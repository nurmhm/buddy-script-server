import { asyncHandler } from "@/utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { ZCreateComment } from "./validators";
import prisma from "@/infrastructure/database/connection";
import { AppError } from "@/utils/AppError";

export class CommentController {
    createComment = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        const data = ZCreateComment.parse(req.body);

        if (!req.user) {
            throw AppError.unauthorized("User not authenticated");
        }

        // Post Exits Check
        const post = await prisma.post.findUnique({
            where: { id: data.postId },
            select: { id: true },
        });

        if(!post) {
            throw AppError.notFound("Post not found");
        }

        //If is it a reply, check if parent comment exists
        if (data.parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: data.parentId },
                select: { id: true, postId: true },
            });

            if(!parentComment) {
                throw AppError.notFound("Parent comment not found");
            }

            if(parentComment.postId !== data.postId) {
                throw AppError.badRequest("Parent comment does not belong to the specified post");
            }
        }

        const comment = await prisma.comment.create({
            data: {
                content: data.content,
                postId: data.postId,
                parentId: data.parentId,
                authorId: req.user.userId,
            },
            select: {
                id: true,
                content: true,
                postId: true,
                parentId: true,
                authorId: true,
                createdAt: true,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Comment created successfully",
            data: comment,
        });
    });
    
}