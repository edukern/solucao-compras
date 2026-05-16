// electron/main/db/schema.js
export function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS colecoes (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      estacao   TEXT NOT NULL CHECK(estacao IN ('verao','inverno')),
      ano       INTEGER NOT NULL,
      status    TEXT NOT NULL DEFAULT 'planejamento'
                     CHECK(status IN ('planejamento','em_compra','finalizada'))
    );

    CREATE TABLE IF NOT EXISTS segmentacoes (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      classificacao   TEXT NOT NULL,
      tipo_produto    TEXT NOT NULL,
      classe          TEXT NOT NULL,
      estacao         TEXT NOT NULL,
      UNIQUE(classificacao, tipo_produto, classe)
    );

    CREATE TABLE IF NOT EXISTS grade_historica (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      segmentacao_id  INTEGER NOT NULL REFERENCES segmentacoes(id),
      colecao_id      INTEGER NOT NULL REFERENCES colecoes(id),
      tamanho         TEXT NOT NULL,
      ordem           INTEGER NOT NULL DEFAULT 0,
      qtd_comprada    INTEGER NOT NULL DEFAULT 0,
      qtd_vendida     INTEGER NOT NULL DEFAULT 0,
      qtd_estoque     INTEGER NOT NULL DEFAULT 0,
      UNIQUE(segmentacao_id, colecao_id, tamanho)
    );

    CREATE TABLE IF NOT EXISTS projecoes (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      segmentacao_id  INTEGER NOT NULL REFERENCES segmentacoes(id),
      colecao_id      INTEGER NOT NULL REFERENCES colecoes(id),
      tamanho         TEXT NOT NULL,
      ordem           INTEGER NOT NULL DEFAULT 0,
      qtd_projetada   INTEGER NOT NULL DEFAULT 0,
      qtd_ajustada    INTEGER NOT NULL DEFAULT 0,
      metodo          TEXT NOT NULL DEFAULT 'media_simples'
                           CHECK(metodo IN ('media_simples','media_ponderada','manual')),
      UNIQUE(segmentacao_id, colecao_id, tamanho)
    );

    CREATE TABLE IF NOT EXISTS fornecedores (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      nome    TEXT NOT NULL,
      contato TEXT
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      fornecedor_id   INTEGER NOT NULL REFERENCES fornecedores(id),
      colecao_id      INTEGER NOT NULL REFERENCES colecoes(id),
      segmentacao_id  INTEGER NOT NULL REFERENCES segmentacoes(id),
      data_pedido     TEXT NOT NULL,
      tamanho         TEXT NOT NULL,
      qtd_pedida      INTEGER NOT NULL DEFAULT 0,
      valor_unitario  REAL NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_grade_seg_col
      ON grade_historica(segmentacao_id, colecao_id);
    CREATE INDEX IF NOT EXISTS idx_proj_seg_col
      ON projecoes(segmentacao_id, colecao_id);
    CREATE INDEX IF NOT EXISTS idx_pedidos_col
      ON pedidos(colecao_id);
    CREATE INDEX IF NOT EXISTS idx_pedidos_seg_col
      ON pedidos(segmentacao_id, colecao_id);
  `)
}
