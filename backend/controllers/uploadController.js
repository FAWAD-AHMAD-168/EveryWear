import asyncHandler from "../utils/asyncHandler.js";

import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import User from "../models/userModel.js";
const uploadFile = asyncHandler(async (req, res) => {
  const file = req.file;
  const filepath = file.path;
  console.log("filepath ", filepath);
  if (!filepath) {
    throw new apiError(400, "No file uploaded");
  }
  const result = await uploadOnCloudinary(filepath);
  if (!result) {
    throw new apiError(500, "Failed to upload file");
  }
  await User.create({
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
    profilePicture: result.secure_url
  });

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { public_id: result.public_id, url: result.secure_url },
        "File uploaded successfully",
      ),
    );
});

export { uploadFile };
