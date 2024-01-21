import { ApiError } from "../Utils/ApiError.js";
import { ApiResponce } from "../Utils/ApiResponce.js";
import { Video } from "../Models/video.model.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { getVideoDureation, uploadOnCloudinary } from "../Utils/cloudinary.js";

// crud - crontrollers for video

// Create
const uploadVideo = asyncHandler(async (req, res) => {
  try {
    // get video from user
    const { title, description } = req.body;
    if (!title || !description) throw new ApiError(401, "fields are required");

    const videoFileLocalPath = req.files?.videoFile[0].path;
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

    // get video dureation

    const dureation = await getVideoDureation(video.public_id);

    // upload video
    const videoUpload = await Video.create({
      title,
      description,
      videoFile: video?.url,
      duration: dureation,
      thumbnail: thumbnail?.url || "",
    });

    const uploadedVideo = await Video.findById(videoUpload._id);
    // uploding error handling
    if (!uploadedVideo)
      throw new ApiError(401, "somthing went wrong while uploading the video");
    // if uploaded return video url and duration
    return res
      .status(200)
      .json(new ApiResponce(200, uploadedVideo, "video uploaded successfully"));
  } catch (error) {
    throw new ApiError(500, `uploading Error ${error?.message}`);
  }
});

// publish controller
const togglePublishVideo = asyncHandler(async (req, res) => {
  try {
    // get video
    const { id } = req.params;
    const currentVideo = await Video.findById(id);
    // console.log(currentVideo.isPublished);

    // id check
    if (!currentVideo) throw new ApiError(400, "video not found by the id");

    // set video ispubished to true of false
    if (currentVideo.isPublished === false) {
      currentVideo.isPublished = true;
      await currentVideo.save();
    } else if (currentVideo.isPublished === true) {
      currentVideo.isPublished = false;
      await currentVideo.save();
    }

    return res
      .status(200)
      .json(
        new ApiResponce(
          200,
          currentVideo.isPublished
            ? "video is published"
            : "video is unpublished",
          currentVideo
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      `somthing went wrong while publishing the video ${error?.message}`
    );
  }
});

// Read
const getVideo = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) throw new ApiError(404, "video not found");

    // chech publish status
    if (video.isPublished === false)
      throw new ApiError(404, "video is unavilable");

    // show user published video only
    return res
      .status(200)
      .json(new ApiResponce(200, video, "video fetched successfully"));
  } catch (error) {
    throw new ApiError(500, `unable to get the video ${error?.message}`);
  }
});

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
});

// Update
const updateVideo = asyncHandler(async (req, res) => {});

// Delete
const deleteVideo = asyncHandler(async (req, res) => {});

export {
  uploadVideo,
  togglePublishVideo,
  getVideo,
  getAllVideos,
  updateVideo,
  deleteVideo,
};
