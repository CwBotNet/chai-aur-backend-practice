import { Router } from "express";
import { verifyJwt } from "../Middlewares/auth.middleware.js";
import { toggleSubscription } from "../Controllers/Subscription.controller.js";

const router = Router();

router.use(verifyJwt);

router.route("/:id").post(toggleSubscription);

export default router;
