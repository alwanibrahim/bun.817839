import { routeGroup } from "../utils/routeGroup"
import { jwtPlugin, requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { ProductController } from "../controllers/product.controller"
import { CategoriyController } from "../controllers/category.controller"
import { AffiliateController } from "../controllers/affiliateCommissions.controller"
import { DepositeController } from "../controllers/deposite.controller"
import { UserController } from "../controllers/user.controller"
import { ProductTypeController } from "../controllers/productTypes.controller"
import { AuthController } from "../controllers/auth.controller"
import { NotifController } from "../controllers/notif.controller"
import { DistributionController } from "../controllers/distribuiton.controller"
import { ProductVariantController } from "../controllers/productVarian.controller"
import { apiKeyGuard } from "../plugins/apiKeyGuard"
import { ProductAccountController } from "../controllers/productAccount.controller"
import { ProductInviteController } from "../controllers/productInvites.controller"
import { ProductControllerV1 } from "../controllers/product.v1.controller"


export const userRoutes = routeGroup(
    "/api",
    [jwtPlugin, requireAuth, requireRole(["user", "admin"])],
    (group) => {
        //categories
        //commisions
        group.get("/commissions", AffiliateController.commissions)
        group.get("/referrals", AffiliateController.referrals)
        group.get("/stats", AffiliateController.stats)
        //distribution
        group.get("/distributions", DistributionController.index)
        group.post("/distributions", DistributionController.store)
        group.get("/distributions/:id", DistributionController.destroy)
        //deposites
        group.get("/deposites", DepositeController.index)
        group.post("/deposites", DepositeController.store)
        //user
        group.get("/me", UserController.me)
        //producttype
        //otp
        group.post("/resend-otp", AuthController.resendOtp)
        group.post("/verify-otp", AuthController.verifyOtp)
        //notifikasi
        group.get("/notifications", NotifController.index)
        group.get("/notifications/read/all", NotifController.markAllRead)
        group.patch("/notifications/:id/read", NotifController.markAsRead)
        .get("/products", ProductController.index)
        .get("/categories", CategoriyController.index)
        .get("/product-types", ProductTypeController.index)
        .get("/product-variants", ProductVariantController.index)
            //product-accounts
            .get("/product-accounts", ProductAccountController.index)
            .post("/product-accounts", ProductAccountController.store)
            .put("/product-accounts/:id", ProductAccountController.update)
            .delete("/product-accounts/:id", ProductAccountController.destroy)
            //product-invites
            .get("/product-invites", ProductInviteController.index)
            .post("/product-invites", ProductInviteController.store)
            .put("/product-invites/:id", ProductInviteController.update)
            .delete("/product-invites/:id", ProductInviteController.destroy)

        .put("/user/:id", UserController.update)
    }
)
export const authRoute = routeGroup(
    "/api",
    [],
    (group) => {
        group.use(apiKeyGuard)
        .post("/register", AuthController.register)
        .post("/login", AuthController.login)
        
            //productv1
            .get("/products/v1", ProductControllerV1.index)         // ambil semua
            .post("/products/v1", ProductControllerV1.store)        // tambah baru
            .patch("/products/v1/:id", ProductControllerV1.update)  // update 1 produk
            .delete("/products/v1/:id", ProductControllerV1.destroy) // hapus produk

    }
)

export const adminRoutes = routeGroup(
    "/api/admin",
    [jwtPlugin, requireAuth, requireRole(["admin"])],
    (group) => {

        group.post("/notifications", NotifController.store)

        group.post("/product-types", ProductTypeController.store)
        group.post("/products", ProductController.store)
        group.put("/products/:id", ProductController.update)
        group.delete("/products/:id", ProductController.destroy)
        //categories
        group.post("/categories", CategoriyController.store)
        group.put("/categories/:id", CategoriyController.update)
        group.delete("/categories/:id", CategoriyController.destroy)
    }
)
