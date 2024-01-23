import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../Controllers/Like.controller.js";
import { verifyJwt } from "../Middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/toggle/v/:id").post(toggleVideoLike);
router.route("/toggle/c/:id").post(toggleCommentLike);
router.route("/toggle/t/:id").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router;
