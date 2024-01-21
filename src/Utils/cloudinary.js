import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new ApiError(401, "Local file path is missing");
    }
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded
    console.log(`file is uploaded on cloudinary ${response.url}`);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove file locally saved temporary file as the upload operation got failed
    return null;
  }
};

/*-------------------------------------------------------------------------------------------------------------------------------------------------
cloudinary.uploader.upload(
  "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" },
  function (error, result) {
    console.log(result);
  }
  );
-----------------------------------------------------------------------------------------------------------------------------------------------------*/

// get video public_id upload
const getVideoDureation = async (public_id) => {
  const response = await cloudinary.api
    .resource(public_id, {
      resource_type: "video",
      media_metadata: true,
    })
    .then(function (result) {
      // console.log(result.video_duration);
      return result;
    });
  // console.log(response);
  return response.video_duration;
};

/*------------------------------------------------------------------------------------------------------------------------------------------------------- 
Useing the resource method with the media_metadata option to get video dureation:

cloudinary.v2.api.resource("public_id", { resource_type: "video", media_metadata: true })
 .then(function(result) {
     console.log(result.video_duration); // Access the duration here
 });
---------------------------------------------------------------------------------------------------------------------------------------------------------*/

export { uploadOnCloudinary, getVideoDureation };
