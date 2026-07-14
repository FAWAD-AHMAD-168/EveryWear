import express from "express";
const router = express.Router();


import { addToCart,getCart,removeFromCart,clearCart , updateCartItem } from "../controllers/cartController.js";
import isAuthenticated from "../middlewares/auth/isAuthenticated.js";

router.post("/add-to-cart/:productId", isAuthenticated, addToCart);
router.delete("/remove-from-cart/:itemId", isAuthenticated, removeFromCart);
router.patch("/update-cart/:itemId", isAuthenticated, updateCartItem);
router.delete("/clear-cart", isAuthenticated, clearCart);
router.get("/", isAuthenticated, getCart);
export default router;
