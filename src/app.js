import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./Routes/user.router.js";
import videoRouter from "./Routes/video.router.js";
import likeRouter from "./Routes/like.router.js";
import tweetRouter from "./Routes/tweet.router.js";
import commentRouter from "./Routes/comment.router.js";
import subscriptionRouter from "./Routes/subscription.router.js";
app.use("/api/v1/user", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/subscription", subscriptionRouter);

export { app };
