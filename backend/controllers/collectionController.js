import Collection from "../models/collectionModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import capitalizeName from "../utils/capitalizeName.js";

//  Create a new collection

const createCollection = asyncHandler(async (req, res) => {
  let { name, hasCategories } = req.body;

  // Title Case formatting
  const formattedName = capitalizeName(name);

  const slug = formattedName.toLowerCase().replace(/\s+/g, "-");

  const ifCollectionExists = await Collection.findOne({ name: formattedName });
  if (ifCollectionExists) {
    throw new apiError(400, "Collection with this name already exists");
  }

  const existingSlug = await Collection.findOne({ slug });
  if (existingSlug) {
    throw new apiError(400, "Collection with this slug already exists");
  }

  const collection = await Collection.create({
    name: formattedName,
    slug,
    hasCategories: hasCategories || false,
  });

  return res
    .status(201)
    .json(new apiResponse(201, collection, "Collection created successfully"));
});

//edit a collection
const editCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, hasCategories } = req.body;

  const existingCollection = await Collection.findById(id);

  if (!existingCollection) {
    throw new apiError(404, "Collection not found");
  }

  const formattedName = name ? capitalizeName(name) : existingCollection.name;
  const slug = formattedName.toLowerCase().replace(/\s+/g, "-");

  const ifCollectionExists = await Collection.findOne({
    slug,
    _id: { $ne: id },
  });
  if (ifCollectionExists) {
    throw new apiError(400, "Another collection with this name already exists");
  }

  const updatedCollection = await Collection.findByIdAndUpdate(
    id,
    {
      name: formattedName,
      slug,

      hasCategories:
        hasCategories !== undefined
          ? hasCategories
          : existingCollection.hasCategories,
    },
    { new: true },
  );

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedCollection,
        "Collection updated successfully",
      ),
    );
});

// toggle collection status

const toggleCollectionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const collection = await Collection.findById(id);

  if (!collection) {
    throw new apiError(404, "Collection not found");
  }
  collection.isActive = !collection.isActive;
  await collection.save();

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        collection,
        "Collection status toggled successfully",
      ),
    );
});

// Delete a collection

const deleteCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const collection = await Collection.findByIdAndDelete(id);

  if (!collection) {
    throw new apiError(404, "Collection not found");
  }
  return res
    .status(200)
    .json(
      new apiResponse(200, collection, "Collection deleted successfully"),
    );
});

//get all collections

const getAllCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find();
  return res
    .status(200)
    .json(
      new apiResponse(200, collections, "Collections fetched successfully"),
    );
});

export  {
  createCollection,
  editCollection,
  toggleCollectionStatus,
  deleteCollection,
  getAllCollections,
};
