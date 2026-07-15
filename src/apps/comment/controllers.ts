import { asyncHandler } from "@/utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { ZCreateComment } from "./validators";
import prisma from "@/infrastructure/database/connection";
import { AppError } from "@/utils/AppError";
import { ZGQuery } from "../user/validators";

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

        if (!data.parentId) {
            await prisma.post.update({
                where: { id: data.postId },
                data: { commentCount: { increment: 1 } },
            });
        }

        return res.status(201).json({
            success: true,
            message: "Comment created successfully",
            data: comment,
        });
    });

    getComments = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        const {page, limit, sortBy, orderBy} = ZGQuery.parse(req.query);
        const {postId} = req.query as { postId: string };
    
        const skip = (page - 1) * limit;

        const orderClause: Record<string, 'asc' | 'desc'> = { [sortBy]: orderBy };

        const comments = await prisma.comment.findMany({
            skip,
            take: limit,
            orderBy: orderClause,
            where: {
                parentId: null,
                postId: postId,
            },
            select: {
                    id: true,
    content: true,
    createdAt: true,
    likeCount: true,
    author: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
        },
    },

    _count: {
        select: {
            replies: true,
        },
    }
            },
        });

        const commentIds = comments.map((c) => c.id);
        const userLikes = req.user?.userId
          ? await prisma.like.findMany({
              where: {
                userId: req.user.userId,
                targetType: "COMMENT",
                targetId: { in: commentIds },
              },
              select: { targetId: true },
            })
          : [];
        const likedCommentIds = new Set(userLikes.map((l) => l.targetId));

        const commentsWithLiked = comments.map((comment) => ({
          ...comment,
          isLiked: likedCommentIds.has(comment.id),
        }));

        return res.status(200).json({
            success: true,
            message: "Comments fetched successfully",
            data: commentsWithLiked,
        });

    })

    getReplies = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        const {page, limit, sortBy, orderBy} = ZGQuery.parse(req.query);
        const {commentId} = req.params as { commentId: string };
        console.log(commentId, "commentId")
        const skip = (page - 1) * limit;

        const orderClause: Record<string, 'asc' | 'desc'> = { [sortBy]: orderBy };

        const replies = await prisma.comment.findMany({
            skip,
            take: limit,
            orderBy: orderClause,
            where: {
                parentId: commentId,
            },
            select: {
                id: true,
                content: true,
                createdAt: true,
                likeCount: true,
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },

                _count: {
                    select: {
                        replies: true,
                    },
                }
            },
        });

        const replyIds = replies.map((r) => r.id);
        const userLikes = req.user?.userId
          ? await prisma.like.findMany({
              where: {
                userId: req.user.userId,
                targetType: "COMMENT",
                targetId: { in: replyIds },
              },
              select: { targetId: true },
            })
          : [];
        const likedReplyIds = new Set(userLikes.map((l) => l.targetId));

        const repliesWithLiked = replies.map((reply) => ({
          ...reply,
          isLiked: likedReplyIds.has(reply.id),
        }));

        return res.status(200).json({
            success: true,
            message: "Replies fetched successfully",
            data: repliesWithLiked,
        });
    }
)
}