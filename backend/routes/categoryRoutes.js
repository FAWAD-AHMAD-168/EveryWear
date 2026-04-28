import express from "express";

import {createCategory, editCategory, toggleCategoryStatus, deleteCategory, getCategoryById} from "../controllers/categoryController.js";
import {createCategoryValidator,editCategoryValidator} from "../validators/categoryValidator.js";
import isAuthenticated from "../middlewares/auth/isAuthenticated.js";
import isAdmin from "../middlewares/auth/isAdmin.js";
import validate from "../middlewares/validate.js";
const router = express.Router();


router.post("/:collectionId", isAuthenticated, isAdmin, createCategoryValidator, validate, createCategory);
router.put("/:categoryId", isAuthenticated, isAdmin, editCategoryValidator, validate, editCategory);
router.patch("/:categoryId/toggle-status", isAuthenticated, isAdmin, toggleCategoryStatus);
router.delete("/:categoryId", isAuthenticated, isAdmin, deleteCategory);
router.get("/:collectionId", getCategoryById);


export default router;