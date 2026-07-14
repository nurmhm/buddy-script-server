import { Router } from "express";
import { PostController } from "./controllers";
import { authenticate } from "@/middleware/authenticate";
import { upload } from "@/utils/upload";


const postRouter = Router();

const postController = new PostController();

postRouter.post('/', authenticate, upload.single("image"), postController.createPost);
postRouter.get('/', authenticate, postController.getPosts);

export { postRouter };
