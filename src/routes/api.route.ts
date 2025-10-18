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


export const userRoutes = routeGroup(
    "/api",
    [jwtPlugin, requireAuth, requireRole(["user", "admin"])],
    (group) => {
        //categories
        group.get("/categories", CategoriyController.index)
        //commisions
        group.get("/commissions", AffiliateController.commissions)
        group.get("/referrals", AffiliateController.referrals)
        group.get("/stats", AffiliateController.stats)
        //distribution
        group.get("/distributions", DistributionController.index)
        group.get("/distributions/:id", DistributionController.destroy)
        //deposites
        group.get("/deposites", DepositeController.index)
        group.post("/deposites", DepositeController.store)
        //user
        group.get("/me", UserController.me)
        //producttype
        group.get("/product-types", ProductTypeController.index)
        //otp
        group.post("/resend-otp", AuthController.resendOtp)
        group.post("/verify-otp", AuthController.verifyOtp)
        //notifikasi
        group.get("/notifications", NotifController.index)
        group.get("/notifications/read/all", NotifController.markAllRead)
        group.patch("/notifications/:id/read", NotifController.markAsRead)
        //ptoduct
        group.get("/products", ProductController.index)
        group.get("/product-variants", ProductVariantController.index)
    }
)
export const authRoute = routeGroup(
    "/api",
    [],
    (group) => {
        group.post("/register", AuthController.register)
        group.post("/login", AuthController.login)
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
