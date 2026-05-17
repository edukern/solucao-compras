import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { runMigrations } from '../electron/main/db/schema.js'
import { makeSessoes } from '../electron/main/db/sessoes.js'
import { makePedidos } from '../electron/main/db/pedidos.js'
import { makeProjecoes } from '../electron/main/db/projecoes.js'

function freshDb() {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  db.pragma('journal_mode = WAL')
  runMigrations(db)
  return db
}

function seed(db) {
  const forn = db.prepare(`INSERT INTO fornecedores (nome) VALUES (?)`).run('Fornecedor A')
  const col  = db.prepare(`INSERT INTO colecoes (nome, estacao, ano) VALUES (?, ?, ?)`).run('VR2025', 'verao', 2025)
  const comp1 = db.prepare(`INSERT INTO compradores (nome, cnpj, cidade) VALUES (?, ?, ?)`).run('Loja 1', '00.000.000/0001-00', 'Porto Alegre')
  const comp2 = db.prepare(`INSERT INTO compradores (nome, cnpj, cidade) VALUES (?, ?, ?)`).run('Loja 2', '11.111.111/0001-11', 'Caxias do Sul')
  const seg  = db.prepare(`INSERT INTO segmentacoes (classificacao, tipo_produto, classe, tipo_grade, estacao) VALUES (?, ?, ?, ?, ?)`).run('AD', 'Calça', 'Jeans', 'AD', 'verao')
  return {
    fornId: Number(forn.lastInsertRowid),
    colId:  Number(col.lastInsertRowid),
    compIds: [Number(comp1.lastInsertRowid), Number(comp2.lastInsertRowid)],
    segId:  Number(seg.lastInsertRowid),
  }
}

// ─── Schema ─────────────────────────────────────────────────────────────────

describe('runMigrations', () => {
  it('cria todas as tabelas sem erro', () => {
    const db = freshDb()
    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all().map(r => r.name)
    for (const t of ['colecoes', 'fornecedores', 'compradores', 'segmentacoes',
                     'grade_historica', 'projecoes', 'sessoes', 'visitas', 'pedidos', 'pedido_itens']) {
      expect(tables).toContain(t)
    }
  })

  it('é idempotente: rodar duas vezes não lança erro', () => {
    const db = new Database(':memory:')
    db.pragma('foreign_keys = ON')
    expect(() => { runMigrations(db); runMigrations(db) }).not.toThrow()
  })
})

// ─── Sessoes ─────────────────────────────────────────────────────────────────

describe('makeSessoes', () => {
  let db, sess, ids

  beforeEach(() => {
    db   = freshDb()
    sess = makeSessoes(db)
    ids  = seed(db)
  })

  it('create: cria sessão e retorna com N visitas', () => {
    const result = sess.create({
      fornecedor_id: ids.fornId, colecao_id: ids.colId, data_visita: '2025-08-01',
      vendedor: 'Joao', cond_pag: '30/60', frete: 'CIF', obs: ''
    }, ids.compIds)

    expect(result.id).toBeGreaterThan(0)
    expect(result.fornecedor_nome).toBe('Fornecedor A')
    expect(result.visitas).toHaveLength(2)
    expect(result.visitas.map(v => v.comprador_id).sort()).toEqual(ids.compIds.slice().sort())
  })

  it('list: retorna sessões da coleção com visitas', () => {
    sess.create({ fornecedor_id: ids.fornId, colecao_id: ids.colId, data_visita: '2025-08-01' }, ids.compIds)
    const list = sess.list(ids.colId)
    expect(list).toHaveLength(1)
    expect(list[0].visitas).toHaveLength(2)
  })

  it('getById: retorna null para ID inexistente', () => {
    expect(sess.getById(9999)).toBeNull()
  })

  it('update: atualiza campos da sessão', () => {
    const created = sess.create({ fornecedor_id: ids.fornId, colecao_id: ids.colId, data_visita: '2025-08-01' }, ids.compIds)
    sess.update(created.id, { data_visita: '2025-09-15', vendedor: 'Maria', cond_pag: '60', frete: 'FOB', obs: 'test' })
    const updated = sess.getById(created.id)
    expect(updated.data_visita).toBe('2025-09-15')
    expect(updated.vendedor).toBe('Maria')
    expect(updated.frete).toBe('FOB')
  })

  it('cancelar: remove sessão, visitas e pedidos em cascata', () => {
    const ped = makePedidos(db)
    const created = sess.create({ fornecedor_id: ids.fornId, colecao_id: ids.colId, data_visita: '2025-08-01' }, ids.compIds)
    const visitaId = created.visitas[0].visita_id

    ped.salvar({
      visita_id: visitaId, comprador_id: ids.compIds[0], segmentacao_id: ids.segId,
      valor_unitario: 50, itens: [{ tamanho: 'P', qtd: 10 }, { tamanho: 'M', qtd: 20 }]
    })

    sess.cancelar(created.id)

    expect(sess.getById(created.id)).toBeNull()
    const visitas = db.prepare(`SELECT * FROM visitas WHERE sessao_id = ?`).all(created.id)
    expect(visitas).toHaveLength(0)
    const pedidos = db.prepare(`SELECT * FROM pedidos WHERE visita_id = ?`).all(visitaId)
    expect(pedidos).toHaveLength(0)
    const itens = db.prepare(`SELECT * FROM pedido_itens WHERE pedido_id NOT IN (SELECT id FROM pedidos)`).all()
    expect(itens).toHaveLength(0)
  })
})

// ─── Pedidos ─────────────────────────────────────────────────────────────────

describe('makePedidos', () => {
  let db, ped, ids, visitaId

  beforeEach(() => {
    db  = freshDb()
    ped = makePedidos(db)
    ids = seed(db)
    const sess    = makeSessoes(db)
    const created = sess.create({ fornecedor_id: ids.fornId, colecao_id: ids.colId, data_visita: '2025-08-01' }, ids.compIds)
    visitaId = created.visitas[0].visita_id
  })

  it('salvar: persiste pedido e retorna com itens', () => {
    const result = ped.salvar({
      visita_id: visitaId, comprador_id: ids.compIds[0], segmentacao_id: ids.segId,
      valor_unitario: 99.9, desconto_pct: 10, transportadora: 'Azul', nota_fiscal: 'NF-001',
      itens: [{ tamanho: 'P', qtd: 5 }, { tamanho: 'M', qtd: 10 }, { tamanho: 'G', qtd: 3 }]
    })
    expect(result.id).toBeGreaterThan(0)
    expect(result.transportadora).toBe('Azul')
    expect(result.nota_fiscal).toBe('NF-001')
    expect(result.itens).toHaveLength(3)
    expect(result.itens.find(i => i.tamanho === 'M').qtd).toBe(10)
  })

  it('salvarBatch: persiste múltiplos pedidos de uma vez', () => {
    const { visitas } = makeSessoes(db).list(ids.colId)[0]
    const batch = visitas.map(v => ({
      visita_id: v.visita_id, comprador_id: v.comprador_id, segmentacao_id: ids.segId,
      valor_unitario: 50, itens: [{ tamanho: 'P', qtd: 10 }]
    }))
    const results = ped.salvarBatch(batch)
    expect(results).toHaveLength(2)
    expect(results[0].itens).toHaveLength(1)
    expect(results[1].itens[0].qtd).toBe(10)
  })

  it('totaisPorTamanho: agrega qtd comprada por tamanho', () => {
    ped.salvar({
      visita_id: visitaId, comprador_id: ids.compIds[0], segmentacao_id: ids.segId,
      valor_unitario: 50, itens: [{ tamanho: 'P', qtd: 5 }, { tamanho: 'M', qtd: 8 }]
    })
    const totais = ped.totaisPorTamanho(ids.segId, ids.colId)
    const mapTotais = Object.fromEntries(totais.map(t => [t.tamanho, t.total_pedido]))
    expect(mapTotais['P']).toBe(5)
    expect(mapTotais['M']).toBe(8)
  })

  it('dashboardData: retorna linhas de projecao vs comprado', () => {
    const proj = makeProjecoes(db)
    proj.salvar(ids.segId, ids.colId, [
      { tamanho: 'P', ordem: 0, qtd_projetada: 20, qtd_ajustada: 20 },
      { tamanho: 'M', ordem: 1, qtd_projetada: 30, qtd_ajustada: 30 },
    ], 'manual')

    ped.salvar({
      visita_id: visitaId, comprador_id: ids.compIds[0], segmentacao_id: ids.segId,
      valor_unitario: 50, itens: [{ tamanho: 'P', qtd: 10 }, { tamanho: 'M', qtd: 15 }]
    })

    const rows = ped.dashboardData(ids.colId)
    expect(rows.length).toBeGreaterThanOrEqual(2)
    const rowP = rows.find(r => r.tamanho === 'P')
    const rowM = rows.find(r => r.tamanho === 'M')
    expect(rowP.qtd_ajustada).toBe(20)
    expect(rowP.total_pedido).toBe(10)
    expect(rowM.total_pedido).toBe(15)
  })
})

// ─── Projecoes ────────────────────────────────────────────────────────────────

describe('makeProjecoes', () => {
  let db, proj, ids
  let colBase1, colBase2

  beforeEach(() => {
    db   = freshDb()
    proj = makeProjecoes(db)
    ids  = seed(db)

    const col1 = db.prepare(`INSERT INTO colecoes (nome, estacao, ano) VALUES (?, ?, ?)`).run('VR2023', 'verao', 2023)
    const col2 = db.prepare(`INSERT INTO colecoes (nome, estacao, ano) VALUES (?, ?, ?)`).run('VR2024', 'verao', 2024)
    colBase1 = Number(col1.lastInsertRowid)
    colBase2 = Number(col2.lastInsertRowid)

    // grade_historica: N-2 (2023)
    for (const [tam, ordem, qtd] of [['P', 0, 100], ['M', 1, 200], ['G', 2, 50]]) {
      db.prepare(`INSERT INTO grade_historica (segmentacao_id, colecao_id, tamanho, ordem, qtd_comprada) VALUES (?, ?, ?, ?, ?)`)
        .run(ids.segId, colBase1, tam, ordem, qtd)
    }
    // grade_historica: N-1 (2024)
    for (const [tam, ordem, qtd] of [['P', 0, 120], ['M', 1, 180], ['G', 2, 60]]) {
      db.prepare(`INSERT INTO grade_historica (segmentacao_id, colecao_id, tamanho, ordem, qtd_comprada) VALUES (?, ?, ?, ?, ?)`)
        .run(ids.segId, colBase2, tam, ordem, qtd)
    }
  })

  it('calcular media_simples: (N2+N1)/2 arredondado', () => {
    const rows = proj.calcular(ids.segId, ids.colId, [colBase1, colBase2], 'media_simples')
    expect(rows).toHaveLength(3)
    const mapQtd = Object.fromEntries(rows.map(r => [r.tamanho, r.qtd_projetada]))
    expect(mapQtd['P']).toBe(Math.round((100 + 120) / 2)) // 110
    expect(mapQtd['M']).toBe(Math.round((200 + 180) / 2)) // 190
    expect(mapQtd['G']).toBe(Math.round((50  + 60)  / 2)) // 55
  })

  it('calcular media_ponderada: N2*0.4 + N1*0.6 arredondado', () => {
    const rows = proj.calcular(ids.segId, ids.colId, [colBase1, colBase2], 'media_ponderada')
    const mapQtd = Object.fromEntries(rows.map(r => [r.tamanho, r.qtd_projetada]))
    expect(mapQtd['P']).toBe(Math.round(100 * 0.4 + 120 * 0.6)) // 112
    expect(mapQtd['M']).toBe(Math.round(200 * 0.4 + 180 * 0.6)) // 188
    expect(mapQtd['G']).toBe(Math.round(50  * 0.4 + 60  * 0.6)) // 56
  })

  it('calcular: qtd_ajustada igual a qtd_projetada inicialmente', () => {
    const rows = proj.calcular(ids.segId, ids.colId, [colBase1, colBase2], 'media_simples')
    for (const r of rows) {
      expect(r.qtd_ajustada).toBe(r.qtd_projetada)
    }
  })

  it('calcular: lança erro se menos de 2 coleções base', () => {
    expect(() => proj.calcular(ids.segId, ids.colId, [colBase1], 'media_simples')).toThrow()
  })

  it('salvar + getProjecao: persiste e recupera projeções', () => {
    const rows = proj.calcular(ids.segId, ids.colId, [colBase1, colBase2], 'media_simples')
    proj.salvar(ids.segId, ids.colId, rows, 'media_simples')
    const saved = proj.getProjecao(ids.segId, ids.colId)
    expect(saved).toHaveLength(3)
    expect(saved[0].metodo).toBe('media_simples')
  })

  it('ajustar + restaurar: altera e restaura qtd_ajustada', () => {
    const rows = proj.calcular(ids.segId, ids.colId, [colBase1, colBase2], 'media_simples')
    proj.salvar(ids.segId, ids.colId, rows, 'media_simples')

    proj.ajustar(ids.segId, ids.colId, 'P', 999)
    const afterAjuste = proj.getProjecao(ids.segId, ids.colId).find(r => r.tamanho === 'P')
    expect(afterAjuste.qtd_ajustada).toBe(999)

    proj.restaurar(ids.segId, ids.colId, 'P')
    const afterRestore = proj.getProjecao(ids.segId, ids.colId).find(r => r.tamanho === 'P')
    expect(afterRestore.qtd_ajustada).toBe(afterRestore.qtd_projetada)
  })
})
