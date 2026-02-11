-- V4: Cleanup legacy columns that may still exist from older user schema

-- These columns were part of the initial schema (V1) but are no longer used by the current User entity.
-- Some databases may still have them depending on migration history / manual changes.

ALTER TABLE users DROP COLUMN IF EXISTS enabled;
ALTER TABLE users DROP COLUMN IF EXISTS username;
