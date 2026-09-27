import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    excerpt: { type: String, required: true, trim: true, maxlength: 400 },
    body: { type: String, required: true, trim: true, maxlength: 30000 },
    coverImage: {
        url: { type: String, default: "" },
        publicId: { type: String, default: "" },
    },
    accent: { type: String, default: "#6f856c", match: /^#[0-9a-f]{6}$/i },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date, default: null, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
}, { timestamps: true });

const BlogPost = mongoose.model("BlogPost", blogPostSchema);
export default BlogPost;
