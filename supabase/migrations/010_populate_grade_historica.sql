-- Migration 010: Populate colecoes + grade_historica from hist_grade
--
-- hist_grade uses text colecao_id format: 'YYYY-N' (e.g. '2026-1')
--   N=1 → estacao='verao', N=2 → estacao='inverno'
-- grade_historica uses bigint FK to colecoes.id
--
-- This migration:
--   1. Creates one colecao row per distinct colecao_id in hist_grade
--   2. Populates grade_historica with qtd_total_comprada + standard size ordering

-- ── Step 1: Insert historical colecoes ──────────────────────────────────────
WITH src AS (
  SELECT DISTINCT
    colecao_id,
    LPAD((split_part(colecao_id, '-', 1)::int % 100)::text, 2, '0')
      || '/' || split_part(colecao_id, '-', 2)        AS nome,
    CASE split_part(colecao_id, '-', 2)
      WHEN '1' THEN 'verao'
      ELSE          'inverno'
    END                                                AS estacao,
    split_part(colecao_id, '-', 1)::int                AS ano
  FROM hist_grade
)
INSERT INTO colecoes (nome, estacao, ano, status)
SELECT nome, estacao, ano, 'finalizada'
FROM src
WHERE nome NOT IN (SELECT nome FROM colecoes);

-- ── Step 2: Populate grade_historica ────────────────────────────────────────
INSERT INTO grade_historica
  (segmentacao_id, colecao_id, tamanho, qtd_comprada, qtd_vendida, qtd_estoque, ordem)
SELECT
  hg.segmentacao_id,
  c.id                   AS colecao_id,
  hg.tamanho,
  hg.qtd_total_comprada  AS qtd_comprada,
  0                      AS qtd_vendida,
  0                      AS qtd_estoque,
  CASE hg.tamanho
    WHEN 'RN'  THEN  0
    WHEN '1'   THEN  1   WHEN '2'   THEN  2   WHEN '3'   THEN  3
    WHEN '4'   THEN  4   WHEN '5'   THEN  5   WHEN '6'   THEN  6
    WHEN '7'   THEN  7   WHEN '8'   THEN  8   WHEN '9'   THEN  9
    WHEN '10'  THEN 10   WHEN '12'  THEN 12   WHEN '14'  THEN 14
    WHEN '16'  THEN 16   WHEN '18'  THEN 18   WHEN '20'  THEN 20
    WHEN 'G1'  THEN 21   WHEN 'G2'  THEN 22   WHEN 'G3'  THEN 23
    WHEN 'G4'  THEN 24   WHEN 'G5'  THEN 25   WHEN 'G6'  THEN 26
    WHEN 'G7'  THEN 27   WHEN 'G8'  THEN 28   WHEN 'G9'  THEN 29
    WHEN 'G10' THEN 30
    WHEN 'PP'  THEN 40   WHEN 'P'   THEN 41   WHEN 'M'   THEN 42
    WHEN 'G'   THEN 43   WHEN 'GG'  THEN 44   WHEN 'XG'  THEN 45
    WHEN '34'  THEN 50   WHEN '36'  THEN 52   WHEN '38'  THEN 54
    WHEN '40'  THEN 56   WHEN '42'  THEN 58   WHEN '44'  THEN 60
    WHEN '46'  THEN 62   WHEN '48'  THEN 64   WHEN '50'  THEN 66
    WHEN '52'  THEN 68   WHEN '54'  THEN 70   WHEN '56'  THEN 72
    WHEN '58'  THEN 74   WHEN '60'  THEN 76   WHEN '62'  THEN 78
    WHEN '64'  THEN 80   WHEN 'F'   THEN 90   WHEN 'U'   THEN 91
    ELSE 99
  END                    AS ordem
FROM hist_grade hg
JOIN colecoes c
  ON c.nome = LPAD((split_part(hg.colecao_id, '-', 1)::int % 100)::text, 2, '0')
              || '/' || split_part(hg.colecao_id, '-', 2)
ON CONFLICT (segmentacao_id, colecao_id, tamanho) DO UPDATE
  SET qtd_comprada = EXCLUDED.qtd_comprada,
      ordem        = EXCLUDED.ordem;
