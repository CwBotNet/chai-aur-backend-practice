import { Router } from "express";
import { verifyJwt } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.middleware.js";
import { uploadVideo } from "../Controllers/Video.controller.js";

const router = Router();

router.use(verifyJwt);

router.route("/upload-video").post(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);


export default router;