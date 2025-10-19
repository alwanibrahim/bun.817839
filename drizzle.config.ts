import { defineConfig } from "drizzle-kit"
console.log("DATABASE_URL:", process.env.DATABASE_URL);


export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "mysql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
})
