-- Migration 013: Projeções individualizadas por comprador
-- A tabela projecoes não tinha comprador_id/user_id, então todos os compradores
-- compartilhavam o mesmo conjunto de projeções. Esta migration adiciona as colunas
-- e recria o unique constraint para unicidade por comprador.
-- (Seguro: projecoes está vazia — 0 linhas)

-- 1. Adiciona colunas de identidade
ALTER TABLE projecoes
  ADD COLUMN IF NOT EXISTS comprador_id BIGINT REFERENCES compradores(id),
  ADD COLUMN IF NOT EXISTS user_id      UUID   REFERENCES auth.users(id);

-- 2. Remove constraint que não incluía comprador_id
ALTER TABLE projecoes
  DROP CONSTRAINT IF EXISTS projecoes_segmentacao_id_colecao_id_tamanho_key;

-- 3. Adiciona constraint correto incluindo comprador_id
ALTER TABLE projecoes
  ADD CONSTRAINT projecoes_comp_seg_col_tam_key
  UNIQUE (comprador_id, segmentacao_id, colecao_id, tamanho);

-- 4. Tighten write policy: cada usuário só escreve suas próprias projeções
DROP POLICY IF EXISTS auth_write   ON projecoes;
DROP POLICY IF EXISTS "own_write"  ON projecoes;
CREATE POLICY "own_write" ON projecoes
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
