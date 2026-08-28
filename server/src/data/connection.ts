import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5433/logistics_db",
});

pool.on("connect", () => {
  console.log("⚡ Connected to PostgreSQL Database");
});

pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
  process.exit(-1);
});
