import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    verifiedPurchase: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    adminNote: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
    },
}, { timestamps: true });

const variantSchema = new mongoose.Schema({
    label: { type: String, required: true, trim: true, maxlength: 100 },
    sku: { type: String, trim: true, uppercase: true, default: "" },
    price: { type: Number, min: 0 },
    trackInventory: { type: Boolean, default: false },
    stock: { type: Number, min: 0, default: 0 },
    image: { type: String, default: "" },
}, { _id: true });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        min: 0,
        required: true,
    },
    sku: {
        type: String,
        trim: true,
        uppercase: true,
        default: "",
        index: true,
    },
    trackInventory: {
        type: Boolean,
        default: false,
    },
    stock: {
        type: Number,
        min: 0,
        default: 0,
    },
    lowStockThreshold: {
        type: Number,
        min: 0,
        default: 5,
    },
    image: {
        type: String,
        required: [true, 'Image is required']
    },
    images: {
        type: [String],
        default: [],
    },
    category: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        enum: ["botani-eve", "the-krafted-charm", "the-velvet-bakery"],
        default: "the-krafted-charm",
        index: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isNew: {
        type: Boolean,
        default: false,
    },
    details: {
        type: String,
        default: "",
        trim: true,
    },
    ingredients: {
        type: [String],
        default: [],
    },
    variantName: {
        type: String,
        trim: true,
        maxlength: 50,
        default: "",
    },
    variants: {
        type: [variantSchema],
        default: [],
    },
    ratingAverage: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    ratingCount: {
        type: Number,
        default: 0,
    },
    reviews: {
        type: [reviewSchema],
        default: [],
    },
    soldCount: {
        type: Number,
        min: 0,
        default: 0,
    },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
