-- ============================================================
-- V21: Seed additional places in Tangier (restaurants, hotels, transport hubs, etc.)
-- ============================================================

DO $$
DECLARE
    admin_id   BIGINT;
    tangier_id BIGINT;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@tarik.ma' LIMIT 1;
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found – run V4 first';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM city_names cn
        WHERE cn.city_id = 1 AND cn.language_code = 'en' AND cn.name = 'Tangier'
    ) THEN
        tangier_id := 1;
    ELSE
        SELECT cn.city_id INTO tangier_id
        FROM city_names cn
        WHERE cn.language_code = 'en' AND cn.name = 'Tangier'
        LIMIT 1;
    END IF;

    IF tangier_id IS NULL THEN
        RAISE EXCEPTION 'Tangier city not found – seed it first';
    END IF;

    -- Restaurants
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    SELECT tangier_id,
           'Saveur de Poisson',
           'Popular seafood spot in central Tangier with a daily menu and fresh catch.',
           'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80',
           'Tangier',
           'RESTAURANT',
           35.7857, -5.8128, NOW(), admin_id
    WHERE NOT EXISTS (SELECT 1 FROM places p WHERE p.city_id = tangier_id AND p.name = 'Saveur de Poisson');

    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    SELECT tangier_id,
           'Le Salon Bleu',
           'Rooftop restaurant in the medina known for Moroccan dishes and city views.',
           'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
           'Medina, Tangier',
           'RESTAURANT',
           35.7870, -5.8113, NOW(), admin_id
    WHERE NOT EXISTS (SELECT 1 FROM places p WHERE p.city_id = tangier_id AND p.name = 'Le Salon Bleu');

    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    SELECT tangier_id,
           'La Fabrique',
           'Contemporary café & restaurant with pastries, brunch, and specialty coffee.',
           'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
           'City Center, Tangier',
           'RESTAURANT',
           35.7727, -5.8086, NOW(), admin_id
    WHERE NOT EXISTS (SELECT 1 FROM places p WHERE p.city_id = tangier_id AND p.name = 'La Fabrique');

    -- Hotels / Stays
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    SELECT tangier_id,
           'Hilton Tangier City Center',
           'Modern hotel near the train station and waterfront, convenient for planning as a SLEEP stop.',
           'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
           'City Center, Tangier',
           'HOTEL',
           35.7688, -5.8036, NOW(), admin_id
    WHERE NOT EXISTS (SELECT 1 FROM places p WHERE p.city_id = tangier_id AND p.name = 'Hilton Tangier City Center');

    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    SELECT tangier_id,
           'Hotel Continental',
           'Historic hotel overlooking the port and the medina.',
           'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
           'Port, Tangier',
           'HOTEL',
           35.7901, -5.8120, NOW(), admin_id
    WHERE NOT EXISTS (SELECT 1 FROM places p WHERE p.city_id = tangier_id AND p.name = 'Hotel Continental');

    -- Museums / Attractions
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    SELECT tangier_id,
           'Kasbah Museum',
           'Museum inside the Kasbah featuring Moroccan art and regional history.',
           'https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=800&q=80',
           'Kasbah, Tangier',
           'MUSEUM',
           35.7895, -5.8126, NOW(), admin_id
    WHERE NOT EXISTS (SELECT 1 FROM places p WHERE p.city_id = tangier_id AND p.name = 'Kasbah Museum');

    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    SELECT tangier_id,
           'American Legation Museum',
           'Museum and cultural center in a landmark building; the first American public property outside the U.S.',
           'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&q=80',
           'Medina, Tangier',
           'MUSEUM',
           35.7850, -5.8110, NOW(), admin_id
    WHERE NOT EXISTS (SELECT 1 FROM places p WHERE p.city_id = tangier_id AND p.name = 'American Legation Museum');

    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    SELECT tangier_id,
           'Kasbah of Tangier',
           'Fortified citadel area with viewpoints over the Strait of Gibraltar.',
           'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
           'Kasbah, Tangier',
           'MONUMENT',
           35.7898, -5.8129, NOW(), admin_id
    WHERE NOT EXISTS (SELECT 1 FROM places p WHERE p.city_id = tangier_id AND p.name = 'Kasbah of Tangier');

    -- Mosques
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    SELECT tangier_id,
           'Sidi Bou Abib Mosque',
           'Historic neighborhood mosque in the medina area.',
           'https://images.unsplash.com/photo-1548013146-5f5b41b1a086?w=800&q=80',
           'Medina, Tangier',
           'MOSQUE',
           35.7876, -5.8122, NOW(), admin_id
    WHERE NOT EXISTS (SELECT 1 FROM places p WHERE p.city_id = tangier_id AND p.name = 'Sidi Bou Abib Mosque');

    -- Beaches / Parks
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    SELECT tangier_id,
           'Malabata Beach',
           'Beach area east of central Tangier along the bay.',
           'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
           'Malabata, Tangier',
           'BEACH',
           35.7832, -5.7677, NOW(), admin_id
    WHERE NOT EXISTS (SELECT 1 FROM places p WHERE p.city_id = tangier_id AND p.name = 'Malabata Beach');

    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    SELECT tangier_id,
           'Parc de la Mendoubia',
           'Central park area near the Grand Socco, good for walks and breaks.',
           'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
           'Tangier',
           'PARK',
           35.7836, -5.8124, NOW(), admin_id
    WHERE NOT EXISTS (SELECT 1 FROM places p WHERE p.city_id = tangier_id AND p.name = 'Parc de la Mendoubia');

    -- Markets
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    SELECT tangier_id,
           'Souk Barra',
           'Local market area for produce, spices, and everyday shopping.',
           'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
           'Tangier',
           'MARKET',
           35.7739, -5.8006, NOW(), admin_id
    WHERE NOT EXISTS (SELECT 1 FROM places p WHERE p.city_id = tangier_id AND p.name = 'Souk Barra');

    -- Transport hubs
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    SELECT tangier_id,
           'Tangier Ville Train Station',
           'Main train station in Tangier (transport hub).',
           NULL,
           'Tangier',
           'TRANSPORT_HUB',
           35.7684, -5.8031, NOW(), admin_id
    WHERE NOT EXISTS (SELECT 1 FROM places p WHERE p.city_id = tangier_id AND p.name = 'Tangier Ville Train Station');

    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    SELECT tangier_id,
           'Tangier Ibn Battouta Airport',
           'International airport serving Tangier (transport hub).',
           NULL,
           'Tangier',
           'TRANSPORT_HUB',
           35.7269, -5.9169, NOW(), admin_id
    WHERE NOT EXISTS (SELECT 1 FROM places p WHERE p.city_id = tangier_id AND p.name = 'Tangier Ibn Battouta Airport');

END $$;
