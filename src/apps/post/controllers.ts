import { asyncHandler } from "@/utils/asyncHandler";

import { ZPost } from "./validators";
import prisma from "@/infrastructure/database/connection";
import { NextFunction, Request, Response } from 'express';
import { AppError } from "@/utils/AppError";
import { ZGQuery } from "../user/validators";

export class PostController {
   createPost = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const data = ZPost.parse(req.body);
  
const image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!req.user) {
    throw AppError.unauthorized("User not authenticated");
  }

  const post = await prisma.post.create({
    data: {
      content: data.content,
      imageUrl: image,
      visibility: data.visibility,
      authorId: req.user.userId,
      
    },
    select: {
      id: true,
      content: true,
      imageUrl: true,
      visibility: true,
      authorId: true,
      createdAt: true,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Post created successfully",
    data: post,
  });
});

 getPosts = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const {page, limit, sortBy, orderBy} = ZGQuery.parse(req.query);


    const skip = (page - 1) * limit;

    const orderClause: Record<string, 'asc' | 'desc'> = { [sortBy]: orderBy };

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            skip,
            take: limit,
            orderBy: orderClause,
            where: {
                OR: [
                    { visibility: 'PUBLIC' },
                    { authorId: req.user?.userId },
                ]
            },


            select: {
                id: true,
                content: true,
                imageUrl: true,
                visibility: true,
                authorId: true,
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                createdAt: true,
            },
        }),
        prisma.post.count()
    ])
 

    return res.status(200).json({
        success: true,
        message: "Posts fetched successfully",
        data: posts,
        pagination: {
            page,
            limit,
            total,
        },
    });
});
}