import { User } from "../Models/user.model.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponce } from "../Utils/ApiResponce.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessAndRefreshTokens();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Somthing went wrong while creating tokens");
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
    console.log(avatarLocalPath);
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
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
      throw new ApiError(400, "Avatar file is requied");
    }

    const user = await user.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowercase(),
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
  if (!username || !email) {
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
    const user = await User.findById(decodedToken?.userId);
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

export { registerUser, loginUser, logoutUser, refreshAccessToken };
