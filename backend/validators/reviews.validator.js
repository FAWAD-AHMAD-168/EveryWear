import { body } from "express-validator";
import { query } from "express-validator";

const createReviewValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ min: 10, max: 100 })
    .withMessage("Title must be between 10 and 100 characters."),

  body("description")
    .notEmpty()
    .withMessage("Review description is required.")
    .isLength({ min: 20, max: 1000 })
    .withMessage("Review description must be between 20 and 1000 characters."),

  body("rating")
    .notEmpty()
    .withMessage("Rating is required.")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5."),
];

const updateReviewValidator = [
  body("title")
    .optional()
    .isLength({ min: 10, max: 100 })
    .withMessage("Title must be between 10 and 100 characters."),

  body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5."),

  body("description")
    .optional()
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters."),
];

const getProductReviewsValidator = [
  query("limit")
    .optional()
    .isInt({ min: 20, max: 100 })
    .withMessage("Limit must be a number between 20 and 100."),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a number greater than or equal to 1."),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "rating"])
    .withMessage("Invalid value for sortBy."),

  query("sortOrder")
    .optional()
    .isIn(["oldest_first", "newest_first", "lowest_to_highest", "highest_to_lowest"])
    .withMessage("Invalid value for sortOrder."),
];


const getReviewsForAdminValidator = [
  query("limit")
    .optional()
    .isInt({ min: 20, max: 100 })
    .withMessage("Limit must be a number between 20 and 100."),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a number greater than or equal to 1."),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "rating"])
    .withMessage("Invalid value for sortBy."),

  query("sortOrder")
    .optional()
    .isIn(["oldest_first", "newest_first", "lowest_to_highest", "highest_to_lowest"])
    .withMessage("Invalid value for sortOrder."),

  query("search")
    .optional()
    .isString()
    .withMessage("Invalid value for search."),

  query("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be a number between 1 and 5."),
];

export { createReviewValidator, updateReviewValidator, getProductReviewsValidator, getReviewsForAdminValidator };
