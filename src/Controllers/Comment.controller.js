import { Comment } from "../Models/comment.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponce } from "../Utils/ApiResponce.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

//TODO: get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
  try {
    const { id: videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) throw new ApiError(400, "no video is found");

    const filter = {};

    if (videoId) {
      filter.video = videoId;
    }

    // find and filter comments from db for a particular video
    const commnets = await Comment.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    if (!commnets) throw new ApiError(401, "unable to fetch comments");

    return res
      .status(200)
      .json(new ApiResponce(200, commnets, "comments fetched successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      `server Error white fetching comments : ${error?.message}`
    );
  }
});

// TODO: add a comment to a video
const addComment = asyncHandler(async (req, res) => {
  try {
    // get userId and videoId form the user
    const { id: videoId } = req.params;
    const userId = req.user?._id;

    // id's check
    if (!videoId || !userId) throw new ApiError(400, "Missing Data");
    // get comment data form body
    const { content } = req.body;
    // content check
    if (!content) throw new ApiError(401, "comment is empty");

    // add commnet to db
    const addComment = await Comment.create({
      content,
      video: videoId,
      owner: userId,
    });

    // condition check
    if (!addComment) throw new ApiError(403, "unable to add comment");

    // send responce
    return res.status(200).json(new ApiResponce(200, addComment, "commented"));
  } catch (error) {
    throw new ApiError(
      500,
      `server Error while adding comment${error?.message}`
    );
  }
});

// TODO: update a comment
const updateComment = asyncHandler(async (req, res) => {
  try {
    // get userid from cli
    const userId = req.user?._id;
    // get comment id from params
    const { id: commentId } = req.params;
    // get update commnet from body
    const { content } = req.body;
    // check valid
    if (!commentId) throw new ApiError(400, "commnetId is invalid");
    if (!userId) throw new ApiError(401, "unauthorize");
    // update comment
    const updateComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content,
        },
      },
      { new: true }
    );
    // check update
    if (!updateComment) throw new ApiError(403, "server Error while updateing");
    // send response
    return res
      .status(200)
      .json(new ApiResponce(200, updateComment, "comment updated"));
  } catch (error) {
    throw new ApiError(500, `server comment update Error : ${error?.message}`);
  }
});

// TODO: delete a comment
const deleteComment = asyncHandler(async (req, res) => {
  try {
    // get comment id from params
    const { id: commentId } = req.params;
    // id check
    if (!commentId) throw new ApiError(400, "commnet id is invalid or deleted");
    // delete req to db
    const deleteComment = await Comment.findByIdAndDelete(commentId);
    // delete check
    if (!deleteComment) throw new ApiError(401, "server Error while deleteing");
    // send res
    return res.status(200).json(new ApiResponce(200, "comment deleted"));
  } catch (error) {
    throw new ApiError(
      500,
      `server Error while deleting comment : ${error?.message}`
    );
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
