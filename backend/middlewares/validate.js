import { validationResult } from "express-validator";
import apiError from "../utils/apiError.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new apiError( 400, "Validation failed", errors.array());
  }
  next();
};

export default validate;