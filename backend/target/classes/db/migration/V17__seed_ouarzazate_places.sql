-- ============================================================
-- V17: Seed 10 places in Ouarzazate
-- ============================================================

DO $$
DECLARE
    admin_id      BIGINT;
    ouarzazate_id BIGINT;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@tarik.ma' LIMIT 1;
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found – run V4 first';
    END IF;

    SELECT cn.city_id INTO ouarzazate_id
    FROM city_names cn
    WHERE cn.language_code = 'en' AND cn.name = 'Ouarzazate'
    LIMIT 1;

    IF ouarzazate_id IS NULL THEN
        RAISE EXCEPTION 'Ouarzazate city not found – seed it first';
    END IF;

    -- 1. Ait Benhaddou
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        ouarzazate_id,
        'Ait Benhaddou',
        'A UNESCO World Heritage site and spectacular fortified ksar (village) with stunning earthen clay architecture, featured in numerous Hollywood films.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoNeDpLxNpg6Umg5VAaTQ5yQMsImNHquejmw&s',
        'Ait Benhaddou, Ouarzazate',
        'HISTORIC',
        31.0480, -7.1330, NOW(), admin_id
    );

    -- 2. Atlas Studios
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        ouarzazate_id,
        'Atlas Studios',
        'One of the largest movie studios in the world, featuring massive film sets from famous movies like Gladiator and Game of Thrones.',
        'https://cdn.getyourguide.com/img/tour/31a854ec785ee6aa317d9e7a23b30a404bb85d342c03e772cdda2a27023c51d3.png/145.jpg',
        'Route de Marrakech, Ouarzazate',
        'LANDMARK',
        30.9250, -6.9350, NOW(), admin_id
    );

    -- 3. Taourirt Kasbah
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        ouarzazate_id,
        'Taourirt Kasbah',
        'An impressive 19th-century kasbah that was once the home of the Glaoui family, featuring beautiful mud-brick architecture and intricate decorations.',
        'https://discoverouarzazate.com/wp-content/uploads/2021/07/destinations-single.jpg',
        'Avenue Moulay Ali Cherif, Ouarzazate',
        'HISTORIC',
        30.9350, -6.9050, NOW(), admin_id
    );

    -- 4. Fint Oasis
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        ouarzazate_id,
        'Fint Oasis',
        'A hidden paradise of lush palm groves and crystal-clear streams nestled in dramatic rocky mountains, offering a peaceful escape from the desert.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5eoiSUYNXvXIZ1Dm5jaq9r0oV-XU6KLaqRA&s',
        'Fint Oasis, Ouarzazate',
        'NATURE',
        30.8800, -6.8200, NOW(), admin_id
    );

    -- 5. Cinema Museum
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        ouarzazate_id,
        'Cinema Museum',
        'A fascinating museum dedicated to Morocco''s film industry, showcasing props, costumes, and sets from famous movies filmed in the region.',
        'https://ouarzazate.city/wp-content/uploads/2020/03/ouarzazate-musee-cinema-9238-1030x688.jpg',
        'Avenue Moulay Ali Cherif, Ouarzazate',
        'MUSEUM',
        30.9300, -6.9100, NOW(), admin_id
    );

    -- 6. Draa Valley
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        ouarzazate_id,
        'Draa Valley',
        'Morocco''s longest river valley, featuring stunning palm groves, ancient ksour (fortified villages), and dramatic desert landscapes.',
        'https://www.morocco-like-a-local.com/uploads/sites/89/2022/11/draa-valley-morocco.jpeg',
        'Draa Valley, Ouarzazate',
        'NATURE',
        30.7500, -6.8800, NOW(), admin_id
    );

    -- 7. Tifoultoute Kasbah
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        ouarzazate_id,
        'Tifoultoute Kasbah',
        'A beautifully restored 18th-century kasbah perched on a hill offering panoramic views of the surrounding valleys and mountains.',
        'https://kasbahdetifoultoute.allhotelsmorocco.com/data/Images/OriginalPhoto/15188/1518837/1518837256/tajda-kasbah-tifoultoute-image-8.JPEG',
        'Route de Zagora, Ouarzazate',
        'HISTORIC',
        30.9500, -6.9500, NOW(), admin_id
    );

    -- 8. Ouarzazate Lake
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        ouarzazate_id,
        'Ouarzazate Lake',
        'A serene artificial lake created by the El Mansour Eddahbi dam, offering beautiful views and recreational activities in the desert landscape.',
        'https://ouarzazate.city/wp-content/uploads/2020/04/dardaif-experiences-0401-1030x688.jpg',
        'El Mansour Eddahbi Dam, Ouarzazate',
        'NATURE',
        30.9800, -6.9200, NOW(), admin_id
    );

    -- 9. Skoura Oasis
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        ouarzazate_id,
        'Skoura Oasis',
        'A lush palm oasis known as the "Valley of a Thousand Kasbahs," featuring numerous fortified villages and beautiful desert gardens.',
        'https://sudestmaroc.com/wp-content/uploads/2020/10/lieu-skoura-C.jpg',
        'Skoura, Ouarzazate',
        'NATURE',
        31.0500, -6.7800, NOW(), admin_id
    );

    -- 10. Amridil Kasbah
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        ouarzazate_id,
        'Amridil Kasbah',
        'A well-preserved 17th-century kasbah in Skoura oasis, showcasing traditional Saharan architecture and offering insights into Berber culture.',
        'https://excursionmania.com/uploads/blog/gallery/1671/1737955908.jpg',
        'Skoura, Ouarzazate',
        'HISTORIC',
        31.0600, -6.7700, NOW(), admin_id
    );

END $$;
