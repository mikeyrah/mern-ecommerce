import mongoose from "mongoose";

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
    image: {
        type: String,
        required: [true, 'Image is required']
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
    }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
