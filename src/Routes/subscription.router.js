import { Router } from "express";
import { verifyJwt } from "../Middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../Controllers/Subscription.controller.js";

const router = Router();

router.use(verifyJwt);

router.route("/c/:id").post(toggleSubscription).get(getUserChannelSubscribers);

router.route("/u/:id").get(getSubscribedChannels);

export default router;
