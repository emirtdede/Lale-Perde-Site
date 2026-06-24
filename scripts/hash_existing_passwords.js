const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching main_admin record...');
  const { data, error } = await supabase
    .from('admin_auth')
    .select('id, admin_password_hash')
    .eq('id', 'main_admin')
    .single();

  if (error) {
    console.error('Error fetching admin:', error);
    process.exit(1);
  }

  const currentPass = data.admin_password_hash;
  
  // Basic check to see if it's already a bcrypt hash (starts with $2a$ or $2b$)
  if (currentPass.startsWith('$2a$') || currentPass.startsWith('$2b$')) {
    console.log('Password is already hashed with bcrypt. Exiting.');
    process.exit(0);
  }

  console.log('Hashing plaintext password...');
  const hashed = await bcrypt.hash(currentPass, 10);

  console.log('Updating database...');
  const { error: updateError } = await supabase
    .from('admin_auth')
    .update({ admin_password_hash: hashed })
    .eq('id', 'main_admin');

  if (updateError) {
    console.error('Error updating admin:', updateError);
    process.exit(1);
  }

  console.log('Successfully hashed admin password!');
}

run();
