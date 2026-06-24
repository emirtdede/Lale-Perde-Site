const { Client } = require('pg');

const regions = [
  'eu-central-1',
  'eu-central-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-southeast-3',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-south-1',
  'ca-central-1',
  'sa-east-1'
];

async function tryRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  
  const client = new Client({
    host,
    port: 6543,
    user: 'postgres.adwmdvtrrjlmbhmuodon',
    password: '(3101.ySMDe.3003)', // raw password
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log(`Successfully connected to region: ${region}`);
    
    const query = `
      ALTER TABLE site_settings 
      ADD COLUMN IF NOT EXISTS shopier_url TEXT,
      ADD COLUMN IF NOT EXISTS instagram_url TEXT,
      ADD COLUMN IF NOT EXISTS facebook_url TEXT,
      ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

      UPDATE site_settings
      SET 
        shopier_url = COALESCE(shopier_url, 'https://www.shopier.com/laleperdekahta'),
        instagram_url = COALESCE(instagram_url, 'http://instagram.com/laleperdekahta'),
        facebook_url = COALESCE(facebook_url, 'https://www.facebook.com/Laleperdekahta/'),
        linkedin_url = COALESCE(linkedin_url, 'https://www.linkedin.com/company/laleperde/about/')
      WHERE id = 'main_settings';
    `;
    
    await client.query(query);
    console.log('Database altered successfully!');
    await client.end();
    return true;
  } catch (err) {
    console.log(`Failed for region ${region}: ${err.message}`);
    try {
      await client.end();
    } catch(e) {}
    return false;
  }
}

async function main() {
  for (const region of regions) {
    const success = await tryRegion(region);
    if (success) {
      console.log('All done!');
      process.exit(0);
    }
  }
  console.log('Could not connect to any pooler region.');
  process.exit(1);
}

main();
