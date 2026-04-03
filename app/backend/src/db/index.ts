import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema.js";

export type Bindings = {
  DB: D1Database;
  API_SECRET_KEY: string;
};

export const getDb = (env: Bindings) => {
  return drizzle(env.DB, { schema });
};
