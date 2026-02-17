-- ============================================================
-- V11: Seed 10 places in Casablanca
-- ============================================================

DO $$
DECLARE
    admin_id       BIGINT;
    casablanca_id BIGINT;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@tarik.ma' LIMIT 1;
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found – run V4 first';
    END IF;

    SELECT cn.city_id INTO casablanca_id
    FROM city_names cn
    WHERE cn.language_code = 'en' AND cn.name = 'Casablanca'
    LIMIT 1;

    IF casablanca_id IS NULL THEN
        RAISE EXCEPTION 'Casablanca city not found – seed it first';
    END IF;

    -- 1. Hassan II Mosque
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        casablanca_id,
        'Hassan II Mosque',
        'One of the largest mosques in the world, featuring stunning architecture with a 210m minaret and a glass floor allowing views of the Atlantic Ocean below.',
        'https://plus.unsplash.com/premium_photo-1697729724546-d3862b6fd294?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        'Boulevard Sidi Mohammed Ben Abdellah, Casablanca',
        'RELIGIOUS',
        33.5938, -7.6191, NOW(), admin_id
    );

    -- 2. Morocco Mall
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        casablanca_id,
        'Morocco Mall',
        'The largest shopping center in Africa, featuring over 350 stores, an aquarium, cinema, and numerous dining options with ocean views.',
        'https://www.guideoftheworld.com/wp-content/uploads/2023/07/Morocco-Mall.jpg',
        'Boulevard de la Corniche, Casablanca',
        'SHOPPING',
        33.5630, -7.6660, NOW(), admin_id
    );

    -- 3. La Corniche Casablanca
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        casablanca_id,
        'La Corniche Casablanca',
        'A vibrant waterfront promenade lined with cafes, restaurants, and beaches, offering stunning Atlantic Ocean views and a lively atmosphere.',
        'https://goodmove.ma/wp-content/uploads/2025/08/Hqbl1EgfLgKEvCtYWwcvcIBiL89CqzNaNqFEqlWV.jpg',
        'Boulevard de la Corniche, Casablanca',
        'BEACH',
        33.5720, -7.6580, NOW(), admin_id
    );

    -- 4. Quartier Habous
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        casablanca_id,
        'Quartier Habous',
        'A charming traditional Moroccan neighborhood built in the 1930s, featuring Andalusian architecture, artisan shops, and the Royal Palace.',
        'https://bewilderedinmorocco.com/wp-content/uploads/2025/09/habous-1.webp',
        'Quartier Habous, Casablanca',
        'HISTORIC',
        33.5950, -7.6150, NOW(), admin_id
    );

    -- 5. Sacred Heart Cathedral
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        casablanca_id,
        'Sacred Heart Cathedral',
        'A stunning Gothic Revival cathedral built in 1930, featuring beautiful stained glass windows and impressive architecture.',
        'https://www.barcelo.com/guia-turismo/wp-content/uploads/2022/10/casablanca-catedral-888.jpg',
        'Rue du Général de Gaulle, Casablanca',
        'RELIGIOUS',
        33.5930, -7.6170, NOW(), admin_id
    );

    -- 6. Old Medina of Casablanca
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        casablanca_id,
        'Old Medina of Casablanca',
        'The historic heart of Casablanca, a traditional walled quarter with narrow streets, souks, and the historic Marrakshi Mosque.',
        'https://tse4.mm.bing.net/th/id/OIP._fmNel7H5VJJ7WutqkyclAHaED?rs=1&pid=ImgDetMain&o=7&rm=3',
        'Old Medina, Casablanca',
        'HISTORIC',
        33.6030, -7.6200, NOW(), admin_id
    );

    -- 7. Abderrahman Slaoui Museum
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        casablanca_id,
        'Abderrahman Slaoui Museum',
        'A private museum showcasing an impressive collection of Moroccan and African art, including jewelry, textiles, and contemporary works.',
        'https://i.pinimg.com/736x/b7/4b/6b/b74b6b8930f5f63f7fbd069bb8682d1c.jpg',
        'Rue du Chasseur Joubert, Casablanca',
        'MUSEUM',
        33.5970, -7.6130, NOW(), admin_id
    );

    -- 8. Ain Diab Beach
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        casablanca_id,
        'Ain Diab Beach',
        'A popular urban beach stretching along the Atlantic coast, known for its golden sand, beach clubs, and vibrant nightlife scene.',
        'https://i.pinimg.com/736x/c1/89/7c/c1897c30d9f3489292a3b952f3b4857d.jpg',
        'Ain Diab, Casablanca',
        'BEACH',
        33.5580, -7.6720, NOW(), admin_id
    );

    -- 9. Villa des Arts
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        casablanca_id,
        'Villa des Arts',
        'A beautiful Art Deco villa turned cultural center, hosting contemporary art exhibitions and cultural events in an elegant setting.',
        'http://i.pinimg.com/736x/37/82/f2/3782f2ac0efea27f5d212b5b124a2bf7.jpg',
        'Rue d''Alger, Casablanca',
        'MUSEUM',
        33.5950, -7.6180, NOW(), admin_id
    );

END $$;
