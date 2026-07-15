import express from "express";
const router = express.Router();
import { registerUser , verifyOtp , loginUser , logoutUser } from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.js";
import  {registerValidator,verifyOtpValidator , loginValidator }  from "../validators/auth.validator.js";
import isAuthenticated from "../middlewares/auth/isAuthenticated.js";

router.post("/register", registerValidator, validate, registerUser);
router.post("/verify-otp", verifyOtpValidator, validate, verifyOtp);
router.post("/login", loginValidator, validate, loginUser);
router.post("/logout" ,isAuthenticated,  logoutUser);


export default router;