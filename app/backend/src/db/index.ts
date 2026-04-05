import { drizzle } from "drizzle-orm/d1";

export type Bindings = {
  DB: D1Database;
  API_SECRET_KEY: string;
};

export function getDb(env: Bindings) {
  return drizzle(env.DB);
}
