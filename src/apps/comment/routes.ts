import { Router } from "express";
import { CommentController } from "./controllers";
import { authenticate } from "@/middleware/authenticate";

const commentRouter = Router();
const commentController = new CommentController();

commentRouter.post('/', authenticate, commentController.createComment);
commentRouter.get('/', authenticate, commentController.getComments);
commentRouter.get('/:commentId/replies', authenticate, commentController.getReplies);
export { commentRouter };
