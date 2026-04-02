import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import pg from "pg";

declare module "fastify" {
  interface FastifyInstance {
    db: NodePgDatabase<Record<string, never>>;
  }
}

export function dbConector(fastify: FastifyInstance) {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  fastify.decorate("db", db);

  fastify.addHook("onClose", async () => {
    await pool.end();
  });
}

export default fp(dbConector);
