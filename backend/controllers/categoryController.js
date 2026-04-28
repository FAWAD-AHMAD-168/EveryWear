import mongoose from "mongoose";
import Category from "../models/categoryModel.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import capitalizeName from "../utils/capitalizeName.js";

const createCategory = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    throw new ApiError(400, "Invalid collection ID");
  }
  const { name } = req.body;
  const formattedName = capitalizeName(name);

  const exisitingCategory = await Category.findOne({
    name: formattedName,
    collection: collectionId,
  });
  if (exisitingCategory) {
    throw new ApiError(
      400,
      "Category with this name already exists in this collection",
    );
  }
  const slug = formattedName.toLowerCase().replace(/\s+/g, "-");

  const existingSlug = await Category.findOne({
    slug,
    collection: collectionId,
  });
  if (existingSlug) {
    throw new ApiError(
      400,
      "Category with this slug already exists in this collection",
    );
  }

  const category = await Category.create({
    name: formattedName,
    slug,
    collection: collectionId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully"));
});

const editCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, "Invalid category ID");
  }
  const { name } = req.body;
  const formattedName = capitalizeName(name);
  const existingCategory = await Category.findById(categoryId);
  if (!existingCategory) {
    throw new ApiError(404, "Category not found");
  }
  const slug = formattedName.toLowerCase().replace(/\s+/g, "-");

  const ifCategoryExistsAlready = await Category.findOne({
    slug,
    collection: existingCategory.collection,
    _id: { $ne: categoryId },
  });
  if (ifCategoryExistsAlready) {
    throw new ApiError(400, "Category already exists in this collection");
  }

  existingCategory.name = formattedName;
  existingCategory.slug = slug;

  await existingCategory.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, existingCategory, "Category updated successfully"),
    );
});

const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, "Invalid category ID");
  }
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  category.isActive = !category.isActive;
  await category.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        category,
        `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
      ),
    );
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, "Invalid category ID");
  }
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Category deleted successfully"));
});

//Get Category by collection

const getCategoryById = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    throw new ApiError(400, "Invalid collection ID");
  }

  const categories = await Category.find({ collection: collectionId }).populate("collection", "name");
  return res
    .status(200)
    .json(
      new ApiResponse(200, categories, "Categories retrieved successfully"),
    );
});

export {
  createCategory,
  editCategory,
  toggleCategoryStatus,
  deleteCategory,
  getCategoryById,
};
