import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import { connectDB } from "./lib/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
const app = express();
const PORT = process.env.PORT || 5001;


app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// The frontend sends authentication cookies with requests. When it runs on a
// different origin (for example Vite on localhost:5173), browsers require an
// explicit, non-wildcard CORS policy before they will allow those requests.
const allowedOrigins = new Set(
    (process.env.CLIENT_URL || "http://localhost:5173")
        .split(",")
        .map((origin) => origin.trim().replace(/\/$/, ""))
        .filter(Boolean)
);

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.has(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Vary", "Origin");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    }

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

const frontendDistPath = path.resolve(__dirname, "..", "frontend", "dist");

if (process.env.NODE_ENV === "production" && existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));

    // Serve the React app for client-side routes, while API routes above retain
    // their own responses.
    app.get("/{*splat}", (req, res) => {
        res.sendFile(path.join(frontendDistPath, "index.html"));
    });
}

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log("Server is running on http://localhost:" + PORT);
    });
};

startServer();
