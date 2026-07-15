import { Router } from "express";
import { LikeController } from "./controllers";
import { authenticate } from "@/middleware/authenticate";

const likeRouter = Router();
const likeController = new LikeController();

likeRouter.post("/toggle", authenticate, likeController.toggleLike);

export { likeRouter };
