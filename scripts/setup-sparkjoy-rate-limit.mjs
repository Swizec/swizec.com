// Run once against the site's existing Postgres database before deploying:
//   node scripts/setup-sparkjoy-rate-limit.mjs .env.development
// Or omit the file argument when POSTGRES_URL is already in the environment.
// Only creates the limiter table/index; existing tables are untouched.
import { readFile } from 'node:fs/promises';
import { sql } from '@vercel/postgres';

if (process.argv[2]) process.loadEnvFile(process.argv[2]);
if (!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL is required');

try {
    const schema = await readFile(new URL('./sparkjoy-rate-limit.sql', import.meta.url), 'utf8');
    for (const statement of schema.split(';').filter((part) => part.trim())) {
        await sql.query(statement);
    }
    console.log('SparkJoy rate-limit table and index are ready.');
} finally {
    await sql.end();
}
