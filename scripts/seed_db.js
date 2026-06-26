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

// Default Seed Data matching the database snake_case fields
const defaultCategories = [
  { 
    id: '1', 
    name_tr: 'Tül Perdeler', 
    name_en: 'Sheer Curtains', 
    image: '', 
    images: [],
    status: 'active', 
    display_order: 1,
    description_tr: 'Evinize yumuşak bir aydınlık ve esinti getiren, ince ve dökümlü premium tül tasarımları.',
    description_en: 'Fine, flowing premium sheer designs bringing soft light and breeze to your home.'
  },
  { 
    id: '2', 
    name_tr: 'Fon Perdeler', 
    name_en: 'Drape Curtains', 
    image: '', 
    images: [],
    status: 'active', 
    display_order: 2,
    description_tr: 'Zengin keten dokuları ve derin lacivert/bej renk alternatifleriyle odaya karakter katan kalın dökümlü kumaşlar.',
    description_en: 'Thick draping fabrics that add character to the room with rich linen textures and deep blue/beige alternatives.'
  },
  { 
    id: '3', 
    name_tr: 'Stor & Jaluzi', 
    name_en: 'Roller & Venetian', 
    image: '', 
    images: [],
    status: 'active', 
    display_order: 3,
    description_tr: 'Modern ve minimalist mekanlar için mükemmel ışık kontrolü sunan fonksiyonel ahşap ve kumaş jaluziler.',
    description_en: 'Functional wood and fabric venetian blinds offering perfect light control for modern minimalist spaces.'
  },
  { 
    id: '4', 
    name_tr: 'Motorlu Sistemler', 
    name_en: 'Motorized Systems', 
    image: '', 
    images: [],
    status: 'active', 
    display_order: 4,
    description_tr: 'Akıllı ev sistemlerine entegre olabilen, uzaktan kumandalı ve sessiz çalışan lüks motorlu perde mekanizmaları.',
    description_en: 'Luxury motorized curtain mechanisms that integrate with smart home systems, operating silently and remotely.'
  }
];

const defaultProducts = [
  {
    id: 'prod-001',
    name_tr: 'İskandinav Keten Tül',
    name_en: 'Scandinavian Linen Sheer',
    category_tr: 'Tül Perdeler',
    category_en: 'Sheer Curtains',
    category_id: '1',
    description_tr: 'Doğal keten liflerinden üretilmiş, gün ışığını odaya yumuşatarak yayan minimalist İskandinav tarzı tül perde.',
    description_en: 'Minimalist Scandinavian style sheer curtain made of natural linen fibers, diffusing daylight softly into the room.',
    colors: [
      { nameTr: 'Kırık Beyaz', nameEn: 'Off-White', hex: '#F9FBF7' },
      { nameTr: 'Kum Beji', nameEn: 'Sand Beige', hex: '#E6DFD3' },
      { nameTr: 'Hafif Gri', nameEn: 'Soft Grey', hex: '#DCDCDC' }
    ],
    fabric_type_tr: '%100 Keten',
    fabric_type_en: '100% Linen',
    price_multiplier: 0.15,
    popularity: 95,
    images: ['/assets/scandi.png', '/assets/fabric.png'],
    tech_specs_tr: ['Kuru temizleme önerilir', 'Işık geçirgenliği yüksek', 'Doğal kırışık doku'],
    tech_specs_en: ['Dry clean recommended', 'High light transmittance', 'Natural crinkle texture'],
    status: 'active',
    display_order: 1
  },
  {
    id: 'prod-002',
    name_tr: 'Premium Kadife Fon Perde',
    name_en: 'Premium Velvet Drape',
    category_tr: 'Fon Perdeler',
    category_en: 'Drape Curtains',
    category_id: '2',
    description_tr: 'Zengin dokusu ve derin renk geçişleriyle salonunuza saray zarafeti ve ses/ısı yalıtımı katan lüks İtalyan kadife fon.',
    description_en: 'Luxury Italian velvet drape adding palace elegance and sound/heat insulation to your living room with rich texture.',
    colors: [
      { nameTr: 'Marka Lacivert', nameEn: 'Brand Navy', hex: '#1A2E40' },
      { nameTr: 'Zümrüt Yeşili', nameEn: 'Emerald Green', hex: '#0B3F2E' },
      { nameTr: 'Hardal Sarısı', nameEn: 'Mustard', hex: '#BD954B' }
    ],
    fabric_type_tr: 'İtalyan Kadife',
    fabric_type_en: 'Italian Velvet',
    price_multiplier: 0.28,
    popularity: 88,
    images: ['/assets/hero.png', '/assets/fabric.png'],
    tech_specs_tr: ['Kuru temizleme zorunlu', 'Karartma oranı %80', 'Ağır dökümlü kumaş'],
    tech_specs_en: ['Dry clean only', 'Blackout rate 80%', 'Heavy drape fabric'],
    status: 'active',
    display_order: 2
  },
  {
    id: 'prod-003',
    name_tr: 'Doğal Ahşap Jaluzi',
    name_en: 'Natural Wooden Venetian',
    category_tr: 'Stor & Jaluzi',
    category_en: 'Roller & Venetian',
    category_id: '3',
    description_tr: 'Sürdürülebilir bambu ağacından imal edilen, 50mm bant genişliğine sahip premium minimalist ahşap stor jaluzi.',
    description_en: 'Premium minimalist wooden venetian blind with 50mm slats, manufactured from sustainable bamboo wood.',
    colors: [
      { nameTr: 'Doğal Meşe', nameEn: 'Natural Oak', hex: '#C29B70' },
      { nameTr: 'Kömür Siyahı', nameEn: 'Coal Black', hex: '#2C2C2C' },
      { nameTr: 'Mat Beyaz', nameEn: 'Matte White', hex: '#FFFFFF' }
    ],
    fabric_type_tr: 'Doğal Ahşap / Bambu',
    fabric_type_en: 'Natural Wood / Bamboo',
    price_multiplier: 0.22,
    popularity: 76,
    images: ['/assets/fabric.png', '/assets/scandi.png'],
    tech_specs_tr: ['Nemli bezle temizlenir', 'Işık açısı ayarlanabilir', '50mm bant genişliği'],
    tech_specs_en: ['Clean with damp cloth', 'Adjustable light angle', '50mm slat width'],
    status: 'active',
    display_order: 3
  },
  {
    id: 'prod-004',
    name_tr: 'Akıllı Motorlu Stor',
    name_en: 'Smart Motorized Roller',
    category_tr: 'Motorlu Sistemler',
    category_en: 'Motorized Systems',
    category_id: '4',
    description_tr: 'Somfy motor altyapılı, Apple HomeKit ve Google Home uyumlu, ultra sessiz çalışan akıllı motorlu stor perde sistemi.',
    description_en: 'Somfy-powered smart motorized roller blind system, Apple HomeKit & Google Home compatible, ultra-quiet operation.',
    colors: [
      { nameTr: 'Antrasit', nameEn: 'Anthracite', hex: '#3E424B' },
      { nameTr: 'İnci Beyazı', nameEn: 'Pearl White', hex: '#F3F2EE' }
    ],
    fabric_type_tr: 'Polyester & Glass fiber',
    fabric_type_en: 'Polyester & Glass fiber',
    price_multiplier: 0.35,
    popularity: 90,
    images: ['/assets/hero.png', '/assets/fabric.png'],
    tech_specs_tr: ['Uzaktan kumandalı', 'Sessiz motor (<35dB)', 'Akıllı ev entegrasyonu'],
    tech_specs_en: ['Remote control included', 'Quiet motor (<35dB)', 'Smart home integration'],
    status: 'active',
    display_order: 4
  }
];

const defaultSettings = {
  id: 'main_settings',
  store_name: 'LALE PERDE',
  phone: '+90 543 248 05 03',
  email: 'laleperdekahta@gmail.com',
  address: 'Gazi Ortaokulu Girişi, Karşıyaka, Gazi Cd., 02400 Kâhta/Adıyaman',
  whatsapp_number: '+905432480503',
  google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d394.1424440361272!2d38.61035475548639!3d37.786769185663445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15335f0e3cd67197%3A0x5711b777789062f1!2sLALE%20PERDE%20KAHTA!5e0!3m2!1str!2str!4v1782053953763!5m2!1str!2str',
  announcement_tr: '✦ Tasarım danışmanlığımız ve evinizde ücretsiz keşif hizmetimiz başlamıştır! ✦',
  announcement_en: '✦ Our premium home design consultancy and free home survey services are live! ✦',
  announcement_active: false,
  working_hours_tr: 'Pazartesi - Cumartesi: 09:00 - 19:00 | Pazar: Kapalı',
  working_hours_en: 'Monday - Saturday: 09:00 - 19:00 | Sunday: Closed',
  admin_username: 'admin',
  admin_password_hash: 'lale2026',
  admin_phone: '+905432480503',
  admin_email: 'laleperdekahta@gmail.com'
};

const defaultHomePageContent = {
  id: 'home_content',
  philosophy_title_tr: 'Işığın odanıza yayılış şekli, yaşam kalitenizi belirler.',
  philosophy_title_en: 'The way light enters your room defines your quality of life.',
  philosophy_desc_tr: 'Doğal ışığı yönetmek bir sanattır. Lale Perde olarak biz, estetik ve işlevselliği birleştirerek mekanlarınızın ruhunu değiştiriyoruz.',
  philosophy_desc_en: 'Managing natural light is an art. At Lale Perde, we change the soul of your spaces by combining aesthetics and functionality.',
  craft_title_tr: 'Zanaat & Doku',
  craft_title_en: 'Craft & Texture',
  craft_desc_tr: 'En ince ipliklerden dokunan premium kumaşlarımız, usta ellerde mekanınıza özel bir form kazanır.',
  craft_desc_en: 'Our premium fabrics woven from the finest threads take a special form for your space in master hands.',
  collections_title_tr: 'Seçkin Koleksiyonlarımız',
  collections_title_en: 'Our Selected Collections',
  collections_desc_tr: 'Yaşam alanınıza ilham verecek favori tasarımlarımızı keşfedin.',
  collections_desc_en: 'Discover our favorite designs to inspire your living space.',
  featured_category_ids: []
};

const defaultServices = [
  { id: 'srv-1', title_tr: 'Ücretsiz Keşif & Ölçü', title_en: 'Free Survey & Measurement', description_tr: 'Uzman ekibimizle mekanınızda doğru ölçü alımı.', description_en: 'Accurate measurement in your space with our expert team.', icon: 'Ruler', display_order: 1, status: 'active' },
  { id: 'srv-2', title_tr: 'Tasarım Danışmanlığı', title_en: 'Design Consultancy', description_tr: 'Evinizin stiline en uygun kumaş ve model seçimi.', description_en: 'Choosing the most suitable fabric and model for your home style.', icon: 'Palette', display_order: 2, status: 'active' },
  { id: 'srv-3', title_tr: 'Profesyonel Montaj', title_en: 'Professional Installation', description_tr: 'Kusursuz işçilikle temiz ve hızlı kurulum hizmeti.', description_en: 'Clean and fast installation service with flawless workmanship.', icon: 'Wrench', display_order: 3, status: 'active' },
  { id: 'srv-4', title_tr: 'Akıllı Ev Entegrasyonu', title_en: 'Smart Home Integration', description_tr: 'Motorlu sistemlerin otomasyon ağınıza bağlanması.', description_en: 'Connecting motorized systems to your automation network.', icon: 'Lightbulb', display_order: 4, status: 'active' }
];

const defaultGuides = [
  { id: 'gd-1', title_tr: 'Doğru Perde Ölçüsü Nasıl Alınır?', title_en: 'How to Measure Curtains Correctly?', summary_tr: 'Pencereniz için kusursuz ölçü alma rehberi.', summary_en: 'Perfect measurement guide for your window.', content_tr: 'İçerik buraya gelecek...', content_en: 'Content will go here...', image: '/assets/fabric.png', date: '2026-06-15', status: 'active', display_order: 1 },
  { id: 'gd-2', title_tr: 'Hangi Odaya Hangi Kumaş?', title_en: 'Which Fabric for Which Room?', summary_tr: 'Mekanınıza uygun kumaş seçimi ipuçları.', summary_en: 'Tips for choosing fabric suitable for your space.', content_tr: 'İçerik buraya gelecek...', content_en: 'Content will go here...', image: '/assets/hero.png', date: '2026-06-10', status: 'active', display_order: 2 }
];

const defaultCampaigns = [
  { id: 'cmp-1', title_tr: 'Yaz Koleksiyonu İndirimi', title_en: 'Summer Collection Sale', description_tr: 'Tüm tül perdelerde %20 indirim fırsatı.', description_en: '20% discount on all sheer curtains.', is_active: true, start_date: '2026-06-01', end_date: '2026-08-31' }
];

const defaultComments = [
  {
    id: 'f1',
    author: 'Selim Aksoy',
    content_tr: 'Salonumuz için tül ve fon perde siparişi vermiştik. Keten liflerinin dokusu harika, işçilik kusursuz.',
    content_en: 'We ordered sheer and background curtains for our living room. The linen texture is amazing, craftsmanship is perfect.',
    rating: 5,
    is_active: true,
    display_order: 1
  },
  {
    id: 'f2',
    author: 'Ayla Yılmaz',
    content_tr: 'Ölçü sihirbazı sayesinde pencerelerimizin net ölçülerini aldık, gelen perdeler tam milimetrik oturdu.',
    content_en: 'Thanks to the measuring wizard we got precise measurements, the curtains fit down to the millimeter.',
    rating: 5,
    is_active: true,
    display_order: 2
  },
  {
    id: 'f3',
    author: 'Caner Demir',
    content_tr: 'Motorlu perde sistemleri akıllı evimize mükemmel entegre oldu. Sessiz ve son derece lüks.',
    content_en: 'Motorized curtain systems integrated perfectly with our smart home. Silent and highly luxurious.',
    rating: 5,
    is_active: true,
    display_order: 3
  },
  {
    id: 'f4',
    author: 'Melis Şen',
    content_tr: 'Showroomdaki ilgi ve evde ücretsiz keşif hizmetinden çok memnun kaldık. Teşekkürler Lale Perde.',
    content_en: 'Highly satisfied with the showroom service and free in-house discovery. Thank you Lale Perde.',
    rating: 5,
    is_active: true,
    display_order: 4
  }
];

async function seed() {
  console.log("Checking categories table count...");
  const { count, error: countErr } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  if (countErr) {
    console.error("Error checking categories count:", countErr);
    return;
  }

  if (count > 0) {
    console.log(`Database already seeded with ${count} categories. Skipping seed.`);
    return;
  }

  console.log("Seeding database tables...");
  
  // Seed Categories
  const { error: catErr } = await supabase.from('categories').insert(defaultCategories);
  if (catErr) console.error("Error seeding categories:", catErr.message);
  else console.log("Seeded categories successfully");

  // Seed Products
  const { error: prodErr } = await supabase.from('products').insert(defaultProducts);
  if (prodErr) console.error("Error seeding products:", prodErr.message);
  else console.log("Seeded products successfully");

  // Seed Settings
  const { error: settingsErr } = await supabase.from('site_settings').insert([defaultSettings]);
  if (settingsErr) console.error("Error seeding site_settings:", settingsErr.message);
  else console.log("Seeded site_settings successfully");

  // Seed Home Page Content
  const { error: homeErr } = await supabase.from('home_page_content').insert([defaultHomePageContent]);
  if (homeErr) console.error("Error seeding home_page_content:", homeErr.message);
  else console.log("Seeded home_page_content successfully");

  // Seed Services
  const { error: srvErr } = await supabase.from('services').insert(defaultServices);
  if (srvErr) console.error("Error seeding services:", srvErr.message);
  else console.log("Seeded services successfully");

  // Seed Guides
  const { error: guideErr } = await supabase.from('guides').insert(defaultGuides);
  if (guideErr) console.error("Error seeding guides:", guideErr.message);
  else console.log("Seeded guides successfully");

  // Seed Campaigns
  const { error: campErr } = await supabase.from('campaigns').insert(defaultCampaigns);
  if (campErr) console.error("Error seeding campaigns:", campErr.message);
  else console.log("Seeded campaigns successfully");

  // Seed Comments
  const { error: commentErr } = await supabase.from('comments').insert(defaultComments);
  if (commentErr) console.error("Error seeding comments:", commentErr.message);
  else console.log("Seeded comments successfully");

  console.log("Seeding completed.");
}

seed().catch(err => console.error("Uncaught error during seeding:", err));
