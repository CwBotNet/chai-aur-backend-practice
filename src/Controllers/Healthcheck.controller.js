import { ApiError } from "../Utils/ApiError.js";
import { ApiResponce } from "../Utils/ApiResponce.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

//TODO: build a healthcheck response that simply returns the OK status as json with a message
const healthcheck = asyncHandler(async (req, res) => {
  try {
    return res.status(200).json(new ApiResponce(200, "OK"));
  } catch (error) {
    throw new ApiError(500, `bad request : ${error?.message}`);
  }
});

export { healthcheck };
