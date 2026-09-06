import { pool } from "../config/database";

type ColumnRow = {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
};

async function verifySchema(): Promise<void> {
  const tables = await pool.query<{ tablename: string }>(
    `SELECT tablename
     FROM pg_tables
     WHERE schemaname = 'public'
       AND tablename = ANY($1::text[])
     ORDER BY tablename`,
    [["users", "posts", "comments"]],
  );

  console.log(
    "Tables:",
    tables.rows.map((row) => row.tablename).join(", ") || "(none)",
  );

  const columns = await pool.query<ColumnRow>(
    `SELECT table_name, column_name, data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])
     ORDER BY table_name, ordinal_position`,
    [["users", "posts", "comments"]],
  );

  console.log("\nColumns:");
  for (const col of columns.rows) {
    console.log(
      `- ${col.table_name}.${col.column_name} (${col.data_type}, nullable=${col.is_nullable})`,
    );
  }

  const hasPassword = columns.rows.some(
    (col) => col.table_name === "users" && col.column_name === "password",
  );
  const hasPasswordHash = columns.rows.some(
    (col) => col.table_name === "users" && col.column_name === "password_hash",
  );

  console.log("\nSecurity checks:");
  console.log(`- users.password exists: ${hasPassword}`);
  console.log(`- users.password_hash exists: ${hasPasswordHash}`);

  const fks = await pool.query<{
    constraint_name: string;
    table_name: string;
    column_name: string;
    foreign_table_name: string;
    foreign_column_name: string;
    delete_rule: string;
  }>(
    `SELECT
       tc.constraint_name,
       tc.table_name,
       kcu.column_name,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name,
       rc.delete_rule
     FROM information_schema.table_constraints AS tc
     JOIN information_schema.key_column_usage AS kcu
       ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
     JOIN information_schema.constraint_column_usage AS ccu
       ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
     JOIN information_schema.referential_constraints AS rc
       ON rc.constraint_name = tc.constraint_name
      AND rc.constraint_schema = tc.table_schema
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND tc.table_schema = 'public'
       AND tc.table_name = ANY($1::text[])
     ORDER BY tc.table_name, tc.constraint_name`,
    [["posts", "comments"]],
  );

  console.log("\nForeign keys:");
  for (const fk of fks.rows) {
    console.log(
      `- ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name} ON DELETE ${fk.delete_rule}`,
    );
  }

  const uniques = await pool.query<{ constraint_name: string; column_name: string }>(
    `SELECT tc.constraint_name, kcu.column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
     WHERE tc.table_schema = 'public'
       AND tc.table_name = 'users'
       AND tc.constraint_type = 'UNIQUE'`,
  );

  console.log("\nUsers unique constraints:");
  for (const u of uniques.rows) {
    console.log(`- ${u.constraint_name} (${u.column_name})`);
  }
}

verifySchema()
  .then(async () => {
    await pool.end();
  })
  .catch(async (error) => {
    console.error("Schema verification failed:", error);
    await pool.end();
    process.exit(1);
  });
