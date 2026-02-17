-- ============================================================
-- V12: Seed 10 places in Fez
-- ============================================================

DO $$
DECLARE
    admin_id BIGINT;
    fes_id   BIGINT;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@tarik.ma' LIMIT 1;
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found – run V4 first';
    END IF;

    SELECT cn.city_id INTO fes_id
    FROM city_names cn
    WHERE cn.language_code = 'en' AND cn.name = 'Fes'
    LIMIT 1;

    IF fes_id IS NULL THEN
        RAISE EXCEPTION 'Fes city not found – seed it first';
    END IF;

    -- 1. Al Quaraouiyine Mosque
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        fes_id,
        'Al Quaraouiyine Mosque',
        'Founded in 859 AD, it is one of the oldest universities in the world and a masterpiece of Islamic architecture with stunning courtyards and intricate tilework.',
        'https://i.pinimg.com/1200x/e4/25/3a/e4253a57f92c9c8c6d980274fdbb605a.jpg',
        'Al Quaraouiyine, Medina, Fez',
        'RELIGIOUS',
        34.0631, -4.9775, NOW(), admin_id
    );

    -- 2. Bou Inania Madrasa
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        fes_id,
        'Bou Inania Madrasa',
        'A 14th-century Islamic school featuring exquisite Marinid architecture, with intricate zellij tilework, carved cedar woodwork, and a stunning central courtyard.',
        'https://i.pinimg.com/1200x/67/f3/f9/67f3f951643c28c6532df82b7324c6c1.jpg',
        'Talaa Kebira, Medina, Fez',
        'HISTORIC',
        34.0625, -4.9780, NOW(), admin_id
    );

    -- 3. Medina of Fez
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        fes_id,
        'Medina of Fes',
        'A UNESCO World Heritage site, the oldest and largest medieval city in the world, with over 9,000 narrow alleyways and countless historic buildings.',
        'https://www.barcelo.com/guia-turismo/wp-content/uploads/2023/09/zocos-fez.jpg',
        'Medina, Fes',
        'HISTORIC',
        34.0630, -4.9770, NOW(), admin_id
    );

    -- 4. Chouara Tannery
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        fes_id,
        'Chouara Tannery',
        'The famous 11th-century leather tannery where traditional methods are still used, creating a colorful spectacle of stone vats filled with natural dyes.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWR9urB7wIo2LWHMrKkCNO9kLtv-2_5m6qzg&s',
        'Chouara, Medina, Fez',
        'LANDMARK',
        34.0640, -4.9760, NOW(), admin_id
    );

    -- 5. Bab Bou Jeloud
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        fes_id,
        'Bab Bou Jeloud',
        'The iconic blue gate marking the western entrance to the Medina, featuring stunning blue tilework and serving as a gateway to the ancient city.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTe6ugFIf-_dlxyFU-t9wZkc2IzVUqWPsnzw&s',
        'Bab Bou Jeloud, Fes',
        'LANDMARK',
        34.0615, -4.9790, NOW(), admin_id
    );

    -- 6. Dar Batha Museum
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        fes_id,
        'Dar Batha Museum',
        'A beautiful 19th-century palace turned museum, housing an impressive collection of traditional Moroccan arts, crafts, and historical artifacts.',
        'https://www.vh.ma/wp-content/uploads/2025/02/dar-batha-museum.jpg',
        'Rue Dar Batha, Medina, Fes',
        'MUSEUM',
        34.0645, -4.9755, NOW(), admin_id
    );

    -- 7. Royal Palace of Fez
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        fes_id,
        'Royal Palace of Fez',
        'A magnificent 14th-century palace featuring golden brass doors, intricate zellij tilework, and beautiful gardens, serving as the official residence of the King.',
        'https://media.tacdn.com/media/attractions-splice-spp-360x240/12/50/9f/ab.jpg',
        'Place des Alaouites, Fez',
        'LANDMARK',
        34.0670, -4.9880, NOW(), admin_id
    );

    -- 8. Jnan Sbil Gardens
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        fes_id,
        'Jnan Sbil Gardens',
        'A peaceful 18th-century Andalusian-style garden featuring lush vegetation, water features, and walking paths perfect for relaxation.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxq3l7TbXRgBrjI_J-GBfvjrbLSgufoSeDpA&s',
        'Jnan Sbil, Fez',
        'PARK',
        34.0660, -4.9820, NOW(), admin_id
    );

    -- 9. Borj Nord
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        fes_id,
        'Borj Nord',
        'A 16th-century fortress built to defend the city, now housing a military museum with an impressive collection of historical weapons and armor.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYPBL1yZgZWOz1IO0SzRQCt9jD3IKQTIdIhw&s',
        'Borj Nord, Fez',
        'MUSEUM',
        34.0690, -4.9850, NOW(), admin_id
    );

    -- 10. Nejjarine Museum of Wooden Arts & Crafts
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        fes_id,
        'Nejjarine Museum of Wooden Arts & Crafts',
        'Housed in a beautifully restored 18th-century fondouq, this museum showcases Morocco''s rich tradition of woodworking and craftsmanship.',
        'https://media.tacdn.com/media/attractions-splice-spp-360x240/12/73/41/3c.jpg',
        'Place Nejjarine, Medina, Fes',
        'MUSEUM',
        34.0620, -4.9765, NOW(), admin_id
    );

END $$;
