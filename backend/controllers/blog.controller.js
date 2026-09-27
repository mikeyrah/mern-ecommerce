import mongoose from "mongoose";
import BlogPost from "../models/blogPost.model.js";
import cloudinary from "../lib/cloudinary.js";

const slugify = (value) => String(value || "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 180);

const uniqueSlug = async (title, excludeId) => {
    const base = slugify(title) || `story-${Date.now()}`;
    let slug = base;
    let suffix = 2;
    while (await BlogPost.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) slug = `${base}-${suffix++}`;
    return slug;
};

const uploadCover = async (image) => {
    if (!image) return null;
    if (typeof image !== "string" || !image.startsWith("data:image/")) throw new Error("Cover image must be an uploaded image");
    const result = await cloudinary.uploader.upload(image, { folder: "blog-covers", transformation: [{ width: 1600, height: 1000, crop: "fill", gravity: "auto", quality: "auto", fetch_format: "auto" }] });
    return { url: result.secure_url, publicId: result.public_id };
};

const validate = ({ title, category, excerpt, body }) => {
    if (![title, category, excerpt, body].every((value) => String(value || "").trim())) return "Title, category, excerpt, and article body are required";
    return null;
};

export const getPublishedPosts = async (_req, res) => {
    try {
        const posts = await BlogPost.find({ status: "published" }).sort({ publishedAt: -1, createdAt: -1 }).lean();
        res.json({ posts });
    } catch { res.status(500).json({ message: "Unable to load journal posts" }); }
};

export const getPublishedPost = async (req, res) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug, status: "published" }).lean();
        if (!post) return res.status(404).json({ message: "Journal post not found" });
        res.json({ post });
    } catch { res.status(500).json({ message: "Unable to load journal post" }); }
};

export const getAdminPosts = async (_req, res) => {
    try { res.json({ posts: await BlogPost.find({}).sort({ updatedAt: -1 }).lean() }); }
    catch { res.status(500).json({ message: "Unable to load journal posts" }); }
};

export const createPost = async (req, res) => {
    try {
        const issue = validate(req.body ?? {});
        if (issue) return res.status(400).json({ message: issue });
        const status = req.body.status === "published" ? "published" : "draft";
        const coverImage = await uploadCover(req.body.coverImage);
        const post = await BlogPost.create({
            title: String(req.body.title).trim(), slug: await uniqueSlug(req.body.title),
            category: String(req.body.category).trim(), excerpt: String(req.body.excerpt).trim(), body: String(req.body.body).trim(),
            accent: /^#[0-9a-f]{6}$/i.test(req.body.accent || "") ? req.body.accent : "#6f856c",
            status, publishedAt: status === "published" ? new Date() : null,
            coverImage: coverImage || undefined, author: req.user._id,
        });
        res.status(201).json({ post });
    } catch (error) { res.status(500).json({ message: error.message || "Unable to create journal post" }); }
};

export const updatePost = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid journal post" });
        const post = await BlogPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Journal post not found" });
        const issue = validate(req.body ?? {});
        if (issue) return res.status(400).json({ message: issue });
        const previousStatus = post.status;
        const nextStatus = req.body.status === "published" ? "published" : "draft";
        if (req.body.coverImage?.startsWith?.("data:image/")) {
            const nextCover = await uploadCover(req.body.coverImage);
            if (post.coverImage?.publicId) await cloudinary.uploader.destroy(post.coverImage.publicId).catch(() => {});
            post.coverImage = nextCover;
        }
        post.title = String(req.body.title).trim();
        if (post.isModified("title")) post.slug = await uniqueSlug(post.title, post._id);
        post.category = String(req.body.category).trim(); post.excerpt = String(req.body.excerpt).trim(); post.body = String(req.body.body).trim();
        post.accent = /^#[0-9a-f]{6}$/i.test(req.body.accent || "") ? req.body.accent : post.accent;
        post.status = nextStatus;
        if (nextStatus === "published" && previousStatus !== "published") post.publishedAt = new Date();
        if (nextStatus === "draft") post.publishedAt = null;
        await post.save();
        res.json({ post });
    } catch (error) { res.status(500).json({ message: error.message || "Unable to update journal post" }); }
};

export const deletePost = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Journal post not found" });
        if (post.coverImage?.publicId) await cloudinary.uploader.destroy(post.coverImage.publicId).catch(() => {});
        await post.deleteOne();
        res.json({ message: "Journal post deleted" });
    } catch { res.status(500).json({ message: "Unable to delete journal post" }); }
};
