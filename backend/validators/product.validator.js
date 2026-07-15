import { body } from "express-validator";

const createProductValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Product name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Product description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Product description must be between 10 and 500 characters"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number")
    .toFloat(),

  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be a number between 0 and 100")
    .toFloat(),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean")
    .toBoolean(),

  body("isLimitedEdition")
    .optional()
    .isBoolean()
    .withMessage("isLimitedEdition must be a boolean")
    .toBoolean(),
];

const editProductValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),

    body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Product description must be between 10 and 500 characters"),

    body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number")
    .toFloat(),

    body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be a number between 0 and 100")
    .toFloat(),

    body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean")
    .toBoolean(),

    body("isLimitedEdition")
    .optional()
    .isBoolean()
    .withMessage("isLimitedEdition must be a boolean")
    .toBoolean(),


]

export { createProductValidator, editProductValidator };