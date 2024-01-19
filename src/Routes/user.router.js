import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserCoverImage,
  updateUserAvatar,
  getCurrentUser,
  getUserChannelProfile,
  getUserWatchHistory,
} from "../Controllers/user.controller.js";
import { upload } from "../Middlewares/multer.middleware.js";
import { verifyJwt } from "../Middlewares/auth.middleware.js";

const router = Router();

// create Routes
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
// secured Routes
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
// update routes
router.route("/update-password").patch(verifyJwt, changeCurrentPassword);
router.route("/update-details").patch(verifyJwt, updateAccountDetails);
router
  .route("/update-cover")
  .patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage);
router
  .route("/update-avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);
// read routes
router.route("/get-user").get(verifyJwt, getCurrentUser);
router.route("/channel/:username").get(verifyJwt, getUserChannelProfile);
router.route("/watch-history").get(verifyJwt, getUserWatchHistory);

export default router;
