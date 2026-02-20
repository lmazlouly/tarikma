ALTER TABLE circuit_stops
    ADD COLUMN day_number INT;

ALTER TABLE circuit_stops
    ADD COLUMN stop_kind VARCHAR(20);

ALTER TABLE circuit_stops
    ADD COLUMN meal_type VARCHAR(20);

ALTER TABLE circuit_stops
    ADD COLUMN start_time TIME;

ALTER TABLE circuit_stops
    ADD COLUMN end_time TIME;

ALTER TABLE circuit_stops
    ADD CONSTRAINT ck_circuit_stops_day_number CHECK (day_number IS NULL OR day_number > 0);

ALTER TABLE circuit_stops
    ADD CONSTRAINT ck_circuit_stops_stop_kind CHECK (stop_kind IS NULL OR stop_kind IN ('VISIT', 'EAT', 'SLEEP', 'TRANSPORT'));

ALTER TABLE circuit_stops
    ADD CONSTRAINT ck_circuit_stops_meal_type CHECK (meal_type IS NULL OR meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER'));

ALTER TABLE circuit_stops
    ADD CONSTRAINT ck_circuit_stops_meal_type_requires_eat CHECK (meal_type IS NULL OR stop_kind = 'EAT');

ALTER TABLE circuit_stops
    ADD CONSTRAINT ck_circuit_stops_time_window CHECK (start_time IS NULL OR end_time IS NULL OR start_time < end_time);

CREATE INDEX idx_circuit_stops_circuit_id_day_number ON circuit_stops (circuit_id, day_number);
