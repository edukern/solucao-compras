import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeColecoes } from '../electron/main/db/colecoes.js'
import { makeSegmentacoes } from '../electron/main/db/segmentacoes.js'
import { makeFornecedores } from '../electron/main/db/fornecedores.js'
import { makePedidos } from '../electron/main/db/pedidos.js'

let db, col, seg, forn, ped
let colId, segId, fornId

beforeEach(() => {
  db = makeDb()
  col = makeColecoes(db)
  seg = makeSegmentacoes(db)
  forn = makeFornecedores(db)
  ped = makePedidos(db)
  colId = col.create({ nome: 'Verão 2026', estacao: 'verao', ano: 2026 })
  segId = seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
  fornId = forn.create({ nome: 'ABC', contato: '' })
})

describe('pedidos', () => {
  it('saves a purchase order (multiple sizes) and retrieves total bought per size', () => {
    ped.salvar({
      fornecedor_id: fornId,
      colecao_id: colId,
      segmentacao_id: segId,
      data_pedido: '2026-05-16',
      valor_unitario: 49.90,
      itens: [
        { tamanho: 'P', qtd_pedida: 30 },
        { tamanho: 'M', qtd_pedida: 50 },
      ]
    })
    const totais = ped.getTotaisPorTamanho(segId, colId)
    expect(totais.find(r => r.tamanho === 'P').total_pedido).toBe(30)
    expect(totais.find(r => r.tamanho === 'M').total_pedido).toBe(50)
  })

  it('accumulates quantities from multiple orders for same seg+col+size', () => {
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-10', valor_unitario: 49.90,
      itens: [{ tamanho: 'P', qtd_pedida: 20 }]
    })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 49.90,
      itens: [{ tamanho: 'P', qtd_pedida: 15 }]
    })
    const totais = ped.getTotaisPorTamanho(segId, colId)
    expect(totais.find(r => r.tamanho === 'P').total_pedido).toBe(35)
  })

  it('calculates valor_total of a pedido correctly', () => {
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 50.00,
      itens: [{ tamanho: 'P', qtd_pedida: 10 }, { tamanho: 'M', qtd_pedida: 20 }]
    })
    const pedidos = ped.listarPorColecao(colId)
    const total = pedidos.reduce((s, p) => s + p.qtd_pedida * p.valor_unitario, 0)
    expect(total).toBe(1500)
  })

  it('lists pedidos grouped as visitas (by supplier + date)', () => {
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 49.90,
      itens: [{ tamanho: 'P', qtd_pedida: 20 }, { tamanho: 'M', qtd_pedida: 30 }]
    })
    const visitas = ped.listarVisitas(colId)
    expect(visitas).toHaveLength(1)
    expect(visitas[0].total_pecas).toBe(50)
    expect(visitas[0].total_valor).toBeCloseTo(50 * 49.90)
  })
})

describe('totaisPorFornecedor', () => {
  it('returns suppliers with order totals for a collection', () => {
    const seg2Id = seg.create({ classificacao: 'EX', tipo_produto: 'CALCA', classe: 'MASC', estacao: 'VERAO' })
    const forn2Id = forn.create({ nome: 'XYZ', contato: '' })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 50.00,
      itens: [{ tamanho: 'P', qtd_pedida: 10 }, { tamanho: 'M', qtd_pedida: 20 }]
    })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: seg2Id,
      data_pedido: '2026-05-16', valor_unitario: 80.00,
      itens: [{ tamanho: 'P', qtd_pedida: 5 }]
    })
    ped.salvar({ fornecedor_id: forn2Id, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 60.00,
      itens: [{ tamanho: 'G', qtd_pedida: 15 }]
    })
    const rows = ped.totaisPorFornecedor(colId)
    expect(rows).toHaveLength(2)
    const abc = rows.find(r => r.fornecedor_id === fornId)
    expect(abc.num_skus).toBe(2)
    expect(abc.total_pecas).toBe(35)
    expect(abc.total_valor).toBeCloseTo(10*50 + 20*50 + 5*80)
    const xyz = rows.find(r => r.fornecedor_id === forn2Id)
    expect(xyz.num_skus).toBe(1)
    expect(xyz.total_pecas).toBe(15)
  })

  it('filters by segmentacao_id when segId is provided', () => {
    const seg2Id = seg.create({ classificacao: 'EX', tipo_produto: 'CALCA', classe: 'MASC', estacao: 'VERAO' })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 50.00,
      itens: [{ tamanho: 'P', qtd_pedida: 10 }]
    })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: seg2Id,
      data_pedido: '2026-05-16', valor_unitario: 80.00,
      itens: [{ tamanho: 'M', qtd_pedida: 5 }]
    })
    const rows = ped.totaisPorFornecedor(colId, segId)
    expect(rows).toHaveLength(1)
    expect(rows[0].total_pecas).toBe(10)
  })

  it('returns empty array when collection has no orders', () => {
    const rows = ped.totaisPorFornecedor(colId)
    expect(rows).toHaveLength(0)
  })
})

describe('itensPorFornecedor', () => {
  it('returns segmentacoes with comprado totals for a supplier in a collection', () => {
    const seg2Id = seg.create({ classificacao: 'EX', tipo_produto: 'CALCA', classe: 'MASC', estacao: 'VERAO' })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 50.00,
      itens: [{ tamanho: 'P', qtd_pedida: 10 }, { tamanho: 'M', qtd_pedida: 20 }]
    })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: seg2Id,
      data_pedido: '2026-05-16', valor_unitario: 80.00,
      itens: [{ tamanho: 'P', qtd_pedida: 5 }]
    })
    const rows = ped.itensPorFornecedor(fornId, colId)
    expect(rows).toHaveLength(2)
    const ad = rows.find(r => r.segmentacao_id === segId)
    expect(ad.classificacao).toBe('AD')
    expect(ad.tipo_produto).toBe('BERMUDA')
    expect(ad.classe).toBe('FEM')
    expect(ad.total_comprado).toBe(30)
    const ex = rows.find(r => r.segmentacao_id === seg2Id)
    expect(ex.total_comprado).toBe(5)
  })

  it('accumulates across multiple order dates for same supplier+seg', () => {
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-10', valor_unitario: 50.00,
      itens: [{ tamanho: 'P', qtd_pedida: 10 }]
    })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 50.00,
      itens: [{ tamanho: 'P', qtd_pedida: 15 }]
    })
    const rows = ped.itensPorFornecedor(fornId, colId)
    expect(rows).toHaveLength(1)
    expect(rows[0].total_comprado).toBe(25)
  })

  it('returns empty array for supplier with no orders in that collection', () => {
    const rows = ped.itensPorFornecedor(fornId, colId)
    expect(rows).toHaveLength(0)
  })
})
