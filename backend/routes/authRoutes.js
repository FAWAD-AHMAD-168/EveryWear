import express from "express";
const router = express.Router();
import { registerUser , verifyOtp , loginUser , logoutUser } from "../controllers/authController.js";
import validate from "../middlewares/validate.js";
import  {registerValidator,verifyOtpValidator , loginValidator }  from "../validators/authValidator.js";
import authMiddleware from "../middlewares/authMiddleware.js";

router.post("/register", registerValidator, validate, registerUser);
router.post("/verify-otp", verifyOtpValidator, validate, verifyOtp);
router.post("/login", loginValidator, validate, loginUser);
router.post("/logout" ,authMiddleware,  logoutUser);


export default router;