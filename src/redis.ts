// src/redis.ts
import Redis from "ioredis";

// Gunakan URL dari env atau default localhost
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Singleton connection
export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  reconnectOnError: (err) => {
    console.error("🔁 Redis reconnect triggered:", err.message);
    return true;
  },
});

// Event listener (biar tahu status)
redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("ready", () => console.log("🚀 Redis ready"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));
redis.on("close", () => console.log("⚠️ Redis connection closed"));
