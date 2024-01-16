import { User } from "../Models/user.model.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponce } from "../Utils/ApiResponce.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";

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

    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0].path;
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
    console.log(`registration error : ${error}`);
  }
});

export default registerUser;
