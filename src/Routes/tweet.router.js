import { Router } from "express";
import {
  createTweet,
  updateTweet,
  deleteTweet,
  getUserTweets,
  getAllTweets,
} from "../Controllers/Tweet.controller.js";
import { verifyJwt } from "../Middlewares/auth.middleware.js";
const router = Router();

router.use(verifyJwt);

router.route("/tweet").post(createTweet);
router.route("/").get(getAllTweets);

router
.route("/:id")
.get(getUserTweets)
.patch(updateTweet)
.delete(deleteTweet);

export default router;
