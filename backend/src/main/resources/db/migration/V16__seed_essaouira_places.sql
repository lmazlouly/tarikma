-- ============================================================
-- V16: Seed 10 places in Essaouira
-- ============================================================

DO $$
DECLARE
    admin_id     BIGINT;
    essaouira_id BIGINT;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@tarik.ma' LIMIT 1;
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found – run V4 first';
    END IF;

    SELECT cn.city_id INTO essaouira_id
    FROM city_names cn
    WHERE cn.language_code = 'en' AND cn.name = 'Essaouira'
    LIMIT 1;

    IF essaouira_id IS NULL THEN
        RAISE EXCEPTION 'Essaouira city not found – seed it first';
    END IF;

    -- 1. Essaouira Medina
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        essaouira_id,
        'Essaouira Medina',
        'A UNESCO World Heritage site featuring 18th-century fortified medina with distinctive blue and white architecture, narrow alleyways, and bustling souks.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEQOdG_Lo1jZ9VleU0ANzdVcY9PPe2Vh2mcg&s',
        'Medina, Essaouira',
        'HISTORIC',
        31.5125, -9.7700, NOW(), admin_id
    );

    -- 2. Skala de la Ville
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        essaouira_id,
        'Skala de la Ville',
        'An impressive 18th-century sea fortification with massive ramparts, cannons, and stunning views of the Atlantic Ocean and the city.',
        'https://lp-cms-production.imgix.net/2019-06/9072bf3981b32f81e179f041932d8fcf-skala-de-la-ville.jpg?w=1200&auto=format',
        'Rue de la Skala, Essaouira',
        'LANDMARK',
        31.5110, -9.7715, NOW(), admin_id
    );

    -- 3. Essaouira Beach
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        essaouira_id,
        'Essaouira Beach',
        'A beautiful expansive beach with golden sand and strong winds, making it perfect for windsurfing, kitesurfing, and other water sports.',
        'https://explorawatersports.com/wp-content/uploads/2024/05/essaouira-morocco-the-place-of-all-smiles.webp',
        'Boulevard Mohammed V, Essaouira',
        'BEACH',
        31.5150, -9.7650, NOW(), admin_id
    );

    -- 4. Port of Essaouira
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        essaouira_id,
        'Port of Essaouira',
        'A vibrant fishing port with colorful blue boats, fresh seafood markets, and a lively atmosphere where fishermen bring in their daily catch.',
        'https://photo620x400.mnstatic.com/9c165762e4d93e6a5bd2f351f3b8b83f/port-dessaouira.jpg',
        'Port d''Essaouira, Essaouira',
        'LANDMARK',
        31.5130, -9.7680, NOW(), admin_id
    );

    -- 5. Skala du Port
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        essaouira_id,
        'Skala du Port',
        'Historic fortifications protecting the fishing port with ancient cannons, offering spectacular views of the ocean and the bustling harbor below.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzBTfBsHUWn8RMIcH9Xnx3gkBpvxn45h7piQ&s',
        'Port d''Essaouira, Essaouira',
        'LANDMARK',
        31.5120, -9.7690, NOW(), admin_id
    );

    -- 6. Moulay Hassan Square
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        essaouira_id,
        'Moulay Hassan Square',
        'The main square of Essaouira, a vibrant gathering place with cafes, street performers, and stunning views of the port and Atlantic Ocean.',
        'https://www.riad-lunetoile.com/wp-content/uploads/2015/11/IMG_0286.jpg',
        'Place Moulay Hassan, Essaouira',
        'LANDMARK',
        31.5140, -9.7720, NOW(), admin_id
    );

    -- 7. Sidi Mohammed Ben Abdallah Museum
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        essaouira_id,
        'Sidi Mohammed Ben Abdallah Museum',
        'A fascinating museum housed in a 19th-century building showcasing regional history, traditional crafts, and artifacts from Essaouira''s maritime past.',
        'https://exploreessaouira.com/wp-content/uploads/2022/05/Sidi-Mohammed-ben-Abdallah-Museum-entrance.jpg',
        'Rue Laalouj, Medina, Essaouira',
        'MUSEUM',
        31.5115, -9.7705, NOW(), admin_id
    );

    -- 8. Diabat
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        essaouira_id,
        'Diabat',
        'A charming coastal village south of Essaouira known for its windswept beaches, ruins of an old palace, and association with Jimi Hendrix.',
        'https://cdn.getyourguide.com/img/tour/38cf7dbf0dbbfeba0f9d94bae566c7b76d236084e9f849e8f20124780c681591.jpg/68.jpg',
        'Diabat, Essaouira',
        'BEACH',
        31.4950, -9.7850, NOW(), admin_id
    );

    -- 9. Sidi Kaouki Beach
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        essaouira_id,
        'Sidi Kaouki Beach',
        'A pristine beach south of Essaouira famous for its strong winds, perfect waves for surfing, and the legendary camel races along the shore.',
        'https://static.wixstatic.com/media/16e9e2_88725fda80584779a3ff784ccb9c17ea~mv2.jpeg/v1/fill/w_568,h_320,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/16e9e2_88725fda80584779a3ff784ccb9c17ea~mv2.jpeg',
        'Sidi Kaouki, Essaouira',
        'BEACH',
        31.4750, -9.8200, NOW(), admin_id
    );

    -- 10. Dar Souiri
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        essaouira_id,
        'Dar Souiri',
        'A beautiful 18th-century mansion showcasing traditional Moroccan architecture, now serving as a cultural center for art exhibitions and music events.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEJV4qG-njrWBfTgpXLRuWqoV3z0mLRnPV9w&s',
        'Rue de la Skala, Medina, Essaouira',
        'MUSEUM',
        31.5110, -9.7710, NOW(), admin_id
    );

END $$;
