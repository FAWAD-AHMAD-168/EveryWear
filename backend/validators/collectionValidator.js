import { body } from "express-validator";

const createCollectionValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Collection name is required")
    .isLength({ max: 20 })
    .withMessage("Collection name must be at most 20 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Only letters and spaces allowed"),
  body("hasCategories")
    .optional()
    .isBoolean()
    .withMessage("hasCategories must be a boolean value"),
];

const editCollectionValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Collection name cannot be empty")
    .isLength({ max: 20 })
    .withMessage("Collection name must be at most 20 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Only letters and spaces allowed"),

  body("hasCategories")
    .optional()
    .isBoolean()
    .withMessage("hasCategories must be a boolean value"),
];
export { createCollectionValidator, editCollectionValidator };
