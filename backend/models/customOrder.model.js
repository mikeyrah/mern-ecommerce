import mongoose from "mongoose";

const customOrderSchema = new mongoose.Schema({
    requestNumber: { type: String, unique: true, index: true },
    customerName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    occasion: { type: String, required: true, trim: true, maxlength: 100 },
    dessertType: { type: String, required: true, enum: ["cake", "cupcakes", "cookies", "treats", "dessert-table", "other"] },
    eventDate: { type: Date, required: true, index: true },
    servings: { type: Number, required: true, min: 1, max: 1000 },
    flavor: { type: String, required: true, trim: true, maxlength: 150 },
    colors: { type: String, default: "", trim: true, maxlength: 200 },
    designDetails: { type: String, required: true, trim: true, maxlength: 2000 },
    allergies: { type: String, default: "", trim: true, maxlength: 500 },
    budget: { type: Number, min: 0, max: 100000, default: 0 },
    deliveryMethod: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
    status: { type: String, enum: ["new", "reviewing", "quoted", "approved", "declined", "completed"], default: "new", index: true },
    quotedPrice: { type: Number, min: 0, default: 0 },
    adminNote: { type: String, default: "", trim: true, maxlength: 2000 },
}, { timestamps: true });

customOrderSchema.pre("validate", function () {
    if (!this.requestNumber) this.requestNumber = `VB-${Date.now().toString(36).toUpperCase()}-${this._id.toString().slice(-4).toUpperCase()}`;
});

export default mongoose.model("CustomOrder", customOrderSchema);
