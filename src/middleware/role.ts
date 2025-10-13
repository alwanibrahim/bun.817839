export const requireRole = (roles: string[]) => {
    return async ({ user, set }: any) => {
        if (!user) {
            set.status = 401
            throw new Error("Unauthorized")
        }

        if (!roles.includes(user.role)) {
            set.status = 403
            throw new Error("Forbidden: Access denied")
        }

        return { user }
    }
}
