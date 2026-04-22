import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new apiError(400, "User already exists");
  }

  const user = await User.create({
    name,
    email,
    password
  });

  res.status(201).json(
    new apiResponse(201, {email:user.email , name : user.name , password : user.password }, "User registered successfully")
  );
}); 
