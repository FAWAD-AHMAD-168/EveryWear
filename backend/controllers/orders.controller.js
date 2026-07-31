import AsyncHandler from "../utils/async-handler.js";
import apiError from "../utils/api-error.js";
import apiResponse from "../utils/api-response.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";
import mongoose from "mongoose";
import generateOrderId from "../utils/generate-order-id.js";
import Order from "../models/orders.model.js";

//Create an Order
const createOrder = AsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress } = req.body;
  const { notes } = req.body;
  const { paymentMethod } = req.body;

  const { fullName, email, phone, country, province, city, streetAddress, postalCode } = shippingAddress;

  if (!fullName || !email || !phone || !country || !province || !city || !streetAddress) {
    throw new apiError(400, "All fields in shipping address are required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new apiError(404, "User not found");
  }
  // // Store product snapshots so order details remain unchanged even if the product is updated later.
  const confirmedOrderItems = [];
  const billingDetails = {
    subTotal: 0,
    discount: 0,
    shippingFees: 150,
    tax: 0,
    grandTotal: 0,
  };
  const paymentInfo = {
    paymentMethod: "",
    paymentStatus: "Pending",
    paidAt: null,
    transactionId: null,
  };

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    console.log("transaction started ");
    const cart = await Cart.findOne({ user: userId }).session(session).populate("items.product");
    if (!cart) {
      throw new apiError(404, "Cart not found");
    }

    if (cart.items.length === 0) {
      throw new apiError(400, "Cart is empty");
    }

    const orderItems = cart.items;

    for (const item of orderItems) {
      const product = item.product;
      const availableSizes = product.sizes;
      let sizeAvailable = false;
      let isStockAvailable = false;

      for (const size of availableSizes) {
        if (size.size === item.size) {
          sizeAvailable = true;
          if (size.stock >= item.quantity) {
            isStockAvailable = true;
            size.stock -= item.quantity;
            await product.save({ session });
          }
        }
      }
      if (sizeAvailable && isStockAvailable) {
        const orderItem = {
          product: product._id,
          productName: product.name,
          size: item.size,
          quantity: item.quantity,
          priceAtPurchase: product.price,
          discountedPriceAtPurchase: product.discountedPrice,
          productImage: product.images.length > 0 ? product.images[0].imageUrl : null,
        };
        confirmedOrderItems.push(orderItem);

        billingDetails.subTotal += product.price * item.quantity;

        billingDetails.discount += (product.price - product.discountedPrice) * item.quantity;
        billingDetails.grandTotal += orderItem.discountedPriceAtPurchase * orderItem.quantity;
      }

      if (paymentMethod === "cash_on_delivery") {
        paymentInfo.paymentMethod = "cash_on_delivery";
        paymentInfo.paymentStatus = "pending";
      }

      if (!sizeAvailable) {
        throw new apiError(400, `Size ${item.size} is not available  for  ${product.name}`);
      }
      if (sizeAvailable && !isStockAvailable) {
        throw new apiError(400, `Size ${item.size} is not  available in required quantity  for ${product.name} `);
      }
    }

    billingDetails.grandTotal += billingDetails.shippingFees + billingDetails.tax;
    const orderId = generateOrderId();
    console.log("Generated Order ID:", orderId);

    //create order with all the details
    const order = new Order({
      user: userId,
      orderId: orderId,
      items: confirmedOrderItems,
      billingDetails: billingDetails,
      paymentInfo: paymentInfo,
      shippingAddress: shippingAddress,
      notes: notes,
    });

    await order.save({ session });

    const cartToBeCleared = await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } }, { session });

    await session.commitTransaction();
    console.log("transaction committed ");

    return res.status(200).json(new apiResponse(200, order, "Order placed successfully. You will receive an email confirmation shortly."));
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
      console.log("transaction aborted ");
    }
    throw error;
  } finally {
    session.endSession();
  }
});

// Get all orders for a user
const getUserOrders = AsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  if (!orders || orders.length === 0) {
    throw new apiError(404, "No orders found ");
  }
  return res.status(200).json(new apiResponse(200, orders, "User orders fetched successfully"));
});

//Cancel the Order

const cancelOrder = AsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.params;
  const { reason, description } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    console.log("transaction started ");
    if (reason === "Other" && description.trim() === "") {
      throw new apiError(400, "Description is required");
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).session(session);

    if (!order) {
      throw new apiError(404, "Order not found");
    }

    if (order.status === "cancelled") {
      throw new apiError(400, "Order is already cancelled");
    }
    if (
      order.status === "shipped" ||
      order.status === "outForDelivery" ||
      order.status === "delivered" ||
      order.status === "returned" ||
      order.status === "refunded"
    ) {
      throw new apiError(400, "Order cannot be cancelled once it has been shipped or delivered");
    }

    const items = order.items;
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new apiError(404, "Product  not found");
      }
      const availableSizes = product.sizes;
      for (const size of availableSizes) {
        if (size.size === item.size) {
          size.stock += item.quantity;
          await product.save({ session });
          break;
        }
      }
    }

    order.status = "cancelled";
    order.cancellationInfo.reason = reason;
    order.cancellationInfo.description = description;
    order.cancellationInfo.cancellationDate = new Date();
    order.cancellationInfo.cancelledBy = userId;
    await order.save({ session });

    await session.commitTransaction();
    console.log("transaction committed ");

    return res.status(200).json(new apiResponse(200, order.status, "Order Cancelled"));
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
      console.log("transaction aborted ");
      throw error;
    }
  } finally {
    await session.endSession();
  }
});

//get details of a single order
const getOrderDetailsForAdmin = AsyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOne({
    _id: orderId,
  });

  if (!order) {
    throw new apiError(404, "Order not found");
  }

  return res.status(200).json(new apiResponse(200, order, "Order details fetched successfully"));
});

const getOrderDetailsForUser = AsyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    throw new apiError(404, "Order not found");
  }

  return res.status(200).json(new apiResponse(200, order, "Order details fetched successfully"));
});
//Update order status by admin
const updateOrderStatus = AsyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  if (!status) {
    throw new apiError(400, "Status is required");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new apiError(404, "Order not found");
  }
  if (status === "delivered" && order.status !== "outForDelivery") {
    throw new apiError(400, "Order cannot be marked as delivered unless it is out for delivery");
  }

  if (status === "delivered" && order.paymentInfo.paymentMethod === "cash_on_delivery") {
    if (order.paymentInfo.paymentStatus !== "completed") {
      order.paymentInfo.paymentStatus = "completed";
      order.paymentInfo.paymentDate = new Date();
    }
  }
  order.status = status;
  await order.save();
  return res.status(200).json(new apiResponse(200, order, "Order status updated successfully"));
});

//Get Recent Orders for Dashboard
const getRecentOrdersForDashboard = AsyncHandler(async (req, res) => {
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(4).select("orderId status billingDetails createdAt");

  if (!recentOrders || recentOrders.length === 0) {
    throw new apiError(404, "No recent orders found");
  }

  return res.status(200).json(new apiResponse(200, recentOrders, "Recent orders fetched successfully"));
});

//Order Statistics

const getOrderStatistics = AsyncHandler(async (req, res) => {
  const [totalOrders, totalRevenue, monthlyRevenue, totalOrderStatsByStatus] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      {
        $match: {
          status: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$billingDetails.grandTotal" },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          status: "delivered",
          "paymentInfo.paymentStatus": "completed",
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: "$billingDetails.grandTotal" },
          orders: { $sum: 1 },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]),

    Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        totalOrders,
        totalRevenue,
        monthlyRevenue,
        totalOrderStatsByStatus,
      },
      "Order statistics fetched successfully",
    ),
  );
});







export {
  createOrder,
  getRecentOrdersForDashboard,
  getUserOrders,
  cancelOrder,
  getOrderDetailsForAdmin,
  getOrderDetailsForUser,
  updateOrderStatus,
  getOrderStatistics,
};
