import { Router } from "express";
import { verifyJwt } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideo,
  togglePublishVideo,
  updateVideoDetails,
  updateVideoThumbnail,
  uploadVideo,
} from "../Controllers/Video.controller.js";

const router = Router();

router.use(verifyJwt);

router.route("/").get(getAllVideos);

router
  .route("/:id")
  .get(getVideo)
  .patch(upload.single("thumbnail"), updateVideoThumbnail)
  .delete(deleteVideo);

router.route("/video-details/:id").patch(updateVideoDetails);

router.route("/upload-video").post(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);
router.route("/publish-video/:id").patch(togglePublishVideo);

export default router;
