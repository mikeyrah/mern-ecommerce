import express from "express";
import { getAllProducts, getFeaturedProducts, createProduct,
     deleteProduct, getRecommendedProducts, getProductsByCategory, getProductsByBrand, toggleFeaturedProduct, updateProduct, getProductById, addProductReview } from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/",protectRoute, adminRoute, getAllProducts)
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/brand/:brand", getProductsByBrand);
router.get("/recommendations", getRecommendedProducts);
router.get("/:id", getProductById);
router.post("/", protectRoute, adminRoute, createProduct);
router.post("/:id/reviews", protectRoute, addProductReview);
router.put("/:id", protectRoute, adminRoute, updateProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
