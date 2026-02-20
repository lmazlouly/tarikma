CREATE TABLE bookings (
    id                  BIGSERIAL PRIMARY KEY,
    circuit_session_id  BIGINT NOT NULL REFERENCES circuit_sessions(id) ON DELETE CASCADE,
    user_id             BIGINT NOT NULL REFERENCES users(id),
    stripe_checkout_id  VARCHAR(255),
    stripe_payment_id   VARCHAR(255),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    amount_mad          NUMERIC(10,2) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    paid_at             TIMESTAMP WITH TIME ZONE,
    UNIQUE(circuit_session_id, user_id)
);

CREATE INDEX idx_bookings_session ON bookings(circuit_session_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_stripe_checkout ON bookings(stripe_checkout_id);
