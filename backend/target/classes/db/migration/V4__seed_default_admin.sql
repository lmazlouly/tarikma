-- V4: Seed default admin user

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure ADMIN role exists
INSERT INTO roles (name) VALUES ('ADMIN') ON CONFLICT (name) DO NOTHING;

-- Seed default admin user
INSERT INTO users (
    enabled,
    password_hash,
    username,
    phone,
    created_at,
    email,
    full_name,
    is_verified
)
VALUES (
    TRUE,
    crypt('tarikma1234', gen_salt('bf')),
    'admin@tarik.ma',
    '',
    NOW(),
    'admin@tarik.ma',
    'Super Admin',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Assign ADMIN role to default admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ADMIN'
WHERE u.email = 'admin@tarik.ma'
ON CONFLICT (user_id, role_id) DO NOTHING;
