-- ============================================================
-- V9: Seed 7 popular Moroccan cities with multilingual names
-- Images sourced from Unsplash (permanent URLs, no API key)
-- ============================================================

-- Use the default admin as created_by
DO $$
DECLARE
    admin_id BIGINT;
    city_id  BIGINT;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@tarik.ma' LIMIT 1;

    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found – run V4 first';
    END IF;

    -- 1. Marrakech
    INSERT INTO cities (region, image, description, latitude, longitude, created_at, created_by)
    VALUES (
        'Marrakech-Safi',
        'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80',
        'The Red City – a vibrant imperial city famous for its bustling souks, Jemaa el-Fnaa square, and stunning palaces.',
        31.6295, -7.9811, NOW(), admin_id
    ) RETURNING id INTO city_id;

    INSERT INTO city_names (city_id, language_code, name, is_primary) VALUES
        (city_id, 'en', 'Marrakech', TRUE),
        (city_id, 'fr', 'Marrakech', FALSE),
        (city_id, 'ar', 'مراكش', FALSE);

    -- 2. Fes
    INSERT INTO cities (region, image, description, latitude, longitude, created_at, created_by)
    VALUES (
        'Fès-Meknès',
        'https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?w=800&q=80',
        'Home to the world''s oldest university and a UNESCO-listed medieval medina with thousands of winding alleys.',
        34.0181, -5.0078, NOW(), admin_id
    ) RETURNING id INTO city_id;

    INSERT INTO city_names (city_id, language_code, name, is_primary) VALUES
        (city_id, 'en', 'Fes', TRUE),
        (city_id, 'fr', 'Fès', FALSE),
        (city_id, 'ar', 'فاس', FALSE);

    -- 3. Casablanca
    INSERT INTO cities (region, image, description, latitude, longitude, created_at, created_by)
    VALUES (
        'Casablanca-Settat',
        'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800&q=80',
        'Morocco''s economic capital, home to the iconic Hassan II Mosque and a cosmopolitan Atlantic coastline.',
        33.5731, -7.5898, NOW(), admin_id
    ) RETURNING id INTO city_id;

    INSERT INTO city_names (city_id, language_code, name, is_primary) VALUES
        (city_id, 'en', 'Casablanca', TRUE),
        (city_id, 'fr', 'Casablanca', FALSE),
        (city_id, 'ar', 'الدار البيضاء', FALSE);

    -- 4. Rabat
    INSERT INTO cities (region, image, description, latitude, longitude, created_at, created_by)
    VALUES (
        'Rabat-Salé-Kénitra',
        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
        'The political capital of Morocco, blending historic kasbahs and gardens with modern government institutions.',
        34.0209, -6.8416, NOW(), admin_id
    ) RETURNING id INTO city_id;

    INSERT INTO city_names (city_id, language_code, name, is_primary) VALUES
        (city_id, 'en', 'Rabat', TRUE),
        (city_id, 'fr', 'Rabat', FALSE),
        (city_id, 'ar', 'الرباط', FALSE);

    -- 5. Agadir
    INSERT INTO cities (region, image, description, latitude, longitude, created_at, created_by)
    VALUES (
        'Souss-Massa',
        'https://images.unsplash.com/photo-1565689157206-0fddef7589a2?w=800&q=80',
        'A modern beach resort city on the Atlantic coast, known for its long sandy beach, seafood, and year-round sunshine.',
        30.4278, -9.5981, NOW(), admin_id
    ) RETURNING id INTO city_id;

    INSERT INTO city_names (city_id, language_code, name, is_primary) VALUES
        (city_id, 'en', 'Agadir', TRUE),
        (city_id, 'fr', 'Agadir', FALSE),
        (city_id, 'ar', 'أكادير', FALSE);

    -- 6. Essaouira
    INSERT INTO cities (region, image, description, latitude, longitude, created_at, created_by)
    VALUES (
        'Marrakech-Safi',
        'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800&q=80',
        'A charming coastal wind city known for its fortified medina, vibrant art scene, fresh seafood, and world-class windsurfing.',
        31.5085, -9.7595, NOW(), admin_id
    ) RETURNING id INTO city_id;

    INSERT INTO city_names (city_id, language_code, name, is_primary) VALUES
        (city_id, 'en', 'Essaouira', TRUE),
        (city_id, 'fr', 'Essaouira', FALSE),
        (city_id, 'ar', 'الصويرة', FALSE);

    -- 7. Ouarzazate
    INSERT INTO cities (region, image, description, latitude, longitude, created_at, created_by)
    VALUES (
        'Drâa-Tafilalet',
        'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80',
        'The Gateway to the Sahara – a desert city known for its kasbahs, film studios, and dramatic Atlas Mountain landscapes.',
        30.9189, -6.8936, NOW(), admin_id
    ) RETURNING id INTO city_id;

    INSERT INTO city_names (city_id, language_code, name, is_primary) VALUES
        (city_id, 'en', 'Ouarzazate', TRUE),
        (city_id, 'fr', 'Ouarzazate', FALSE),
        (city_id, 'ar', 'ورزازات', FALSE);

END $$;
