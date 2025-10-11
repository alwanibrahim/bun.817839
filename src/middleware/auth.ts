import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { jwt } from "@elysiajs/jwt";

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
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(payload.id)));

    if (!user) throw new Error("Unauthorized");
    if (user.sessionKey !== payload.sessionKey) {
        throw new Error("Session expired, please login again");
    }

    return { user };
};
