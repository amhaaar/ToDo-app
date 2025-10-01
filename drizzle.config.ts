import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: ".env.local" });

export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
}as unknown; 
