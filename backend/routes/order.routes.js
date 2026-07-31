import express from "express";

import isAuthenticated from "../middlewares/auth/isAuthenticated.js";
import isAdmin from "../middlewares/auth/isAdmin.js";
import validate from "../middlewares/validate.js";

import {
  createOrder,
  cancelOrder,
  getUserOrders,
  getOrderDetailsForAdmin,
  getOrderDetailsForUser,
  updateOrderStatus,
  getRecentOrdersForDashboard,
  getOrderStatistics,
} from "../controllers/orders.controller.js";

const router = express.Router();

router.post("/create-order", isAuthenticated, isAdmin, createOrder);
router.patch("/cancel-order/:orderId", isAuthenticated, cancelOrder);
router.get("/get-user-orders", isAuthenticated, getUserOrders);
router.get("/get-order-details/:orderId", isAuthenticated, isAdmin, getOrderDetailsForAdmin);
router.get("/get-order-details-for-user/:orderId", isAuthenticated, getOrderDetailsForUser);
router.patch("/update-order-status/:orderId", isAuthenticated, isAdmin, updateOrderStatus);
router.get("/get-recent-orders-for-dashboard", isAuthenticated, isAdmin, getRecentOrdersForDashboard);
router.get("/get-order-statistics", isAuthenticated, isAdmin, getOrderStatistics);

export default router;
