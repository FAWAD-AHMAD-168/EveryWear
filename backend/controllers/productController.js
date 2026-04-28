import Products from "../models/productModel.js";
import Collection from "../models/collectionModel.js";
import Category from "../models/categoryModel.js";
import mongoose from "mongoose";
import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import {uploadOnCloudinary,deleteFromCloudinary} from "../services/cloudinary.js";
import capitalizeName from "../utils/capitalizeName.js";

const addProductToCollection = asyncHandler(async (req, res, next) => {
  const { collectionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    return next(new apiError(400, "Invalid collection ID"));
  }
  const ifCollectionExists = await Collection.findById(collectionId);

  if (!ifCollectionExists) {
    return next(new apiError(404, "Collection not found"));
  }

  const { name,description,price,sizes,discount,isFeatured,isLimitedEdition } = req.body;
  const images = req.files;
if(!images || images.length === 0) {
  throw new apiError(400, "At least one image is required");
}

  const formattedName = capitalizeName(name);
  const slug = formattedName.toLowerCase().replace(/\s+/g, "-");

  let parsedSizes;

  try {
    parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
  } catch (error) {
    throw new apiError(400, "Invalid sizes format");
  }
if(Array.isArray(parsedSizes)) {
  for (const sizeObj of parsedSizes) {
    if (!sizeObj.size || !sizeObj.stock) {
      throw new apiError(400, "Each size must have size name and stock");
    }
  }
} else {
  throw new apiError(400, "Sizes must be an array of objects");
}

  const existingProduct = await Products.findOne({
    name: formattedName,
    slug: slug,
  });
  if (existingProduct) {
    return next(new apiError(400, "Product with this name already exists"));
  }

  const Price = parseFloat(price);
  const Discount = discount ? parseFloat(discount) : 0;


  const discountedPrice = discount
    ? Math.floor(Price - (Price * Discount) / 100)
    : undefined;

  const uploadedImages = [];
  
  for (const image of images) {
    const result = await uploadOnCloudinary(image.path);
    uploadedImages.push({
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  }

  const product = await Products.create({
    collection: collectionId,
    name: formattedName,
    slug: slug,
    description,
    price,
    discountedPrice,
    sizes: parsedSizes,
    images: uploadedImages,
    discount,
    isFeatured,
    isLimitedEdition,
  });

  return res
    .status(201)
    .json(new apiResponse(201, product, "Product added successfully"));
});

const addProductToCategoryOfCollection = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return next(new apiError(400, "Invalid category ID"));
  }
  const ifCategoryExists = await Category.findById(categoryId);

  if (!ifCategoryExists) {
    return next(new apiError(404, "Category not found"));
  }
  const collectionId = ifCategoryExists.collection;

  const { name,description,price,sizes,discount,isFeatured,isLimitedEdition } = req.body;
  const images = req.files;
if(!images || images.length === 0) {
  throw new apiError(400, "At least one image is required");
}

  const formattedName = capitalizeName(name);
  const slug = formattedName.toLowerCase().replace(/\s+/g, "-");

  let parsedSizes;

  try {
    parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
  } catch (error) {
    throw new apiError(400, "Invalid sizes format");
  }
if(Array.isArray(parsedSizes)) {
  for (const sizeObj of parsedSizes) {
    if (!sizeObj.size || !sizeObj.stock) {
      throw new apiError(400, "Each size must have size name and stock");
    }
  }
} else {
  throw new apiError(400, "Sizes must be an array of objects");
}

  const existingProduct = await Products.findOne({
    name: formattedName,
    slug: slug,
  });
  if (existingProduct) {
    return next(new apiError(400, "Product with this name already exists"));
  }

  const Price = parseFloat(price);
  const Discount = discount ? parseFloat(discount) : 0;


  const discountedPrice = discount
    ? Math.floor(Price - (Price * Discount) / 100)
    : undefined;

  const imageUrls = [];
  for (const image of images) {
    const result = await uploadOnCloudinary(image.path);
    imageUrls.push({
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  }

  const product = await Products.create({
    category: categoryId,
    collection: collectionId,
    name: formattedName,
    slug: slug,
    description,
    price,
    discountedPrice,
    sizes: parsedSizes,
    images: imageUrls,
    discount,
    isFeatured,
    isLimitedEdition,
  });

  return res
    .status(201)
    .json(new apiResponse(201, product, "Product added successfully"));
});

//Edit a product 
const editProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new apiError(400, "Invalid product ID");
  }

  const product = await Products.findById(productId);
  if (!product) {
    throw new apiError(404, "Product not found");
  }

  const {
    name,
    description,
    price,
    sizes,
    discount,
    isFeatured,
    isLimitedEdition,
  } = req.body;

  
  if (name !== undefined) {
    const formattedName = capitalizeName(name);
    const slug = formattedName.toLowerCase().replace(/\s+/g, "-");

    const existingProduct = await Products.findOne({
      name: formattedName,
      slug
    });

    if (existingProduct) {
      throw new apiError(
        400,
        "Another product with this name already exists"
      );
    }

    product.name = formattedName;
    product.slug = slug;
  }

  //  DESCRIPTION
  if (description !== undefined) {
    product.description = description;
  }

  //  SIZES
  if (sizes !== undefined) {
    let parsedSizes;

    try {
      parsedSizes =
        typeof sizes === "string" ? JSON.parse(sizes) : sizes;
    } catch {
      throw new apiError(400, "Invalid sizes format");
    }

    if (!Array.isArray(parsedSizes)) {
      throw new apiError(400, "Sizes must be an array of objects");
    }

    for (const sizeObj of parsedSizes) {
      if (!sizeObj.size || sizeObj.stock === undefined) {
        throw new apiError(
          400,
          "Each size must have size name and stock"
        );
      }
    }

    product.sizes = parsedSizes;
  }

  //  PRICE + DISCOUNT
  let finalPrice = product.price;
  let finalDiscount = product.discount || 0;

  if (price !== undefined) {
    finalPrice = Number(price);
    product.price = finalPrice;
  }

  if (discount !== undefined) {
    finalDiscount = Number(discount);
    product.discount = finalDiscount;
  }

  //  DISCOUNTED PRICE 
  if (price !== undefined || discount !== undefined) {
    product.discountedPrice = finalDiscount
      ? Math.floor(finalPrice - (finalPrice * finalDiscount) / 100)
      : undefined;
  }

 
  if (isFeatured !== undefined) {
    product.isFeatured =
      isFeatured === true || isFeatured === "true";
  }

  if (isLimitedEdition !== undefined) {
    product.isLimitedEdition =
      isLimitedEdition === true || isLimitedEdition === "true";
  }

  await product.save();

  return res
    .status(200)
    .json(new apiResponse(200, product, "Product updated successfully"));
});

//Delete  image  of a product
const DeleteProductImage = asyncHandler(async (req, res, next) => {
  const { productId, imageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new apiError(400, "Invalid product ID");
  }

  const product = await Products.findById(productId);
  if (!product) {
    throw new apiError(404, "Product not found");
  }

  const image = product.images.id(imageId);
  if (!image) {
    throw new apiError(404, "Image not found");
  }

  if (!image.publicId) {
    throw new apiError(400, "Image publicId missing");
  }

  const imageDeleted = await deleteFromCloudinary(image.publicId);

  if (!imageDeleted || imageDeleted.result !== "ok") {
    throw new apiError(500, "Failed to delete image from Cloudinary");
  }

  image.deleteOne();

  await product.save();

  return res
    .status(200)
    .json(new apiResponse(200, product, "Image deleted successfully"));
});


//Add new image to a product
const AddProductImages = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const images = req.files;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new apiError(400, "Invalid product ID");
  }

  const product = await Products.findById(productId);
  if (!product) {
    throw new apiError(404, "Product not found");
  }
  if (!images || images.length === 0) {
    throw new apiError(400, "At least one image is required");
  }

  for (const image of images) {
    const result = await uploadOnCloudinary(image.path);
    product.images.push({
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  }

  await product.save();

  return res
    .status(200)
    .json(new apiResponse(200, product, "Image added successfully"));
});







//Delete A Product 

const deleteProduct = asyncHandler(async (req, res, next) => {  

  
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new apiError(400, "Invalid product ID");
  }
  const product = await Products.findById(productId);

  if (!product) {
    throw new apiError(404, "Product not found");
  }

  for (const image of product.images) {
    const result = await deleteFromCloudinary(image.publicId);
    
    if (!result || result.result !== "ok") {
      console.error(
        `Failed to delete image with public ID ${image.publicId} from Cloudinary`
      );
    }
  }

  const deletedProduct = await Products.findByIdAndDelete(productId);

  return res
    .status(200)
    .json(new apiResponse(200, deletedProduct, "Product deleted successfully"));




  


  





});


//Get All Products

const getAllProducts = asyncHandler(async (req, res, next) => {
  const products = await Products.find();
  return res
    .status(200)
    .json(new apiResponse(200, products, "Products retrieved successfully"));
});



//get products by a category 

const getProductsByCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const products = await Products.find({ category: categoryId });
  return res
    .status(200)
    .json(new apiResponse(200, products, "Products retrieved successfully"));
});

// get products by a collection

const getProductsByCollection = asyncHandler(async (req, res, next) => {
  const { collectionId } = req.params;
  const products = await Products.find({ collection: collectionId }); 

  return res
    .status(200)
    .json(new apiResponse(200, products, "Products retrieved successfully"));
});






export {
  addProductToCollection,
  addProductToCategoryOfCollection,
  editProduct,
  deleteProduct,
  DeleteProductImage,
  AddProductImages,
  getAllProducts,
  getProductsByCategory,
  getProductsByCollection,
};
