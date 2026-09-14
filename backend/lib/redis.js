import Redis from "ioredis"
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });
export const redis = new Redis(process.env.UPSTASH_REDIS_URL);

redis.on("error", (error) => {
    console.error("Redis connection error:", error.message);
});
