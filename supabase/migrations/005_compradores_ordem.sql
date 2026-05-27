-- supabase/migrations/005_compradores_ordem.sql
-- Renomeia 5 compradores e define ordem de exibição
ALTER TABLE compradores
  ADD COLUMN IF NOT EXISTS ordem INTEGER NOT NULL DEFAULT 0;

-- Renomear os 5 que mudam de nome
UPDATE compradores SET nome = 'Backes Art. Vestuário'  WHERE id = 1;
UPDATE compradores SET nome = 'Backes Programação 1'   WHERE id = 2;
UPDATE compradores SET nome = 'Backes Programação 2'   WHERE id = 3;
UPDATE compradores SET nome = 'Rafael Filial 2'        WHERE id = 4;
UPDATE compradores SET nome = 'Rafael Filial 1'        WHERE id = 5;
-- IDs 6, 7, 8 mantêm nomes atuais (Rafael J. Backes, Streit Conf, FMV Streit Conf)

-- Definir ordem de exibição
UPDATE compradores SET ordem = 1 WHERE id = 1;
UPDATE compradores SET ordem = 2 WHERE id = 2;
UPDATE compradores SET ordem = 3 WHERE id = 3;
UPDATE compradores SET ordem = 4 WHERE id = 6;
UPDATE compradores SET ordem = 5 WHERE id = 5;
UPDATE compradores SET ordem = 6 WHERE id = 4;
UPDATE compradores SET ordem = 7 WHERE id = 7;
UPDATE compradores SET ordem = 8 WHERE id = 8;

CREATE INDEX IF NOT EXISTS compradores_ordem_idx ON compradores(ordem);
