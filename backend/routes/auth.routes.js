import express from "express";
const router = express.Router();
import {
  registerUser,
  verifyOtp,
  loginUser,
  logoutUser,
  uploadProfileImage,
  editProfileImage,
  deleteProfileImage,
  refreshAccessToken,
  resendOTP,
} from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.js";
import {
  registerValidator,
  verifyOtpValidator,
  loginValidator,
  resendOtpValidator,
} from "../validators/auth.validator.js";
import {
  loginRateLimit,
  registerRateLimit,
  verifyOtpRateLimit,
  resendOtpRateLimit,
  refreshTokenRateLimit,
} from "../middlewares/rate-limits/auth-rate-limits.js";
import isAuthenticated from "../middlewares/auth/isAuthenticated.js";
import upload from "../middlewares/multer.js";

router.post("/register", registerRateLimit, registerValidator, validate, registerUser);
router.post("/verify-otp", verifyOtpRateLimit, verifyOtpValidator, validate, verifyOtp);
router.post("/login", loginRateLimit, loginValidator, validate, loginUser);
router.post("/logout", isAuthenticated, logoutUser);
router.post("/upload-profile-image", isAuthenticated, upload.single("profileImage"), uploadProfileImage);
router.put("/edit-profile-image", isAuthenticated, upload.single("profileImage"), editProfileImage);
router.delete("/delete-profile-image", isAuthenticated, deleteProfileImage);
router.post("/refresh-access-token", refreshTokenRateLimit, refreshAccessToken);
router.post("/resend-otp", resendOtpRateLimit, resendOtpValidator, validate, resendOTP);

export default router;
