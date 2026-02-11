-- ============================================================
-- V2: Redesign users table and add role-specific tables
-- ============================================================

-- 1. Alter users table: add new columns
ALTER TABLE users ADD COLUMN full_name VARCHAR(150);
ALTER TABLE users ADD COLUMN email VARCHAR(255);
ALTER TABLE users ADD COLUMN phone VARCHAR(30);
ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Migrate existing data: copy username into email and full_name
UPDATE users SET email = username, full_name = username;

-- Apply NOT NULL and UNIQUE constraints after backfill
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);

-- Drop old columns
ALTER TABLE users DROP COLUMN IF EXISTS username;
ALTER TABLE users DROP COLUMN IF EXISTS enabled;

-- 2. Companies table
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Guides table
CREATE TABLE guides (
    user_id BIGINT PRIMARY KEY,
    guide_type VARCHAR(20) NOT NULL CHECK (guide_type IN ('independent', 'company')),
    company_id BIGINT,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    bio TEXT,
    languages TEXT,
    CONSTRAINT fk_guides_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_guides_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE SET NULL
);

-- 4. Company members table
CREATE TABLE company_members (
    company_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    member_role VARCHAR(20) NOT NULL CHECK (member_role IN ('owner', 'manager', 'agent')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    PRIMARY KEY (company_id, user_id),
    CONSTRAINT fk_company_members_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT fk_company_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 5. Seed default roles
INSERT INTO roles (name) VALUES ('ADMIN') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('CUSTOMER') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('GUIDE') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('COMPANY_OWNER') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('COMPANY_STAFF') ON CONFLICT (name) DO NOTHING;
