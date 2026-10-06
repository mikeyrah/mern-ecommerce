import express from "express";
import { getAllProducts, getFeaturedProducts, createProduct,
     deleteProduct, deleteReview, getAdminReviews, getRecommendedProducts, getProductsByCategory, getProductsByBrand, getReviewEligibility, getSearchSuggestions, moderateReview, searchProducts, toggleFeaturedProduct, updateProduct, updateInventory, getProductById, addProductReview } from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/",protectRoute, adminRoute, getAllProducts)
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/brand/:brand", getProductsByBrand);
router.get("/recommendations", getRecommendedProducts);
router.get("/search/suggestions", getSearchSuggestions);
router.get("/search/catalog", searchProducts);
router.get("/reviews/admin", protectRoute, adminRoute, getAdminReviews);
router.patch("/reviews/:productId/:reviewId", protectRoute, adminRoute, moderateReview);
router.delete("/reviews/:productId/:reviewId", protectRoute, adminRoute, deleteReview);
router.get("/:id/review-eligibility", protectRoute, getReviewEligibility);
router.get("/:id", getProductById);
router.post("/", protectRoute, adminRoute, createProduct);
router.post("/:id/reviews", protectRoute, addProductReview);
router.put("/:id", protectRoute, adminRoute, updateProduct);
router.patch("/:id/inventory", protectRoute, adminRoute, updateInventory);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
