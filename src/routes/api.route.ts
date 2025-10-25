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
import { GameTopupController } from "../controllers/gameTopup.controller"


export const userRoutes = routeGroup(
    "/api",
    [jwtPlugin, requireAuth, requireRole(["user", "admin"])],
    (group) => {
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
        group.put("/user/:id", UserController.update)


        //otp
        group.post("/resend-otp", AuthController.resendOtp)
        group.post("/verify-otp", AuthController.verifyOtp)


        //notifikasi
        group.get("/notifications", NotifController.index)
        group.get("/notifications/read/all", NotifController.markAllRead)
        group.patch("/notifications/:id/read", NotifController.markAsRead)

        //products
        group.get("/products", ProductController.index)

        //categories
        group.get("/categories", CategoriyController.index)

        //product-type
        group.get("/product-types", ProductTypeController.index)

        //product-variant
        group.get("/product-variants", ProductVariantController.index)
        //product-accounts
        group.get("/product-accounts", ProductAccountController.index)
        group.post("/product-accounts", ProductAccountController.store)
        group.put("/product-accounts/:id", ProductAccountController.update)
        group.delete("/product-accounts/:id", ProductAccountController.destroy)
        //product-invites
        group.get("/product-invites", ProductInviteController.index)
        group.post("/product-invites", ProductInviteController.store)
        group.put("/product-invites/:id", ProductInviteController.update)
        group.delete("/product-invites/:id", ProductInviteController.destroy)

        //game
        group.post("/topup", GameTopupController.topup)
    }
)
export const authRoute = routeGroup(
    "/api",
    [],
    (group) => {
        group.use(apiKeyGuard)
        group.post("/register", AuthController.register)
        group.post("/login", AuthController.login)

        
    }
)

export const adminRoutes = routeGroup(
    "/api/admin",
    [jwtPlugin, requireAuth, requireRole(["admin"])],
    (group) => {
        //notification
        group.post("/notifications", NotifController.store)


        //product-type
        group.post("/product-types", ProductTypeController.store)
        //products
        group.post("/products", ProductController.store)
        group.put("/products/:id", ProductController.update)
        group.delete("/products/:id", ProductController.destroy)
        //categories
        group.post("/categories", CategoriyController.store)
        group.put("/categories/:id", CategoriyController.update)
        group.delete("/categories/:id", CategoriyController.destroy)
    }
)

// //productv1
// group.get("/products/v1", ProductControllerV1.index)         // ambil semua
// group.post("/products/v1", ProductControllerV1.store)        // tambah baru
// group.patch("/products/v1/:id", ProductControllerV1.update)  // update 1 produk
// group.delete("/products/v1/:id", ProductControllerV1.destroy) // hapus produk