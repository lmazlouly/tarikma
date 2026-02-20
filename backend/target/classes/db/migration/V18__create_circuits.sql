CREATE TABLE circuits (
    id BIGSERIAL PRIMARY KEY,
    city_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by BIGINT NOT NULL,
    CONSTRAINT fk_circuits_city FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE CASCADE,
    CONSTRAINT fk_circuits_created_by FOREIGN KEY (created_by) REFERENCES users (id)
);

CREATE INDEX idx_circuits_created_by ON circuits (created_by);
CREATE INDEX idx_circuits_city_id ON circuits (city_id);
CREATE INDEX idx_circuits_created_by_city_id ON circuits (created_by, city_id);

CREATE TABLE circuit_stops (
    id BIGSERIAL PRIMARY KEY,
    circuit_id BIGINT NOT NULL,
    place_id BIGINT NOT NULL,
    position INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_circuit_stops_circuit FOREIGN KEY (circuit_id) REFERENCES circuits (id) ON DELETE CASCADE,
    CONSTRAINT fk_circuit_stops_place FOREIGN KEY (place_id) REFERENCES places (id),
    CONSTRAINT ck_circuit_stops_position_positive CHECK (position > 0),
    CONSTRAINT uq_circuit_stops_circuit_position UNIQUE (circuit_id, position) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX idx_circuit_stops_circuit_id ON circuit_stops (circuit_id);
CREATE INDEX idx_circuit_stops_place_id ON circuit_stops (place_id);

CREATE TABLE circuit_routes (
    id BIGSERIAL PRIMARY KEY,
    circuit_id BIGINT NOT NULL,
    from_stop_id BIGINT NOT NULL,
    to_stop_id BIGINT NOT NULL,
    transport_mode VARCHAR(30),
    distance_km DOUBLE PRECISION,
    duration_minutes INT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_circuit_routes_circuit FOREIGN KEY (circuit_id) REFERENCES circuits (id) ON DELETE CASCADE,
    CONSTRAINT fk_circuit_routes_from_stop FOREIGN KEY (from_stop_id) REFERENCES circuit_stops (id) ON DELETE CASCADE,
    CONSTRAINT fk_circuit_routes_to_stop FOREIGN KEY (to_stop_id) REFERENCES circuit_stops (id) ON DELETE CASCADE,
    CONSTRAINT uq_circuit_routes UNIQUE (circuit_id, from_stop_id, to_stop_id)
);

CREATE INDEX idx_circuit_routes_circuit_id ON circuit_routes (circuit_id);
