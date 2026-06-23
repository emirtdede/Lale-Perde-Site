async function main() {
  try {
    const res = await fetch('https://adwmdvtrrjlmbhmuodon.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkd21kdnRycmpsbWJobXVvZG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNTU1NDYsImV4cCI6MjA5NzczMTU0Nn0.hd7Otm48TOghOW4YgtOHKKpgP4OIhbpcVZpvmQbsPBY'
      }
    });
    console.log('Status:', res.status);
    console.log('Headers:');
    for (const [key, value] of res.headers.entries()) {
      console.log(`${key}: ${value}`);
    }
  } catch (e) {
    console.error(e);
  }
}
main();
