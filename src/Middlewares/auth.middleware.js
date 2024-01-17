import { User } from "../Models/user.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    // get token from body or header
    const token =
      req.cookie?.accessTokenm ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log(token);
    // decode token
    if (!token) throw new ApiError(401, "Unauthorized request");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // find user by decoded token data
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) throw new ApiError(401, "Invalid Access Token");

    // set req user to user from decoded token
    req.user = user;
    // than forward to the next method
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid access token");
  }
});
