import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponce } from "../Utils/ApiResponce.js";
import { Like } from "../Models/like.model.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

//TODO: toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { id: videoId } = req.params;

  try {
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid videoId");
    }

    // Find existing like for the video by the current user
    const existingLike = await Like.findOne({
      video: videoId,
      likedBy: req.user?._id,
    });

    // Create a new like
    if (!existingLike) {
      const NewLike = new Like({
        video: videoId,
        likedBy: req.user._id,
      });
      await NewLike.save();
      return res
        .status(200)
        .json(new ApiResponce(200, NewLike, "liked video successfully"));
    }
    // If a like exists, delete it (unlike)
    await existingLike.deleteOne();
    res.json(new ApiResponce(200, "video is unliked"));
  } catch (error) {
    throw new ApiError(500, "Failed to toggle video like", error?.message);
  }
});

//TODO: toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { id: commentId } = req.params;
  try {
    // commentId check
    if (!isValidObjectId(commentId))
      throw new ApiError(400, "invalid comment id");

    // find existingComment id in comments model
    const existingComment = await Like.findOne({
      comment: commentId,
      likedBy: req.user._id,
    });

    // check if not exist
    if (!existingComment) {
      // create a new one and save it into database
      const newCommnet = new Like({
        comment: commentId,
        likedBy: req.user._id,
      });
      // save comment
      await newCommnet.save();
      // send response
      return res
        .status(200)
        .json(new ApiResponce(200, newCommnet, "comment created"));
    }

    // if exists then delete
    await existingComment.deleteOne();
    res.status(200).json(new ApiResponce(200, "comment deleted"));
  } catch (error) {
    throw new ApiError(500, `Failed to toggle commnet like :${error?.mesage}`);
  }
});

//TODO: toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { id: tweetId } = req.params;
  try {
    // id check
    if (!isValidObjectId(tweetId))
      throw new ApiError(400, "not a valid tweet id");

    // tweet id db check
    const existingTweet = await Like.findOne({
      tweet: tweetId,
      likedBy: req.user._id,
    });

    // condition if not exists
    if (!existingTweet) {
      // create a new one and save it into database
      const newTweet = new Like({
        tweet: tweetId,
        likedBy: req.user._id,
      });

      await newTweet.save();

      return res.status(200).json(new ApiResponce(200, newTweet, "tweeted"));
    }

    // condition if exists
    await existingTweet.deleteOne();
    return res.status(200).json(new ApiResponce(200, "Untweeted"));
  } catch (error) {
    throw new ApiError(500, `Failed to toggle tweet like ${error?.message}`);
  }
});

//TODO: get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
  try {
    const likedVideosAggegate = await Like.aggregate([
      {
        $match: {
          likedBy: new mongoose.Types.ObjectId(req.user?._id),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "likedVideo",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
              },
            },
            {
              $unwind: "$ownerDetails",
            },
          ],
        },
      },
      {
        $unwind: "$likedVideo",
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          likedVideo: {
            _id: 1,
            videoFile: 1,
            thumbnail: 1,
            owner: 1,
            title: 1,
            description: 1,
            views: 1,
            duration: 1,
            createdAt: 1,
            isPublished: 1,
            ownerDetails: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponce(
          200,
          likedVideosAggegate,
          "liked videos fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, `Failed to get liked videos :${error?.message} `);
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
