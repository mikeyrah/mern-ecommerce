import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist, updateStockNotification } from "../controllers/wishlist.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protectRoute);
router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.patch("/:productId/notification", updateStockNotification);
export default router;
