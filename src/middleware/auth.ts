import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { jwt } from "@elysiajs/jwt";
import { redis } from "../redis"; // ⬅️ tambahkan ini

export const jwtPlugin = jwt({
  name: "jwt",
  secret: process.env.JWT_SECRET!,
  exp: "7d",
});

export const requireAuth = async ({ jwt, headers }: any) => {
  const auth = headers.authorization;
  if (!auth) throw new Error("Unauthorized");

  const token = auth.split(" ")[1];
  const payload = token ? await jwt.verify(token) : null;
  if (!payload) throw new Error("Unauthorized");

  const userId = Number(payload.id);
  const cacheKey = `cache:user:${userId}:auth`;

  // 1️⃣ Cek cache dulu
  const cached = await redis.get(cacheKey);
  if (cached) {
    const user = JSON.parse(cached);
    // Validasi sessionKey dari payload vs cache
    if (user.sessionKey !== payload.sessionKey)
      throw new Error("Session expired, please login again");

    console.log(`🚀 JWT Cache HIT untuk user ${userId}`);
    return { user };
  }

  // 2️⃣ Kalau cache kosong → query DB
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new Error("Unauthorized");

  if (user.sessionKey !== payload.sessionKey)
    throw new Error("Session expired, please login again");

  // 3️⃣ Simpan user ke Redis (TTL 10 menit)
  await redis.set(cacheKey, JSON.stringify(user), "EX", 60 * 10);
  console.log(`🐢 JWT Cache MISS → user ${userId} disimpan`);

  return { user };
};
