const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Parse .env manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^${name}\\s*=\\s*["']?(.*?)["']?\\s*$`, 'm'));
  return match ? match[1] : null;
};

const connectionString = getEnvVar('DATABASE_URL');

if (!connectionString) {
  console.error('Error: DATABASE_URL not found in .env');
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const sqlPath = path.join(__dirname, '..', '02_mounting_types_migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing mounting types migration SQL...');
    await client.query(sql);
    console.log('Migration completed successfully!');

  } catch (err) {
    console.error('Error executing migration SQL:', err);
  } finally {
    await client.end();
  }
}

run();
