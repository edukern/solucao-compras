-- Migration 009: per-store cond_pag / frete / transportadora overrides
-- Adds nullable override columns to visitas so each store can have different
-- payment/freight terms within the same purchase session.
-- When NULL, the UI falls back to the session-level values from the sessoes table.

ALTER TABLE visitas ADD COLUMN IF NOT EXISTS cond_pag TEXT;
ALTER TABLE visitas ADD COLUMN IF NOT EXISTS frete TEXT;
ALTER TABLE visitas ADD COLUMN IF NOT EXISTS transportadora TEXT;
