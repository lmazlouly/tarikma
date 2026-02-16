-- ============================================================
-- V6: Replace is_disabled with enabled column
-- The is_disabled column (added in V3) duplicates the original
-- enabled column (V1, dropped in V2/V5). Restore enabled and
-- migrate any data from is_disabled.
-- ============================================================

-- Add enabled column back if it doesn't exist (default TRUE = not disabled)
ALTER TABLE users ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- If is_disabled exists, migrate its data: enabled = NOT is_disabled
UPDATE users SET enabled = NOT is_disabled WHERE TRUE;

-- Drop the redundant is_disabled column
ALTER TABLE users DROP COLUMN IF EXISTS is_disabled;
