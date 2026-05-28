-- supabase/migrations/016_compradores_pdf_info.sql
-- Campos adicionais dos compradores para cabeçalho do PDF de pedido
ALTER TABLE compradores
  ADD COLUMN IF NOT EXISTS fantasia  TEXT,
  ADD COLUMN IF NOT EXISTS ie        TEXT,
  ADD COLUMN IF NOT EXISTS email     TEXT,
  ADD COLUMN IF NOT EXISTS telefone  TEXT,
  ADD COLUMN IF NOT EXISTS endereco  TEXT;
