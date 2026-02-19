-- ============================================================
-- V8: Create cities, city_names, and places tables
-- ============================================================

-- 1. Cities table
CREATE TABLE cities (
    id          BIGSERIAL PRIMARY KEY,
    region      VARCHAR(100) NOT NULL,
    image       VARCHAR(500),
    description TEXT,
    latitude    DOUBLE PRECISION NOT NULL,
    longitude   DOUBLE PRECISION NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by  BIGINT NOT NULL,
    CONSTRAINT fk_cities_created_by FOREIGN KEY (created_by) REFERENCES users (id)
);

-- 2. City names (multilingual)
CREATE TABLE city_names (
    id            BIGSERIAL PRIMARY KEY,
    city_id       BIGINT NOT NULL,
    language_code VARCHAR(5) NOT NULL,
    name          VARCHAR(200) NOT NULL,
    is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_city_names_city FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE CASCADE,
    CONSTRAINT uq_city_names_city_lang UNIQUE (city_id, language_code)
);

-- 3. Places table
CREATE TABLE places (
    id           BIGSERIAL PRIMARY KEY,
    city_id      BIGINT NOT NULL,
    name         VARCHAR(300) NOT NULL,
    description  TEXT,
    image        VARCHAR(500),
    address      VARCHAR(500),
    category     VARCHAR(100),
    latitude     DOUBLE PRECISION NOT NULL,
    longitude    DOUBLE PRECISION NOT NULL,
    map_place_id VARCHAR(255),
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by   BIGINT NOT NULL,
    CONSTRAINT fk_places_city FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE CASCADE,
    CONSTRAINT fk_places_created_by FOREIGN KEY (created_by) REFERENCES users (id)
);

-- Indexes for common queries
CREATE INDEX idx_city_names_city_id ON city_names (city_id);
CREATE INDEX idx_places_city_id ON places (city_id);
CREATE INDEX idx_places_category ON places (category);
