-- This script populates the curtain_types and mounting_types tables
-- according to the provided list for EV PERDELERİ category.

-- 1. Ensure the 'Ev Perdeleri' category exists and get its ID.
-- If you have a different ID for 'Ev Perdeleri', please replace the UUID below.
-- For safety, we will assume you have a category named 'Ev Perdeleri'. If not, we will insert one.

DO $$
DECLARE
    v_category_id text;
    v_curtain_type_id text;
BEGIN
    -- Try to find the 'Ev Perdeleri' category
    SELECT id INTO v_category_id FROM categories WHERE name_tr ILIKE '%ev perdeleri%' LIMIT 1;
    
    -- If it doesn't exist, create it
    IF v_category_id IS NULL THEN
        v_category_id := gen_random_uuid()::text;
        INSERT INTO categories (id, name_tr, name_en, status, display_order, image)
        VALUES (v_category_id, 'Ev Perdeleri', 'Home Curtains', 'active', 1, '');
    END IF;

    -- Clear existing curtain_types and mounting_types for this category to avoid duplicates
    -- ONLY do this if you want to wipe the existing ones!
    DELETE FROM mounting_types WHERE category_id = v_category_id;
    DELETE FROM curtain_types WHERE category_id = v_category_id;

    -- =================================================================
    -- 1. Fon Perde
    -- =================================================================
    v_curtain_type_id := gen_random_uuid()::text;
    INSERT INTO curtain_types (id, category_id, name_tr, name_en, slug, display_order, status)
    VALUES (v_curtain_type_id, v_category_id, 'Fon Perde', 'Drape Curtain', 'fon-perde', 1, 'active');

    INSERT INTO mounting_types (id, category_id, curtain_type_id, name_tr, name_en, display_order, status) VALUES
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Kornişe montaj (ruletli/düğmeli)', 'Cornice mount (roller/button)', 1, 'active'),
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Rustik borusuna montaj (halkalı, kapsüllü veya brizli)', 'Rustic pipe mount (ring, capsule)', 2, 'active'),
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Tavana veya duvara alüminyum ray montajı', 'Ceiling or wall aluminum rail mount', 3, 'active');

    -- =================================================================
    -- 2. Tül Perde
    -- =================================================================
    v_curtain_type_id := gen_random_uuid()::text;
    INSERT INTO curtain_types (id, category_id, name_tr, name_en, slug, display_order, status)
    VALUES (v_curtain_type_id, v_category_id, 'Tül Perde', 'Sheer Curtain', 'tul-perde', 2, 'active');

    INSERT INTO mounting_types (id, category_id, curtain_type_id, name_tr, name_en, display_order, status) VALUES
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Standart kornişe montaj', 'Standard cornice mount', 1, 'active'),
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Tavana alüminyum raylı montaj', 'Ceiling aluminum rail mount', 2, 'active'),
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Rustik borusuna montaj', 'Rustic pipe mount', 3, 'active');

    -- =================================================================
    -- 3. Stor Perde
    -- =================================================================
    v_curtain_type_id := gen_random_uuid()::text;
    INSERT INTO curtain_types (id, category_id, name_tr, name_en, slug, display_order, status)
    VALUES (v_curtain_type_id, v_category_id, 'Stor Perde', 'Roller Blind', 'stor-perde', 3, 'active');

    INSERT INTO mounting_types (id, category_id, curtain_type_id, name_tr, name_en, display_order, status) VALUES
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Tavana klipsli montaj', 'Ceiling clip mount', 1, 'active'),
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Duvara "L" ayak ile montaj', 'Wall "L" bracket mount', 2, 'active'),
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Kornişe özel geçme aparatı ile pratik montaj', 'Practical mount with special cornice adapter', 3, 'active');

    -- =================================================================
    -- 4. Zebra Perde
    -- =================================================================
    v_curtain_type_id := gen_random_uuid()::text;
    INSERT INTO curtain_types (id, category_id, name_tr, name_en, slug, display_order, status)
    VALUES (v_curtain_type_id, v_category_id, 'Zebra Perde', 'Zebra Blind', 'zebra-perde', 4, 'active');

    INSERT INTO mounting_types (id, category_id, curtain_type_id, name_tr, name_en, display_order, status) VALUES
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Tavana klipsli montaj', 'Ceiling clip mount', 1, 'active'),
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Duvara "L" ayak ile montaj', 'Wall "L" bracket mount', 2, 'active'),
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Kornişe pratik aparatlı montaj', 'Practical mount with cornice adapter', 3, 'active');

    -- =================================================================
    -- 5. Katlamalı (Roman) Perde
    -- =================================================================
    v_curtain_type_id := gen_random_uuid()::text;
    INSERT INTO curtain_types (id, category_id, name_tr, name_en, slug, display_order, status)
    VALUES (v_curtain_type_id, v_category_id, 'Katlamalı (Roman) Perde', 'Roman Blind', 'katlamali-perde', 5, 'active');

    INSERT INTO mounting_types (id, category_id, curtain_type_id, name_tr, name_en, display_order, status) VALUES
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Cırtcırtlı (velcro) özel alüminyum ray sistemi ile tavana, duvara veya pencere kanadına vidalı montaj.', 'Velcro special aluminum rail system mount to ceiling, wall or window sash.', 1, 'active');

    -- =================================================================
    -- 6. Kruvaze Perde
    -- =================================================================
    v_curtain_type_id := gen_random_uuid()::text;
    INSERT INTO curtain_types (id, category_id, name_tr, name_en, slug, display_order, status)
    VALUES (v_curtain_type_id, v_category_id, 'Kruvaze Perde', 'Double Breasted Curtain', 'kruvaze-perde', 6, 'active');

    INSERT INTO mounting_types (id, category_id, curtain_type_id, name_tr, name_en, display_order, status) VALUES
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Çift kanallı kornişe veya özel mekanizmalı alüminyum raya montaj', 'Mount to double-channel cornice or special mechanism aluminum rail', 1, 'active');

    -- =================================================================
    -- 7. Jaluzi Perde
    -- =================================================================
    v_curtain_type_id := gen_random_uuid()::text;
    INSERT INTO curtain_types (id, category_id, name_tr, name_en, slug, display_order, status)
    VALUES (v_curtain_type_id, v_category_id, 'Jaluzi Perde', 'Venetian Blind', 'jaluzi-perde', 7, 'active');

    INSERT INTO mounting_types (id, category_id, curtain_type_id, name_tr, name_en, display_order, status) VALUES
    (gen_random_uuid(), v_category_id, v_curtain_type_id, 'Tavana, duvara veya doğrudan pencere pervazı/kanadına montaj', 'Mount to ceiling, wall, or directly on window sill/sash', 1, 'active');

END $$;
