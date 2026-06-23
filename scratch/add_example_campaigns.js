const url = 'https://adwmdvtrrjlmbhmuodon.supabase.co/rest/v1/campaigns';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkd21kdnRycmpsbWJobXVvZG9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE1NTU0NiwiZXhwIjoyMDk3NzMxNTQ2fQ.A5f2e1f3vqwIoVT_FDNAe57ENFp8jecGz5xZWJApPU8';

const campaigns = [
  {
    id: 'camp-example-1',
    title_tr: 'Yaz Esintisi Koleksiyonu',
    title_en: 'Summer Breeze Collection',
    description_tr: 'Seçili tül ve fon perdelerde %20 İndirim!',
    description_en: '20% Off on selected tulle and drape curtains!',
    is_active: true,
    start_date: '2026-06-01',
    end_date: '2026-08-31'
  },
  {
    id: 'camp-example-2',
    title_tr: 'Ücretsiz Keşif & Ölçü Hizmeti',
    title_en: 'Free On-Site Consultation',
    description_tr: 'İstanbul içi adresinize özel mimari danışmanlık.',
    description_en: 'Professional architectural consultancy at your address.',
    is_active: true,
    start_date: '2026-06-01',
    end_date: '2026-12-31'
  },
  {
    id: 'camp-example-3',
    title_tr: 'Akıllı Ev Kampanyası',
    title_en: 'Smart Home Campaign',
    description_tr: 'Motorlu stor perdelerde montaj bizden!',
    description_en: 'Free installation on motorized roller blinds!',
    is_active: true,
    start_date: '2026-06-15',
    end_date: '2026-07-15'
  }
];

async function insertCampaigns() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(campaigns)
    });
    
    if (res.ok) {
      console.log('Successfully inserted 3 example campaigns.');
    } else {
      const err = await res.text();
      console.error('Failed to insert campaigns:', err);
    }
  } catch (e) {
    console.error('Error during execution:', e);
  }
}

insertCampaigns();
