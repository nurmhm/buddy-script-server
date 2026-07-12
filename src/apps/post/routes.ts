import { Router } from "express";
import { PostController } from "./controllers";
import { authenticate } from "@/middleware/authenticate";


const postRouter = Router();

const postController = new PostController();

postRouter.post('/', authenticate, postController.createPost);
postRouter.get('/', authenticate, postController.getPosts);

export { postRouter };
