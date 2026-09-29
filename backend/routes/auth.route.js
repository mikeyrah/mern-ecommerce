import express from "express";
import { changePassword, forgotPassword, getProfile, login, logout, signup, refreshToken, removeProfilePicture, requestEmailVerification, resetPassword, updateProfilePicture, verifyEmail } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/verify-email/request", protectRoute, requestEmailVerification);
router.post("/change-password", protectRoute, changePassword);
router.get("/profile", protectRoute, getProfile);
router.put("/profile-picture", protectRoute, updateProfilePicture);
router.delete("/profile-picture", protectRoute, removeProfilePicture);


export default router;
