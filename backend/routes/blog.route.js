import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { createPost, deletePost, getAdminPosts, getPublishedPost, getPublishedPosts, updatePost } from "../controllers/blog.controller.js";

const router = express.Router();
router.get("/", getPublishedPosts);
router.get("/admin", protectRoute, adminRoute, getAdminPosts);
router.post("/admin", protectRoute, adminRoute, createPost);
router.put("/admin/:id", protectRoute, adminRoute, updatePost);
router.delete("/admin/:id", protectRoute, adminRoute, deletePost);
router.get("/:slug", getPublishedPost);
export default router;
