import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../Models/playlist.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponce } from "../Utils/ApiResponce.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

//TODO: create playlist
const createPlaylist = asyncHandler(async (req, res) => {
  try {
    const { name, description } = req.body;
    // body data check
    if (!name || !description)
      throw new ApiError(400, "all fields are required");
    // create playlist
    const createPlaylist = await Playlist.create({
      name,
      description,
      owner: req.user._id,
    });

    if (!createPlaylist) throw new ApiError(401, "unable to create playlist");

    return res
      .status(200)
      .json(new ApiResponce(200, createPlaylist, "playlist created"));
  } catch (error) {
    throw new ApiError(
      500,
      `somthing went wrong while creating playlist: ${error?.message}`
    );
  }
});

//TODO: get user playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    // id check
    if (!isValidObjectId(userId))
      throw new ApiError(404, "unauthorized request");
    // find user's playlists
    const playlists = await Playlist.find({ owner: userId });

    if (!playlists) throw new ApiError(402, "unable to fetch playlists");

    return res
      .status(200)
      .json(new ApiResponce(200, playlists, "playlist fetched successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      `somthing went wrong while fetching user playlist: ${error?.message}`
    );
  }
});

//TODO: get playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
  try {
    const { id: playlistId } = req.params;

    // id check
    if (!isValidObjectId(playlistId))
      throw new ApiError(401, "playlist not found");

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) throw new ApiError(403, "unable to fetch playlist");

    return res
      .status(200)
      .json(
        new ApiResponce(200, playlist, "playlist details fetched successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      `somthing went wrong while fetching video by playlistId: ${error?.message}`
    );
  }
});

// TODO: add video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;
    // id check
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId))
      throw new ApiError(403, "invalid request");
    // add video
    const addVideoToPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $addToSet: {
          videos: videoId,
        },
      },
      { new: true }
    );
    // video check
    if (!addVideoToPlaylist) throw new ApiError(401, "unable to add video");
    // send responce
    return res
      .status(200)
      .json(
        new ApiResponce(200, addVideoToPlaylist, "video added to playlist")
      );
  } catch (error) {
    throw new ApiError(
      500,
      `somthing went wrong while adding video to playlist: ${error?.message}`
    );
  }
});

// TODO: remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;

    // id check

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId))
      throw new ApiError(403, "invalid request");

    // remove video
    const removeVided = await Playlist.findByIdAndUpdate(playlistId, {
      $pull: {
        videos: videoId,
      },
    });
    console.log(removeVided);

    if (!removeVided) throw new ApiError(401, "unable to remove video");

    return res
      .status(200)
      .json(new ApiResponce(200, "video removed for playlist successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      `somthing went wrong while revomving video from playlist: ${error?.message}`
    );
  }
});

// TODO: delete playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  try {
    const { id: playlistId } = req.params;
    // id check

    if (!isValidObjectId(playlistId))
      throw new ApiError(403, "invalid request");

    // delete playlist
    const deletePlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletePlaylist) throw new ApiError(401, "unable to delete playlist");

    // send responce
    return res
      .status(200)
      .json(new ApiResponce(200, "playlist deleted successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      `somthing went wrong while deleting playlist: ${error?.message}`
    );
  }
});

//TODO: update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
  try {
    const { id: playlistId } = req.params;
    const { name, description } = req.body;

    // id check and body data check

    if (!isValidObjectId(playlistId))
      throw new ApiError(403, "invalid request");

    if (!name || !description)
      throw new ApiError(402, "all fields are required");

    // update playlist
    const updatePlaylist = await Playlist.findByIdAndUpdate(playlistId, {
      name,
      description,
    });

    if (!updatePlaylist) throw new ApiError(401, "unable to update playlist");

    const updatedPlaylist = await Playlist.findById(playlistId);

    return res
      .status(200)
      .json(
        new ApiResponce(
          200,
          await updatedPlaylist,
          "playlist updated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `somthing went wrong while updateing playlist: ${error?.message}`
    );
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
