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
  // id's check
  // get subs logic
  // send res
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { id: subscriberId } = req.params;
  // get user from cli
  // id's check
  // get channels logic
  // send res
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
