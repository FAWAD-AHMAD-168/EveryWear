import User from "../models/user.model.js";
import asyncHandler from "../utils/async-handler.js";
import apiError from "../utils/api-error.js";
import apiResponse from "../utils/api-response.js";
import sendEmail from "../services/resendEmail.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";
import verificationOtpEmail from "../email-templates/auth/verification-otp-email.js";
import resendOtpEmail from "../email-templates/auth/resend-otp-email.js";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new apiError(400, "Invalid credentials!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = Date.now() + 10 * 60 * 1000;

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    verificationOtp: otp,
    verificationOtpExpiresAt: otpExpiresAt,
  });
  const emailContent = verificationOtpEmail(otp);

  await sendEmail(user.email, "Email Verification - EveryWear", emailContent);

  return res.status(201).json(
    new apiResponse(
      201,
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      "Account created successfully!",
    ),
  );
});

//verify OTP

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError(404, "Invalid credentials!");
  }
  if (user.verificationOtp !== otp) {
    throw new apiError(400, "Invalid OTP!");
  }
  if (Date.now() > user.verificationOtpExpiresAt) {
    throw new apiError(400, "Verification OTP has expired!");
  }

  user.isVerified = true;
  user.verificationOtp = null;
  user.verificationOtpExpiresAt = null;
  await user.save();

  return res.status(200).json(new apiResponse(200, null, "Account verified successfully! You can now log in."));
});

// Resend OTP
const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new apiError(404, "User not found!");
  }
  if (user.isVerified) {
    throw new apiError(400, "Email already verified!");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = Date.now() + 10 * 60 * 1000;

  const emailContent = resendOtpEmail(otp);

  const response = await sendEmail(user.email, "Resend Verification OTP - EveryWear", emailContent);
  console.log(response);

  user.verificationOtp = otp;
  user.verificationOtpExpiresAt = otpExpiresAt;
  await user.save();

  return res.status(200).json(new apiResponse(200, null, "New verification OTP sent! Please check your email."));
});

//login

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new apiError(404, "Invalid credentials!");
  }
  if (!user.isVerified) {
    throw new apiError(400, "Email not verified! Please verify your email before logging in.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new apiError(400, "Invalid credentials!");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  user.refreshToken = hashedRefreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, options);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        accessToken,

        user: { id: user._id, email: user.email, name: user.name, role: user.role },
      },
      "Login successful!",
    ),
  );
});

//logout
const logoutUser = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const user = await User.findById(id);
  if (!user) {
    throw new apiError(404, "User not found!");
  }
  user.refreshToken = null;
  await user.save();

  res.clearCookie("refreshToken", options);

  return res.status(200).json(new apiResponse(200, null, "Logged out successfully!"));
});

//// Generate a new access token using a valid refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new apiError(401, "Your session has expired. Please log in again.");
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new apiError(401, "Your session has expired. Please log in again.");
    }

    if (err.name === "JsonWebTokenError") {
      throw new apiError(401, "Your session is no longer valid. Please log in again.");
    }

    throw new apiError(401, "Your session could not be verified. Please log in again.");
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new apiError(401, "Your session is no longer valid. Please log in again.");
  }

  const isValidRefreshToken = await bcrypt.compare(refreshToken, user.refreshToken);

  if (!isValidRefreshToken) {
    user.refreshToken = null;
    await user.save();

    throw new apiError(401, "Your session is no longer valid. Please log in again.");
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

  user.refreshToken = hashedNewRefreshToken;
  await user.save();

  res.cookie("refreshToken", newRefreshToken, options);

  return res.status(200).json(new apiResponse(200, { accessToken: newAccessToken }, "Session refreshed successfully."));
});
//Profile Image Upload For the User
const uploadProfileImage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    throw new apiError(404, "User not found!");
  }
  const image = req.file;
  if (!image) {
    throw new apiError(400, "No image file provided!");
  }
  const result = await uploadOnCloudinary(image.path, "EveryWear/Users/profile-images");
  if (!result) {
    throw new apiError(500, "Failed to upload profile image.");
  }
  user.profileImage = {
    imageUrl: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();
  return res
    .status(200)
    .json(new apiResponse(200, { profileImage: user.profileImage }, "Profile image uploaded successfully!"));
});

// Delete Profile Image For the User
const deleteProfileImage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    throw new apiError(404, "User not found!");
  }
  if (!user.profileImage || !user.profileImage.publicId) {
    throw new apiError(400, "No profile image to delete!");
  }
  await deleteFromCloudinary(user.profileImage.publicId);
  user.profileImage.imageUrl = null;
  user.profileImage.publicId = null;
  await user.save();
  return res.status(200).json(new apiResponse(200, null, "Profile image deleted successfully!"));
});

// Edit Profile Image For the User
const editProfileImage = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new apiError(404, "User not found!");
  }

  const newImage = req.file;

  if (!newImage) {
    throw new apiError(400, "No image file provided!");
  }

  // Delete the existing profile image if one exists
  if (user.profileImage.imageUrl && user.profileImage.publicId) {
    const deletionResult = await deleteFromCloudinary(user.profileImage.publicId);

    if (deletionResult.result !== "ok") {
      throw new apiError(500, "Failed to delete old profile image.");
    }
  }

  // Upload the new profile image
  const result = await uploadOnCloudinary(newImage.path, "EveryWear/Users/profile-images");

  if (!result) {
    throw new apiError(500, "Failed to upload profile image.");
  }

  user.profileImage = {
    imageUrl: result.secure_url,
    publicId: result.public_id,
  };

  await user.save();

  return res
    .status(200)
    .json(new apiResponse(200, { profileImage: user.profileImage }, "Profile image updated successfully!"));
});

export {
  registerUser,
  verifyOtp,
  loginUser,
  logoutUser,
  uploadProfileImage,
  editProfileImage,
  deleteProfileImage,
  refreshAccessToken,
  resendOTP,
};
