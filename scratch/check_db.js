const { createClient } = require('@supabase/supabase-js');
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables'); // Or query via SQL, but standard Rest API doesn't support direct arbitrary query.
  // Wait, we can query information_schema by doing Rest call if exposed, but standard REST hides schema tables.
  // Let's try calling a SQL endpoint or we can try checking specific spelling.
  // Wait, let's check: homepage_content, home_page_content, homepage, home_content
  const guesses = ['home_page_content', 'homepage_content', 'homepage', 'page_content', 'site_settings', 'settings'];
  for (const g of guesses) {
    const { data: d, error: err } = await supabase.from(g).select('*').limit(1);
    if (!err) {
      console.log(`Found table: "${g}"`);
    } else {
      console.log(`Table "${g}" checked: ${err.message}`);
    }
  }
}

listTables();
