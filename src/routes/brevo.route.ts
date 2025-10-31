import { Elysia, t } from "elysia";
import { BrevoSendEmailNode } from "../nodes/build-in/BrevoSendEmailNode";
import { db } from "../db";
import {users} from '../db/schema'
import { eq } from "drizzle-orm";

export const brevoRoute = new Elysia({ prefix: "/send-email" })
  .post(
    "/:id",
    async ({ params }) => {
      const { id } = params;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(id)));

      if (!user) return {
        success: false,
        message: "User not found"
      };

      const node = new BrevoSendEmailNode();

      const result = await node.execute({
        params: {
          to: user.email,
          subject: "Welcome Bro!",
          html: "<h1>Selamat datang!</h1>",
        },
      });

      return {
        success: true,
        message: "Email terkirim!",
        data: result,
      };
    }
  );
