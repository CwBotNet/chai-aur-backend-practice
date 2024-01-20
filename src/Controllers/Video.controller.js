import { ApiError } from "../Utils/ApiError.js";
import { ApiResponce } from "../Utils/ApiResponce.js";
import { Video } from "../Models/video.model.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { updateUserAvatar } from "./user.controller.js";
// crud - crontrollers for video

// Create
const uploadVideo = asyncHandler(async (req, res) => {
  try {
    // get video from user
    const { title, description } = req.body;
    if (!title || !description) throw new ApiError(401, "fields are required");

    const videoFileLocalPath = req.files?.videoFile[0];
    console.log(videoFileLocalPath);

    let thumbnailLocalPath;
    if (
      req.files &&
      Array.isArray(req.files?.thumbnail) &&
      req.files.thumbnail.length > 0
    ) {
      thumbnailLocalPath = req.files?.thumbnail[0].path;
    }

    if (!videoFileLocalPath) throw new Error("video is requred");

    const video = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    // video check
    if (!video) throw new ApiError(400, "video file is required");

    // upload video
    const videoUpload = await Video.create({
      title,
      description,
      videoFile: video?.url,
      // duration: video?.format,
      thumbnail: thumbnail?.url || "",
    });

    const uploadedVideo = await Video.findById(videoUpload._id);
    // uploding error handling
    if (!uploadedVideo)
      throw new ApiError(401, "somthing went wrong while uploading the video");
    // if uploaded return video url and duration
    return res
      .status(200)
      .json(new ApiResponce(200, "video uploaded successfully"));
  } catch (error) {
    throw new ApiError(500, `uploading Error ${error?.message}`);
  }
});

// publish controller

const publishVideo = asyncHandler(async (req, res) => {});

// Read
const getVideo = asyncHandler(async (req, res) => {});

const getAllVideos = asyncHandler(async (req, res) => {});

// Update
const updateVideo = asyncHandler(async (req, res) => {});

// Delete
const deleteVideo = asyncHandler(async (req, res) => {});

export { uploadVideo };
