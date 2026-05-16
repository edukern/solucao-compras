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
