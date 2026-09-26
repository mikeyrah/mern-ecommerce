import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAllOrders, getMyOrders, getOrderById, requestReturn, reviewReturn, updateOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", protectRoute, getMyOrders);
router.get("/admin", protectRoute, adminRoute, getAllOrders);
router.patch("/admin/:id", protectRoute, adminRoute, updateOrder);
router.post("/admin/:id/return", protectRoute, adminRoute, reviewReturn);
router.post("/:id/return", protectRoute, requestReturn);
router.get("/:id", protectRoute, getOrderById);

export default router;
