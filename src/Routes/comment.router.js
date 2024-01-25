import { Router } from "express";
import {
  addComment,
  getVideoComments,
  deleteComment,
  updateComment,
} from "../Controllers/Comment.controller.js";
import { verifyJwt } from "../Middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

router
  .route("/:id") // id as video id
  .post(addComment)
  .get(getVideoComments)
  .patch(updateComment)
  .delete(deleteComment);

export default router;
