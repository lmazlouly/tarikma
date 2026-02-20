-- ============================================================
-- V14: Seed 11 places in Rabat
-- ============================================================

DO $$
DECLARE
    admin_id BIGINT;
    rabat_id BIGINT;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@tarik.ma' LIMIT 1;
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found – run V4 first';
    END IF;

    SELECT cn.city_id INTO rabat_id
    FROM city_names cn
    WHERE cn.language_code = 'en' AND cn.name = 'Rabat'
    LIMIT 1;

    IF rabat_id IS NULL THEN
        RAISE EXCEPTION 'Rabat city not found – seed it first';
    END IF;

    -- 1. Hassan Tower
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        rabat_id,
        'Hassan Tower',
        'An unfinished 12th-century minaret that was intended to be the world''s tallest, now standing as a symbol of Rabat with its impressive Almohad architecture.',
        'https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=center,quality=60,width=400,height=265,dpr=2/tour_img/64b57f7b9699d.jpeg',
        'Place du Mechouar, Rabat',
        'HISTORIC',
        34.0225, -6.8390, NOW(), admin_id
    );

    -- 2. Mausoleum of Mohammed V
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        rabat_id,
        'Mausoleum of Mohammed V',
        'A magnificent modern mausoleum housing the tombs of King Mohammed V and his sons, featuring stunning white marble architecture and intricate Moroccan craftsmanship.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvjdBa0hR3dbmE9hIQkTxp-qiX3f64vsfMSQ&s',
        'Place du Mechouar, Rabat',
        'RELIGIOUS',
        34.0220, -6.8395, NOW(), admin_id
    );

    -- 3. Kasbah of the Udayas
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        rabat_id,
        'Kasbah of the Udayas',
        'A 12th-century fortified citadel with distinctive blue and white walls, narrow streets, and beautiful Andalusian gardens overlooking the Atlantic Ocean.',
        'https://www.story-rabat.com/wp-content/uploads/2024/02/Kasbah-of-the-udayas-2048x1365-1.webp',
        'Kasbah des Oudaias, Rabat',
        'HISTORIC',
        34.0185, -6.8420, NOW(), admin_id
    );

    -- 4. Chellah
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        rabat_id,
        'Chellah',
        'Ancient Roman and Islamic archaeological site featuring medieval ruins, a mosque, and beautiful gardens with storks nesting on the ancient walls.',
        'https://www.chellah.site/wp-content/uploads/2023/11/chellah-visite-rabat-travel-guide-tourisme-morocco-maroc-necropole-merinide.jpg',
        'Route de Chellah, Rabat',
        'HISTORIC',
        34.0150, -6.8310, NOW(), admin_id
    );

    -- 5. Rabat Medina
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        rabat_id,
        'Rabat Medina',
        'The historic old town of Rabat, featuring traditional Moroccan architecture, bustling souks, and the famous Rue des Consuls with its historic diplomatic quarter.',
        'https://www.story-rabat.com/wp-content/uploads/2025/02/View-of-Rabat-Medina.webp',
        'Medina, Rabat',
        'HISTORIC',
        34.0250, -6.8350, NOW(), admin_id
    );

    -- 6. Royal Palace of Rabat
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        rabat_id,
        'Royal Palace of Rabat',
        'The official residence of the King of Morocco, featuring impressive golden gates, beautiful gardens, and stunning Moroccan architecture.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTD64fh4YOfefRR2GMps82UtSohVegW6S8sPA&s',
        'Rue Sharif, Mechouar, Rabat',
        'LANDMARK',
        34.0200, -6.8370, NOW(), admin_id
    );

    -- 7. Mohammed VI Museum of Modern and Contemporary Art
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        rabat_id,
        'Mohammed VI Museum of Modern and Contemporary Art',
        'Morocco''s first museum dedicated to modern and contemporary art, housed in a beautifully renovated 1930s building featuring Moroccan and international artists.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS31j4k0FY1PDyWzTwTK5S-q-HxRk1g-IRLA&s',
        'Rue Haj Ahmed Cherkaoui, Rabat',
        'MUSEUM',
        34.0260, -6.8320, NOW(), admin_id
    );

    -- 8. Rabat Beach
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        rabat_id,
        'Rabat Beach',
        'A beautiful urban beach stretching along the Atlantic coast, featuring golden sand, clear waters, and views of the marina and Hassan Tower.',
        'https://www.story-rabat.com/wp-content/uploads/2025/06/rabat-beach-and-marina-from-above.jpg',
        'Avenue de la Plage, Rabat',
        'BEACH',
        34.0160, -6.8450, NOW(), admin_id
    );

    -- 9. Andalusian Gardens
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        rabat_id,
        'Andalusian Gardens',
        'A peaceful oasis within the Kasbah of the Udayas, featuring lush vegetation, fragrant flowers, and traditional Andalusian garden design.',
        'https://egyptunitedtours.com/wp-content/uploads/2025/11/Andalusian-Gardens-RabatThe-Green-Heart-of-Moroccos-Capital.webp',
        'Kasbah des Oudaias, Rabat',
        'PARK',
        34.0185, -6.8425, NOW(), admin_id
    );

    -- 10. Oudaia Gate
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        rabat_id,
        'Oudaia Gate',
        'The magnificent main entrance to the Kasbah of the Udayas, featuring stunning 12th-century Almohad architecture with intricate geometric patterns and decorations.',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuhaaM-vK8jajK1zDIPlmq34l4cX0dm9HFqQ&s',
        'Kasbah des Oudaias, Rabat',
        'LANDMARK',
        34.0180, -6.8415, NOW(), admin_id
    );

    -- 11. Complexe Sportif Prince Moulay Abdellah
    INSERT INTO places (city_id, name, description, image, address, category, latitude, longitude, created_at, created_by)
    VALUES (
        rabat_id,
        'Complexe Sportif Prince Moulay Abdellah',
        'A major multi-purpose sports complex and stadium, one of Morocco''s premier sports venues hosting football matches and major events.',
        'https://sonarges.ma/wp-content/uploads/2024/12/MY-ABDELLAH.webp',
        'Avenue des FAR, Rabat',
        'SPORTS',
        34.0140, -6.8500, NOW(), admin_id
    );

END $$;
