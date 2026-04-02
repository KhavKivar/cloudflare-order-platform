// vitest.setup.ts
import { vi } from "vitest";

// Mock your DB module (adjust path to match your project)
vi.mock("./src/db", async (importOriginal) => {
  const { drizzle } = await import("drizzle-orm/pglite");
  const { PGlite } = await import("@electric-sql/pglite");
  const fs = await import("node:fs");
  const path = await import("node:path");
  const schema = await import("./src/db/schema");

  const originalModule = await importOriginal<typeof import("./src/db")>();

  // Create fresh in-memory Postgres instance
  const client = new PGlite();

  // Drizzle instance with your schema
  const testDb = drizzle(client, { schema });

  // Manually run migrations using client.exec to avoid multi-statement issues with prepared queries
  const migrationsFolder = "./src/db";
  const migrationFiles = fs
    .readdirSync(migrationsFolder)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(migrationsFolder, file), "utf8");
    await client.exec(sql);
  }

  // Return the mocked db instead of the real one
  return {
    ...originalModule,
    db: testDb,
  };
});
