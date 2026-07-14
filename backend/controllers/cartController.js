import Products from "../models/productModel.js";
import User from "../models/userModel.js";
import Cart from "../models/cartModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";

// ADD TO CART

const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { size, quantity } = req.body;
  const userId = req.user._id;

  if (!size || !quantity) {
    throw new apiError(400, "Size and quantity are required");
  }
  if (quantity <= 0) {
    throw new apiError(400, "Quantity must be greater than zero");
  }
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new apiError(400, "Invalid product ID");
  }
  const product = await Products.findById(productId);
  if (!product) {
    throw new apiError(404, "Product not found");
  }
  const selectedSize = product.sizes.find((item) => item.size === size);
  if (!selectedSize) {
    throw new apiError(400, "Selected size is not available ");
  }

  const isStockAvailable = selectedSize.stock >= quantity;
  if (!isStockAvailable) {
    throw new apiError(400, "Insufficient stock for the selected size");
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [{ product: productId, size, quantity }],
    });
  } else {
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size,
    );
    if (existingItemIndex >= 0) {
      if (
        cart.items[existingItemIndex].quantity + quantity >
        selectedSize.stock
      ) {
        throw new apiError(400, "Insufficient stock for the selected size");
      } else {
        cart.items[existingItemIndex].quantity += quantity;
      }
    } else {
      cart.items.push({ product: productId, size, quantity });
    }
  }
  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate({
    path: "items.product",
    select: "name price discountedPrice images",
  });

  res
    .status(201)
    .json(new apiResponse(201, populatedCart, "Product added to cart"));
});

//GET CART

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name price discountedPrice images",
  });

  //Empty Cart

  if (!cart) {
    res
      .status(200)
      .json(
        new apiResponse(
          200,
          { cart: { items: [] }, totalDiscountedPrice: 0, totalPrice: 0 },
          "Cart is empty",
        ),
      );
    return;
  }

  const totalDiscountedPrice = cart.items.reduce((total, item) => {
    return total + item.product.discountedPrice * item.quantity;
  }, 0);
  console.log(totalDiscountedPrice);

  const totalPrice = cart.items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
  console.log(totalPrice);

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        { cart, totalDiscountedPrice, totalPrice },
        "Cart retrieved successfully",
      ),
    );
});

//REMOVE FROM THE CART

const removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new apiError(400, "Invalid item ID");
  }
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new apiError(404, "Cart not found");
  }

  const ifItemExists = cart.items.find(
    (item) => item._id.toString() === itemId,
  );
  if (!ifItemExists) {
    throw new apiError(404, "Item not found in cart");
  }

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  await cart.save();

  res.status(200).json(new apiResponse(200, cart, "Product removed from cart"));
});

//Update Cart Item
const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity, size } = req.body;
  const userId = req.user._id;

  if (quantity === undefined && size === undefined) {
    throw new apiError(
      400,
      "At least one of quantity or size must be provided to update the cart-item",
    );
  }
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new apiError(400, "Invalid item ID");
  }
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new apiError(404, "Cart not found");
  }

  const cartItem = cart.items.find((item) => item._id.toString() === itemId);
  if (!cartItem) {
    throw new apiError(404, "Item not found in cart");
  }

  const product = await Products.findById(cartItem.product);
  if (!product) {
    throw new apiError(404, "Product not found");
  }

  if (quantity <= 0) {
    throw new apiError(400, "Quantity must be greater than zero");
  }

  let finalSize = size ?? cartItem.size;
  let finalQuantity = quantity ?? cartItem.quantity;

  const selectedSize = product.sizes.find((item) => item.size === finalSize);
  if (!selectedSize) {
    throw new apiError(400, "Selected size is not available");
  }
  if (finalQuantity <= 0) {
    throw new apiError(400, "Quantity must be greater than zero");
  }
  if (finalQuantity > selectedSize.stock) {
    throw new apiError(400, "Insufficient stock for the selected size");
  }
  if (finalSize !== cartItem.size) {
    cartItem.size = finalSize;
  }
  if (finalQuantity !== cartItem.quantity) {
    cartItem.quantity = finalQuantity;
  }

  await cart.save();

  res
    .status(200)
    .json(new apiResponse(200, cart, "Cart item updated successfully"));
});

//CLEAR THE CART

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new apiError(404, "Cart not found");
  }
  cart.items = [];
  await cart.save();
  return res
    .status(200)
    .json(new apiResponse(200, cart, "Cart cleared successfully"));
});

export { addToCart, getCart, removeFromCart, updateCartItem, clearCart };
