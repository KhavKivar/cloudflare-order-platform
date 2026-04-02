import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    wranglerConfigPath: "wrangler.toml",
    dbName: "ordersapp-db",
  },
} satisfies Config;
