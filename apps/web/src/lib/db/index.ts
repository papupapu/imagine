import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// DATABASE_URL is required at runtime but not at build time
const sql = neon(process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@placeholder/placeholder");
export const db = drizzle(sql, { schema });
