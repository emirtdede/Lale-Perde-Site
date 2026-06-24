const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^${name}\\s*=\\s*["']?(.*?)["']?\\s*$`, 'm'));
  return match ? match[1] : null;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Fetching existing taxonomy data...');
  
  // 1. Fetch Categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*');
  
  if (catError) {
    console.error('Error fetching categories:', catError);
    return;
  }
  console.log(`Found ${categories.length} categories.`);

  // 2. Fetch Curtain Types
  const { data: curtainTypes, error: curtError } = await supabase
    .from('curtain_types')
    .select('*');
  
  if (curtError) {
    console.error('Error fetching curtain types:', curtError);
    return;
  }
  console.log(`Found ${curtainTypes.length} curtain types.`);

  // 3. Fetch Fabric Types
  const { data: fabricTypes, error: fabError } = await supabase
    .from('fabric_types')
    .select('*');
  
  if (fabError) {
    console.error('Error fetching fabric types:', fabError);
    return;
  }
  console.log(`Found ${fabricTypes.length} fabric types.`);

  // Clear existing products to prevent duplicates (optional, let's keep it or just insert new ones)
  // Let's check if we want to delete old ones. Yes, let's delete dummy products first or just insert if they don't exist.
  // Actually, let's delete them to make it clean.
  console.log('Deleting existing products to seed fresh data...');
  const { error: deleteError } = await supabase.from('products').delete().neq('id', 'keep-nothing');
  if (deleteError) {
    console.error('Error deleting products:', deleteError);
  }

  const sampleProducts = [];

  // Helper to find id by matching name
  const findCurtainType = (catId, name) => {
    return curtainTypes.find(c => c.category_id === catId && c.name_tr.toLowerCase().includes(name.toLowerCase()))?.id || null;
  };

  const findFabricType = (catId, name) => {
    return fabricTypes.find(f => f.category_id === catId && f.name_tr.toLowerCase().includes(name.toLowerCase()))?.id || null;
  };

  categories.forEach(cat => {
    const catName = cat.name_tr.toLowerCase();
    
    if (catName.includes('ev')) {
      sampleProducts.push({
        name_tr: 'Lüks Kadife Fon Perde',
        name_en: 'Luxury Velvet Drape Curtain',
        category_tr: cat.name_tr,
        category_en: cat.name_en,
        category_id: cat.id,
        description_tr: 'Evinize zarafet ve sıcaklık katacak, birinci sınıf dökümlü kadife fon perde.',
        description_en: 'Premium velvet drape curtain that adds elegance and warmth to your home.',
        colors: [
          { nameTr: 'Zümrüt Yeşili', nameEn: 'Emerald Green', hex: '#0F5257' },
          { nameTr: 'Hardal Sarısı', nameEn: 'Mustard Yellow', hex: '#E7B800' },
          { nameTr: 'Vizon', nameEn: 'Mink', hex: '#8B80F9' }
        ],
        fabric_type_tr: 'Kadife',
        fabric_type_en: 'Velvet',
        price_multiplier: 450,
        popularity: 95,
        images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600'],
        tech_specs_tr: ['%100 Kadife İplik', 'Yüksek gramajlı dökümlü yapı', 'Kuru temizleme önerilir'],
        tech_specs_en: ['100% Velvet Yarn', 'High weight elegant drape', 'Dry clean recommended'],
        status: 'active',
        cover_image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600',
        display_order: 1,
        curtain_type_id: findCurtainType(cat.id, 'Fon'),
        fabric_type_id: findFabricType(cat.id, 'Kadife')
      });
      sampleProducts.push({
        name_tr: 'Premium Keten Görünümlü Tül',
        name_en: 'Premium Linen Look Sheer',
        category_tr: cat.name_tr,
        category_en: cat.name_en,
        category_id: cat.id,
        description_tr: 'Doğal dokusuyla ışığı mükemmel süzen keten görünümlü modern tül perde.',
        description_en: 'Modern linen-look sheer curtain that filters light perfectly with its natural texture.',
        colors: [
          { nameTr: 'Ekru', nameEn: 'Ecru', hex: '#F4EBE1' },
          { nameTr: 'Beyaz', nameEn: 'White', hex: '#FFFFFF' }
        ],
        fabric_type_tr: 'Keten',
        fabric_type_en: 'Linen',
        price_multiplier: 250,
        popularity: 88,
        images: ['https://images.unsplash.com/photo-1617806118233-18e1db207f62?q=80&w=600'],
        tech_specs_tr: ['Keten karışımlı dokuma', 'Kolay ütülenebilir kumaş', '30 derecede yıkanabilir'],
        tech_specs_en: ['Linen blend weave', 'Easy-iron fabric', 'Washable at 30 degrees'],
        status: 'active',
        cover_image: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?q=80&w=600',
        display_order: 2,
        curtain_type_id: findCurtainType(cat.id, 'Tül'),
        fabric_type_id: findFabricType(cat.id, 'Keten')
      });
    } else if (catName.includes('ofis')) {
      sampleProducts.push({
        name_tr: 'Sunscreen Metalik Stor Perde',
        name_en: 'Sunscreen Metallic Roller Blind',
        category_tr: cat.name_tr,
        category_en: cat.name_en,
        category_id: cat.id,
        description_tr: 'Ofislerde parlama ve sıcaklığı engelleyen, dışarıyı görmeyi sağlayan güneş kırıcı stor.',
        description_en: 'Sun-filtering roller blind that prevents glare and heat in offices while maintaining view.',
        colors: [
          { nameTr: 'Metalik Gri', nameEn: 'Metallic Grey', hex: '#8E9094' },
          { nameTr: 'Siyah-Antrasit', nameEn: 'Black-Anthracite', hex: '#2B2C2C' }
        ],
        fabric_type_tr: 'Sunscreen',
        fabric_type_en: 'Sunscreen',
        price_multiplier: 380,
        popularity: 90,
        images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600'],
        tech_specs_tr: ['%3 Açıksal Geçirgenlik', 'Alev almaz özellik', 'Silinebilir yüzey'],
        tech_specs_en: ['3% Openness Factor', 'Flame retardant', 'Wipeable surface'],
        status: 'active',
        cover_image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600',
        display_order: 1,
        curtain_type_id: findCurtainType(cat.id, 'Stor'),
        fabric_type_id: findFabricType(cat.id, 'Sunscreen')
      });
    } else if (catName.includes('cami')) {
      sampleProducts.push({
        name_tr: 'Altın Nakışlı Cami Mihrap Perdesi',
        name_en: 'Gold Embroidered Mosque Mihrab Curtain',
        category_tr: cat.name_tr,
        category_en: cat.name_en,
        category_id: cat.id,
        description_tr: 'Cami mimarisine uygun, el işçiliği nakışlı ve ağır dökümlü mihrap perdesi.',
        description_en: 'Hand-embroidered and heavy drape mihrab curtain suitable for mosque architecture.',
        colors: [
          { nameTr: 'Bordo', nameEn: 'Claret Red', hex: '#800020' },
          { nameTr: 'Zümrüt', nameEn: 'Emerald', hex: '#0F5257' }
        ],
        fabric_type_tr: 'Kadife',
        fabric_type_en: 'Velvet',
        price_multiplier: 600,
        popularity: 99,
        images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600'],
        tech_specs_tr: ['Birinci kalite İpek Kadife', 'Altın yaldızlı sim nakış', 'Özel tasarım saçak süslemesi'],
        tech_specs_en: ['Premium Silk Velvet', 'Gold gilded thread embroidery', 'Custom design fringe decoration'],
        status: 'active',
        cover_image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600',
        display_order: 1,
        curtain_type_id: findCurtainType(cat.id, 'Mihrap'),
        fabric_type_id: findFabricType(cat.id, 'Kadife')
      });
    } else if (catName.includes('sahne')) {
      sampleProducts.push({
        name_tr: 'Alev Almaz Akustik Sahne Perdesi',
        name_en: 'Flame Retardant Acoustic Stage Curtain',
        category_tr: cat.name_tr,
        category_en: cat.name_en,
        category_id: cat.id,
        description_tr: 'Tiyatro ve konferans salonları için ses emici ve alev almaz özellikli ağır kadife perde.',
        description_en: 'Heavy velvet curtain with sound-absorbing and flame-retardant properties for theaters.',
        colors: [
          { nameTr: 'Kraliyet Kırmızısı', nameEn: 'Royal Red', hex: '#9A031E' },
          { nameTr: 'Mat Siyah', nameEn: 'Matte Black', hex: '#111111' }
        ],
        fabric_type_tr: 'Ağır Kadife',
        fabric_type_en: 'Heavy Velvet',
        price_multiplier: 750,
        popularity: 92,
        images: ['https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=600'],
        tech_specs_tr: ['550g/m² Akustik Kadife', 'B1 Sınıfı Alev Almazlık Sertifikası', 'Yüksek ses yutma katsayısı'],
        tech_specs_en: ['550g/m² Acoustic Velvet', 'B1 Flame Retardancy Certificate', 'High sound absorption coefficient'],
        status: 'active',
        cover_image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=600',
        display_order: 1,
        curtain_type_id: findCurtainType(cat.id, 'Sahne'),
        fabric_type_id: findFabricType(cat.id, 'Kadife') || findFabricType(cat.id, 'Alev')
      });
    } else if (catName.includes('hastane')) {
      sampleProducts.push({
        name_tr: 'Anti-Bakteriyel Fileli Hasta Yatağı Bölme Perdesi',
        name_en: 'Antibacterial Meshed Bed Partition Curtain',
        category_tr: cat.name_tr,
        category_en: cat.name_en,
        category_id: cat.id,
        description_tr: 'Klinik ve hastaneler için özel hijyen standartlarında üretilmiş fileli bölme perdesi.',
        description_en: 'Meshed partition curtain produced with special hygiene standards for clinics and hospitals.',
        colors: [
          { nameTr: 'Medikal Mavi', nameEn: 'Medical Blue', hex: '#A8DADC' },
          { nameTr: 'Açık Yeşil', nameEn: 'Light Green', hex: '#E8F5E9' }
        ],
        fabric_type_tr: 'Anti-bakteriyel Kumaşlar',
        fabric_type_en: 'Antibacterial Fabrics',
        price_multiplier: 290,
        popularity: 85,
        images: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600'],
        tech_specs_tr: ['Gümüş iyon teknolojisi ile bakteri üretmez', 'Üst kısmı 50cm havalandırma fileli', 'Leke tutmaz ve yıkanabilir'],
        tech_specs_en: ['Inhibits bacteria growth with silver ions', 'Top 50cm ventilation mesh', 'Stain resistant and washable'],
        status: 'active',
        cover_image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600',
        display_order: 1,
        curtain_type_id: findCurtainType(cat.id, 'Hasta') || findCurtainType(cat.id, 'Bölme'),
        fabric_type_id: findFabricType(cat.id, 'Anti')
      });
    } else if (catName.includes('otel')) {
      sampleProducts.push({
        name_tr: 'Blackout Dimout Otel Fon Perdesi',
        name_en: 'Blackout Dimout Hotel Drape',
        category_tr: cat.name_tr,
        category_en: cat.name_en,
        category_id: cat.id,
        description_tr: 'Otel odaları için %100 ışık blokajı sağlayan, alev almaz sertifikalı fon perde.',
        description_en: 'Flame retardant certified drape curtain that provides 100% light blockage for hotel rooms.',
        colors: [
          { nameTr: 'Kül Grisi', nameEn: 'Ash Grey', hex: '#B0A99F' },
          { nameTr: 'Krem', nameEn: 'Cream', hex: '#FFFDD0' }
        ],
        fabric_type_tr: 'Karartma (Blackout) ve Dimout',
        fabric_type_en: 'Blackout & Dimout',
        price_multiplier: 480,
        popularity: 93,
        images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600'],
        tech_specs_tr: ['%100 Işık sızdırmazlık (Blackout)', 'Alev iletmeme özellikli iplik', 'Termal yalıtım katkısı'],
        tech_specs_en: ['100% Lightproof (Blackout)', 'Flame retardant yarn', 'Thermal insulation properties'],
        status: 'active',
        cover_image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600',
        display_order: 1,
        curtain_type_id: findCurtainType(cat.id, 'Fon') || findCurtainType(cat.id, 'Karartma'),
        fabric_type_id: findFabricType(cat.id, 'Karartma') || findFabricType(cat.id, 'Alev')
      });
    } else if (catName.includes('dış mekan') || catName.includes('dis-mekan')) {
      sampleProducts.push({
        name_tr: 'Fermuarlı Zip Dış Mekan Stor Perde',
        name_en: 'Zippered Outdoor Zip Roller Blind',
        category_tr: cat.name_tr,
        category_en: cat.name_en,
        category_id: cat.id,
        description_tr: 'Kış bahçesi, pergola ve balkonlar için rüzgar, yağmur ve sinek geçirmeyen motorlu zip perde.',
        description_en: 'Motorized zip blind for winter gardens, pergolas and balconies protecting from wind and rain.',
        colors: [
          { nameTr: 'Antrasit', nameEn: 'Anthracite', hex: '#343538' },
          { nameTr: 'Krem', nameEn: 'Cream', hex: '#EAE6DF' }
        ],
        fabric_type_tr: 'Sunscreen (Dış Mekan Güneş Kırıcı)',
        fabric_type_en: 'Sunscreen (Outdoor)',
        price_multiplier: 890,
        popularity: 96,
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600'],
        tech_specs_tr: ['120 km/h rüzgara dayanıklı kilit sistemi', 'Su geçirmez Serge Ferrari kumaş', 'Somfy motor entegrasyonu'],
        tech_specs_en: ['Windproof lock system up to 120 km/h', 'Waterproof Serge Ferrari fabric', 'Somfy motor integration'],
        status: 'active',
        cover_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600',
        display_order: 1,
        curtain_type_id: findCurtainType(cat.id, 'Zip'),
        fabric_type_id: findFabricType(cat.id, 'Sunscreen') || findFabricType(cat.id, 'Akrilik')
      });
    } else if (catName.includes('endüstriyel') || catName.includes('endustriyel')) {
      sampleProducts.push({
        name_tr: 'Şeffaf PVC Şerit Bölme Perdesi',
        name_en: 'Clear PVC Strip Curtain',
        category_tr: cat.name_tr,
        category_en: cat.name_en,
        category_id: cat.id,
        description_tr: 'Depo ve imalathanelerde ısı/toz yalıtımı sağlayan, transpalet geçişine uygun şerit perde.',
        description_en: 'Strip curtain providing heat/dust insulation in warehouses and workshops, suitable for pallet jacks.',
        colors: [
          { nameTr: 'Şeffaf Mavi', nameEn: 'Clear Blue Tint', hex: '#D0E1FD' }
        ],
        fabric_type_tr: 'Şeffaf PVC',
        fabric_type_en: 'Clear PVC',
        price_multiplier: 320,
        popularity: 82,
        images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600'],
        tech_specs_tr: ['3mm et kalınlığı, 30cm şerit genişliği', 'Paslanmaz askı aparatlı galvaniz ray', 'Düşük ısı kayıp katsayısı'],
        tech_specs_en: ['3mm thickness, 30cm strip width', 'Galvanized rail with stainless steel hanger', 'Low heat loss coefficient'],
        status: 'active',
        cover_image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600',
        display_order: 1,
        curtain_type_id: findCurtainType(cat.id, 'Şerit'),
        fabric_type_id: findFabricType(cat.id, 'Şeffaf')
      });
    } else if (catName.includes('karavan') || catName.includes('tekne')) {
      sampleProducts.push({
        name_tr: 'Isı Yalıtımlı Termal Plise Karavan Perdesi',
        name_en: 'Thermal Insulated Pleated Caravan Blind',
        category_tr: cat.name_tr,
        category_en: cat.name_en,
        category_id: cat.id,
        description_tr: 'Karavan camları için özel ölçü üretilen, sineklikli ve ısı yalıtımlı plise perde.',
        description_en: 'Custom-made pleated curtain for caravan windows with insect screen and thermal insulation.',
        colors: [
          { nameTr: 'Metalik Gri / Krem', nameEn: 'Metallic Grey / Cream', hex: '#C2C4C6' }
        ],
        fabric_type_tr: 'Alüminyum Arka Kaplamalı (Termal / Isı Yalıtımlı) Kumaşlar',
        fabric_type_en: 'Aluminum Coated (Thermal)',
        price_multiplier: 550,
        popularity: 91,
        images: ['https://images.unsplash.com/photo-1527786356703-4b100091cd50?q=80&w=600'],
        tech_specs_tr: ['Alüminyum kaplama arka yüzey ile %40 ısı koruması', 'Dahili akordeon sineklik sistemi', 'Sarsıntıda ses yapmayan gergi ipleri'],
        tech_specs_en: ['40% heat protection with aluminum backing', 'Integrated accordion flyscreen system', 'Tension cords that prevent rattling'],
        status: 'active',
        cover_image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd50?q=80&w=600',
        display_order: 1,
        curtain_type_id: findCurtainType(cat.id, 'Plise'),
        fabric_type_id: findFabricType(cat.id, 'Alüminyum') || findFabricType(cat.id, 'Termal')
      });
    }
  });

  const productsWithIds = sampleProducts.map(p => ({
    id: crypto.randomUUID(),
    ...p
  }));

  console.log(`Inserting ${productsWithIds.length} sample products...`);
  const { data: inserted, error: insertError } = await supabase
    .from('products')
    .insert(productsWithIds)
    .select();
  
  if (insertError) {
    console.error('Error inserting products:', insertError);
  } else {
    console.log(`Successfully seeded ${inserted.length} products!`);
  }
}

seed();
