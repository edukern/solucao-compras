-- supabase/migrations/004_data_entrega_sessoes.sql
ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS data_entrega DATE;
