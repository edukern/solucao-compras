const Database = require('better-sqlite3')
const path = require('path')
const os = require('os')

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'solucao-compras', 'solucao-compras.db')
console.log('Abrindo banco:', dbPath)

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = OFF')

// Run full migrations (idempotent — safe on any DB state)
db.exec(`
  CREATE TABLE IF NOT EXISTS colecoes (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    nome    TEXT NOT NULL,
    estacao TEXT NOT NULL CHECK(estacao IN ('verao','inverno')),
    ano     INTEGER NOT NULL,
    status  TEXT NOT NULL DEFAULT 'planejamento'
                 CHECK(status IN ('planejamento','em_compra','finalizada'))
  );
  CREATE TABLE IF NOT EXISTS fornecedores (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    nome     TEXT NOT NULL,
    contato  TEXT,
    categoria TEXT
  );
  CREATE TABLE IF NOT EXISTS compradores (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    nome  TEXT NOT NULL,
    cnpj  TEXT,
    cidade TEXT
  );
  CREATE TABLE IF NOT EXISTS grade_historica (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    segmentacao_id INTEGER NOT NULL REFERENCES segmentacoes(id),
    colecao_id     INTEGER NOT NULL REFERENCES colecoes(id),
    tamanho        TEXT NOT NULL,
    ordem          INTEGER NOT NULL DEFAULT 0,
    qtd_comprada   INTEGER NOT NULL DEFAULT 0,
    qtd_vendida    INTEGER NOT NULL DEFAULT 0,
    qtd_estoque    INTEGER NOT NULL DEFAULT 0,
    UNIQUE(segmentacao_id, colecao_id, tamanho)
  );
  CREATE TABLE IF NOT EXISTS projecoes (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    segmentacao_id INTEGER NOT NULL REFERENCES segmentacoes(id),
    colecao_id     INTEGER NOT NULL REFERENCES colecoes(id),
    tamanho        TEXT NOT NULL,
    ordem          INTEGER NOT NULL DEFAULT 0,
    qtd_projetada  INTEGER NOT NULL DEFAULT 0,
    qtd_ajustada   INTEGER NOT NULL DEFAULT 0,
    metodo         TEXT NOT NULL DEFAULT 'media_simples'
                        CHECK(metodo IN ('media_simples','media_ponderada','manual')),
    UNIQUE(segmentacao_id, colecao_id, tamanho)
  );
`)

// Segmentacoes migration
const segCols = db.pragma('table_info(segmentacoes)').map(c => c.name)
if (!segCols.includes('tipo_grade')) {
  if (segCols.length > 0) {
    db.exec(`
      ALTER TABLE segmentacoes RENAME TO _seg_old;
      CREATE TABLE segmentacoes (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        classificacao TEXT NOT NULL,
        tipo_produto  TEXT NOT NULL,
        classe        TEXT NOT NULL,
        tipo_grade    TEXT NOT NULL DEFAULT 'AD',
        estacao       TEXT NOT NULL,
        UNIQUE(classificacao, tipo_produto, classe, tipo_grade)
      );
      INSERT INTO segmentacoes (id, classificacao, tipo_produto, classe, tipo_grade, estacao)
        SELECT id, classificacao, tipo_produto, classe, 'AD', estacao FROM _seg_old;
      DROP TABLE _seg_old;
    `)
  } else {
    db.exec(`
      CREATE TABLE IF NOT EXISTS segmentacoes (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        classificacao TEXT NOT NULL,
        tipo_produto  TEXT NOT NULL,
        classe        TEXT NOT NULL,
        tipo_grade    TEXT NOT NULL DEFAULT 'AD',
        estacao       TEXT NOT NULL,
        UNIQUE(classificacao, tipo_produto, classe, tipo_grade)
      );
    `)
  }
}

// Drop old flat pedidos if it has tamanho column
const pedCols = db.pragma('table_info(pedidos)').map(c => c.name)
if (pedCols.includes('tamanho')) {
  db.exec(`DROP TABLE IF EXISTS pedidos`)
}

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
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    visita_id      INTEGER NOT NULL REFERENCES visitas(id),
    comprador_id   INTEGER NOT NULL REFERENCES compradores(id),
    segmentacao_id INTEGER NOT NULL REFERENCES segmentacoes(id),
    valor_unitario REAL NOT NULL DEFAULT 0,
    desconto_pct   REAL NOT NULL DEFAULT 0,
    transportadora TEXT,
    nota_fiscal    TEXT,
    obs            TEXT
  );
  CREATE TABLE IF NOT EXISTS pedido_itens (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    tamanho   TEXT NOT NULL,
    qtd       INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_grade_seg_col ON grade_historica(segmentacao_id, colecao_id);
  CREATE INDEX IF NOT EXISTS idx_proj_seg_col  ON projecoes(segmentacao_id, colecao_id);
  CREATE INDEX IF NOT EXISTS idx_visitas_col   ON visitas(colecao_id);
  CREATE INDEX IF NOT EXISTS idx_pedidos_visita ON pedidos(visita_id);
  CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens(pedido_id);
`)
try { db.exec(`ALTER TABLE fornecedores ADD COLUMN categoria TEXT`) } catch {}

db.pragma('foreign_keys = ON')

// Coleção
const col = db.prepare(`INSERT OR IGNORE INTO colecoes (nome, estacao, ano, status) VALUES (?, ?, ?, ?)`).run('Inverno 2026', 'inverno', 2026, 'em_compra')
const colId = col.lastInsertRowid || db.prepare(`SELECT id FROM colecoes WHERE nome = ?`).get('Inverno 2026').id

// Fornecedores (64 — coleção 2026/1)
const insertForn = db.prepare(`INSERT OR IGNORE INTO fornecedores (nome, contato, categoria) VALUES (?, ?, ?)`)
const fornecedores = [
  ['APPLICATO','','CONFECCOES'],['AQUECCE','','CONFECCOES'],['AUTENTICADA','','CONFECCOES'],
  ['BALBOA','','CONFECCOES'],['BICHO BAGUNCA','','CONFECCOES'],['BIOGAS','','CONFECCOES'],
  ['BLUE MACAW','','CONFECCOES'],['BRUNA','','CONFECCOES'],['CATOLELE','','CONFECCOES'],
  ['CAW','','CONFECCOES'],['CIA CORPO','','CONFECCOES'],['COSTAO','','CONFECCOES'],
  ['COTTON E COTTON','','CONFECCOES'],['CROCKER','','CONFECCOES'],['DANKA','','CONFECCOES'],
  ['DESAYNER','','CONFECCOES'],['DIANFA','','CONFECCOES'],['DIXIE','','CONFECCOES'],
  ['DOCE GLAMOUR','','CONFECCOES'],['DOLCE ROSE','','CONFECCOES'],['ED VERTIDO','','CONFECCOES'],
  ['ETERNITY','','CONFECCOES'],['FAKINI','','CONFECCOES'],['FANIKITUS','','CONFECCOES'],
  ['FARAELLI','','CONFECCOES'],['FELICITA','','CONFECCOES'],['FR TEXTIL','','CONFECCOES'],
  ['GIRAFFE','','CONFECCOES'],['HIRLOGS','','CONFECCOES'],['HUTTZ','','CONFECCOES'],
  ['IZITEX','','CONFECCOES'],['LEPOQUE','','CONFECCOES'],['LOTUS','','CONFECCOES'],
  ['LUCKYS','','CONFECCOES'],['LUNENDER','','CONFECCOES'],['LUSSAN','','CONFECCOES'],
  ['LZT','','CONFECCOES'],['MARCO TEXTIL','','CONFECCOES'],['MARU','','CONFECCOES'],
  ['MOONCITY','','CONFECCOES'],['OLHO FATAL','','CONFECCOES'],['OLIVEIRA MALHAS','','CONFECCOES'],
  ['OVERCOR','','CONFECCOES'],['PATY MODAS','','CONFECCOES'],['RALA KIDS','','CONFECCOES'],
  ['RCA','','CONFECCOES'],['ROLU','','CONFECCOES'],['ROSA BELLA','','CONFECCOES'],
  ['ROVITEX','','CONFECCOES'],['SBA','','CONFECCOES'],['SEA BRAZIL','','CONFECCOES'],
  ['SFIGMOS','','CONFECCOES'],['SHILMAR','','CONFECCOES'],['SIGOSTA','','CONFECCOES'],
  ['TANISE','','CONFECCOES'],['TEEZZ','','CONFECCOES'],['TILE SUL','','CONFECCOES'],
  ['TRAJADINHOS','','CONFECCOES'],['TRE FIORI','','CONFECCOES'],['URBAN CITY','','CONFECCOES'],
  ['VIVA VIDA','','CONFECCOES'],['GANGSTER','','ACESSORIOS'],['MORMAII','','CALCADOS'],
  ['ACONCHEGO DO BEBE','','CAMA-MESA-BANHO'],
]
for (const [nome, contato, categoria] of fornecedores) insertForn.run(nome, contato, categoria)

// Compradores
const insertComp = db.prepare(`INSERT OR IGNORE INTO compradores (nome, cnpj, cidade) VALUES (?, ?, ?)`)
const compradores = [
  ['Irmãos Backes',       '08.889.201/0001-01', 'Três Coroas/RS'],
  ['Samuel Paulo Backes', '15.563.106/0001-70', 'Três Coroas/RS'],
  ['PSM Backes',          '28.010.922/0001-07', 'Igrejinha/RS'],
  ['Alexandre Backes',    '06.284.903/0001-28', ''],
  ['Elisangela M. Backes','13.706.244/0001-36', 'Santa Maria do Herval/RS'],
  ['Rafael J. Backes',    '46.348.002/0001-77', 'Rolante/RS'],
  ['Streit Conf',         '10.206.469/0001-35', 'Riozinho/RS'],
  ['FMV Streit Conf',     '20.354.516/0001-41', 'Rolante/RS'],
]
for (const [nome, cnpj, cidade] of compradores) insertComp.run(nome, cnpj, cidade)

// Segmentações (inclui tipo_grade)
const insertSeg = db.prepare(`INSERT OR IGNORE INTO segmentacoes (classificacao, tipo_produto, classe, tipo_grade, estacao) VALUES (?, ?, ?, ?, ?)`)
insertSeg.run('AD', 'BERMUDA', 'FEM',  'AD',  'inverno')
insertSeg.run('AD', 'CALCA',   'MASC', 'AD',  'inverno')
insertSeg.run('EX', 'BLUSINHA','FEM',  'EX',  'inverno')
insertSeg.run('INF','VESTIDO', 'FEM',  'INF', 'inverno')

function getSegId(cl, tp, cls) {
  return db.prepare(`SELECT id FROM segmentacoes WHERE classificacao=? AND tipo_produto=? AND classe=?`).get(cl, tp, cls).id
}
function getFornId(nome) {
  return db.prepare(`SELECT id FROM fornecedores WHERE nome = ?`).get(nome).id
}
function getCompId(nome) {
  return db.prepare(`SELECT id FROM compradores WHERE nome = ?`).get(nome).id
}

const seg1 = getSegId('AD', 'BERMUDA', 'FEM')
const seg2 = getSegId('AD', 'CALCA',   'MASC')
const seg3 = getSegId('EX', 'BLUSINHA','FEM')
const fLun  = getFornId('LUNENDER')
const cIrm  = getCompId('Irmãos Backes')
const cSam  = getCompId('Samuel Paulo Backes')

// Projeções
const insertProj = db.prepare(`INSERT OR REPLACE INTO projecoes (segmentacao_id, colecao_id, tamanho, qtd_ajustada) VALUES (?, ?, ?, ?)`)
insertProj.run(seg1, colId, 'PP', 50); insertProj.run(seg1, colId, 'P', 80); insertProj.run(seg1, colId, 'M', 60); insertProj.run(seg1, colId, 'G', 40); insertProj.run(seg1, colId, 'GG', 20); insertProj.run(seg1, colId, 'XG', 10)
insertProj.run(seg2, colId, 'PP', 40); insertProj.run(seg2, colId, 'P', 70); insertProj.run(seg2, colId, 'M', 50); insertProj.run(seg2, colId, 'G', 30); insertProj.run(seg2, colId, 'GG', 20); insertProj.run(seg2, colId, 'XG', 10)
insertProj.run(seg3, colId, 'G1', 30); insertProj.run(seg3, colId, 'G2', 40); insertProj.run(seg3, colId, 'G3', 35)

// Visita de exemplo
const visita = db.prepare(`INSERT INTO visitas (fornecedor_id, colecao_id, data_visita, vendedor, cond_pag, frete, obs) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(fLun, colId, '2026-05-17', 'Maria', '30/60 dias', 'CIF', '')
const visitaId = visita.lastInsertRowid

// Pedidos com pedido_itens
const insertPed = db.prepare(`INSERT INTO pedidos (visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct, transportadora, nota_fiscal, obs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
const insertItem = db.prepare(`INSERT INTO pedido_itens (pedido_id, tamanho, qtd) VALUES (?, ?, ?)`)

const pedIrm = insertPed.run(visitaId, cIrm, seg1, 45.00, 0, '', '', '').lastInsertRowid
insertItem.run(pedIrm, 'PP', 10); insertItem.run(pedIrm, 'P', 20); insertItem.run(pedIrm, 'M', 15); insertItem.run(pedIrm, 'G', 10)

const pedSam = insertPed.run(visitaId, cSam, seg1, 45.00, 0, '', '', '').lastInsertRowid
insertItem.run(pedSam, 'PP', 5); insertItem.run(pedSam, 'P', 8); insertItem.run(pedSam, 'M', 6); insertItem.run(pedSam, 'G', 4)

const pedSam2 = insertPed.run(visitaId, cSam, seg2, 55.00, 5, '', '', '').lastInsertRowid
insertItem.run(pedSam2, 'P', 12); insertItem.run(pedSam2, 'M', 18); insertItem.run(pedSam2, 'G', 10)

console.log('✓ Dados de teste criados:')
console.log('  Coleção: Inverno 2026 (id', colId + ')')
console.log('  64 fornecedores, 8 compradores, 4 segmentações')
console.log('  1 visita com 3 pedidos (Irmãos Backes + Samuel x2)')
db.close()
