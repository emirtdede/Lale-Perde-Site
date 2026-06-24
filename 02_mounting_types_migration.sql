-- 1. MONTAJ TİPLERİ (mounting_types) TABLOSU
CREATE TABLE IF NOT EXISTS public.mounting_types (
    id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
    category_id text REFERENCES public.categories(id) ON DELETE CASCADE,
    curtain_type_id text REFERENCES public.curtain_types(id) ON DELETE SET NULL,
    name_tr text NOT NULL,
    name_en text,
    description_tr text,
    description_en text,
    display_order integer DEFAULT 1,
    status text DEFAULT 'active',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ÜRÜNLER TABLOSUNA MONTAJ TİPLERİ ALANININ EKLENMESİ
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS mounting_type_ids text[] DEFAULT '{}';
ALTER TABLE IF EXISTS public.mounting_types ADD COLUMN IF NOT EXISTS curtain_type_id text REFERENCES public.curtain_types(id) ON DELETE SET NULL;

-- 3. ROW LEVEL SECURITY POLİTİKALARI
ALTER TABLE public.mounting_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access for mounting_types" ON public.mounting_types;
DROP POLICY IF EXISTS "Allow authenticated full access for mounting_types" ON public.mounting_types;

CREATE POLICY "Allow public read access for mounting_types" ON public.mounting_types FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access for mounting_types" ON public.mounting_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. TÜM SEKTÖRLER VE DETAYLI MONTAJ TİPLERİNİN SEED EDİLMESİ & ÜRÜNLERLE EŞLEŞTİRİLMESİ
DO $$
DECLARE
  cat_id TEXT;
  curt_type_id TEXT;
  mt_id TEXT;
  r RECORD;
BEGIN
  -- Eski hatalı eşleşmeleri temizlemek için tüm ürünlerin montaj tiplerini sıfırlıyoruz.
  UPDATE public.products SET mounting_type_ids = '{}';
  -- Eski montaj tiplerini tamamen temizleyip sıfırdan ekliyoruz (curtain_type_id eşleşmesi için).
  DELETE FROM public.mounting_types;

  -- =========================================================================
  -- 1. EV SEKTÖRÜ
  -- =========================================================================
  SELECT id INTO cat_id FROM public.categories WHERE slug = 'ev' OR name_tr ILIKE 'Ev%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    
    -- Fon Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Fon Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      -- Kornişe montaj (ruletli/düğmeli)
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Kornişe montaj (ruletli/düğmeli)') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Kornişe montaj (ruletli/düğmeli)', 'Cornice Mount (with Rollers/Buttons)', 'Mevcut kornişe ruletler yardımıyla pratik takma.', 'Practical installation to existing cornice with rollers.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Kornişe montaj (ruletli/düğmeli)' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;

      -- rustik borusuna montaj (halkalı, kapsüllü veya brizli)
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Rustik borusuna montaj (halkalı, kapsüllü veya brizli)') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Rustik borusuna montaj (halkalı, kapsüllü veya brizli)', 'Rustic Pole Mount (Eyelet/Ring/Briz)', 'Rustik borusuna halkalı veya kapsüllü asım.', 'Rustic pole mount with rings or eyelets.', 2) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Rustik borusuna montaj (halkalı, kapsüllü veya brizli)' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;

      -- tavana veya duvara alüminyum ray montajı
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana veya duvara alüminyum ray montajı') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana veya duvara alüminyum ray montajı', 'Ceiling or Wall Aluminum Track Mount', 'Profil ray sistemi ile kolay sürgülü montaj.', 'Easy sliding installation with track system.', 3) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana veya duvara alüminyum ray montajı' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Tül Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Tül Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      -- Standart kornişe montaj
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Standart kornişe montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Standart kornişe montaj', 'Standard Cornice Mount', 'Mevcut korniş kanallarına standart ruletler ile asım.', 'Hanging on standard cornice tracks with rollers.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Standart kornişe montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;

      -- tavana alüminyum raylı montaj
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana alüminyum raylı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana alüminyum raylı montaj', 'Ceiling Aluminum Track Mount', 'Tavana monte alüminyum ray sistemi.', 'Aluminum track system mounted to the ceiling.', 2) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana alüminyum raylı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;

      -- rustik borusuna montaj
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Rustik borusuna montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Rustik borusuna montaj', 'Rustic Pole Mount', 'Rustik halkaları ile boru üzerine montaj.', 'Mounting on rustic poles with rings.', 3) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Rustik borusuna montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Stor Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Stor Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      -- Tavana klipsli montaj
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana klipsli montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana klipsli montaj', 'Ceiling Clamp Mount', 'Tavana vidalanan metal klipsler ile montaj.', 'Mounting using metal clamps screwed to the ceiling.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana klipsli montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;

      -- duvara "L" ayak ile montaj
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Duvara "L" ayak ile montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Duvara "L" ayak ile montaj', 'Wall "L" Bracket Mount', 'Duvara monte edilen L konsollar ile montaj.', 'Mounting on walls using L-brackets.', 2) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Duvara "L" ayak ile montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;

      -- kornişe özel geçme aparatı ile pratik montaj
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Kornişe özel geçme aparatı ile pratik montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Kornişe özel geçme aparatı ile pratik montaj', 'Cornice Easy Adapter Mount', 'Kornişe delmeden geçme aparatı ile montaj.', 'Practical installation to cornice without drilling.', 3) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Kornişe özel geçme aparatı ile pratik montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Zebra Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Zebra Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      -- Tavana klipsli montaj
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana klipsli montaj (Zebra)') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana klipsli montaj (Zebra)', 'Ceiling Clamp Mount (Zebra)', 'Zebra kasasını tavana doğrudan klipsle sabitleme.', 'Ceiling clamp mount for Zebra casing.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana klipsli montaj (Zebra)' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;

      -- duvara "L" ayak ile montaj
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Duvara "L" ayak ile montaj (Zebra)') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Duvara "L" ayak ile montaj (Zebra)', 'Wall "L" Bracket Mount (Zebra)', 'Zebra kasasını duvara L ayakla sabitleme.', 'Wall L-bracket mount for Zebra casing.', 2) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Duvara "L" ayak ile montaj (Zebra)' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;

      -- kornişe pratik aparatlı montaj
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Kornişe pratik aparatlı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Kornişe pratik aparatlı montaj', 'Cornice Practical Adapter Mount', 'Özel plastik/metal aparatlarla kornişe pratik sabitleme.', 'Practical adapter mounting onto cornice.', 3) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Kornişe pratik aparatlı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Katlamalı (Roman) Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Katlamalı (Roman) Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      -- Cırtcırtlı (velcro) özel alüminyum ray sistemi ile tavana, duvara veya pencere kanadına vidalı montaj
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Cırtcırtlı (velcro) özel alüminyum ray sistemi ile tavana, duvara veya pencere kanadına vidalı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Cırtcırtlı (velcro) özel alüminyum ray sistemi ile tavana, duvara veya pencere kanadına vidalı montaj', 'Velcro Special Track Screwed Mount', 'Cırtcırtlı özel alüminyum ray sistemi ile montaj.', 'Velcro special track system screwed to ceiling, wall or window frame.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Cırtcırtlı (velcro) özel alüminyum ray sistemi ile tavana, duvara veya pencere kanadına vidalı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Kruvaze Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Kruvaze Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      -- Çift kanallı kornişe veya özel mekanizmalı alüminyum raya montaj
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Çift kanallı kornişe veya özel mekanizmalı alüminyum raya montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Çift kanallı kornişe veya özel mekanizmalı alüminyum raya montaj', 'Double Cornice or Mechanical Track Mount', 'Çift kanallı kornişe veya özel mekanizmalı alüminyum raya montaj (yanlardan duvara monte edilen kanca/kordon ile toplanır).', 'Mounting on double cornice or special mechanical rail.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Çift kanallı kornişe veya özel mekanizmalı alüminyum raya montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Jaluzi Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Jaluzi Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      -- Tavana, duvara veya doğrudan pencere pervazı/kanadı içine vidalı montaj
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana, duvara veya doğrudan pencere pervazı/kanadı içine vidalı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana, duvara veya doğrudan pencere pervazı/kanadı içine vidalı montaj', 'Ceiling/Wall/Frame Screwed Mount', 'Tavana, duvara veya doğrudan pencere pervazı/kanadı içine vidalı montaj (hareketli kanatlarda sallanmayı önlemek için alt zıgıl sabitlemesi ile).', 'Screwed into ceiling, wall or frame with tension cord.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana, duvara veya doğrudan pencere pervazı/kanadı içine vidalı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Rustik Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Rustik Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      -- Pencere üstü duvara rustik konsolları (ayakları) ile vidalı montaj
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Pencere üstü duvara rustik konsolları (ayakları) ile vidalı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Pencere üstü duvara rustik konsolları (ayakları) ile vidalı montaj', 'Rustic Bracket Screwed Mount (Wall)', 'Pencere üstü duvara rustik konsolları (ayakları) ile vidalı montaj, nadiren tavana özel ayaklarla montaj.', 'Rustic bracket wall/ceiling screwed mount.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Pencere üstü duvara rustik konsolları (ayakları) ile vidalı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;
  END IF;

  -- =========================================================================
  -- 2. OFİS / KURUMSAL SEKTÖRÜ
  -- =========================================================================
  SELECT id INTO cat_id FROM public.categories WHERE slug = 'ofis' OR name_tr ILIKE 'Ofis%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    -- Stor Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Stor Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana klipsli, duvara "L" ayaklı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana klipsli, duvara "L" ayaklı montaj', 'Ceiling Clamp / Wall L-Bracket Mount', 'Tavana klipsli, duvara "L" ayaklı montaj (genellikle asma tavan veya kartonpiyer içi gizli montaj tercih edilir).', 'Ceiling clamp/wall L-bracket hidden mount.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana klipsli, duvara "L" ayaklı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Jaluzi Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Jaluzi Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Cam bölme içlerine, pencere kanatlarına veya duvara vidalı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Cam bölme içlerine, pencere kanatlarına veya duvara vidalı montaj', 'Partition Glass / Window Frame Screwed Mount', 'Cam bölme içlerine, pencere kanatlarına veya duvara vidalı montaj.', 'Screwed into glass dividers, frames or walls.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Cam bölme içlerine, pencere kanatlarına veya duvara vidalı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Dikey Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Dikey Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Kendi özel geniş alüminyum rayı ile tavana klipsli montaj veya duvara uzun "L" ayaklarla vidalı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Kendi özel geniş alüminyum rayı ile tavana klipsli montaj veya duvara uzun "L" ayaklarla vidalı montaj', 'Vertical Blind Special Rail Mount', 'Kendi özel geniş alüminyum rayı ile tavana klipsli montaj veya duvara uzun "L" ayaklarla vidalı montaj.', 'Ceiling clip or long L-bracket wall mount with special track.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Kendi özel geniş alüminyum rayı ile tavana klipsli montaj veya duvara uzun "L" ayaklarla vidalı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Zebra Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Zebra Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana veya duvara klipsli/L ayaklı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana veya duvara klipsli/L ayaklı montaj', 'Ceiling/Wall Clamp L-Bracket Mount', 'Tavana veya duvara klipsli/L ayaklı montaj.', 'Ceiling/wall mount with clamp/bracket.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana veya duvara klipsli/L ayaklı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Plise Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Plise Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Cam yüzeyine veya pencere pervazına doğrudan vidalı, geçmeli veya yapışkanlı (deliksiz) zıgıllı (gerdirme ipli) montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Cam yüzeyine veya pencere pervazına doğrudan vidalı, geçmeli veya yapışkanlı (deliksiz) zıgıllı (gerdirme ipli) montaj', 'Direct Window/Frame Tension Cord Mount', 'Cam yüzeyine veya pencere pervazına doğrudan vidalı, geçmeli veya yapışkanlı (deliksiz) zıgıllı (gerdirme ipli) montaj.', 'Tension cord glass or sill mount.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Cam yüzeyine veya pencere pervazına doğrudan vidalı, geçmeli veya yapışkanlı (deliksiz) zıgıllı (gerdirme ipli) montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Motorlu Perde Sistemleri
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Motorlu Perde Sistemleri' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Elektrik altyapısına bağlı olarak tavana veya duvara çelik taşıyıcılı, gizli ışık bandı/kartonpiyer içi ankrajlı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Elektrik altyapısına bağlı olarak tavana veya duvara çelik taşıyıcılı, gizli ışık bandı/kartonpiyer içi ankrajlı montaj', 'Power Track Carrier Box Mount', 'Elektrik altyapısına bağlı olarak tavana veya duvara çelik taşıyıcılı, gizli ışık bandı/kartonpiyer içi ankrajlı montaj.', 'Power track carrier or ceiling band mount.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Elektrik altyapısına bağlı olarak tavana veya duvara çelik taşıyıcılı, gizli ışık bandı/kartonpiyer içi ankrajlı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;
  END IF;

  -- =========================================================================
  -- 3. CAMİ / İBADETHANE SEKTÖRÜ
  -- =========================================================================
  SELECT id INTO cat_id FROM public.categories WHERE slug = 'cami' OR name_tr ILIKE 'Cami%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    -- Fon Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Fon Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Yüksek tavanlara uygun ağır yük taşıyıcı alüminyum raylara veya çok kanallı kornişlere montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Yüksek tavanlara uygun ağır yük taşıyıcı alüminyum raylara veya çok kanallı kornişlere montaj', 'Heavy Duty High Ceiling Track Mount', 'Yüksek tavanlara uygun ağır yük taşıyıcı alüminyum raylara veya çok kanallı kornişlere montaj.', 'Heavy-duty high ceiling track or cornice installation.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Yüksek tavanlara uygun ağır yük taşıyıcı alüminyum raylara veya çok kanallı kornişlere montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Tül Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Tül Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Standart korniş sistemlerine veya alüminyum raylara montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Standart korniş sistemlerine veya alüminyum raylara montaj', 'Standard Cornice or Track Mount', 'Standart korniş sistemlerine veya alüminyum raylara montaj.', 'Standard cornice or aluminum rail mounting.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Standart korniş sistemlerine veya alüminyum raylara montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Seperatör (Bölme) Perdesi
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Seperatör (Bölme) Perdesi' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana asma tijli (sarkıt) ray sistemlerine veya iki duvar arası çelik halat gerdirmeli montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana asma tijli (sarkıt) ray sistemlerine veya iki duvar arası çelik halat gerdirmeli montaj', 'Suspended Rod Track / Tension Cable Mount', 'Tavana asma tijli (sarkıt) ray sistemlerine veya iki duvar arası çelik halat gerdirmeli montaj.', 'Ceiling suspended rod or wall wire gerdirmeli mount.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana asma tijli (sarkıt) ray sistemlerine veya iki duvar arası çelik halat gerdirmeli montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Kapı Perdesi
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Kapı Perdesi' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Kapı pervazı üstüne duvara rustik borusu veya korniş montajı') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Kapı pervazı üstüne duvara rustik borusu veya korniş montajı', 'Over Door Frame Rustic or Cornice Mount', 'Kapı pervazı üstüne duvara rustik borusu veya korniş montajı.', 'Over door frame wall rustic rod or cornice installation.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Kapı pervazı üstüne duvara rustik borusu veya korniş montajı' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Mihrap Perdesi
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Mihrap Perdesi' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Duvara sabit cırtcırtlı bant (velcro) montajı veya niş içi kavisli ray montajı') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Duvara sabit cırtcırtlı bant (velcro) montajı veya niş içi kavisli ray montajı', 'Wall Velcro / Curved Track Niche Mount', 'Duvara sabit cırtcırtlı bant (velcro) montajı veya niş içi kavisli ray montajı.', 'Fixed wall velcro or curved track niche mount.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Duvara sabit cırtcırtlı bant (velcro) montajı veya niş içi kavisli ray montajı' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;
  END IF;

  -- =========================================================================
  -- 4. SAHNE / KONFERANS SEKTÖRÜ
  -- =========================================================================
  SELECT id INTO cat_id FROM public.categories WHERE slug = 'sahne' OR name_tr ILIKE 'Sahne%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    -- Sahne (Ana) Perdesi
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Sahne (Ana) Perdesi' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Ağır motorlu çelik ray sistemleriyle tavana veya çelik konstrüksiyona (truss sistemi) taşıyıcı ankrajlarla montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Ağır motorlu çelik ray sistemleriyle tavana veya çelik konstrüksiyona (truss sistemi) taşıyıcı ankrajlarla montaj', 'Heavy Motorized Steel Track / Truss Anchor Mount', 'Ağır motorlu çelik ray sistemleriyle tavana veya çelik konstrüksiyona (truss sistemi) taşıyıcı ankrajlarla montaj.', 'Heavy motorized steel tracks on ceiling/truss structures.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Ağır motorlu çelik ray sistemleriyle tavana veya çelik konstrüksiyona (truss sistemi) taşıyıcı ankrajlarla montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Fon / Kulis Perdesi
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Fon / Kulis Perdesi' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Sabit boru sistemlerine bağcıklı (kravatlı) montaj veya tavana raylı manuel çekme montajı') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Sabit boru sistemlerine bağcıklı (kravatlı) montaj veya tavana raylı manuel çekme montajı', 'Fixed Pole Tie-On or Manual Track Pull Mount', 'Sabit boru sistemlerine bağcıklı (kravatlı) montaj veya tavana raylı manuel çekme montajı.', 'Fixed pole with strings or ceiling profile manual track.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Sabit boru sistemlerine bağcıklı (kravatlı) montaj veya tavana raylı manuel çekme montajı' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Akustik Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Akustik Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana veya duvar kirişlerine sızdırmazlık sağlayacak şekilde "U" veya düz ağır tip raylı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana veya duvar kirişlerine sızdırmazlık sağlayacak şekilde "U" veya düz ağır tip raylı montaj', 'Ceiling/Beam Sealed U-Shape Heavy Track Mount', 'Tavana veya duvar kirişlerine sızdırmazlık sağlayacak şekilde "U" veya düz ağır tip raylı montaj.', 'Screwed into ceiling or beams with seal overlap.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana veya duvar kirişlerine sızdırmazlık sağlayacak şekilde "U" veya düz ağır tip raylı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Soffit (Alınlık) Perdesi
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Soffit (Alınlık) Perdesi' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Sahne üst konstrüksiyonuna cırtcırtlı veya bağcıklı (hareketsiz) montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Sahne üst konstrüksiyonuna cırtcırtlı veya bağcıklı (hareketsiz) montaj', 'Fixed Velcro/Tie Top Stage Mount', 'Sahne üst konstrüksiyonuna cırtcırtlı veya bağcıklı (hareketsiz) montaj.', 'Fixed velcro or string ties on overhead structures.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Sahne üst konstrüksiyonuna cırtcırtlı veya bağcıklı (hareketsiz) montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Motorlu Sahne Sistemleri
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Motorlu Sahne Sistemleri' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana veya sahne kulesine çelik halat ve makara sistemleriyle entegre edilen ağır sanayi tipi kurulum') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana veya sahne kulesine çelik halat ve makara sistemleriyle entegre edilen ağır sanayi tipi kurulum', 'Pulley Cable Mechanical Rigging Install', 'Tavana veya sahne kulesine çelik halat ve makara sistemleriyle entegre edilen ağır sanayi tipi kurulum.', 'Heavy mechanical pulley and steel rigging systems.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana veya sahne kulesine çelik halat ve makara sistemleriyle entegre edilen ağır sanayi tipi kurulum' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Projeksiyon Perdesi
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Projeksiyon Perdesi' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana gizli (gömme) montaj, duvara vidalı (askılı) montaj veya mobil seyyar ayaklı kullanım') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana gizli (gömme) montaj, duvara vidalı (askılı) montaj veya mobil seyyar ayaklı kullanım', 'Recessed Ceiling / Suspended / Mobile Stand Mount', 'Tavana gizli (gömme) montaj, duvara vidalı (askılı) montaj veya mobil seyyar ayaklı kullanım.', 'Recessed ceiling slot, wall hooks or mobile stand assembly.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana gizli (gömme) montaj, duvara vidalı (askılı) montaj veya mobil seyyar ayaklı kullanım' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;
  END IF;

  -- =========================================================================
  -- 5. HASTANE / KLİNİK SEKTÖRÜ
  -- =========================================================================
  SELECT id INTO cat_id FROM public.categories WHERE slug = 'hastane' OR name_tr ILIKE 'Hastane%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    -- Hasta Yatağı Bölme (Seperatör) Perdesi
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Hasta Yatağı Bölme (Seperatör) Perdesi' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana "L" veya "U" şeklinde dönen, çelik askılı (tijli) veya doğrudan tavana sıfır özel alüminyum ray montajı') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana "L" veya "U" şeklinde dönen, çelik askılı (tijli) veya doğrudan tavana sıfır özel alüminyum ray montajı', 'L/U Suspended Rod or Flush Ceiling Track Mount', 'Tavana "L" veya "U" şeklinde dönen, çelik askılı (tijli) veya doğrudan tavana sıfır özel alüminyum ray montajı.', 'L or U-shaped tracks suspended by steel rods or flush tavan montajı.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana "L" veya "U" şeklinde dönen, çelik askılı (tijli) veya doğrudan tavana sıfır özel alüminyum ray montajı' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Stor Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Stor Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana veya duvara vidalı standart montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana veya duvara vidalı standart montaj', 'Standard Screwed Ceiling/Wall Mount', 'Tavana veya duvara vidalı standart montaj.', 'Standard screwed brackets on walls or ceilings.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana veya duvara vidalı standart montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Dikey Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Dikey Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana alüminyum raylı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana alüminyum raylı montaj', 'Ceiling Track Profile Mount', 'Tavana alüminyum raylı montaj.', 'Ceiling aluminum profile track setup.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana alüminyum raylı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- İki Cam Arası Jaluzi Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'İki Cam Arası Jaluzi Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Doğrudan çift cam (ısıcam) üretimi aşamasında camlar arasına fabrika çıkışlı entegre montaj (dışarıdan sadece buton/mıknatıs mekanizması cama yapıştırılır)') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Doğrudan çift cam (ısıcam) üretimi aşamasında camlar arasına fabrika çıkışlı entegre montaj (dışarıdan sadece buton/mıknatıs mekanizması cama yapıştırılır)', 'Double Glass Sealed Blind Integration', 'Doğrudan çift cam (ısıcam) üretimi aşamasında camlar arasına fabrika çıkışlı entegre montaj.', 'Factory assembly inside double glazed units with external magnetic dials.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Doğrudan çift cam (ısıcam) üretimi aşamasında camlar arasına fabrika çıkışlı entegre montaj (dışarıdan sadece buton/mıknatıs mekanizması cama yapıştırılır)' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Karartma (Blackout) Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Karartma (Blackout) Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Işık sızıntısını önlemek için kapalı kasa (kutu) profiller ile pencere pervazına sıfır montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Işık sızıntısını önlemek için kapalı kasa (kutu) profiller ile pencere pervazına sıfır montaj', 'Sealed Side Track Box Mount', 'Işık sızıntısını önlemek için kapalı kasa (kutu) profiller ile pencere pervazına sıfır montaj.', 'Box cassette and side channels screwed tight to block light leakage.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Işık sızıntısını önlemek için kapalı kasa (kutu) profiller ile pencere pervazına sıfır montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;
  END IF;

  -- =========================================================================
  -- 6. OTEL / KONAKLAMA SEKTÖRÜ
  -- =========================================================================
  SELECT id INTO cat_id FROM public.categories WHERE slug = 'otel' OR name_tr ILIKE 'Otel%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    -- Fon Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Fon Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Kartonpiyer arkasına gizlenmiş otel tipi ağır yük taşıyıcı alüminyum raylara ruletli montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Kartonpiyer arkasına gizlenmiş otel tipi ağır yük taşıyıcı alüminyum raylara ruletli montaj', 'Concealed Hotel Track Roller Mount', 'Kartonpiyer arkasına gizlenmiş otel tipi ağır yük taşıyıcı alüminyum raylara ruletli montaj.', 'Concealed heavy aluminum tracks with rollers behind plaster coving.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Kartonpiyer arkasına gizlenmiş otel tipi ağır yük taşıyıcı alüminyum raylara ruletli montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Tül Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Tül Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Alüminyum raylara veya standart kornişlere ruletli montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Alüminyum raylara veya standart kornişlere ruletli montaj', 'Aluminum Tracks or Cornice Roller Mount', 'Alüminyum raylara veya standart kornişlere ruletli montaj.', 'Installing on aluminum curtain tracks or standard cornices with rollers.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Alüminyum raylara veya standart kornişlere ruletli montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Karartma (Blackout) Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Karartma (Blackout) Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Işık sızıntısını sıfıra indirmek için "L" dönüşlü korniş/ray sistemleriyle yan duvarları da kapatacak şekilde tavana montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Işık sızıntısını sıfıra indirmek için "L" dönüşlü korniş/ray sistemleriyle yan duvarları da kapatacak şekilde tavana montaj', 'L-Curved Ceiling Tight Blackout Mount', 'Işık sızıntısını sıfıra indirmek için "L" dönüşlü korniş/ray sistemleriyle yan duvarları da kapatacak şekilde tavana montaj.', 'L-curved track profiles flush on ceiling closing wall gaps to block light.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Işık sızıntısını sıfıra indirmek için "L" dönüşlü korniş/ray sistemleriyle yan duvarları da kapatacak şekilde tavana montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Stor Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Stor Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Tavana veya duvara alüminyum kasalı klipsli montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Tavana veya duvara alüminyum kasalı klipsli montaj', 'Aluminum Boxed Cassette Bracket Mount', 'Tavana veya duvara alüminyum kasalı klipsli montaj.', 'Installing profile cassette brackets to wall/ceiling.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Tavana veya duvara alüminyum kasalı klipsli montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Motorlu Perde Sistemleri
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Motorlu Perde Sistemleri' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Elektrik tesisatlı gizli tavan rayı montajı (oda kartı/otomasyon sistemine entegre)') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Elektrik tesisatlı gizli tavan rayı montajı (oda kartı/otomasyon sistemine entegre)', 'Power Hidden Ceiling Track Mount', 'Elektrik tesisatlı gizli tavan rayı montajı (oda kartı/otomasyon sistemine entegre).', 'Electric motorized track wired to card otomasyon.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Elektrik tesisatlı gizli tavan rayı montajı (oda kartı/otomasyon sistemine entegre)' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Duş Perdesi
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Duş Perdesi' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'İki duvar arasına yaylı sıkıştırmalı boru montajı veya tavana askılı "L" / "U" şekilli krom boru/ray montajı') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'İki duvar arasına yaylı sıkıştırmalı boru montajı veya tavana askılı "L" / "U" şekilli krom boru/ray montajı', 'Tension Spring Pole or Chrome suspended Mount', 'İki duvar arasına yaylı sıkıştırmalı boru montajı veya tavana askılı "L" / "U" şekilli krom boru/ray montajı.', 'Tension spring wall compression or chrome rail suspended on ceiling.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'İki duvar arasına yaylı sıkıştırmalı boru montajı veya tavana askılı "L" / "U" şekilli krom boru/ray montajı' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;
  END IF;

  -- =========================================================================
  -- 7. DIŞ MEKAN / TERAS SEKTÖRÜ
  -- =========================================================================
  SELECT id INTO cat_id FROM public.categories WHERE slug = 'dis-mekan' OR name_tr ILIKE 'Dış Mekan%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    -- Zip Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Zip Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Yanlardaki alüminyum kılavuz profillerin kolonlara veya duvarlara ankrajlı montajı, üst kasetin tavana/duvara vidalanması') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Yanlardaki alüminyum kılavuz profillerin kolonlara veya duvarlara ankrajlı montajı, üst kasetin tavana/duvara vidalanması', 'Side Guide Channel Anchored & Cassette Box Screwed Mount', 'Rüzgar direncini sağlamak için yanlardaki alüminyum kılavuz profillerin kolonlara veya duvarlara ankrajlı montajı, üst kasetin tavana/duvara vidalanması.', 'Aluminum side rails anchored to columns/walls, top box screwed.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Yanlardaki alüminyum kılavuz profillerin kolonlara veya duvarlara ankrajlı montajı, üst kasetin tavana/duvara vidalanması' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Şeffaf Branda Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Şeffaf Branda Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Manuel çevirme kollu mekanizmanın duvara/direklere montajı veya etrafından cırtcırtlı / kilitli düğmeli (fermuarlı) sabit montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Manuel çevirme kollu mekanizmanın duvara/direklere montajı veya etrafından cırtcırtlı / kilitli düğmeli (fermuarlı) sabit montaj', 'Manual Crank Gear or Fixed Velcro / Zipper Mount', 'Manuel çevirme kollu mekanizmanın duvara/direklere montajı veya etrafından cırtcırtlı / kilitli düğmeli (fermuarlı) sabit montaj.', 'Crank handle gearbox screwed or zipper/velcro enclosure.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Manuel çevirme kollu mekanizmanın duvara/direklere montajı veya etrafından cırtcırtlı / kilitli düğmeli (fermuarlı) sabit montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Balkon / Teras Tülü
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Balkon / Teras Tülü' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Dış mekan şartlarına dayanıklı alüminyum dış mekan rayının tavana vidalı montajı') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Dış mekan şartlarına dayanıklı alüminyum dış mekan rayının tavana vidalı montajı', 'Ceiling Screwed Weatherproof Track Mount', 'Dış mekan şartlarına dayanıklı alüminyum dış mekan rayının tavana vidalı montajı.', 'Rustproof aluminum track profile screwed to outdoor ceiling.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Dış mekan şartlarına dayanıklı alüminyum dış mekan rayının tavana vidalı montajı' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Bambu / Hasır Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Bambu / Hasır Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Üst çıtasındaki halkalar (kancalar) yardımıyla tavana veya pencere üstü duvara askılı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Üst çıtasındaki halkalar (kancalar) yardımıyla tavana veya pencere üstü duvara askılı montaj', 'Top Slat Ring Hooks Ceiling/Wall Suspended Mount', 'Üst çıtasındaki halkalar (kancalar) yardımıyla tavana veya pencere üstü duvara askılı montaj.', 'Top rail ring hooks suspended from ceiling/wall eyes.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Üst çıtasındaki halkalar (kancalar) yardımıyla tavana veya pencere üstü duvara askılı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Tente ve Pergola Sistemleri
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Tente ve Pergola Sistemleri' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Çelik dübellerle ana taşıyıcı kolonlara, dış cepheye veya zemine ağır ankraj montajı') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Çelik dübellerle ana taşıyıcı kolonlara, dış cepheye veya zemine ağır ankraj montajı', 'Heavy Duty Concrete Bolt Wall/Floor Anchor Mount', 'Çelik dübellerle ana taşıyıcı kolonlara, dış cepheye veya zemine ağır ankraj montajı.', 'Expansion anchors bolted into masonry/floor.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Çelik dübellerle ana taşıyıcı kolonlara, dış cepheye veya zemine ağır ankraj montajı' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;
  END IF;

  -- =========================================================================
  -- 8. ENDÜSTRİYEL (PVC)
  -- =========================================================================
  SELECT id INTO cat_id FROM public.categories WHERE slug = 'endustriyel' OR name_tr ILIKE 'Endüstriyel%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    -- Şerit PVC Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Şerit PVC Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Paslanmaz çelik veya galvaniz tırnaklı (taraklı) askı profilinin kapı üstü duvara veya tavana vidalı montajı') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Paslanmaz çelik veya galvaniz tırnaklı (taraklı) askı profilinin kapı üstü duvara veya tavana vidalı montajı', 'Stainless/Galvanized Hook-On Comb Wall/Ceiling Mount', 'Paslanmaz çelik veya galvaniz tırnaklı (taraklı) askı profilinin kapı üstü duvara veya tavana vidalı montajı.', 'Hook-on taraklı hanger strip profiles screwed.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Paslanmaz çelik veya galvaniz tırnaklı (taraklı) askı profilinin kapı üstü duvara veya tavana vidalı montajı' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Kaynak Perdesi
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Kaynak Perdesi' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Hareketli olabilmesi için tekerlekli (seyyar) demir profil çerçevelere geçmeli montaj veya tavana boru/ray montajı') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Hareketli olabilmesi için tekerlekli (seyyar) demir profil çerçevelere geçmeli montaj veya tavana boru/ray montajı', 'Mobile Wheel Frame or Ceiling Track Suspended Mount', 'Hareketli olabilmesi için tekerlekli (seyyar) demir profil çerçevelere geçmeli montaj veya tavana boru/ray montajı.', 'Mobile wheeled iron frame sleeves, or ceiling profile pipe track.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Hareketli olabilmesi için tekerlekli (seyyar) demir profil çerçevelere geçmeli montaj veya tavana boru/ray montajı' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Soğuk Hava Deposu Perdesi
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Soğuk Hava Deposu Perdesi' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Isı yalıtımı sağlayacak şekilde kapı lentosuna paslanmaz tırnaklı askı sistemi ile montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Isı yalıtımı sağlayacak şekilde kapı lentosuna paslanmaz tırnaklı askı sistemi ile montaj', 'Stainless Hook-On Lintel Hanger Mount', 'Isı yalıtımı sağlayacak şekilde kapı lentosuna paslanmaz tırnaklı askı sistemi ile montaj.', 'Fixed to the door header lintel using hook-on comb tracks.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Isı yalıtımı sağlayacak şekilde kapı lentosuna paslanmaz tırnaklı askı sistemi ile montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Yüksek Hızlı Sarmal Perde / Kapı
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Yüksek Hızlı Sarmal Perde / Kapı' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Motor mekanizmalı üst tamburun kapı üstüne, yönlendirici yan dikmelerin ise zemin ve kapı yanlarına çelik dübellerle ağır sanayi montajı') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Motor mekanizmalı üst tamburun kapı üstüne, yönlendirici yan dikmelerin ise zemin ve kapı yanlarına çelik dübellerle ağır sanayi montajı', 'Motorized Top Roller & Side Channels Heavy Duty Anchor Install', 'Motor mekanizmalı üst tamburun kapı üstüne, yönlendirici yan dikmelerin ise zemin ve kapı yanlarına çelik dübellerle ağır sanayi montajı.', 'Motorized roll header and side track channels bolted using industrial anchors.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Motor mekanizmalı üst tamburun kapı üstüne, yönlendirici yan dikmelerin ise zemin ve kapı yanlarına çelik dübellerle ağır sanayi montajı' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Endüstriyel Bölme Branda Perdesi
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Endüstriyel Bölme Branda Perdesi' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'C tipi ağır yük çelik raylarına makaralı montaj veya çelik halat gerdirmeli asma montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'C tipi ağır yük çelik raylarına makaralı montaj veya çelik halat gerdirmeli asma montaj', 'C-Type Track Roller or Steel Cable Suspended Mount', '"C" tipi ağır yük çelik raylarına makaralı montaj veya çelik halat gerdirmeli asma montaj.', 'Heavy-duty steel C-tracks with rolling trolleys or high tension steel wire.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'C tipi ağır yük çelik raylarına makaralı montaj veya çelik halat gerdirmeli asma montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;
  END IF;

  -- =========================================================================
  -- 9. KARAVAN / TEKNE
  -- =========================================================================
  SELECT id INTO cat_id FROM public.categories WHERE slug = 'karavan' OR name_tr ILIKE 'Karavan%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    -- Plise Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Plise Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Hareket halindeyken sallanmaması için çerçeveye entegre, dört köşeden gerdirme ipli (zıgıllı) vidalı veya yapışkanlı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Hareket halindeyken sallanmaması için çerçeveye entegre, dört köşeden gerdirme ipli (zıgıllı) vidalı veya yapışkanlı montaj', '4-Corner Tension Wire Screwed or Adhesive Mount', 'Hareket halindeyken sallanmaması için çerçeveye entegre, dört köşeden gerdirme ipli (zıgıllı) vidalı veya yapışkanlı montaj.', 'Framed tension wires screwed/glued preventing shaking on move.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Hareket halindeyken sallanmaması için çerçeveye entegre, dört köşeden gerdirme ipli (zıgıllı) vidalı veya yapışkanlı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Sineklikli Plise Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Sineklikli Plise Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Çerçeveli bir kaset içinde doğrudan karavan/tekne pencere doğramasına vidalı sabit montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Çerçeveli bir kaset içinde doğrudan karavan/tekne pencere doğramasına vidalı sabit montaj', 'Flyscreen Casing Screwed Frame Mount', 'Çerçeveli bir kaset içinde doğrudan karavan/tekne pencere doğramasına vidalı sabit montaj.', 'Cassette frame screwed directly onto windows.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Çerçeveli bir kaset içinde doğrudan karavan/tekne pencere doğramasına vidalı sabit montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Mini Stor Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Mini Stor Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Karavan duvar paneline veya tavan döşemesine özel kısa klipslerle vidalı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Karavan duvar paneline veya tavan döşemesine özel kısa klipslerle vidalı montaj', 'RV Wall/Ceiling Profile Short Clip Mount', 'Karavan duvar paneline veya tavan döşemesine özel kısa klipslerle vidalı montaj.', 'Installing short profile clips on RV walls or ceilings.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Karavan duvar paneline veya tavan döşemesine özel kısa klipslerle vidalı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Mikro Jaluzi Perde
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Mikro Jaluzi Perde' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Camın alt ve üst pervazlarına vidalanan kılavuz telleri (çelik tel) veya sabitleme klipsleri ile sarsıntıyı önleyen zıgıllı montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Camın alt ve üst pervazlarına vidalanan kılavuz telleri (çelik tel) veya sabitleme klipsleri ile sarsıntıyı önleyen zıgıllı montaj', 'Sill top-bottom guide wire tension mount', 'Camın alt ve üst pervazlarına vidalanan kılavuz telleri (çelik tel) veya sabitleme klipsleri ile sarsıntıyı önleyen zıgıllı montaj.', 'Top-bottom guide wires or clamps securing slats from wobbling.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Camın alt ve üst pervazlarına vidalanan kılavuz telleri (çelik tel) veya sabitleme klipsleri ile sarsıntıyı önleyen zıgıllı montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;

    -- Mıknatıslı / Çıtçıtlı Gölgelik Perdesi
    SELECT id INTO curt_type_id FROM public.curtain_types WHERE category_id = cat_id AND name_tr = 'Mıknatıslı / Çıtçıtlı Gölgelik Perdesi' LIMIT 1;
    IF curt_type_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.mounting_types WHERE category_id = cat_id AND name_tr = 'Cam kenarındaki yalıtım kaplamalarına veya araç sacına yapıştırılan/vidalanan çıtçıt, cırtcırt (velcro) veya neodim mıknatıs karşılıkları ile geçici/pratik montaj') THEN
        INSERT INTO public.mounting_types (category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order)
        VALUES (cat_id, curt_type_id, 'Cam kenarındaki yalıtım kaplamalarına veya araç sacına yapıştırılan/vidalanan çıtçıt, cırtcırt (velcro) veya neodim mıknatıs karşılıkları ile geçici/pratik montaj', 'Snap/Velcro or Neodymium Magnet Quick Mount', 'Cam kenarındaki yalıtım kaplamalarına veya araç sacına yapıştırılan/vidalanan çıtçıt, cırtcırt (velcro) veya neodim mıknatıs karşılıkları ile geçici/pratik montaj.', 'Snaps, velcro or neodymium magnets fixed to metal frame for quick attach.', 1) RETURNING id INTO mt_id;
      ELSE
        UPDATE public.mounting_types SET curtain_type_id = curt_type_id WHERE category_id = cat_id AND name_tr = 'Cam kenarındaki yalıtım kaplamalarına veya araç sacına yapıştırılan/vidalanan çıtçıt, cırtcırt (velcro) veya neodim mıknatıs karşılıkları ile geçici/pratik montaj' RETURNING id INTO mt_id;
      END IF;
      FOR r IN SELECT id FROM public.products WHERE category_id = cat_id AND curtain_type_id = curt_type_id LOOP
        UPDATE public.products SET mounting_type_ids = array_append(mounting_type_ids, mt_id) WHERE id = r.id AND NOT (mounting_type_ids @> array[mt_id]);
      END LOOP;
    END IF;
  END IF;

END $$;
