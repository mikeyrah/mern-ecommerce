import { redis } from "./redis.js";

try {
    await redis.set("foo", "bar");
    console.log('Redis test succeeded: "foo" was set to "bar".');
} finally {
    redis.disconnect();
}
