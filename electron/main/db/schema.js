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
    CREATE INDEX IF NOT EXISTS idx_pedidos_visita
      ON pedidos(visita_id);
    CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido
      ON pedido_itens(pedido_id);
  `)
  // idx_visitas_col only applies to the old visitas schema (which had colecao_id);
  // after the deduplication migration below, visitas no longer has that column
  try { db.exec(`CREATE INDEX IF NOT EXISTS idx_visitas_col ON visitas(colecao_id)`) } catch {}

  // Add categoria to fornecedores if upgrading from very old schema
  try { db.exec(`ALTER TABLE fornecedores ADD COLUMN categoria TEXT`) } catch {}

  // Add unique index on fornecedores.nome for idempotent imports
  // If this fails (duplicate names already in DB), imports may create duplicates — log so it's visible
  try {
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_fornecedores_nome ON fornecedores(nome)`)
  } catch (e) {
    console.error('[schema] idx_fornecedores_nome failed — duplicate names in DB:', e.message)
  }

  // Add referencia and icms_pct to pedidos (introduced 2026-05)
  try { db.exec(`ALTER TABLE pedidos ADD COLUMN referencia TEXT`) } catch {}
  try { db.exec(`ALTER TABLE pedidos ADD COLUMN icms_pct REAL NOT NULL DEFAULT 0`) } catch {}

  // Sessoes: groups multiple lojas into a single buying session
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessoes (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(id),
      colecao_id    INTEGER NOT NULL REFERENCES colecoes(id),
      data_visita   TEXT NOT NULL,
      vendedor      TEXT,
      cond_pag      TEXT,
      frete         TEXT,
      obs           TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sessoes_col ON sessoes(colecao_id);
  `)

  // Link visitas to a sessao (nullable — old records unaffected)
  try { db.exec(`ALTER TABLE visitas ADD COLUMN sessao_id INTEGER REFERENCES sessoes(id)`) } catch {}
  // Link visitas to a comprador for per-loja sessions (nullable — old records unaffected)
  try { db.exec(`ALTER TABLE visitas ADD COLUMN comprador_id INTEGER REFERENCES compradores(id)`) } catch {}
  // Transportadora at session level (shown when frete = FOB)
  try { db.exec(`ALTER TABLE sessoes ADD COLUMN transportadora TEXT`) } catch {}

  // app_config must always exist — used by index.js to guard seedInitialData
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  // Deduplicate visitas — remove columns now owned by sessoes
  const visitaCols = db.pragma('table_info(visitas)').map(c => c.name)
  if (visitaCols.includes('fornecedor_id')) {
    // Create new table first, then drop the old one, then rename.
    // This preserves pedidos.visita_id REFERENCES visitas(id) because SQLite only
    // auto-rewrites FK text when we rename the referenced table — by keeping the name
    // "visitas" as the final target, pedidos keeps pointing to the right table.
    // Wrapped in a transaction so a crash mid-migration doesn't leave the DB without a visitas table.

    db.transaction(() => {
      db.exec(`
        CREATE TABLE visitas_new (
          id           INTEGER PRIMARY KEY AUTOINCREMENT,
          sessao_id    INTEGER NOT NULL REFERENCES sessoes(id),
          comprador_id INTEGER NOT NULL REFERENCES compradores(id)
        );

        INSERT INTO visitas_new (id, sessao_id, comprador_id)
          SELECT id, sessao_id, comprador_id
          FROM visitas
          WHERE sessao_id IS NOT NULL AND comprador_id IS NOT NULL;

        DROP TABLE visitas;

        ALTER TABLE visitas_new RENAME TO visitas;

        CREATE INDEX IF NOT EXISTS idx_visitas_sessao ON visitas(sessao_id);
        CREATE INDEX IF NOT EXISTS idx_visitas_comprador ON visitas(comprador_id);
      `)
    })()
  }
}

export function seedInitialData(db) {
  const seedCompradores = db.prepare(
    `INSERT OR IGNORE INTO compradores (nome, cnpj, cidade) VALUES (?, ?, ?)`
  )
  const seedFornecedores = db.prepare(
    `INSERT OR IGNORE INTO fornecedores (nome, contato, categoria) VALUES (?, ?, ?)`
  )
  ;[
    ['Irmãos Backes',        '08.889.201/0001-01', 'Três Coroas/RS'],
    ['Samuel Paulo Backes',  '15.563.106/0001-70', 'Três Coroas/RS'],
    ['PSM Backes',           '28.010.922/0001-07', 'Igrejinha/RS'],
    ['Alexandre Backes',     '06.284.903/0001-28', ''],
    ['Elisangela M. Backes', '13.706.244/0001-36', 'Santa Maria do Herval/RS'],
    ['Rafael J. Backes',     '46.348.002/0001-77', 'Rolante/RS'],
    ['Streit Conf',          '10.206.469/0001-35', 'Riozinho/RS'],
    ['FMV Streit Conf',      '20.354.516/0001-41', 'Rolante/RS'],
  ].forEach(([nome, cnpj, cidade]) => seedCompradores.run(nome, cnpj, cidade))
  ;[
    ['LUNENDER',  '', 'CONFECCOES'],
    ['GANGSTER',  '', 'ACESSORIOS'],
    ['FAKINI',    '', 'CONFECCOES'],
    ['ROVITEX',   '', 'CONFECCOES'],
    ['BIOGAS',    '', 'CONFECCOES'],
    ['CROCKER',   '', 'CONFECCOES'],
    ['HUTTZ',     '', 'CONFECCOES'],
    ['MOONCITY',  '', 'CONFECCOES'],
  ].forEach(([nome, contato, categoria]) => seedFornecedores.run(nome, contato, categoria))
}
