import { routeGroup } from "../utils/routeGroup"
import { jwtPlugin, requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { ProductController } from "../controllers/product.controller"// ← perbaiki typo: "Category" bukan "Categoriy"
import { CategoriyController } from "../controllers/category.controller"
import { AffiliateController } from "../controllers/affiliateCommissions.controller"
import { DepositeController } from "../controllers/deposite.controller"
import { UserController } from "../controllers/user.controller"


export const userRoutes = routeGroup(
    "/api",
    [jwtPlugin, requireAuth, requireRole(["user", "admin"])],
    (group) => {
        group.get("/products", ProductController.index)
        group.get("/categories", CategoriyController.index)
        group.get("/affiliates", AffiliateController.index)
        group.get("/deposites", DepositeController.index)
        group.get("/deposites", DepositeController.index)
        group.get("/me", UserController.me)
    }
)

export const adminRoutes = routeGroup(
    "/api/admin",
    [jwtPlugin, requireAuth, requireRole(["admin"])],
    (group) => {

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
