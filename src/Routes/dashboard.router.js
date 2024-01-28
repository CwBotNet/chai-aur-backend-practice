import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../Controllers/Dashboard.controller.js";
import { verifyJwt } from "../Middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/s").get(getChannelStats);
router.route("/v").get(getChannelVideos);

export default router;
