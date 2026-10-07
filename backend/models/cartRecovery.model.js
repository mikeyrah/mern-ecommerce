import mongoose from "mongoose";

const recoverySettingsSchema = new mongoose.Schema({
    key: { type: String, default: "cart-recovery", unique: true },
    enabled: { type: Boolean, default: true },
    delayHours: { type: Number, min: 1, max: 168, default: 24 },
}, { timestamps: true });

const recoveryEventSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true, index: true },
    type: { type: String, enum: ["sent", "recovered"], required: true, index: true },
    cartTotal: { type: Number, min: 0, default: 0 },
    itemCount: { type: Number, min: 0, default: 0 },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", unique: true, sparse: true },
}, { timestamps: true });

recoveryEventSchema.index({ createdAt: -1 });

export const RecoverySettings = mongoose.model("RecoverySettings", recoverySettingsSchema);
export const RecoveryEvent = mongoose.model("RecoveryEvent", recoveryEventSchema);
