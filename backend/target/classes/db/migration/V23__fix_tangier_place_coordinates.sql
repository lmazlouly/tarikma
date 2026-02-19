-- ============================================================
-- V23: Fix incorrect coordinates for Tangier places
-- ============================================================

-- V10 places
UPDATE places SET latitude = 35.7839, longitude = -5.8131 WHERE name = 'Grand Socco (Place 9 Avril 1947)';
UPDATE places SET latitude = 35.7915, longitude = -5.8218 WHERE name = 'Café Hafa';
UPDATE places SET latitude = 35.8006, longitude = -5.9061 WHERE name = 'Cap Spartel';
UPDATE places SET latitude = 35.7603, longitude = -5.9392 WHERE name = 'Hercules Caves';
UPDATE places SET latitude = 35.7907, longitude = -5.8549 WHERE name = 'Rmilat Park (Parc Perdicaris)';
UPDATE places SET latitude = 35.7843, longitude = -5.8131 WHERE name = 'Mendoubia Gardens';
UPDATE places SET latitude = 35.7640, longitude = -5.9340 WHERE name = 'Achakar Beach';

-- V21 places
UPDATE places SET latitude = 35.7825, longitude = -5.8125 WHERE name = 'Saveur de Poisson';
UPDATE places SET latitude = 35.7893, longitude = -5.8130 WHERE name = 'Le Salon Bleu';
UPDATE places SET latitude = 35.7830, longitude = -5.8100 WHERE name = 'La Fabrique';
UPDATE places SET latitude = 35.7700, longitude = -5.7990 WHERE name = 'Hilton Tangier City Center';
UPDATE places SET latitude = 35.7878, longitude = -5.8073 WHERE name = 'Hotel Continental';
UPDATE places SET latitude = 35.7839, longitude = -5.8108 WHERE name = 'American Legation Museum';
UPDATE places SET latitude = 35.7837, longitude = -5.8132 WHERE name = 'Sidi Bou Abib Mosque';
UPDATE places SET latitude = 35.7785, longitude = -5.7774 WHERE name = 'Malabata Beach';
UPDATE places SET latitude = 35.7843, longitude = -5.8131 WHERE name = 'Parc de la Mendoubia';
UPDATE places SET latitude = 35.7835, longitude = -5.8115 WHERE name = 'Souk Barra';
UPDATE places SET latitude = 35.7700, longitude = -5.7854 WHERE name = 'Tangier Ville Train Station';
UPDATE places SET latitude = 35.7228, longitude = -5.9168 WHERE name = 'Tangier Ibn Battouta Airport';
