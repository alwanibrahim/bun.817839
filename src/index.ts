import { Elysia } from "elysia";
import { authRoute } from "./routes/auth.route";
import { testRoute } from "./routes/test.route";
import { productRoute } from "./routes/product.route";
import { categoryRoute  } from "./routes/category.route";
import { depositeRoute } from "./routes/deposite.route";
import { affiliateCommissionsRoute } from "./routes/affiliateCommissions.route";
import { notificationRoute } from "./routes/notif.route";

const app = new Elysia().get("/", () => "Hello Elysia")
  .use(authRoute)
  .use(testRoute)
  .use(productRoute)
  .use(categoryRoute)
  .use(depositeRoute)
  .use(affiliateCommissionsRoute)
  .use(notificationRoute)
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
