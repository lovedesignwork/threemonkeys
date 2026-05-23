/* eslint-disable */
/**
 * Apply a SQL migration file against the Supabase database using the
 * direct connection URL stored in .env.local as SUPABASE_DB_URL.
 *
 *   node scripts/apply-migration.js <path/to/migration.sql>
 *
 * Example:
 *   node scripts/apply-migration.js supabase/migrations/012_xxx.sql
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Manual .env.local loader (URL contains '%' which dotenv mishandles)
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
for (const line of envFile.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Usage: node scripts/apply-migration.js <path/to/migration.sql>');
  process.exit(1);
}

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error(
    'SUPABASE_DB_URL not set in .env.local. Get it from Supabase Dashboard ' +
      '-> Project Settings -> Database -> Connection string (URI).',
  );
  process.exit(1);
}

const sql = fs.readFileSync(path.resolve(migrationFile), 'utf8');

(async () => {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 60000,
  });

  console.log(`Applying ${path.basename(migrationFile)}...`);
  try {
    await client.connect();
    await client.query(sql);
    console.log('✓ Migration applied successfully.');
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
