import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        productImage: {
          type: String,
          required: true,
        },
        priceAtPurchase: {
          type: Number,
          required: true,
        },
        discountedPriceAtPurchase: {
          type: Number,
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },
      province: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },
      streetAddress: {
        type: String,
        required: true,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
    },

    billingDetails: {
      subTotal: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        required: true,
      },
      shippingFees: {
        type: Number,
        required: true,
      },
      tax: {
        type: Number,
        required: true,
      },
      grandTotal: {
        type: Number,
        required: true,
      },
    },

    paymentInfo: {
      paymentMethod: {
        type: String,
        required: true,
        enum: ["Cash on Delivery", "Credit Card", "PayPal", "Bank Transfer"],
      },
      paymentStatus: {
        type: String,
        required: true,
        enum: ["pending", "completed", "failed", "refunded"],
      },
      paidAt: {
        type: Date,
      },
      transactionId: {
        type: String,
      },
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "outForDelivery",
        "delivered",
        "cancelled",
        "returned",
        "refunded",
      ],
      default: "pending",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
