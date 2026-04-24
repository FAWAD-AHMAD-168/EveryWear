import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import sendEmail from "../services/resendEmail.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Register
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new apiError(400, "User already exists!");
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

  const response = await sendEmail(
    user.email,
    "Email Verification - EveryWear",
    `
    <html>
      <body>
        <p>Your verification code is:</p>
        <h2>${otp}</h2>
        <p>This OTP will expire in 10 minutes.</p>
      </body>
    </html>
  `,
  );

  return res.status(201).json(
    new apiResponse(
      201,
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      "User registered successfully! Please check your email for the verification code.",
    ),
  );
});

//verify OTP

const verifyOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError(404, "User not found!");
  }
  if (user.verificationOtp !== otp) {
    throw new apiError(400, "Invalid OTP!");
  }
  if (Date.now() > user.verificationOtpExpiresAt) {
    throw new apiError(400, "Verification code has expired!");
  }

  user.isVerified = true;
  user.verificationOtp = null;
  user.verificationOtpExpiresAt = null;
  await user.save();

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        null,
        "Email verified successfully! You can now log in.",
      ),
    );
});

//login

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new apiError(404, "User not found!");
  }
  if (!user.isVerified) {
    throw new apiError(
      400,
      "Email not verified! Please verify your email before logging in.",
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new apiError(400, "Invalid credentials!");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, options);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        accessToken,
        refreshToken,
        user: { id: user._id, email: user.email, name: user.name },
      },
      "Login successful!",
    ),
  );
});

//logout
const logoutUser = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const user = await User.findById(id);
  if (!user) {
    throw new apiError(404, "User not found!");
  }
  user.refreshToken = null;
  await user.save();

  res.clearCookie("refreshToken", options);

  return res
    .status(200)
    .json(new apiResponse(200, null, "Logged out successfully!"));
});

export { registerUser, verifyOtp, loginUser, logoutUser };
