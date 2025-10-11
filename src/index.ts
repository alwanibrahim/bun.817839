import { Elysia } from "elysia";
import { authRoute } from "./routes/auth.route";
import { testRoute } from "./routes/test.route";
import { productRoute } from "./routes/product.route";
import { categoryRoute  } from "./routes/category.route";
import { depositeRoute } from "./routes/deposite.route";
import { affiliateCommissionsRoute } from "./routes/affiliateCommissions.route";
import { notificationRoute } from "./routes/notif.route";
import { userRoute } from "./routes/user.route";
import { productAccountsRoute } from "./routes/productAccount.route";
import { productInvitesRoute } from "./routes/productInvites.route";
import { productVariantsRoute } from "./routes/productVariants.route";
import { distributionRoute } from "./routes/distribution.route";

const app = new Elysia().get("/", () => "Hello Elysia")
  .use(authRoute)
  .use(testRoute)
  .use(productRoute)
  .use(categoryRoute)
  .use(depositeRoute)
  .use(affiliateCommissionsRoute)
  .use(notificationRoute)
  .use(userRoute)
  .use(productAccountsRoute)
  .use(productInvitesRoute)
  .use(productVariantsRoute)
  .use(distributionRoute)
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
