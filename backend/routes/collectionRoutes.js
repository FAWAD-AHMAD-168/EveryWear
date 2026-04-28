import express from "express";

import {createCollection, editCollection, toggleCollectionStatus,deleteCollection ,getAllCollections} from "../controllers/collectionController.js";
import { createCollectionValidator , editCollectionValidator } from "../validators/collectionValidator.js";
import isAuthenticated from "../middlewares/auth/isAuthenticated.js";
import isAdmin from "../middlewares/auth/isAdmin.js";
import validate from "../middlewares/validate.js";
const router = express.Router();


router.post("/", isAuthenticated, isAdmin, createCollectionValidator, validate, createCollection);
router.put("/:id", isAuthenticated, isAdmin, editCollectionValidator, validate, editCollection);
router.patch("/:id/toggle-status", isAuthenticated, isAdmin, toggleCollectionStatus);
router.delete("/:id", isAuthenticated, isAdmin, deleteCollection);
router.get("/", getAllCollections);

export default router;