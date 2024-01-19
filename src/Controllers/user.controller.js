import { User } from "../Models/user.model.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponce } from "../Utils/ApiResponce.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    // console.log(user);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      `Somthing went wrong while creating tokens ${error}`
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user data from client
  // validation - not empty
  // user check
  // get image and file from client usign cloudinary middleware
  // image and avatar check
  // upload into cloudinary, avatar
  // create user object - create entry in  db
  // remove password and refresh token field from responce
  // check for user creation
  // return responce
  try {
    const { fullName, email, username, password } = req.body;

    if (
      [fullName, username, email, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new Error("Please fill all fields");
    }

    const existedUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existedUser) {
      throw new ApiError(409, "user with this email already exists");
    }

    // console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log(avatarLocalPath);
    // const coverImageLocalPath = req.files?.coverImage[0].path;

    let coverImageLocalPath;
    if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
      throw new Error("Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // console.log(avatar);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
      throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "somthing went wrong while registering the user");
    }

    return res
      .status(201)
      .json(
        new ApiResponce(200, createdUser, "user registration successfully")
      );
  } catch (error) {
    throw new ApiError(500, `registration error : ${error?.message}`);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // get login data form body
  const { username, email, password } = req.body;

  // login method username or email
  if (!username && !email) {
    throw new ApiError(401, "username or email is required");
  }

  // find user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) throw new ApiError(404, "user not found");

  // check password
  const isPasswordMatched = await user.isPasswordCorrect(password);
  if (!isPasswordMatched) throw new ApiError(401, "Invalid user credentials");
  // create and send token
  // console.log(user._id);
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  // remove password from output
  const loggedInUser = await User.findById(user._id).select(
    "-passowrd -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponce(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // get user access from middleware
  await User.findByIdAndUpdate(
    req.user._id,
    {
      // revoke the refresh token
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponce(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // get refreshToken form cli
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized  request");

  try {
    // decode token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    // find user by decoded token data
    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "Invalid refresh Token");
    // check if user's current token is same as what we have in db
    if (incomingRefreshToken !== user?.refreshToken)
      throw new ApiError(401, "Refresh token is expired or used");

    // generate new token and send it to the cli
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponce(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) throw new ApiError(400, "invalid password");
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponce(200, {}, "Password updated"));
  } catch (error) {
    throw new ApiError(500, "error while update the password", error?.message);
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponce(200, req.user, "user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) throw new ApiError(400, "All fields are required");

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullName: fullName,
          email: email,
        },
      },
      {
        new: true, // Return the updated document instead of the original one.
      }
    ).select("-password");

    return res
      .status(200)
      .json(new ApiResponce(200, user, "details updated successfully"));
  } catch (error) {
    throw new ApiError(
      401,
      `Error while update account details : ${error?.message}`
    );
  }
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  try {
    const avatarImageLocalPath = req.file?.path;

    if (!avatarImageLocalPath)
      throw new ApiError(400, "avatar image file is missing");

    const avatarImage = await uploadOnCloudinary(avatarImageLocalPath);
    if (!avatarImage.url)
      throw new ApiError(400, "Error while uploading on avatarImage");
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatarImage.url,
        },
      },
      { new: true }
    ).select("-password");

    return res
      .status(200)
      .json(new ApiResponce(200, user, "avatarImage updated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  try {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath)
      throw new ApiError(400, "cover image file is missing");

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url)
      throw new ApiError(400, "Error while uploading on coverImage");
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: coverImage.url,
        },
      },
      { new: true }
    ).select("-password");

    return res
      .status(200)
      .json(new ApiResponce(200, user, "coverImage updated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  // get user from params
  // filter data which is required
  try {
    const { username } = req.params;

    if (!username?.trim()) throw new ApiError(400, "username is missing");

    const channel = await User.aggregate([
      {
        $match: {
          username: username?.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          subscribersCount: {
            $size: "$subscribers",
          },
          channelsSubscribedToCount: {
            $size: "$subscribedTo",
          },
          isSubscribed: {
            $cond: {
              if: { $in: [req.user?._id, "$subscribers.subscriber"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          subscribersCount: 1,
          channelsSubscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
        },
      },
    ]);

    if (!channel?.length) throw new ApiError(404, "channel does not exists");

    return res
      .status(200)
      .json(
        new ApiResponce(200, channel[0], "user channel fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getUserWatchHistory = asyncHandler(async (req, res) => {
  try {
    const user = User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user?._id),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "watchHistory",
          foreignField: "_id",
          as: "watchHistory",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      fullName: 1,
                      username: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                owner: {
                  $first: "$owner",
                },
              },
            },
          ],
        },
      },
    ]);
    return res
      .status(200)
      .json(
        new ApiResponce(
          200,
          user[0]?.watchHistory || [],
          "Watch history fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getUserWatchHistory,
};
