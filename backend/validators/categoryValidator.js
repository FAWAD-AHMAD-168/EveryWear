import {body} from "express-validator";
const createCategoryValidator = [
  body("name")
    .notEmpty()
    .withMessage("Category name is required")

    // .trim()
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Category name can only contain letters, numbers, and spaces")

    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),
];

const editCategoryValidator = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Category name cannot be empty")
    .trim()
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Category name can only contain letters, numbers, and spaces")
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),
];


export { createCategoryValidator, editCategoryValidator };