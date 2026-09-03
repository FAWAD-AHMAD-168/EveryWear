import AsyncHandler from "../utils/async-handler.js";
import apiError from "../utils/api-error.js";
import apiResponse from "../utils/api-response.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";
import mongoose from "mongoose";
import generateOrderId from "../utils/orders/generate-order-id.js";
import getDateRange from "../utils/orders/get-date-range.js";
import buildSortOptions from "../utils/orders/build-sort-options.js";
import buildFilterOptions from "../utils/orders/build-order-filters.js";
import Order from "../models/orders.model.js";

import sendEmail from "../services/resendEmail.js";
import orderPlacedEmail from "../email-templates/orders/order-placed-email.js";
import orderCancelledEmail from "../email-templates/orders/order-cancelled-email.js";
import orderConfirmedEmail from "../email-templates/orders/order-confirmed-email.js";
import orderShippedEmail from "../email-templates/orders/order-shipped-email.js";
import orderDeliveredEmail from "../email-templates/orders/order-delivered-email.js";

// Create a new order from the authenticated user's cart and process inventory updates.

const createOrder = AsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress } = req.body;
  const { notes } = req.body;
  const { paymentMethod } = req.body;

  const { fullName, email, phone, country, province, city, streetAddress, postalCode } = shippingAddress;

  // Store product snapshots so order details remain unchanged even if the product is updated later.
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
    paymentStatus: "pending",
    paidAt: null,
    transactionId: null,
  };
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name price discountedPrice sizes images",
  });
  if (!cart) {
    throw new apiError(404, "Cart not found");
  }

  if (cart.items.length === 0) {
    throw new apiError(400, "Cart is empty");
  }

  const orderItems = cart.items;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    for (const item of orderItems) {
      const product = item.product;
      if (!product) {
        throw new apiError(404, "Product no longer exists!");
      }
      const availableSizes = product.sizes;
      let sizeAvailable = false;
      let isStockAvailable = false;

      const sizeMap = new Map(availableSizes.map((size) => [size.size, size]));
      const selectedSize = sizeMap.get(item.size);

      if (selectedSize !== undefined && selectedSize !== null && selectedSize.stock >= item.quantity) {
        sizeAvailable = true;
        isStockAvailable = true;

        const stockUpdate = await Product.updateOne(
          {
            _id: product._id,
            sizes: {
              $elemMatch: {
                size: item.size,
                stock: {
                  $gte: item.quantity,
                },
              },
            },
          },
          { $inc: { "sizes.$.stock": -item.quantity } },
          { session },
        );
        if (stockUpdate.modifiedCount === 0) {
          throw new apiError(400, `Size ${item.size} is not available in required quantity for ${product.name}`);
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

      if (!sizeAvailable) {
        throw new apiError(400, `Size ${item.size} is not available  for  ${product.name}`);
      }
      if (sizeAvailable && !isStockAvailable) {
        throw new apiError(400, `Size ${item.size} is not  available in required quantity  for ${product.name} `);
      }
    }
    if (paymentMethod === "cash_on_delivery") {
      paymentInfo.paymentMethod = "cash_on_delivery";
      paymentInfo.paymentStatus = "pending";
    }

    billingDetails.grandTotal += billingDetails.shippingFees + billingDetails.tax;
    const orderId = generateOrderId();

    // create order with all the details
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

    // clear the cart after order is placed

    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } }, { session });

    await session.commitTransaction();
    const emailContent = orderPlacedEmail(order, fullName);
    await sendEmail(email, "Your Order Has Been Placed - EveryWear", emailContent);

    return res
      .status(200)
      .json(new apiResponse(200, order, "Order placed successfully. You will receive an email confirmation shortly."));
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
});

// Retrieve all orders belonging to the authenticated user.
const getUserOrders = AsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  if (!orders || orders.length === 0) {
    throw new apiError(404, "No orders found ");
  }
  return res.status(200).json(new apiResponse(200, orders, "User orders fetched successfully"));
});

// Cancel an existing order and restore the reserved product stock.

const cancelOrder = AsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new apiError(400, "Invalid order ID");
  }
  const { reason, description } = req.body;
  const user = await User.findById(userId);
  console.log("user", user);
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

      const sizeMap = new Map(availableSizes.map((size) => [size.size, size]));
      const selectedSize = sizeMap.get(item.size);
      if (!selectedSize) {
        throw new apiError(400, "Selected size is not available for this product");
      }
      selectedSize.stock += item.quantity;
      await product.save({ session });
    }

    order.status = "cancelled";
    order.cancellationInfo.reason = reason;
    order.cancellationInfo.description = description;
    order.cancellationInfo.cancellationDate = new Date();
    order.cancellationInfo.cancelledBy = userId;
    await order.save({ session });

    const emailContent = orderCancelledEmail(order);
    await sendEmail(user.email, "Order Cancelled", emailContent);

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

// Retrieve complete details of a specific order for admin access.
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
// Retrieve complete details of a specific order for customer access.

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

// Update the status of an order and handle payment completion for Cash on Delivery orders.
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
  const user = await User.findById(order.user);
  if (!user) {
    throw new apiError(404, "User not found");
  }

  if (status === "processing" && order.status !== "confirmed") {
    throw new apiError(400, "Order cannot be marked as processing unless it is confirmed");
  }

  if (status === "packed" && order.status !== "processing") {
    throw new apiError(400, "Order cannot be marked as packed unless it is processing");
  }

  if (status === "shipped" && order.status !== "confirmed") {
    throw new apiError(400, "Order cannot be marked as shipped unless it is confirmed");
  }

  if (status === "confirmed" && order.status === "confirmed") {
    throw new apiError(400, "Order is already confirmed");
  }

  if (status === "delivered" && order.status !== "outForDelivery") {
    throw new apiError(400, "Order cannot be marked as delivered unless it is out for delivery");
  }

  if (
    status === "delivered" &&
    order.status === "outForDelivery" &&
    order.paymentInfo.paymentMethod === "cash_on_delivery"
  ) {
    if (order.paymentInfo.paymentStatus !== "completed") {
      order.paymentInfo.paymentStatus = "completed";
      order.paymentInfo.paymentDate = new Date();
    }
  }
  order.status = status;
  await order.save();

  switch (status) {
    case "confirmed": {
      const emailContent = orderConfirmedEmail(order, user.name);
      await sendEmail(user.email, "Order Confirmed", emailContent);
      break;
    }
    case "shipped": {
      const emailContent = orderShippedEmail(order, user.name);
      await sendEmail(user.email, "Order Shipped", emailContent);
      break;
    }
    case "delivered": {
      const emailContent = orderDeliveredEmail(order, user.name);
      await sendEmail(user.email, "Order Delivered", emailContent);
      break;
    }
    default:
      break;
  }

  return res.status(200).json(new apiResponse(200, order, "Order status updated successfully"));
});

// Retrieve the latest orders for displaying on the admin dashboard.
const getRecentOrdersForDashboard = AsyncHandler(async (req, res) => {
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select("orderId status billingDetails createdAt");

  if (!recentOrders || recentOrders.length === 0) {
    throw new apiError(404, "No recent orders found");
  }

  return res.status(200).json(new apiResponse(200, recentOrders, "Recent orders fetched successfully"));
});

// Generate order analytics including revenue, monthly sales, and order status statistics.

const getOrderStatistics = AsyncHandler(async (req, res) => {
  const [totalOrders, totalRevenue, monthlyRevenue,monthlyOrders ,totalOrderStatsByStatus] = await Promise.all([
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
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
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
        monthlyOrders,
        totalOrderStatsByStatus,
      },
      "Order statistics fetched successfully",
    ),
  );
});

// Retrieve all orders for the admin with support for pagination, filtering, and sorting.

const getAllOrdersForAdmin = AsyncHandler(async (req, res) => {
  const {
    page,
    limit,
    sortBy,
    sortOrder,
    status,
    paymentStatus,
    paymentMethod,
    lowerPrice,
    upperPrice,
    minPrice,
    maxPrice,
    city,
    province,
    dateFilter,
    startDate,
    endDate,
  } = req.query;

  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 20;
  const skip = (pageNumber - 1) * pageSize;

  //Date range validation and parsing

  if (dateFilter === "custom" && (!startDate || !endDate)) {
    throw new apiError(400, "Both startDate and endDate are required");
  }

  let parsedStartDate = null;
  let parsedEndDate = null;
  const dates = getDateRange(dateFilter, startDate, endDate);
  parsedStartDate = dates.startDate;
  parsedEndDate = dates.endDate;
  if (parsedStartDate > parsedEndDate) {
    throw new apiError(400, "startDate cannot be greater than endDate");
  }

  // Set up sorting options based on the query parameters

  let sortOptions = {};
  sortOptions = buildSortOptions(sortBy, sortOrder);

  // Set up filtering options based on the query parameters
  let filterOptions = buildFilterOptions(
    status,
    paymentStatus,
    paymentMethod,
    lowerPrice,
    upperPrice,
    minPrice,
    maxPrice,
    city,
    province,
    parsedStartDate,
    parsedEndDate,
  );

  const [orders, totalOrders] = await Promise.all([
    Order.find(filterOptions).sort(sortOptions).skip(skip).limit(pageSize).lean(),
    Order.countDocuments(filterOptions),
  ]);

  if (!orders || orders.length === 0) {
    return res
      .status(200)
      .json(new apiResponse(200, { orders: [], totalOrders: 0, totalNumberOfPages: 0 }, "No orders found"));
  }
  const totalPages = Math.ceil(totalOrders / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPrevPage = pageNumber > 1;

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { totalPages, totalOrders, orders, hasNextPage, hasPrevPage, page: pageNumber, limit: pageSize },
        "All orders fetched successfully",
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
  getAllOrdersForAdmin,
};
