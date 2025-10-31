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
import { telegramController } from "../webhooks/telegram.controller"
import { NodesControllers } from "../controllers/nodes.controller"
import { BotsControllers } from "../controllers/bots.controller"
import { FlowsControllers } from "../controllers/flow.controller"


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
        //product-invites
        group.get("/product-invites", ProductInviteController.index)

        //game
        group.post("/topup", GameTopupController.topup)
        //bots
        group.get("/bots", BotsControllers.index)
        group.post("/bots", BotsControllers.create)
        
        //flows
        group.get("/flows", FlowsControllers.index)
        group.post("/flows", FlowsControllers.create)

        
        //nodes
        group.get("/nodes", NodesControllers.index)
        group.post("/nodes", NodesControllers.create)
        
    }
)
export const authRoute = routeGroup(
    "/api",
    [],
    (group) => {
        group.use(apiKeyGuard)
        group.post("/register", AuthController.register)
        group.post("/login", AuthController.login)
        // group.post("/telegram/webhook", telegramController.telegram)
        
        
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
        group.put("/product-types/:id", ProductTypeController.update)
        group.delete("/product-types/:id", ProductTypeController.destroy)
        //products
        group.post("/products", ProductController.store)
        group.put("/products/:id", ProductController.update)
        group.delete("/products/:id", ProductController.destroy)
        //categories
        group.post("/categories", CategoriyController.store)
        group.put("/categories/:id", CategoriyController.update)
        group.delete("/categories/:id", CategoriyController.destroy)
        
        //product-accounts
        group.post("/product-accounts", ProductAccountController.store)
        group.put("/product-accounts/:id", ProductAccountController.update)
        group.delete("/product-accounts/:id", ProductAccountController.destroy)
        //product-variants
        group.post("/product-variants", ProductVariantController.store)
        group.put("/product-variants/:id", ProductVariantController.update)
        group.delete("/product-variants/:id", ProductVariantController.destroy)

        //product-invites
        group.post("/product-invites", ProductInviteController.store)
        group.put("/product-invites/:id", ProductInviteController.update)
        group.delete("/product-invites/:id", ProductInviteController.destroy)
        //affiliate
        group.get("/affiliate/commissions", AffiliateController.index)
        group.delete("/affiliate/:id", AffiliateController.destroy)
        //users
        group.get("/users", UserController.index)
        group.delete("/user/:id", UserController.destroy)
        //notifications 
        group.get("/notifications", NotifController.index)
        group.delete("/notifications/:id", NotifController.destroy)
        //distributions
        group.delete("/distributions/:id", DistributionController.destroy)
    }
)

// //productv1
// group.get("/products/v1", ProductControllerV1.index)         // ambil semua
// group.post("/products/v1", ProductControllerV1.store)        // tambah baru
// group.patch("/products/v1/:id", ProductControllerV1.update)  // update 1 produk
// group.delete("/products/v1/:id", ProductControllerV1.destroy) // hapus produk