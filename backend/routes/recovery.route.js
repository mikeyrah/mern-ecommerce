import express from "express";
import { getRecoveryAdmin, getRecoveryPreference, updateRecoveryPreference, updateRecoverySettings } from "../controllers/recovery.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/preference", protectRoute, getRecoveryPreference);
router.patch("/preference", protectRoute, updateRecoveryPreference);
router.get("/admin", protectRoute, adminRoute, getRecoveryAdmin);
router.patch("/admin", protectRoute, adminRoute, updateRecoverySettings);
export default router;
