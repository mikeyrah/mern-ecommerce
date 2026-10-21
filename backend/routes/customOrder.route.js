import express from "express";
import { createCustomOrder, getCustomOrders, updateCustomOrder } from "../controllers/customOrder.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", createCustomOrder);
router.get("/admin", protectRoute, adminRoute, getCustomOrders);
router.patch("/admin/:id", protectRoute, adminRoute, updateCustomOrder);

export default router;
