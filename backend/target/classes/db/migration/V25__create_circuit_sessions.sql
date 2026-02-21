CREATE TABLE circuit_sessions (
    id              BIGSERIAL PRIMARY KEY,
    circuit_id      BIGINT NOT NULL REFERENCES circuits(id) ON DELETE CASCADE,
    start_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date_time   TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    notes           TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_circuit_sessions_circuit_id ON circuit_sessions(circuit_id);
CREATE INDEX idx_circuit_sessions_start ON circuit_sessions(start_date_time);
