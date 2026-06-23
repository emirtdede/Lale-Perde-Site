const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adwmdvtrrjlmbhmuodon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkd21kdnRycmpsbWJobXVvZG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNTU1NDYsImV4cCI6MjA5NzczMTU0Nn0.hd7Otm48TOghOW4YgtOHKKpgP4OIhbpcVZpvmQbsPBY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('site_settings').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns:', Object.keys(data[0]));
    console.log('Row values:', data[0]);
  }
}

main();
