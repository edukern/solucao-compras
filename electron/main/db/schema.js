export function runMigrations(db) {
  // Base tables — unchanged
  db.exec(`
    CREATE TABLE IF NOT EXISTS colecoes (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      estacao   TEXT NOT NULL CHECK(estacao IN ('verao','inverno')),
      ano       INTEGER NOT NULL,
      status    TEXT NOT NULL DEFAULT 'planejamento'
                     CHECK(status IN ('planejamento','em_compra','finalizada'))
    );

    CREATE TABLE IF NOT EXISTS fornecedores (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      contato   TEXT,
      categoria TEXT
    );

    CREATE TABLE IF NOT EXISTS compradores (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      nome    TEXT NOT NULL,
      cnpj    TEXT,
      cidade  TEXT
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
  `)

  // Segmentacoes: recreate if tipo_grade is missing
  const segCols = db.pragma('table_info(segmentacoes)').map(c => c.name)
  if (!segCols.includes('tipo_grade')) {
    if (segCols.length > 0) {
      // Migrate existing rows — copy with default tipo_grade 'AD'
      db.exec(`
        ALTER TABLE segmentacoes RENAME TO _seg_old;
        CREATE TABLE segmentacoes (
          id              INTEGER PRIMARY KEY AUTOINCREMENT,
          classificacao   TEXT NOT NULL,
          tipo_produto    TEXT NOT NULL,
          classe          TEXT NOT NULL,
          tipo_grade      TEXT NOT NULL DEFAULT 'AD',
          estacao         TEXT NOT NULL,
          UNIQUE(classificacao, tipo_produto, classe, tipo_grade)
        );
        INSERT INTO segmentacoes (id, classificacao, tipo_produto, classe, tipo_grade, estacao)
          SELECT id, classificacao, tipo_produto, classe, 'AD', estacao FROM _seg_old;
        DROP TABLE _seg_old;
      `)
    } else {
      db.exec(`
        CREATE TABLE IF NOT EXISTS segmentacoes (
          id              INTEGER PRIMARY KEY AUTOINCREMENT,
          classificacao   TEXT NOT NULL,
          tipo_produto    TEXT NOT NULL,
          classe          TEXT NOT NULL,
          tipo_grade      TEXT NOT NULL DEFAULT 'AD',
          estacao         TEXT NOT NULL,
          UNIQUE(classificacao, tipo_produto, classe, tipo_grade)
        );
      `)
    }
  }

  // Drop old flat pedidos if it has tamanho column (old schema)
  const pedCols = db.pragma('table_info(pedidos)').map(c => c.name)
  if (pedCols.includes('tamanho')) {
    db.exec(`DROP TABLE IF EXISTS pedidos`)
  }

  // New purchase tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS visitas (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(id),
      colecao_id    INTEGER NOT NULL REFERENCES colecoes(id),
      data_visita   TEXT NOT NULL,
      vendedor      TEXT,
      cond_pag      TEXT,
      frete         TEXT,
      obs           TEXT
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      visita_id       INTEGER NOT NULL REFERENCES visitas(id),
      comprador_id    INTEGER NOT NULL REFERENCES compradores(id),
      segmentacao_id  INTEGER NOT NULL REFERENCES segmentacoes(id),
      valor_unitario  REAL NOT NULL DEFAULT 0,
      desconto_pct    REAL NOT NULL DEFAULT 0,
      transportadora  TEXT,
      nota_fiscal     TEXT,
      obs             TEXT
    );

    CREATE TABLE IF NOT EXISTS pedido_itens (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
      tamanho   TEXT NOT NULL,
      qtd       INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_grade_seg_col
      ON grade_historica(segmentacao_id, colecao_id);
    CREATE INDEX IF NOT EXISTS idx_proj_seg_col
      ON projecoes(segmentacao_id, colecao_id);
    CREATE INDEX IF NOT EXISTS idx_visitas_col
      ON visitas(colecao_id);
    CREATE INDEX IF NOT EXISTS idx_pedidos_visita
      ON pedidos(visita_id);
    CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido
      ON pedido_itens(pedido_id);
  `)

  // Add categoria to fornecedores if upgrading from very old schema
  try { db.exec(`ALTER TABLE fornecedores ADD COLUMN categoria TEXT`) } catch {}
}
