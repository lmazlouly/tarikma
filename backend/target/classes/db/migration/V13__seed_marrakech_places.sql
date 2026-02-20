-- ============================================================
-- V13: Seed 10 places in Marrakech
-- ============================================================

DO $$
DECLARE
    admin_id     BIGINT;
    marrakech_id BIGINT;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@tarik.ma' LIMIT 1;
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found – run V4 first';
    END IF;

    SELECT cn.city_id INTO marrakech_id
    FROM city_names cn
    WHERE cn.language_code = 'en' AND cn.name = 'Marrakech'
    LIMIT 1;

    IF marrakech_id IS NULL THEN
        RAISE EXCEPTION 'Marrakech city not found – seed it first';
    END IF;

    -- 1. Jemaa el-Fnaa
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        marrakech_id,
        'Jemaa el-Fnaa',
        'The famous main square and market place in Marrakech, a UNESCO World Heritage site bustling with storytellers, musicians, snake charmers, and food stalls.',
        'https://www.lesjardinsdelamedina.com/blog/wp-content/uploads/2020/07/jama-el-fnaa.jpg',
        'Jemaa el-Fnaa, Medina, Marrakech',
        'LANDMARK',
        31.6285, -7.9892, NOW(), admin_id
    );

    -- 2. Koutoubia Mosque
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        marrakech_id,
        'Koutoubia Mosque',
        'The largest mosque in Marrakech, featuring a magnificent 77-meter minaret and stunning Almohad architecture, serving as the city''s most iconic landmark.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSniBcxHpJm2YL2YM5YdtITX1PYdwJuLF1bBA&s',
        'Avenue Mohammed V, Marrakech',
        'RELIGIOUS',
        31.6255, -7.9895, NOW(), admin_id
    );

    -- 3. Majorelle Garden
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        marrakech_id,
        'Majorelle Garden',
        'A stunning botanical garden created by French painter Jacques Majorelle, featuring vibrant blue buildings, exotic plants, and the Islamic Art Museum.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPF006gVEwNYt-YD6Fz-m0QDaZ-bZN82phEw&s',
        'Rue Yves St Laurent, Marrakech',
        'PARK',
        31.6375, -7.9935, NOW(), admin_id
    );

    -- 4. Bahia Palace
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        marrakech_id,
        'Bahia Palace',
        'A breathtaking 19th-century palace showcasing the finest Moroccan and Islamic architecture, with intricate tilework, carved stucco, and beautiful courtyards.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNzRYGc4nUKEAT4OmdpFywFK_HYHsvMngJig&s',
        'Rue Riad Zitoun Jdid, Medina, Marrakech',
        'HISTORIC',
        31.6260, -7.9870, NOW(), admin_id
    );

    -- 5. Saadian Tombs
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        marrakech_id,
        'Saadian Tombs',
        'A 16th-century royal necropolis featuring beautifully decorated tombs of the Saadian dynasty, hidden for centuries and rediscovered in 1917.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRauOdJ9ni0iovgeru7OaB6rRrEAWNEhimGbg&s',
        'Rue de la Kasbah, Medina, Marrakech',
        'HISTORIC',
        31.6235, -7.9825, NOW(), admin_id
    );

    -- 6. Ben Youssef Madrasa
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        marrakech_id,
        'Ben Youssef Madrasa',
        'An ancient Islamic college and one of the largest theological schools in North Africa, featuring exquisite Marinid architecture and intricate decorations.',
        'https://riad-selouane.net/wp-content/uploads/blog/medersa-ben-youssef/medersa-ben-youssef-marrakesch-riad-selouane-blogpost.jpg',
        'Place Ben Youssef, Medina, Marrakech',
        'HISTORIC',
        31.6290, -7.9830, NOW(), admin_id
    );

    -- 7. El Badi Palace
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        marrakech_id,
        'El Badi Palace',
        'The ruins of a magnificent 16th-century palace built by Sultan Ahmad al-Mansur, once considered one of the most beautiful palaces in the world.',
        'https://badipalace.com/wp-content/uploads/2025/04/El-Badi-Palace-square.webp',
        'Rue de la Kasbah, Medina, Marrakech',
        'HISTORIC',
        31.6225, -7.9835, NOW(), admin_id
    );

    -- 8. Menara Gardens
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        marrakech_id,
        'Menara Gardens',
        'A historic 12th-century olive grove featuring a large pavilion reflecting in a tranquil lake, with stunning views of the Atlas Mountains.',
        'https://menaragardens.com/wp-content/uploads/2024/08/les-jardin-de-la-menara.webp',
        'Avenue de la Menara, Marrakech',
        'PARK',
        31.6200, -8.0050, NOW(), admin_id
    );

    -- 9. Marrakech Museum
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        marrakech_id,
        'Marrakech Museum',
        'Housed in a beautiful 19th-century Dar Menebhi palace, showcasing Moroccan art, ceramics, jewelry, and historical artifacts.',
        'https://marrakechmuseum.com/wp-content/uploads/2024/08/museum-marrakech.webp',
        'Rue Ben Slimane, Medina, Marrakech',
        'MUSEUM',
        31.6295, -7.9820, NOW(), admin_id
    );

    -- 10. Le Jardin Secret
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        marrakech_id,
        'Le Jardin Secret',
        'A beautifully restored 20th-century palace garden featuring Islamic architecture, exotic plants, and a traditional hammam in the heart of the Medina.',
        'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepDMmH_gvoi3tIPqqcOFMsZGgtTPgu5U86Y2jmjxNvwzTsDiFcPjifJ8DHVCD30nElESshNBM_7uRfwbLq4wVT5B3Dz-AZXPAJmCGKVtBKh0KrMbT0KNT5HL5bkCd9-F--8aDqv=s1360-w1360-h1020-rw',
        'Rue Mouassine, Medina, Marrakech',
        'PARK',
        31.6300, -7.9815, NOW(), admin_id
    );

END $$;
