const Database = require('better-sqlite3')
const path = require('path')
const os = require('os')

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'solucao-compras', 'solucao-compras.db')
console.log('Abrindo banco:', dbPath)

const db = new Database(dbPath)
db.pragma('foreign_keys = ON')

// Coleção
const col = db.prepare(`INSERT OR IGNORE INTO colecoes (nome, estacao, ano, status) VALUES (?, ?, ?, ?)`).run('Inverno 2026', 'inverno', 2026, 'em_compra')
const colId = col.lastInsertRowid || db.prepare(`SELECT id FROM colecoes WHERE nome = ?`).get('Inverno 2026').id

// Fornecedores (64 — coleção 2026/1)
const insertForn = db.prepare(`INSERT OR IGNORE INTO fornecedores (nome, contato, categoria) VALUES (?, ?, ?)`)
const fornecedores = [
  ['APPLICATO',        'CONFECCOES'],
  ['AQUECCE',          'CONFECCOES'],
  ['AUTENTICADA',      'CONFECCOES'],
  ['BALBOA',           'CONFECCOES'],
  ['BICHO BAGUNCA',    'CONFECCOES'],
  ['BIOGAS',           'CONFECCOES'],
  ['BLUE MACAW',       'CONFECCOES'],
  ['BRUNA',            'CONFECCOES'],
  ['CATOLELE',         'CONFECCOES'],
  ['CAW',              'CONFECCOES'],
  ['CIA CORPO',        'CONFECCOES'],
  ['COSTAO',           'CONFECCOES'],
  ['COTTON E COTTON',  'CONFECCOES'],
  ['CROCKER',          'CONFECCOES'],
  ['DANKA',            'CONFECCOES'],
  ['DESAYNER',         'CONFECCOES'],
  ['DIANFA',           'CONFECCOES'],
  ['DIXIE',            'CONFECCOES'],
  ['DOCE GLAMOUR',     'CONFECCOES'],
  ['DOLCE ROSE',       'CONFECCOES'],
  ['ED VERTIDO',       'CONFECCOES'],
  ['ETERNITY',         'CONFECCOES'],
  ['FAKINI',           'CONFECCOES'],
  ['FANIKITUS',        'CONFECCOES'],
  ['FARAELLI',         'CONFECCOES'],
  ['FELICITA',         'CONFECCOES'],
  ['FR TEXTIL',        'CONFECCOES'],
  ['GIRAFFE',          'CONFECCOES'],
  ['HIRLOGS',          'CONFECCOES'],
  ['HUTTZ',            'CONFECCOES'],
  ['IZITEX',           'CONFECCOES'],
  ['LEPOQUE',          'CONFECCOES'],
  ['LOTUS',            'CONFECCOES'],
  ['LUCKYS',           'CONFECCOES'],
  ['LUNENDER',         'CONFECCOES'],
  ['LUSSAN',           'CONFECCOES'],
  ['LZT',              'CONFECCOES'],
  ['MARCO TEXTIL',     'CONFECCOES'],
  ['MARU',             'CONFECCOES'],
  ['MOONCITY',         'CONFECCOES'],
  ['OLHO FATAL',       'CONFECCOES'],
  ['OLIVEIRA MALHAS',  'CONFECCOES'],
  ['OVERCOR',          'CONFECCOES'],
  ['PATY MODAS',       'CONFECCOES'],
  ['RALA KIDS',        'CONFECCOES'],
  ['RCA',              'CONFECCOES'],
  ['ROLU',             'CONFECCOES'],
  ['ROSA BELLA',       'CONFECCOES'],
  ['ROVITEX',          'CONFECCOES'],
  ['SBA',              'CONFECCOES'],
  ['SEA BRAZIL',       'CONFECCOES'],
  ['SFIGMOS',          'CONFECCOES'],
  ['SHILMAR',          'CONFECCOES'],
  ['SIGOSTA',          'CONFECCOES'],
  ['TANISE',           'CONFECCOES'],
  ['TEEZZ',            'CONFECCOES'],
  ['TILE SUL',         'CONFECCOES'],
  ['TRAJADINHOS',      'CONFECCOES'],
  ['TRE FIORI',        'CONFECCOES'],
  ['URBAN CITY',       'CONFECCOES'],
  ['VIVA VIDA',        'CONFECCOES'],
  ['GANGSTER',         'ACESSORIOS'],
  ['MORMAII',          'CALCADOS'],
  ['ACONCHEGO DO BEBE','CAMA-MESA-BANHO'],
]
for (const [nome, categoria] of fornecedores) insertForn.run(nome, '', categoria)

// Compradores (8 lojas)
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

// Segmentações (sample — 3 para teste rápido)
const insertSeg = db.prepare(`INSERT OR IGNORE INTO segmentacoes (classificacao, tipo_produto, classe, estacao) VALUES (?, ?, ?, ?)`)
insertSeg.run('AD', 'BERMUDA', 'FEM', 'inverno')
insertSeg.run('AD', 'CALCA', 'MASC', 'inverno')
insertSeg.run('EX', 'BLUSINHA', 'FEM', 'inverno')

function getSegId(cl, tp, cls) {
  return db.prepare(`SELECT id FROM segmentacoes WHERE classificacao=? AND tipo_produto=? AND classe=?`).get(cl, tp, cls).id
}
function getFornId(nome) {
  return db.prepare(`SELECT id FROM fornecedores WHERE nome = ?`).get(nome).id
}

const seg1 = getSegId('AD', 'BERMUDA', 'FEM')
const seg2 = getSegId('AD', 'CALCA', 'MASC')
const seg3 = getSegId('EX', 'BLUSINHA', 'FEM')
const fGang = getFornId('GANGSTER')
const fLun  = getFornId('LUNENDER')

// Projeções
const insertProj = db.prepare(`INSERT OR REPLACE INTO projecoes (segmentacao_id, colecao_id, tamanho, qtd_ajustada) VALUES (?, ?, ?, ?)`)
insertProj.run(seg1, colId, 'P', 50); insertProj.run(seg1, colId, 'M', 80); insertProj.run(seg1, colId, 'G', 60)
insertProj.run(seg2, colId, 'P', 40); insertProj.run(seg2, colId, 'M', 70); insertProj.run(seg2, colId, 'G', 50)
insertProj.run(seg3, colId, 'P', 30); insertProj.run(seg3, colId, 'M', 50); insertProj.run(seg3, colId, 'G', 40)

// Pedidos
const insertPed = db.prepare(`INSERT INTO pedidos (fornecedor_id, colecao_id, segmentacao_id, data_pedido, tamanho, qtd_pedida, valor_unitario) VALUES (?, ?, ?, ?, ?, ?, ?)`)
const pedidos = [
  [fGang, colId, seg1, '2026-05-10', 'P', 30, 45.00],
  [fGang, colId, seg1, '2026-05-10', 'M', 50, 45.00],
  [fGang, colId, seg2, '2026-05-10', 'M', 40, 55.00],
  [fLun,  colId, seg1, '2026-05-12', 'G', 40, 42.00],
  [fLun,  colId, seg3, '2026-05-12', 'P', 25, 38.00],
  [fLun,  colId, seg3, '2026-05-12', 'M', 35, 38.00],
]
for (const p of pedidos) insertPed.run(...p)

console.log('✓ Dados de teste criados:')
console.log('  Coleção: Inverno 2026 (id', colId + ')')
console.log('  64 fornecedores, 8 compradores, 3 segmentações, 6 pedidos')
db.close()
