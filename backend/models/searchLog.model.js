import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema({
    query: { type: String, required: true, trim: true, lowercase: true, maxlength: 100, index: true },
    resultCount: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

searchLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

const SearchLog = mongoose.model("SearchLog", searchLogSchema);
export default SearchLog;
