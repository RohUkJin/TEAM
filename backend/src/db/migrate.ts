import fs from "fs";
import path from "path";
import { pool } from "../config/database";

const migrationsDir = path.join(__dirname, "migrations");

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const result = await pool.query<{ filename: string }>(
    "SELECT filename FROM schema_migrations ORDER BY id ASC",
  );
  return new Set(result.rows.map((row) => row.filename));
}

async function applyMigration(filename: string, sql: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [
      filename,
    ]);
    await client.query("COMMIT");
    console.log(`Applied: ${filename}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function migrate(): Promise<void> {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const files = fs
    .readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const filename of files) {
    if (applied.has(filename)) {
      console.log(`Skip (already applied): ${filename}`);
      continue;
    }

    const fullPath = path.join(migrationsDir, filename);
    const sql = fs.readFileSync(fullPath, "utf8");
    await applyMigration(filename, sql);
  }
}

migrate()
  .then(async () => {
    console.log("Migrations completed.");
    await pool.end();
  })
  .catch(async (error) => {
    console.error("Migration failed:", error);
    await pool.end();
    process.exit(1);
  });
