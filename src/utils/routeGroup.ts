import { Elysia } from "elysia"

export const routeGroup = (
    prefix: string,
    middlewares: any[] = [],
    defineRoutes: (group: Elysia<any>) => void
) => {
    const group = new Elysia<any>({ prefix })

    for (const mw of middlewares) {
        if (typeof mw === "function") group.derive(mw)
        else group.use(mw)
    }

    defineRoutes(group)

    return group
}
