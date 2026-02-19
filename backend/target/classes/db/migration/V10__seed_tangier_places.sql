-- ============================================================
-- V10: Seed 10 places in Tangier
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

    SELECT cn.city_id INTO tangier_id
    FROM city_names cn
    WHERE cn.language_code = 'en' AND cn.name = 'Tangier'
    LIMIT 1;

    IF tangier_id IS NULL THEN
        RAISE EXCEPTION 'Tangier city not found – seed it first';
    END IF;

    -- 1. Medina of Tangier
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        tangier_id,
        'Medina of Tangier',
        'The historic walled old town of Tangier, a labyrinth of narrow streets filled with shops, riads, and centuries of history.',
        'https://images.unsplash.com/photo-1582919534700-acf2374f10d3?w=800&q=80',
        'Medina, Tangier',
        'HISTORIC',
        35.7850, -5.8130, NOW(), admin_id
    );

    -- 2. Grand Socco (Place 9 Avril 1947)
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        tangier_id,
        'Grand Socco (Place 9 Avril 1947)',
        'A bustling square at the entrance of the medina, once the main marketplace and now a vibrant gathering point.',
        'https://lh3.googleusercontent.com/gps-cs-s/AHVAweo9kKsHe5HRCxuZD1x9ROA-MqFRbhEAtvYGOcPhlFDlCQ3djfwSSz8xToWdtFxNC9WIlhHxxo3WKy0iYghXx0HBfTsTuFSgrahr2-m0E_XxweBBRDLeeA0MqKl0rExIVjz_LTaY=s1360-w1360-h1020-rw',
        'Grand Socco, Tangier',
        'LANDMARK',
        35.7842, -5.8107, NOW(), admin_id
    );

    -- 3. Petit Socco
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        tangier_id,
        'Petit Socco',
        'A small, atmospheric square in the heart of the medina, once the social hub of Tangier''s international era.',
        'https://lh3.googleusercontent.com/gps-cs-s/AHVAwer1fJdSGCEx35n_0wG0TZ4n4l7G0ky-lL0PmkeG1DJ7UAUZ7e8pMuMaJJy5aRfk-aOvbsfIufESBUO5PhdSw3Yh4-hKwjv8WZZfvIbYx8H5n8b3AhTAu9GvBqh33hymuxLdKVP7=s1360-w1360-h1020-rw',
        'Petit Socco, Medina, Tangier',
        'LANDMARK',
        35.7862, -5.8100, NOW(), admin_id
    );

    -- 4. Café Hafa
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        tangier_id,
        'Café Hafa',
        'A legendary cliffside café overlooking the Strait of Gibraltar, frequented by artists and writers since 1921.',
        'https://fr.le360.ma/resizer/b-jVhmGqlAxzcPR-RXGQQOhSdQ0=/arc-photo-le360/eu-central-1-prod/public/WIJG2EFZ7RF4TPPA7MW3PF37S4.jpg',
        'Avenue Hafa, Tangier',
        'CAFE',
        35.7910, -5.8220, NOW(), admin_id
    );

    -- 5. Cap Spartel
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        tangier_id,
        'Cap Spartel',
        'The northwestern-most point of Africa where the Atlantic Ocean meets the Mediterranean Sea, crowned by a 19th-century lighthouse.',
        'https://images.unsplash.com/photo-1640397348992-db78f960f688?w=800&q=80',
        'Cap Spartel, Tangier',
        'NATURE',
        35.7926, -5.9186, NOW(), admin_id
    );

    -- 6. Hercules Caves
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        tangier_id,
        'Hercules Caves',
        'A stunning sea cave steeped in Greek mythology, with an opening shaped like the map of Africa looking out to the Atlantic.',
        'https://lh3.googleusercontent.com/gps-cs-s/AHVAwerR7GI4DJKSO8zZceMR27ieepCna40X-Q7e3rNaZOA3o9N3kmUvmKVwRoJU2mqqZ56zYZmwFt_G-j7MkGkNWNrcB2DXJVJdlOfjSYy0HlH9dEh0fyC2k0l4BOz_6wi65WB5IaSo=s1360-w1360-h1020-rw',
        'Grottes d''Hercule, Tangier',
        'NATURE',
        35.7614, -5.9381, NOW(), admin_id
    );

    -- 7. Rmilat Park (Parc Perdicaris)
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        tangier_id,
        'Rmilat Park (Parc Perdicaris)',
        'A lush forested park on the outskirts of Tangier with walking trails, pine trees, and panoramic ocean views.',
        'https://soccohostel.com/wp-content/uploads/2025/03/20231129_123123.jpg',
        'Parc Perdicaris, Tangier',
        'PARK',
        35.7720, -5.9050, NOW(), admin_id
    );

    -- 8. Tangier Corniche / Beach Promenade
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        tangier_id,
        'Tangier Corniche / Beach Promenade',
        'A scenic waterfront promenade stretching along the bay, perfect for strolling with views of the port and the Spanish coast.',
        'https://ferrater.com/wp-content/uploads/2013/04/P_PA_TANGER_CORNICHE_R01.jpg',
        'Corniche, Tangier',
        'BEACH',
        35.7780, -5.7980, NOW(), admin_id
    );

    -- 9. Mendoubia Gardens
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        tangier_id,
        'Mendoubia Gardens',
        'A peaceful green oasis near the Grand Socco featuring ancient trees, including an 800-year-old banyan, and historical cannons.',
        'https://soccohostel.com/wp-content/uploads/2025/03/AF1QipMOGn-EOq8ADX1HijKMs01GXaS83gN6K9YpmKc0s512.jpg',
        'Rue de la Liberté, Tangier',
        'PARK',
        35.7835, -5.8125, NOW(), admin_id
    );

    -- 10. Achakar Beach
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        tangier_id,
        'Achakar Beach',
        'A popular sandy beach west of Tangier, known for its relaxed atmosphere, surfing conditions, and proximity to Cap Spartel.',
        'https://images.mnstatic.com/9b/40/9b40642ab0734efbb08d680851b6cfe7.jpg',
        'Achakar, Tangier',
        'BEACH',
        35.7680, -5.9280, NOW(), admin_id
    );

END $$;
