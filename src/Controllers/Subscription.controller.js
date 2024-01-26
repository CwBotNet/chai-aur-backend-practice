import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../Models/user.model.js";
import { Subscription } from "../Models/subscription.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponce } from "../Utils/ApiResponce.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

// TODO: toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
  const { id: channelId } = req.params;
  // get user id form cli
  const userId = req.user._id;
  // id's check
  if (!channelId) throw new ApiError(401, "channel id is invalid");
  if (!isValidObjectId(userId)) throw new ApiError(404, "unauthorized");

  // toggle logic
  const subscribed = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  // console.log(subscribed);

  if (!subscribed) {
    const newSubscriber = await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });
    // send res
    return res
      .status(200)
      .json(new ApiResponce(200, newSubscriber, "subscribed"));
  }

  const unsubscribe = await subscribed.deleteOne();

  // unsub check
  if (!unsubscribe) throw new ApiError(401, "unable to unsub");
  // send res
  return res.status(200).json(new ApiResponce(200, "subscribe channel"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { id: channelId } = req.params;
  // get user from cli
  try {
    const userId = req.user?._id;
    // id's check
    if (!isValidObjectId(channelId))
      throw new ApiError(400, "invalid channel id");
    if (!isValidObjectId(userId)) throw new ApiError(400, "unauthorized");
    // get subs logic

    // Aggregation pipeline to get subscribers for a specific channel
    const pipeline = [
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscriber",
          pipeline: [
            {
              $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribedToSubscriber",
              },
            },
            {
              $addFields: {
                subscribedToSubscriber: {
                  $cond: {
                    if: {
                      $in: [channelId, "$subscribedToSubscriber.subscriber"],
                    },
                    then: true,
                    else: false,
                  },
                },
                subscribersCount: {
                  $size: "$subscribedToSubscriber",
                },
              },
            },
          ],
        },
      },
      {
        $unwind: "$subscriber",
      },
      {
        $project: {
          _id: 0,
          subscriber: {
            _id: 1,
            username: 1,
            fullName: 1,
            "avatar": 1,
            subscribedToSubscriber: 1,
            subscribersCount: 1,
          },
        },
      },
    ];

    // Get subscribers using the aggregation pipeline
    const subscribers = await Subscription.aggregate(pipeline);

    // send res
    return res
      .status(200)
      .json(
        new ApiResponce(200, subscribers, "Subscribers fetched successfully")
      );
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, "Failed to fetch channels subscribers"));
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { id: subscriberId } = req.params;
  try {
    // Get user from middleware
    const userId = req.user?._id;

    // ID validation
    if (!isValidObjectId(subscriberId)) {
      throw new ApiError(400, "Invalid subscriber ID");
    }
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Unauthorized");
    }

    // Retrieve subscribed channels using aggregation
    const channels = await Subscription.aggregatePaginate([
      // Match subscriptions for the given subscriber
      { $match: { subscriber: subscriberId } },

      // Lookup channel information for each subscription
      {
        $lookup: {
          from: "channels",
          localField: "channel",
          foreignField: "_id",
          as: "channelData",
        },
      },

      // Unwind the channelData array
      { $unwind: "$channelData" },

      // Restrict results to authorized user (if applicable)
      { $match: { $expr: { $eq: ["$_id", userId] } } },

      // Pagination (assuming `page` and `limit` query parameters)
      { $skip: (req.query.page - 1) * req.query.limit },
      { $limit: req.query.limit },
    ]);

    res.status(200).json(channels);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(new ApiError(500, "Failed to fetch subscribed channels"));
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
