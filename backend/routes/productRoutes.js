import express from "express";
const router = express.Router();
import upload from "../middlewares/multer.js";
import isAuthenticated from "../middlewares/auth/isAuthenticated.js";
import isAdmin from "../middlewares/auth/isAdmin.js";
import validate from "../middlewares/validate.js";


import  {addProductToCollection ,addProductToCategoryOfCollection, editProduct
   ,deleteProduct ,getAllProducts,getProductsByCategory,getProductsByCollection , AddProductImages , DeleteProductImage} from "../controllers/productController.js";
import { createProductValidator ,editProductValidator  } from "../validators/productValidator.js";


 router.get("/", getAllProducts);
 router.get("/category/:categoryId", getProductsByCategory);
 router.get("/collection/:collectionId", getProductsByCollection);
 router.post("/collections/:collectionId", isAuthenticated, isAdmin, upload.array("images", 5), createProductValidator, validate, addProductToCollection);
 router.post("/categories/:categoryId",isAuthenticated,isAdmin,upload.array("images", 5),createProductValidator,validate,addProductToCategoryOfCollection);
 router.patch("/:productId",isAuthenticated,isAdmin,editProductValidator,validate,editProduct);
 router.delete("/:productId", isAuthenticated, isAdmin, deleteProduct);
 router.post("/:productId/images", isAuthenticated, isAdmin, upload.array("images", 5), AddProductImages);
 router.delete("/:productId/images/:imageId", isAuthenticated, isAdmin, DeleteProductImage);

export default router;