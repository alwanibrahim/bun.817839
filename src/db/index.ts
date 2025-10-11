import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL!,
  connectionLimit: 10,           // penting: batasi & reuse koneksi
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 5000,
})

export const db = drizzle(pool, { schema, mode: "default", logger: true },)
