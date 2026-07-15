import express from "express";

import {createCategory, editCategory, toggleCategoryStatus, deleteCategory, getCategoryById} from "../controllers/category.controller.js";
import {createCategoryValidator,editCategoryValidator} from "../validators/category.validator.js";
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