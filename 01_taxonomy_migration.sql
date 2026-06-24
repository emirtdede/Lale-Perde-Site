-- Lale Perde Çoklu Sektör ve Dinamik Kategori Mimarisi Geçiş Scripti
-- Bu dosyayı Supabase SQL Editöründe (SQL Editor) çalıştırın.

-- 1. KATEGORİ TABLOSUNA SLUG EKLENMESİ
ALTER TABLE IF EXISTS public.categories ADD COLUMN IF NOT EXISTS slug text;

-- 2. PERDE ÇEŞİTLERİ (curtain_types) TABLOSU
CREATE TABLE IF NOT EXISTS public.curtain_types (
    id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
    category_id text REFERENCES public.categories(id) ON DELETE CASCADE,
    name_tr text NOT NULL,
    name_en text,
    slug text,
    display_order integer DEFAULT 1,
    status text DEFAULT 'active',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. KUMAŞ TÜRLERİ (fabric_types) TABLOSU
CREATE TABLE IF NOT EXISTS public.fabric_types (
    id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
    category_id text REFERENCES public.categories(id) ON DELETE CASCADE,
    name_tr text NOT NULL,
    name_en text,
    slug text,
    display_order integer DEFAULT 1,
    status text DEFAULT 'active',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ÜRÜNLER TABLOSUNA YENİ İLİŞKİLERİN EKLENMESİ
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS curtain_type_id text REFERENCES public.curtain_types(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS fabric_type_id text REFERENCES public.fabric_types(id) ON DELETE SET NULL;

-- 5. ROW LEVEL SECURITY (RLS) POLİTİKALARI
ALTER TABLE public.curtain_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabric_types ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle (idempotent olması için)
DROP POLICY IF EXISTS "Allow public read access for curtain_types" ON public.curtain_types;
DROP POLICY IF EXISTS "Allow public read access for fabric_types" ON public.fabric_types;
DROP POLICY IF EXISTS "Allow authenticated full access for curtain_types" ON public.curtain_types;
DROP POLICY IF EXISTS "Allow authenticated full access for fabric_types" ON public.fabric_types;

-- Anonim Okuma İzni
CREATE POLICY "Allow public read access for curtain_types" ON public.curtain_types FOR SELECT USING (true);
CREATE POLICY "Allow public read access for fabric_types" ON public.fabric_types FOR SELECT USING (true);

-- Admin CRUD İzni
CREATE POLICY "Allow authenticated full access for curtain_types" ON public.curtain_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access for fabric_types" ON public.fabric_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. SEED DATA (İLK VERİLERİN EKLENMESİ)
-- Idempotent (tekrar çalıştırılabilir) olması için PL/pgSQL bloğu kullanıyoruz.
DO $$ 
DECLARE
  cat_id TEXT;
  c_name TEXT;
  f_name TEXT;
  c_order INT;
  f_order INT;
BEGIN
  -- ==========================================
  -- 1. EV SEKTÖRÜ
  -- ==========================================
  SELECT id INTO cat_id FROM public.categories WHERE name_tr ILIKE 'Ev%' OR slug = 'ev' LIMIT 1;
  IF cat_id IS NULL THEN
    INSERT INTO public.categories (id, name_tr, name_en, slug, display_order, status, image) 
    VALUES ('cat-' || gen_random_uuid()::text, 'Ev', 'Home', 'ev', 1, 'active', '/placeholder.jpg') RETURNING id INTO cat_id;
  ELSE
    UPDATE public.categories SET slug = 'ev', display_order = 1 WHERE id = cat_id;
  END IF;

  -- Ev Perde Çeşitleri
  c_order := 1;
  FOREACH c_name IN ARRAY ARRAY['Fon Perde', 'Tül Perde', 'Stor Perde', 'Zebra Perde', 'Katlamalı (Roman) Perde', 'Kruvaze Perde', 'Jaluzi Perde', 'Rustik Perde']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.curtain_types WHERE category_id = cat_id AND name_tr = c_name) THEN
      INSERT INTO public.curtain_types (category_id, name_tr, slug, display_order) VALUES (cat_id, c_name, c_name, c_order);
    END IF;
    c_order := c_order + 1;
  END LOOP;

  -- Ev Kumaş Türleri
  f_order := 1;
  FOREACH f_name IN ARRAY ARRAY['Kadife', 'İpek', 'Saten', 'Keten', 'Karartma (Blackout)', 'Vual ve Organze', 'Polyester / Sentetik Karışımlar']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.fabric_types WHERE category_id = cat_id AND name_tr = f_name) THEN
      INSERT INTO public.fabric_types (category_id, name_tr, slug, display_order) VALUES (cat_id, f_name, f_name, f_order);
    END IF;
    f_order := f_order + 1;
  END LOOP;

  -- ==========================================
  -- 2. OFİS / KURUMSAL SEKTÖRÜ
  -- ==========================================
  SELECT id INTO cat_id FROM public.categories WHERE name_tr ILIKE 'Ofis%' OR slug = 'ofis' LIMIT 1;
  IF cat_id IS NULL THEN
    INSERT INTO public.categories (id, name_tr, name_en, slug, display_order, status, image) 
    VALUES ('cat-' || gen_random_uuid()::text, 'Ofis / Kurumsal', 'Office', 'ofis', 2, 'active', '/placeholder.jpg') RETURNING id INTO cat_id;
  ELSE
    UPDATE public.categories SET slug = 'ofis', display_order = 2 WHERE id = cat_id;
  END IF;

  c_order := 1;
  FOREACH c_name IN ARRAY ARRAY['Stor Perde', 'Jaluzi Perde', 'Dikey Perde', 'Zebra Perde', 'Plise Perde', 'Motorlu Perde Sistemleri']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.curtain_types WHERE category_id = cat_id AND name_tr = c_name) THEN
      INSERT INTO public.curtain_types (category_id, name_tr, slug, display_order) VALUES (cat_id, c_name, c_name, c_order);
    END IF;
    c_order := c_order + 1;
  END LOOP;

  f_order := 1;
  FOREACH f_name IN ARRAY ARRAY['Sunscreen (Güneş Kırıcı)', 'Polyester', 'Karartma (Blackout)', 'Alev Almaz (Trevira CS vb.)', 'Alüminyum', 'Ahşap']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.fabric_types WHERE category_id = cat_id AND name_tr = f_name) THEN
      INSERT INTO public.fabric_types (category_id, name_tr, slug, display_order) VALUES (cat_id, f_name, f_name, f_order);
    END IF;
    f_order := f_order + 1;
  END LOOP;

  -- ==========================================
  -- 3. CAMİ / İBADETHANE SEKTÖRÜ
  -- ==========================================
  SELECT id INTO cat_id FROM public.categories WHERE name_tr ILIKE 'Cami%' OR slug = 'cami' LIMIT 1;
  IF cat_id IS NULL THEN
    INSERT INTO public.categories (id, name_tr, name_en, slug, display_order, status, image) 
    VALUES ('cat-' || gen_random_uuid()::text, 'Cami / İbadethane', 'Mosque', 'cami', 3, 'active', '/placeholder.jpg') RETURNING id INTO cat_id;
  ELSE
    UPDATE public.categories SET slug = 'cami', display_order = 3 WHERE id = cat_id;
  END IF;

  c_order := 1;
  FOREACH c_name IN ARRAY ARRAY['Fon Perde', 'Tül Perde', 'Seperatör (Bölme) Perdesi', 'Kapı Perdesi', 'Mihrap Perdesi']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.curtain_types WHERE category_id = cat_id AND name_tr = c_name) THEN
      INSERT INTO public.curtain_types (category_id, name_tr, slug, display_order) VALUES (cat_id, c_name, c_name, c_order);
    END IF;
    c_order := c_order + 1;
  END LOOP;

  f_order := 1;
  FOREACH f_name IN ARRAY ARRAY['Kadife', 'Brokar / Jakarlı Kumaşlar', 'Nakışlı Tül', 'Saten', 'Ağır Polyester / Sentetik Karışımlar']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.fabric_types WHERE category_id = cat_id AND name_tr = f_name) THEN
      INSERT INTO public.fabric_types (category_id, name_tr, slug, display_order) VALUES (cat_id, f_name, f_name, f_order);
    END IF;
    f_order := f_order + 1;
  END LOOP;

  -- ==========================================
  -- 4. SAHNE / KONFERANS SEKTÖRÜ
  -- ==========================================
  SELECT id INTO cat_id FROM public.categories WHERE name_tr ILIKE 'Sahne%' OR slug = 'sahne' LIMIT 1;
  IF cat_id IS NULL THEN
    INSERT INTO public.categories (id, name_tr, name_en, slug, display_order, status, image) 
    VALUES ('cat-' || gen_random_uuid()::text, 'Sahne / Konferans', 'Stage', 'sahne', 4, 'active', '/placeholder.jpg') RETURNING id INTO cat_id;
  ELSE
    UPDATE public.categories SET slug = 'sahne', display_order = 4 WHERE id = cat_id;
  END IF;

  c_order := 1;
  FOREACH c_name IN ARRAY ARRAY['Sahne (Ana) Perdesi', 'Fon / Kulis Perdesi', 'Akustik Perde', 'Soffit (Alınlık) Perdesi', 'Motorlu Sahne Sistemleri', 'Projeksiyon Perdesi']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.curtain_types WHERE category_id = cat_id AND name_tr = c_name) THEN
      INSERT INTO public.curtain_types (category_id, name_tr, slug, display_order) VALUES (cat_id, c_name, c_name, c_order);
    END IF;
    c_order := c_order + 1;
  END LOOP;

  f_order := 1;
  FOREACH f_name IN ARRAY ARRAY['Ağır Kadife', 'Alev Almaz (Yanmaz) Kumaşlar', 'Akustik (Ses Emici) Kumaşlar', 'Molton Kumaş', 'Karartma (Blackout)', 'Mat PVC (Projeksiyon Yüzeyleri)']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.fabric_types WHERE category_id = cat_id AND name_tr = f_name) THEN
      INSERT INTO public.fabric_types (category_id, name_tr, slug, display_order) VALUES (cat_id, f_name, f_name, f_order);
    END IF;
    f_order := f_order + 1;
  END LOOP;

  -- ==========================================
  -- 5. HASTANE / KLİNİK SEKTÖRÜ
  -- ==========================================
  SELECT id INTO cat_id FROM public.categories WHERE name_tr ILIKE 'Hastane%' OR slug = 'hastane' LIMIT 1;
  IF cat_id IS NULL THEN
    INSERT INTO public.categories (id, name_tr, name_en, slug, display_order, status, image) 
    VALUES ('cat-' || gen_random_uuid()::text, 'Hastane / Klinik', 'Hospital', 'hastane', 5, 'active', '/placeholder.jpg') RETURNING id INTO cat_id;
  ELSE
    UPDATE public.categories SET slug = 'hastane', display_order = 5 WHERE id = cat_id;
  END IF;

  c_order := 1;
  FOREACH c_name IN ARRAY ARRAY['Hasta Yatağı Bölme (Seperatör) Perdesi', 'Stor Perde', 'Dikey Perde', 'İki Cam Arası Jaluzi Perde', 'Karartma (Blackout) Perde']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.curtain_types WHERE category_id = cat_id AND name_tr = c_name) THEN
      INSERT INTO public.curtain_types (category_id, name_tr, slug, display_order) VALUES (cat_id, c_name, c_name, c_order);
    END IF;
    c_order := c_order + 1;
  END LOOP;

  f_order := 1;
  FOREACH f_name IN ARRAY ARRAY['Anti-bakteriyel Kumaşlar', 'Alev Almaz Kumaşlar', 'Leke Tutmayan / Su İtici Kumaşlar', 'Yıkanabilir Fileli Polyester', 'Gümüş İyonlu (Hijyenik) Kumaşlar', 'PVC / Vinil']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.fabric_types WHERE category_id = cat_id AND name_tr = f_name) THEN
      INSERT INTO public.fabric_types (category_id, name_tr, slug, display_order) VALUES (cat_id, f_name, f_name, f_order);
    END IF;
    f_order := f_order + 1;
  END LOOP;

  -- ==========================================
  -- 6. OTEL / KONAKLAMA SEKTÖRÜ
  -- ==========================================
  SELECT id INTO cat_id FROM public.categories WHERE name_tr ILIKE 'Otel%' OR slug = 'otel' LIMIT 1;
  IF cat_id IS NULL THEN
    INSERT INTO public.categories (id, name_tr, name_en, slug, display_order, status, image) 
    VALUES ('cat-' || gen_random_uuid()::text, 'Otel / Konaklama', 'Hotel', 'otel', 6, 'active', '/placeholder.jpg') RETURNING id INTO cat_id;
  ELSE
    UPDATE public.categories SET slug = 'otel', display_order = 6 WHERE id = cat_id;
  END IF;

  c_order := 1;
  FOREACH c_name IN ARRAY ARRAY['Fon Perde', 'Tül Perde', 'Karartma (Blackout) Perde', 'Stor Perde', 'Motorlu Perde Sistemleri', 'Duş Perdesi']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.curtain_types WHERE category_id = cat_id AND name_tr = c_name) THEN
      INSERT INTO public.curtain_types (category_id, name_tr, slug, display_order) VALUES (cat_id, c_name, c_name, c_order);
    END IF;
    c_order := c_order + 1;
  END LOOP;

  f_order := 1;
  FOREACH f_name IN ARRAY ARRAY['Alev Almaz Kumaşlar', 'Karartma (Blackout) ve Dimout', 'Leke Tutmayan / Kolay Temizlenebilir Kumaşlar', 'Su İtici Kumaşlar', 'Polyester ve Karışımları', 'Jakarlı Kumaşlar']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.fabric_types WHERE category_id = cat_id AND name_tr = f_name) THEN
      INSERT INTO public.fabric_types (category_id, name_tr, slug, display_order) VALUES (cat_id, f_name, f_name, f_order);
    END IF;
    f_order := f_order + 1;
  END LOOP;

  -- ==========================================
  -- 7. DIŞ MEKAN / TERAS SEKTÖRÜ
  -- ==========================================
  SELECT id INTO cat_id FROM public.categories WHERE name_tr ILIKE 'Dış Mekan%' OR slug = 'dis-mekan' LIMIT 1;
  IF cat_id IS NULL THEN
    INSERT INTO public.categories (id, name_tr, name_en, slug, display_order, status, image) 
    VALUES ('cat-' || gen_random_uuid()::text, 'Dış Mekan / Teras', 'Outdoor', 'dis-mekan', 7, 'active', '/placeholder.jpg') RETURNING id INTO cat_id;
  ELSE
    UPDATE public.categories SET slug = 'dis-mekan', display_order = 7 WHERE id = cat_id;
  END IF;

  c_order := 1;
  FOREACH c_name IN ARRAY ARRAY['Zip Perde (Fermuarlı Dış Mekan Stor)', 'Şeffaf Branda Perde', 'Balkon / Teras Tülü', 'Bambu / Hasır Perde', 'Tente ve Pergola Sistemleri']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.curtain_types WHERE category_id = cat_id AND name_tr = c_name) THEN
      INSERT INTO public.curtain_types (category_id, name_tr, slug, display_order) VALUES (cat_id, c_name, c_name, c_order);
    END IF;
    c_order := c_order + 1;
  END LOOP;

  f_order := 1;
  FOREACH f_name IN ARRAY ARRAY['Akrilik Kumaş', 'Şeffaf PVC (Mika)', 'Sunscreen (Dış Mekan Güneş Kırıcı)', 'Su İtici ve Su Geçirmez Kumaşlar', 'UV ve Küf Dirençli Kumaşlar', 'Doğal Bambu / Ahşap']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.fabric_types WHERE category_id = cat_id AND name_tr = f_name) THEN
      INSERT INTO public.fabric_types (category_id, name_tr, slug, display_order) VALUES (cat_id, f_name, f_name, f_order);
    END IF;
    f_order := f_order + 1;
  END LOOP;

  -- ==========================================
  -- 8. ENDÜSTRİYEL (PVC) SEKTÖRÜ
  -- ==========================================
  SELECT id INTO cat_id FROM public.categories WHERE name_tr ILIKE 'Endüstriyel%' OR slug = 'endustriyel' LIMIT 1;
  IF cat_id IS NULL THEN
    INSERT INTO public.categories (id, name_tr, name_en, slug, display_order, status, image) 
    VALUES ('cat-' || gen_random_uuid()::text, 'Endüstriyel (PVC)', 'Industrial', 'endustriyel', 8, 'active', '/placeholder.jpg') RETURNING id INTO cat_id;
  ELSE
    UPDATE public.categories SET slug = 'endustriyel', display_order = 8 WHERE id = cat_id;
  END IF;

  c_order := 1;
  FOREACH c_name IN ARRAY ARRAY['Şerit PVC Perde', 'Kaynak Perdesi', 'Soğuk Hava Deposu Perdesi', 'Yüksek Hızlı Sarmal Perde / Kapı', 'Endüstriyel Bölme Branda Perdesi']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.curtain_types WHERE category_id = cat_id AND name_tr = c_name) THEN
      INSERT INTO public.curtain_types (category_id, name_tr, slug, display_order) VALUES (cat_id, c_name, c_name, c_order);
    END IF;
    c_order := c_order + 1;
  END LOOP;

  f_order := 1;
  FOREACH f_name IN ARRAY ARRAY['Şeffaf PVC', 'Antistatik PVC', 'Polar (Düşük Isıya Dayanıklı) PVC', 'UV Korumalı (Kaynak) PVC', 'Ağır Hizmet Branda (Polyester Kaplı PVC)']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.fabric_types WHERE category_id = cat_id AND name_tr = f_name) THEN
      INSERT INTO public.fabric_types (category_id, name_tr, slug, display_order) VALUES (cat_id, f_name, f_name, f_order);
    END IF;
    f_order := f_order + 1;
  END LOOP;

  -- ==========================================
  -- 9. KARAVAN / TEKNE SEKTÖRÜ
  -- ==========================================
  SELECT id INTO cat_id FROM public.categories WHERE name_tr ILIKE 'Karavan%' OR slug = 'karavan' LIMIT 1;
  IF cat_id IS NULL THEN
    INSERT INTO public.categories (id, name_tr, name_en, slug, display_order, status, image) 
    VALUES ('cat-' || gen_random_uuid()::text, 'Karavan / Tekne', 'Caravan & Boat', 'karavan', 9, 'active', '/placeholder.jpg') RETURNING id INTO cat_id;
  ELSE
    UPDATE public.categories SET slug = 'karavan', display_order = 9 WHERE id = cat_id;
  END IF;

  c_order := 1;
  FOREACH c_name IN ARRAY ARRAY['Plise Perde', 'Sineklikli Plise Perde', 'Mini Stor Perde', 'Mikro Jaluzi Perde', 'Mıknatıslı / Çıtçıtlı Gölgelik Perdesi']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.curtain_types WHERE category_id = cat_id AND name_tr = c_name) THEN
      INSERT INTO public.curtain_types (category_id, name_tr, slug, display_order) VALUES (cat_id, c_name, c_name, c_order);
    END IF;
    c_order := c_order + 1;
  END LOOP;

  f_order := 1;
  FOREACH f_name IN ARRAY ARRAY['Alüminyum Arka Kaplamalı (Termal / Isı Yalıtımlı) Kumaşlar', 'Karartma (Blackout)', 'Nem ve Küfe Dirençli Kumaşlar', 'Su İtici Kumaşlar', 'Polyester', 'Alüminyum']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.fabric_types WHERE category_id = cat_id AND name_tr = f_name) THEN
      INSERT INTO public.fabric_types (category_id, name_tr, slug, display_order) VALUES (cat_id, f_name, f_name, f_order);
    END IF;
    f_order := f_order + 1;
  END LOOP;

END $$;
