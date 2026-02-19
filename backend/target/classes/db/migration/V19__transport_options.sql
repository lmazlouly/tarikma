CREATE TABLE transport_options (
    id BIGSERIAL PRIMARY KEY,
    from_place_id BIGINT NOT NULL,
    to_place_id BIGINT NOT NULL,
    mode VARCHAR(30) NOT NULL,
    name VARCHAR(200),
    description TEXT,
    is_bidirectional BOOLEAN NOT NULL DEFAULT FALSE,
    pricing_type VARCHAR(20) NOT NULL,
    price_mad DOUBLE PRECISION,
    price_per_km_mad DOUBLE PRECISION,
    currency VARCHAR(3) NOT NULL DEFAULT 'MAD',
    service_start_time TIME,
    service_end_time TIME,
    distance_km DOUBLE PRECISION,
    duration_minutes INT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by BIGINT NOT NULL,
    CONSTRAINT fk_transport_options_from_place FOREIGN KEY (from_place_id) REFERENCES places (id) ON DELETE CASCADE,
    CONSTRAINT fk_transport_options_to_place FOREIGN KEY (to_place_id) REFERENCES places (id) ON DELETE CASCADE,
    CONSTRAINT fk_transport_options_created_by FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT ck_transport_options_from_to_diff CHECK (from_place_id <> to_place_id),
    CONSTRAINT ck_transport_options_pricing_type CHECK (pricing_type IN ('PER_PERSON', 'PER_RIDE', 'PER_KM', 'FREE', 'UNKNOWN'))
);

CREATE INDEX idx_transport_options_from_place_id ON transport_options (from_place_id);
CREATE INDEX idx_transport_options_to_place_id ON transport_options (to_place_id);
CREATE INDEX idx_transport_options_mode ON transport_options (mode);

ALTER TABLE circuit_routes
    ADD COLUMN transport_option_id BIGINT;

ALTER TABLE circuit_routes
    ADD CONSTRAINT fk_circuit_routes_transport_option
    FOREIGN KEY (transport_option_id) REFERENCES transport_options (id);

CREATE INDEX idx_circuit_routes_transport_option_id ON circuit_routes (transport_option_id);
