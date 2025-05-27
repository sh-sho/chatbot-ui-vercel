import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// config({
//   path: '.env.local',
// });
// let env = config();
// console.log('🌍 Loaded environment variabless:', env);

const runMigrate = async () => {
  console.log('🌍 All environment variables:', process.env);
  // if (!process.env.POSTGRES_URL) {
  if (!process.env.POSTGRESQLCONNSTR_POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  // const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const connection = postgres(process.env.POSTGRESQLCONNSTR_POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log('⏳ Running migrations...');

  const start = Date.now();
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  const end = Date.now();

  console.log('✅ Migrations completed in', end - start, 'ms');
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
