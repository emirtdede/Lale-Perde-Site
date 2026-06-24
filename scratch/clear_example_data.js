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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearData() {
  console.log("Starting deletion of example data...");

  // Delete products first (due to foreign key reference to categories)
  console.log("Deleting products...");
  const { error: pError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
  if (pError) console.error("Error deleting products:", pError.message);
  else console.log("Products deleted successfully.");

  // Delete categories
  console.log("Deleting categories...");
  const { error: cError } = await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (cError) console.error("Error deleting categories:", cError.message);
  else console.log("Categories deleted successfully.");

  // Delete services
  console.log("Deleting services...");
  const { error: sError } = await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (sError) console.error("Error deleting services:", sError.message);
  else console.log("Services deleted successfully.");

  // Delete guides
  console.log("Deleting guides...");
  const { error: gError } = await supabase.from('guides').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (gError) console.error("Error deleting guides:", gError.message);
  else console.log("Guides deleted successfully.");

  console.log("All example data deletion queries completed.");
}

clearData();
