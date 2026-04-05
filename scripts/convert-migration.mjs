#!/usr/bin/env node
/**
 * Converts a PostgreSQL dump (migration.sql) to SQLite-compatible INSERT statements
 * for use in the Drizzle D1 custom migration.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const input = readFileSync(resolve(ROOT, "migration.sql"), "utf8");
const lines = input.split("\n");

// Tables where we want INSERT OR IGNORE (safe to re-run)
const TABLES = new Set([
  "clients",
  "purchase_orders",
  "orders",
  "products",
  "order_lines",
]);

const output = [];
output.push("-- Custom SQL migration file, put your code below! --");
output.push("-- Migrated from PostgreSQL VPS dump");
output.push("");

// Order: clients → products → purchase_orders → orders → order_lines
// The dump already has them in this order, so we just process linearly.

for (const line of lines) {
  const trimmed = line.trim();

  // Skip blank lines, comments, SET, SELECT, \restrict
  if (!trimmed) continue;
  if (trimmed.startsWith("--")) continue;
  if (trimmed.startsWith("SET ")) continue;
  if (trimmed.startsWith("SELECT ")) continue;
  if (trimmed.startsWith("\\")) continue;

  // Skip drizzle internal migrations
  if (trimmed.includes("drizzle.__drizzle_migrations")) continue;

  // Only process INSERT statements for our tables
  if (!trimmed.startsWith("INSERT INTO public.")) continue;

  // Extract table name
  const tableMatch = trimmed.match(/^INSERT INTO public\.(\w+)\s/);
  if (!tableMatch) continue;

  const tableName = tableMatch[1];
  if (!TABLES.has(tableName)) continue;

  let converted = trimmed;

  // Remove `public.` prefix
  converted = converted.replace(/^INSERT INTO public\./, "INSERT OR IGNORE INTO ");

  // Remove `OVERRIDING SYSTEM VALUE `
  converted = converted.replace(/ OVERRIDING SYSTEM VALUE /g, " ");

  // Remove double-quotes around localName (optional, SQLite handles both)
  converted = converted.replace(/"localName"/g, "localName");

  output.push(converted);
}

output.push("");

const result = output.join("\n");
const outPath = resolve(ROOT, "app/backend/drizzle/0003_migrationvps.sql");
writeFileSync(outPath, result, "utf8");

console.log(`✓ Written to ${outPath}`);
console.log(`  Lines: ${output.length}`);
