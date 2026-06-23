const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.adwmdvtrrjlmbhmuodon:%283101.ySMDe.3003%29@db.adwmdvtrrjlmbhmuodon.supabase.co:5432/postgres",
});

async function main() {
  await client.connect();
  try {
    console.log('Adding campaign_interval column to site_settings table...');
    await client.query(`
      ALTER TABLE site_settings 
      ADD COLUMN IF NOT EXISTS campaign_interval INT DEFAULT 8;
    `);
    console.log('Successfully added campaign_interval column.');
  } catch (err) {
    console.error('Error modifying table:', err);
  } finally {
    await client.end();
  }
}

main();
