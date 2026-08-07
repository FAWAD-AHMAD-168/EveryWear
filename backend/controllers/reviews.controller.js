import AsyncHandler from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";

import Product from "../models/product.model.js";
import Order from "../models/orders.model.js";
import Review from "../models/reviews.model.js";

import mongoose from "mongoose";

//Create  a Review

const createReview = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId, orderId } = req.params;
  const { title, description, rating } = req.body;
  const reviewImage = req.file;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID.");
  }
  const order = await Order.findOne({ _id: orderId, user: userId, "items.product": productId });
  if (!order) {
    throw new ApiError(400, "You can only review products you have purchased.");
  }
  const existingReview = await Review.findOne({ user: userId, product: productId, order: order._id });
  if (existingReview) {
    throw new ApiError(400, "You have already given a review for this product.");
  }
  const product = await Product.findById({ _id: productId });
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }
  let uploadedImage = null;
  if (reviewImage) {
    uploadedImage = await uploadOnCloudinary(reviewImage.path, "Reviews");
    if (!uploadedImage) {
      throw new ApiError(500, "Failed to upload review image.");
    }
  }
  const review = new Review({
    user: userId,
    product: productId,
    order: order._id,
    title,
    description,
    rating,
    reviewImage: {
      public_id: uploadedImage?.public_id,
      url: uploadedImage?.secure_url,
    },
  });

  await review.save();

  product.totalReviews += 1;
  product.totalRatings += rating;
  product.averageRating = Number((product.totalRatings / product.totalReviews).toFixed(1));

  await product.save();

  return res.status(201).json(new ApiResponse(201, review, "Review created successfully."));
});

//Delete a Review for the user who created it

const deleteReview = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId, reviewId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "Invalid review ID.");
  }
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }

  const review = await Review.findOne({ _id: reviewId, user: userId, product: productId });
  const product = await Product.findById({ _id: productId });
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }
  if (!review) {
    throw new ApiError(404, "Review not found.");
  }
  if (review.reviewImage && review.reviewImage.public_id) {
    await deleteFromCloudinary(review.reviewImage.public_id);
  }

  await review.deleteOne();

  product.totalReviews -= 1;
  product.totalRatings -= review.rating;
  if (product.totalReviews === 0) {
    product.averageRating = 0;
  } else {
    product.averageRating = Number((product.totalRatings / product.totalReviews).toFixed(1));
  }
  await product.save();
  return res.status(200).json(new ApiResponse(200, {}, "Review deleted successfully."));
});

// Get all reviews for a product

const getProductReviews = AsyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { limit, page, sortBy, sortOrder } = req.query;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }

  const pageNumber = parseInt(page) || 1;
  const pageLimit = parseInt(limit) || 5;

  const skip = (pageNumber - 1) * pageLimit;
  const totalReviews = await Review.countDocuments({ product: productId });
  const totalPages = Math.ceil(totalReviews / pageLimit);
  const hasNextPage = pageNumber < totalPages;
  const hasPrevPage = pageNumber > 1;
  let sortOptions = {};
  if (sortBy === "createdAt") {
    sortOptions = sortOrder === "oldest_first" ? { createdAt: 1 } : { createdAt: -1 };
  }
  if (sortBy === "rating") {
    sortOptions = sortOrder === "lowest_to_highest" ? { rating: 1 } : { rating: -1 };
  }

  const reviews = await Review.find({ product: productId })
    .populate("user", "name email")
    .skip(skip)
    .limit(pageLimit)
    .sort(sortOptions);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { reviews, totalReviews, totalPages, hasNextPage, hasPrevPage },
        "Reviews fetched successfully.",
      ),
    );
});

// Get ALL Reviews for Admin

const getProductReviewsForAdmin = AsyncHandler(async (req, res) => {
  const { limit, page, sortBy, sortOrder, search, rating } = req.query;

  const pageNumber = parseInt(page) || 1;
  const pageLimit = parseInt(limit) || 20;
  const ratingValue = parseInt(rating) || null;
  let filterOptions = {};

  filterOptions = search ? { description: { $regex: search, $options: "i" } } : {};
  filterOptions = ratingValue ? { ...filterOptions, rating: ratingValue } : { ...filterOptions };
  let sortOptions = {};
  if (sortBy === "createdAt") {
    sortOptions = sortOrder === "oldest_first" ? { createdAt: 1 } : { createdAt: -1 };
  }
  if (sortBy === "rating") {
    sortOptions = sortOrder === "lowest_to_highest" ? { rating: 1 } : { rating: -1 };
  }

  const skip = (pageNumber - 1) * pageLimit;
  const totalReviews = await Review.countDocuments(filterOptions);
  const totalPages = Math.ceil(totalReviews / pageLimit);
  const hasNextPage = pageNumber < totalPages;
  const hasPrevPage = pageNumber > 1;

  const reviews = await Review.find(filterOptions)
    .populate("user", "name email")
    .populate("order", "orderNumber")
    .populate("product", "name slug")
    .skip(skip)
    .limit(pageLimit)
    .sort(sortOptions);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { reviews, totalReviews, totalPages, hasNextPage, hasPrevPage },
        "Reviews fetched successfully.",
      ),
    );
});

//Delete a Review by Admin

const deleteReviewByAdmin = AsyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "Invalid review ID.");
  }
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }
  const review = await Review.findOneAndDelete({ _id: reviewId, product: productId });

  if (!review) {
    throw new ApiError(404, "Review not found.");
  }
  if (review.reviewImage && review.reviewImage.public_id) {
    await deleteFromCloudinary(review.reviewImage.public_id);
  }

  product.totalReviews -= 1;
  product.totalRatings -= review.rating;
  if (product.totalReviews === 0) {
    product.averageRating = 0;
  } else {
    product.averageRating = Number((product.totalRatings / product.totalReviews).toFixed(1));
  }
  await product.save();
  return res.status(200).json(new ApiResponse(200, review, "Review deleted successfully."));
});

//Update the review

const updateReview = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { reviewId, productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "Invalid review ID.");
  }
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }
  const { title, description, rating } = req.body;
  const newReviewImage = req.file;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  const review = await Review.findOne({ _id: reviewId, user: userId, product: productId });

  if (!review) {
    throw new ApiError(404, "Review not found.");
  }

  if (title !== undefined && title !== null) {
    review.title = title;
  }

  if (description !== undefined && description !== null) {
    review.description = description;
  }
  if (rating !== undefined && rating !== null) {
    const oldRating = review.rating;
    review.rating = rating;
    product.totalRatings = product.totalRatings - oldRating + rating;
    product.averageRating = Number((product.totalRatings / product.totalReviews).toFixed(1));
    await product.save();
  }

  if (newReviewImage) {
    if (review.reviewImage && review.reviewImage.public_id) {
      await deleteFromCloudinary(review.reviewImage.public_id);
    }
    const uploadedImage = await uploadOnCloudinary(newReviewImage.path, "Reviews");
    if (!uploadedImage) {
      throw new ApiError(500, "Failed to upload review image.");
    }
    review.reviewImage = {
      url: uploadedImage.secure_url,
      public_id: uploadedImage.public_id,
    };
  }

  await review.save();
  return res.status(200).json(new ApiResponse(200, review, "Review updated successfully."));
});

export { createReview, deleteReview, getProductReviews, deleteReviewByAdmin, getProductReviewsForAdmin, updateReview };
