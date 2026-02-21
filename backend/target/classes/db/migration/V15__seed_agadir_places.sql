-- ============================================================
-- V15: Seed 10 places in Agadir
-- ============================================================

DO $$
DECLARE
    admin_id  BIGINT;
    agadir_id BIGINT;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@tarik.ma' LIMIT 1;
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found – run V4 first';
    END IF;

    SELECT cn.city_id INTO agadir_id
    FROM city_names cn
    WHERE cn.language_code = 'en' AND cn.name = 'Agadir'
    LIMIT 1;

    IF agadir_id IS NULL THEN
        RAISE EXCEPTION 'Agadir city not found – seed it first';
    END IF;

    -- 1. Agadir Beach
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        agadir_id,
        'Agadir Beach',
        'A magnificent 10-kilometer stretch of golden sand along the Atlantic coast, perfect for swimming, sunbathing, and water sports with year-round sunshine.',
        'https://images.trvl-media.com/place/6115284/935d8b7c-26fd-422e-b4fb-2329d867a804.jpg',
        'Boulevard du 20 Août, Agadir',
        'BEACH',
        30.4278, -9.5981, NOW(), admin_id
    );

    -- 2. Agadir Oufella
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        agadir_id,
        'Agadir Oufella',
        'A historic hilltop fortress offering panoramic views of the city, ocean, and mountains, with the remains of the old kasbah and a modern observation platform.',
        'https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=center,quality=60,width=400,height=265,dpr=2/tour_img/d61094be5c08ad6ffd075b1c4a701fafd070c625b3027d671d7147a04b2904ff.jpg',
        'Agadir Oufella, Agadir',
        'LANDMARK',
        30.4150, -9.5850, NOW(), admin_id
    );

    -- 3. Souk El Had
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        agadir_id,
        'Souk El Had',
        'The largest and most vibrant market in Agadir, featuring over 6,000 shops selling everything from spices and textiles to traditional crafts and fresh produce.',
        'https://immersi-travel.com/wp-content/uploads/2023/04/Souk-Agadir-mosquee.jpg',
        'Avenue des Forces Armées Royales, Agadir',
        'SHOPPING',
        30.4250, -9.5950, NOW(), admin_id
    );

    -- 4. Marina Agadir
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        agadir_id,
        'Marina Agadir',
        'A modern and luxurious marina featuring beautiful promenades, upscale restaurants, cafes, and stunning views of yachts against the Atlantic backdrop.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuUEhEBICf-8m36BJBljip3mAN0wbRaI_2OA&s',
        'Boulevard de la Marina, Agadir',
        'LANDMARK',
        30.4350, -9.6100, NOW(), admin_id
    );

    -- 5. Valley of the Birds
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        agadir_id,
        'Valley of the Birds',
        'A beautiful urban park and zoo featuring exotic birds, flamingos, and other wildlife in a lush garden setting perfect for families and nature lovers.',
        'https://immersi-travel.com/wp-content/uploads/2023/05/Paon-flammants-rose-Vallee-des-oiseaux-Agadir.jpg',
        'Avenue du Président Kennedy, Agadir',
        'PARK',
        30.4280, -9.5955, NOW(), admin_id
    );

    -- 6. Crocoparc
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        agadir_id,
        'Crocoparc',
        'A unique zoological park dedicated to crocodiles and other reptiles, featuring botanical gardens, educational exhibits, and thrilling feeding demonstrations.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWdA_5U1SMjhd2H3hKSZTtzbRUzrjOL1YkYA&s',
        'Route de Tiznit, Agadir',
        'PARK',
        30.4050, -9.5750, NOW(), admin_id
    );

    -- 7. Agadir Medina
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        agadir_id,
        'Agadir Medina',
        'A reconstructed traditional medina built after the 1960 earthquake, featuring authentic Moroccan architecture, artisan workshops, and cultural exhibits.',
        'https://photos.smugmug.com/Maroc-Lovers/Agadir/Medina-Polizzi/i-2BgFPNj/0/Lgm3LZVPTwXbDSGnJHBdmV2twgnrSv3fgR6QdMgsm/L/agadir-morocco-medina-polizzi-1-L.jpg',
        'Boulevard du 20 Août, Agadir',
        'HISTORIC',
        30.4300, -9.6000, NOW(), admin_id
    );

    -- 8. Taghazout Beach
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        agadir_id,
        'Taghazout Beach',
        'A world-renowned surfing paradise north of Agadir, famous for its perfect waves, laid-back atmosphere, and international surfing community.',
        'https://www.arganetravel.com/modules/ph_simpleblog/covers/4.jpg',
        'Taghazout, Agadir',
        'BEACH',
        30.5430, -9.7020, NOW(), admin_id
    );

    -- 9. Sous-Massa National Park
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        agadir_id,
        'Sous-Massa National Park',
        'A protected natural reserve spanning 33,800 hectares, home to diverse wildlife including endangered species, stunning cliffs, and pristine beaches.',
        'https://www.les-covoyageurs.com/ressources/images-lieux/photo-lieu-79-2.jpg',
        'Route d''Agadir à Tiznit, Agadir',
        'NATURE',
        30.4750, -9.7850, NOW(), admin_id
    );

    -- 10. Agadir Kasbah
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        agadir_id,
        'Agadir Kasbah',
        'The historic fortress ruins atop Agadir Oufella hill, offering spectacular views and serving as a memorial to the 1960 earthquake with preserved city walls.',
        'https://leseco.ma/wp-content/uploads/2024/02/Kasbah-dAgadir-Oufella1.jpg',
        'Agadir Oufella, Agadir',
        'HISTORIC',
        30.4150, -9.5850, NOW(), admin_id
    );

END $$;
