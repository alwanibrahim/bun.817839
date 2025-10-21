import { Elysia } from "elysia";

export const apiKeyGuard = new Elysia()
  .derive(({ request, set }) => {
    const key = request.headers.get("x-api-key");
    const validKey = process.env.API_SECRET_KEY;

    if (key !== validKey) {
      set.status = 401;
      throw new Error("Unauthorized: invalid API key");
    }
  });
