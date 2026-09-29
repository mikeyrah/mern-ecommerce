import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import orderRoutes from "./routes/order.route.js";
import blogRoutes from "./routes/blog.route.js";
import { stripeWebhook } from "./controllers/payment.controller.js";

import { connectDB } from "./lib/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
const app = express();
const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "img-src": ["'self'", "data:", "https:"],
            "script-src": ["'self'"],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Stripe signature verification requires the untouched request body. This
// route must remain before the global JSON parser.
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use("/api/auth/profile-picture", express.json({ limit: "8mb" }));
app.use("/api/blog/admin", express.json({ limit: "8mb" }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 25, standardHeaders: "draft-8", legacyHeaders: false });
const checkoutLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false });
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/auth/verify-email", authLimiter);
app.use("/api/payments/create-checkout-session", checkoutLimiter);

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
app.use("/api/orders", orderRoutes);
app.use("/api/blog", blogRoutes);

app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
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
    if (process.env.NODE_ENV === "production") {
        const required = ["MONGO_URI", "UPSTASH_REDIS_URL", "ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "CLIENT_URL"];
        const missing = required.filter((name) => !process.env[name]);
        if (missing.length) throw new Error(`Missing required production configuration: ${missing.join(", ")}`);
    }
    await connectDB();
    app.listen(PORT, () => {
        console.log("Server is running on http://localhost:" + PORT);
    });
};

startServer();
