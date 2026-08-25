import rateLimit from "express-rate-limit";

// Login rate limiter
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

// Registration rate limiter
const registerRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },
});

// OTP verification rate limiter
const verifyOtpRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP verification attempts. Please try again later.",
  },
});

// Resend OTP rate limiter
const resendOtpRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 13,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again later.",
  },
});

// Refresh token rate limiter
const refreshTokenRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many token refresh requests. Please try again later.",
  },
});

export {
  loginRateLimit,
  registerRateLimit,
  verifyOtpRateLimit,
  resendOtpRateLimit,
  refreshTokenRateLimit,
};