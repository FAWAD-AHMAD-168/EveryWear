import { query } from "express-validator";
import { body } from "express-validator";

const createOrderValidator = [
  body("shippingAddress")
    .exists({ checkNull: true })
    .withMessage("Shipping address is required.")
    .isObject()
    .withMessage("Please enter a valid shipping address before placing your order."),

  body("shippingAddress.fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Full name must be between 3 and 100 characters."),

  body("shippingAddress.email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("shippingAddress.phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required.")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 and 15 digits."),

  body("shippingAddress.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required.")
    .isLength({ min: 2, max: 60 })
    .withMessage("Country must be between 2 and 60 characters."),

  body("shippingAddress.province")
    .trim()
    .notEmpty()
    .withMessage("Province is required.")
    .isLength({ min: 2, max: 60 })
    .withMessage("Province must be between 2 and 60 characters."),

  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required.")
    .isLength({ min: 2, max: 60 })
    .withMessage("City must be between 2 and 60 characters."),

  body("shippingAddress.streetAddress")
    .trim()
    .notEmpty()
    .withMessage("Street address is required.")
    .isLength({ min: 5, max: 200 })
    .withMessage("Street address must be between 5 and 200 characters."),

  body("shippingAddress.postalCode")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Postal code must be between 3 and 20 characters."),

  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required.")
    .isIn(["cash_on_delivery", "stripe", "paypal", "jazzcash", "bank_transfer"])
    .withMessage("Invalid payment method."),

  body("notes")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters."),
];

const orderQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page number must be a positive number"),
  query("limit")
    .optional()
    .isInt({ min: 10, max: 50 })
    .withMessage("Page size must be a positive integer between 10 and 50"),
  query("status")
    .optional()
    .isIn([
      "pending",
      "confirmed",
      "processing",
      "packed",
      "shipped",
      "outForDelivery",
      "delivered",
      "cancelled",
      "returned",
      "refunded",
    ])
    .withMessage("Invalid order status"),
  query("sortBy").optional().isIn(["createdAt", "price"]).withMessage("Invalid sort field"),
  query("sortOrder")
    .optional()
    .isIn(["oldest_to_newest", "newest_to_oldest", "low_to_high", "high_to_low"])
    .withMessage("Invalid sort order"),
  query("paymentStatus")
    .optional()
    .isIn(["pending", "completed", "failed", "refunded"])
    .withMessage("Invalid payment status"),
  query("paymentMethod")
    .optional()
    .isIn(["cash_on_delivery", "credit_card", "paypal", "bank_transfer"])
    .withMessage("Invalid payment method"),
  query("lowerPrice").optional().isFloat({ min: 0 }).withMessage("Lower price must be a positive number"),
  query("upperPrice").optional().isFloat({ min: 0 }).withMessage("Upper price must be a positive number"),
  query("minPrice").optional().isFloat({ min: 0 }).withMessage("Minimum price must be a positive number"),
  query("maxPrice").optional().isFloat({ min: 0 }).withMessage("Maximum price must be a positive number"),
  query("city").optional().trim().notEmpty().withMessage("City is required"),
  query("province").optional().trim().notEmpty().withMessage("Province is required"),
  query("dateFilter").optional().isIn(["custom", "last_7_days", "last_30_days"]).withMessage("Invalid date filter"),
  query("startDate").optional().isISO8601().withMessage("Invalid start date format"),
  query("endDate").optional().isISO8601().withMessage("Invalid end date format"),
];

export { createOrderValidator, orderQueryValidator };
