import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                name: { type: String, default: "Product" },
                image: { type: String, default: "" },
            },
        ],
        orderNumber: { type: String, unique: true, index: true },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        stripeSessionId: {
            type: String,
            unique: true,
        },
        paymentStatus: {
            type: String,
            enum: ["paid", "refunded", "partially-refunded"],
            default: "paid",
        },
        fulfillmentStatus: {
            type: String,
            enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
            default: "placed",
            index: true,
        },
        customerEmail: { type: String, default: "" },
        shippingAddress: {
            name: String, line1: String, line2: String, city: String,
            state: String, postalCode: String, country: String,
        },
        trackingNumber: { type: String, default: "", trim: true },
        carrier: { type: String, default: "", trim: true },
        adminNote: { type: String, default: "", trim: true, maxlength: 1000 },
        statusHistory: [{
            status: String,
            note: { type: String, default: "" },
            changedAt: { type: Date, default: Date.now },
        }],
    },
    { timestamps: true }
);

orderSchema.pre("validate", function () {
    if (!this.orderNumber) {
        this.orderNumber = `ST-${Date.now().toString(36).toUpperCase()}-${this._id.toString().slice(-4).toUpperCase()}`;
    }
    if (this.isNew && !this.statusHistory.length) {
        this.statusHistory.push({ status: this.fulfillmentStatus, note: "Order placed" });
    }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
