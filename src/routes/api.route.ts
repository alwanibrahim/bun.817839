import { routeGroup } from "../utils/routeGroup"
import { jwtPlugin, requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { ProductController } from "../controllers/product.controller"// ← perbaiki typo: "Category" bukan "Categoriy"
import { CategoriyController } from "../controllers/category.controller"
import { AffiliateController } from "../controllers/affiliateCommissions.controller"
import { DepositeController } from "../controllers/deposite.controller"
import { UserController } from "../controllers/user.controller"
import { ProductTypeController } from "../controllers/productTypes.controller"
import { AuthController } from "../controllers/auth.controller"
import { NotifController } from "../controllers/notif.controller"


export const userRoutes = routeGroup(
    "/api",
    [jwtPlugin, requireAuth, requireRole(["user", "admin"])],
    (group) => {
        //product
        group.get("/products", ProductController.index)
        group.get("/categories", CategoriyController.index)
        group.get("/commissions", AffiliateController.commissions)
        group.get("/referrals", AffiliateController.referrals)
        group.get("/stats", AffiliateController.stats)
        group.get("/deposites", DepositeController.index)
        group.get("/deposites", DepositeController.index)
        group.get("/me", UserController.me)
        group.get("/product-types", ProductTypeController.index)
        group.post("/product-types", ProductTypeController.store)
        group.post("/register", AuthController.register)
        group.post("/deposites", DepositeController.store)
        group.post("/login", AuthController.login)
        group.post("/resend-otp", AuthController.resendOtp)
        group.post("/verify-otp", AuthController.verifyOtp)
        group.get("/notifications", NotifController.index)
        group.get("/notifications/read/all", NotifController.markAllRead)
        group.patch("/notifications/:id/read", NotifController.markAsRead)
    }
)
export const authRoute = routeGroup(
    "/api",
    [],
    (group) => {
        group.post("/register", AuthController.register)
    }
)

export const adminRoutes = routeGroup(
    "/api/admin",
    [jwtPlugin, requireAuth, requireRole(["admin"])],
    (group) => {
        group
        .post("/notifications", NotifController.store)

        group
        .post("/products", ProductController.store)
        .put("/products/:id", ProductController.update)
        .delete("/products/:id", ProductController.destroy)

        group
            .post("/categories", CategoriyController.store)
            .put("/categories/:id", CategoriyController.update)
            .delete("/categories/:id", CategoriyController.destroy)
    }
)
