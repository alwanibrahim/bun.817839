import { Elysia } from "elysia";
import { affiliateCommissionsRoute } from "./routes/backups/affiliateCommissions.route";
// import { authRoute } from "./routes/backups/auth.route";
import { categoryRoute } from "./routes/backups/category.route";
import { depositeRoute } from "./routes/backups/deposite.route";
import { distributionRoute } from "./routes/backups/distribution.route";
import { notificationRoute } from "./routes/backups/notif.route";
import { productRoute } from "./routes/backups/product.route";
import { productAccountsRoute } from "./routes/backups/productAccount.route";
import { productInvitesRoute } from "./routes/backups/productInvites.route";
import { productVariantsRoute } from "./routes/backups/productVariants.route";
import { testRoute } from "./routes/backups/test.route";
import { uploadRoute } from "./routes/backups/upload.route";
import { userRoute } from "./routes/backups/user.route";
import { adminRoutes, userRoutes, authRoute } from "./routes/api.route";

const app = new Elysia().get("/", () => "Hello Elysia")
  // .use(authRoute)
  // .use(testRoute)
  // .use(productRoute)
  // .use(categoryRoute)
  // .use(depositeRoute)
  // .use(affiliateCommissionsRoute)
  // .use(notificationRoute)
  // .use(userRoute)
  // .use(productAccountsRoute)
  // .use(productInvitesRoute)
  // .use(productVariantsRoute)
  // .use(distributionRoute)
  // .use(uploadRoute)
  .use(adminRoutes)
  .use(userRoutes)
  .use(authRoute)
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
