const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL in .env");
  process.exit(1);
}

const client = new Client({
  connectionString,
});

async function main() {
  await client.connect();
  console.log("Connected to PostgreSQL");

  const query = `
    ALTER TABLE site_settings 
    ADD COLUMN IF NOT EXISTS google_ads_id text;
  `;
  await client.query(query);
  console.log("Successfully ran DDL query to add google_ads_id column to site_settings table.");
  await client.end();
}

main().catch(err => {
  console.error("Error running query:", err.message);
  process.exit(1);
});
