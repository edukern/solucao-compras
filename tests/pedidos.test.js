import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeColecoes } from '../electron/main/db/colecoes.js'
import { makeSegmentacoes } from '../electron/main/db/segmentacoes.js'
import { makeFornecedores } from '../electron/main/db/fornecedores.js'
import { makeCompradores } from '../electron/main/db/compradores.js'
import { makeVisitas } from '../electron/main/db/visitas.js'
import { makePedidos } from '../electron/main/db/pedidos.js'

let db, col, seg, forn, comp, vis, ped
let colId, segId, fornId, compId, visitaId

beforeEach(() => {
  db = makeDb()
  col = makeColecoes(db)
  seg = makeSegmentacoes(db)
  forn = makeFornecedores(db)
  comp = makeCompradores(db)
  vis = makeVisitas(db)
  ped = makePedidos(db)

  const colecao = col.create({ nome: 'Verão 2026', estacao: 'verao', ano: 2026 })
  colId = colecao.id
  segId = seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', tipo_grade: 'AD', estacao: 'verao' })
  const fornecedor = forn.create({ nome: 'ABC', contato: '' })
  fornId = fornecedor.id
  const comprador = comp.create({ nome: 'Buyer1', cnpj: '12.345.678/0001-99', cidade: 'SP' })
  compId = comprador.id
  const visita = vis.create({ fornecedor_id: fornId, colecao_id: colId, data_visita: '2026-05-16', vendedor: '', cond_pag: '', frete: '', obs: '' })
  visitaId = visita.id
})

describe('pedidos', () => {
  it('saves a purchase order (multiple sizes) and retrieves total bought per size', () => {
    ped.salvar({
      visita_id: visitaId,
      comprador_id: compId,
      segmentacao_id: segId,
      valor_unitario: 49.90,
      itens: [
        { tamanho: 'P', qtd: 30 },
        { tamanho: 'M', qtd: 50 },
      ]
    })
    const totais = ped.totaisPorTamanho(segId, colId)
    expect(totais.find(r => r.tamanho === 'P').total_pedido).toBe(30)
    expect(totais.find(r => r.tamanho === 'M').total_pedido).toBe(50)
  })

  it('accumulates quantities from multiple orders for same seg+col+size', () => {
    ped.salvar({ visita_id: visitaId, comprador_id: compId, segmentacao_id: segId,
      valor_unitario: 49.90,
      itens: [{ tamanho: 'P', qtd: 20 }]
    })
    ped.salvar({ visita_id: visitaId, comprador_id: compId, segmentacao_id: segId,
      valor_unitario: 49.90,
      itens: [{ tamanho: 'P', qtd: 15 }]
    })
    const totais = ped.totaisPorTamanho(segId, colId)
    expect(totais.find(r => r.tamanho === 'P').total_pedido).toBe(35)
  })

  it('returns all orders for a visit', () => {
    ped.salvar({ visita_id: visitaId, comprador_id: compId, segmentacao_id: segId,
      valor_unitario: 50.00,
      itens: [{ tamanho: 'P', qtd: 10 }, { tamanho: 'M', qtd: 20 }]
    })
    const pedidos = ped.byVisita(visitaId)
    expect(pedidos).toHaveLength(1)
    expect(pedidos[0].itens.length).toBe(2)
  })

  it('returns all orders with comprador info when multiple buyers order from same visit', () => {
    const comp2 = comp.create({ nome: 'Buyer2', cnpj: '98.765.432/0001-00', cidade: 'RJ' })
    ped.salvar({ visita_id: visitaId, comprador_id: compId, segmentacao_id: segId,
      valor_unitario: 49.90,
      itens: [{ tamanho: 'P', qtd: 20 }, { tamanho: 'M', qtd: 30 }]
    })
    ped.salvar({ visita_id: visitaId, comprador_id: comp2.id, segmentacao_id: segId,
      valor_unitario: 49.90,
      itens: [{ tamanho: 'P', qtd: 10 }]
    })
    const pedidos = ped.byVisita(visitaId)
    expect(pedidos).toHaveLength(2)
    expect(pedidos[0].comprador_nome).toBeDefined()
  })
})
