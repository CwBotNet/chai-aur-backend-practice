import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../Models/video.model.js";
import { Subscription } from "../Models/subscription.model.js";
import { Like } from "../Models/like.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponce } from "../Utils/ApiResponce.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

// TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
const getChannelStats = asyncHandler(async (req, res) => {
  // total subs
  const userId = req.user?._id;

  // id check
  if (!isValidObjectId(userId)) throw new ApiError(403, "unauthrized request");

  const subscriptionPipline = [
    {
      $match: { channel: userId },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    { $count: "subscriber" },
  ];

  const VideoPipeline = [
    {
      $match: { owner: userId },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $project: {
        totalLikes: {
          $size: "$likes",
        },
        totalViews: "$views",
        totalVideos: 1,
      },
    },
    {
      $group: {
        _id: 0,
        totalLikes: {
          $sum: "$totalLikes",
        },
        totalViews: {
          $sum: "$totalViews",
        },
        totalVideos: {
          $sum: 1,
        },
      },
    },
  ];

  // aggrigation opreations

  const totalSubs = await Subscription.aggregate(subscriptionPipline);
  const totalVideos = await Video.aggregate(VideoPipeline);
  console.log(totalSubs);
  // total videos
  // total video views
  // total likes

  return res.status(200).json(
    new ApiResponce(200, {
      totalSubscribers: totalSubs,
      userVideosStats: totalVideos,
    })
  );
});

// TODO: Get all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
  // get user id
  const userId = req.user?._id;

  if (!isValidObjectId(userId)) throw new ApiError(403, "unauthorized request");
  // find all video uploaded by user logic

  const channelVideosPipeline = [
    {
      $match: { owner: userId },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "userVideos",
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        duration: 1,
        views: 1,
        createdAt: 1,
        isPublished: 1,
        likesCount: 1,
      },
    },
  ];

  // aggrigation
  const userVideos = await Video.aggregate(channelVideosPipeline);
  // send response
  return res.status(200).json(new ApiResponce(200, { userVideos: userVideos }));
});

export { getChannelStats, getChannelVideos };
