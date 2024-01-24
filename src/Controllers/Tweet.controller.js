import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../Models/user.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponce } from "../Utils/ApiResponce.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

// TODO: create tweet
const createTweet = asyncHandler(async (req, res) => {
  try {
    // get user from cli
    const user = req.user?._id;
    console.log(user);
    // user check
    if (!isValidObjectId(user)) throw new ApiError(404, "User not found");
    // get content to post from body
    const { content } = req.body;
    // content check
    if (!content) throw new ApiError(400, "all content is empty");
    // upload to db
    const createTweet = new Tweet({
      user: user,
      content: content,
    });
    await createTweet.save();

    // upload check
    if (!createTweet) throw new ApiError(403, "Failed to create tweet");
    // send responce
    return res
      .status(200)
      .json(new ApiResponce(200, createTweet, "tweeted successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      `somthing went wrong white create the tweet : ${error?.message}`
    );
  }
});

// TODO: get user tweets
const getUserTweets = asyncHandler(async (req, res) => {
  try {
    // get tweet id from params
    const { id: tweetId } = req.params;
    // user check
    if (!tweetId) throw new ApiError(404, "tweet not found");
    // find tweet in db
    const tweet = await Tweet.findById(tweetId);
    // condition if !exist
    if (!tweet) throw new ApiError(403, "unable to find tweet");

    // if exist tweet send to user in json responce
    return res.status(200).json(new ApiResponce(200, tweet, "tweet fetched"));
  } catch (error) {
    throw new ApiError(500, `internal Error : ${error?.message}`);
  }
});

//TODO: update tweet
const updateTweet = asyncHandler(async (req, res) => {
  try {
    const { id: tweetId } = req.params;
    const { content } = req.body;
    if (!tweetId) throw new ApiError(400, "tweet not found for update");

    const updateTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set: {
          content,
        },
      },
      { new: true }
    );

    if (!updateTweet) throw new ApiError(403, "unable to update");

    return res
      .status(200)
      .json(new ApiResponce(200, updateTweet, "tweet updated"));
  } catch (error) {
    throw new ApiError(
      500,
      `somthing went wrong while updateing the tweet : ${error?.message}`
    );
  }
});

//TODO: delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
  try {
    const { id: tweetId } = req.params;
    if (!tweetId) throw new ApiError(400, "Invalid tweet id to delete");

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deleteTweet) throw new ApiError(403, "unable to delete the tweet");

    return res
      .status(200)
      .json(new ApiResponce(200, "tweet deleted successfully"));
  } catch (error) {
    throw new ApiError(500, `server Error while deleting :${error?.message}`);
  }
});

// get all tweets
const getAllTweets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25, query, sortBy, sortType, userId } = req.query;

  try {
    let filter = {};
    if (query) {
      filter.$or = [
        { content: { $regex: query, $options: "i" } }, // Case-insensitive title search
      ];
    }

    if (userId) {
      filter.user = userId;
    }

    const sort = {};
    // If sortBy is provided, add a sort condition based on sortBy and sortType
    if (sortBy) {
      sort[sortBy] = sortType === "desc" ? -1 : 1; // -1 for descending, 1 for ascending
    }

    const tweets = await Tweet.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit);

    return res
      .status(200)
      .json(new ApiResponce(200, tweets, "tweets fetched successfully"));
  } catch (error) {
    throw new ApiError(500, `somthing went wrong :${error?.message}`);
  }
});

export { createTweet, getAllTweets, getUserTweets, updateTweet, deleteTweet };
