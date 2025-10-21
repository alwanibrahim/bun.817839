import { redis } from "../redis";

export async function invalidateCacheByPattern(pattern: string) {
  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = nextCursor;
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🧹 Hapus cache: ${keys.join(", ")}`);
    }
  } while (cursor !== "0");
}
