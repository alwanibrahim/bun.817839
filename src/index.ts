import { Elysia } from "elysia";
import { redis } from './redis'

import { adminRoutes, userRoutes, authRoute } from "./routes/api.route";
import { cors } from '@elysiajs/cors'
import { tripayWebhook } from "./webhooks/tripay.controller";
import { telegeramEndPoint } from "./routes/telegram.route";
import { testNodeFlow } from "./routes/test.node.route";
import { brevoRoute } from "./routes/brevo.route";



const app = new Elysia().get("/", () => "Hello Elysia")
  .use(cors({
    origin: ["http://localhost:3000", "https://initest.vaultsy.online"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }))

  .use(adminRoutes)
  .use(tripayWebhook)
  .use(userRoutes)
  .use(authRoute)
  .use(telegeramEndPoint)
  .use(brevoRoute)
  .get("/test-nodes", async () => {
    const result = await testNodeFlow(); // panggil function-nya
    return { success: true, result };
  })
  .listen(3001);


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

