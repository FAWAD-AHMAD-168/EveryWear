import express from "express";
import {
  createReview,
  deleteReview,
  getProductReviews,
  deleteReviewByAdmin,
  getProductReviewsForAdmin,
  updateReview,
} from "../controllers/reviews.controller.js";
import {
  createReviewValidator,
  updateReviewValidator,
  getProductReviewsValidator,
  getReviewsForAdminValidator,
} from "../validators/reviews.validator.js";
import validate from "../middlewares/validate.js";
import upload from "../middlewares/multer.js";
import isAuthenticated from "../middlewares/auth/isAuthenticated.js";
import isAdmin from "../middlewares/auth/isAdmin.js";

const router = express.Router();

router.post(
  "/create-review/:productId/:orderId",
  isAuthenticated,
  upload.single("reviewImage"),

  createReviewValidator,
  validate,
  createReview,
);
router.delete("/delete-review/:productId/:reviewId", isAuthenticated, deleteReview);
router.get("/get-product-reviews/:productId", getProductReviewsValidator, validate, getProductReviews);
router.delete("/delete-review-by-admin/:productId/:reviewId", isAuthenticated, isAdmin, deleteReviewByAdmin);
router.get(
  "/get-product-reviews-for-admin",
  isAuthenticated,
  isAdmin,
  getReviewsForAdminValidator,
  validate,
  getProductReviewsForAdmin,
);
router.patch(
  "/update-review/:productId/:reviewId",
  isAuthenticated,
  upload.single("reviewImage"),

  updateReviewValidator,
  validate,
  updateReview,
);

export default router;
