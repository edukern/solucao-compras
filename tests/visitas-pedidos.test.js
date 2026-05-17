import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeColecoes } from '../electron/main/db/colecoes.js'
import { makeFornecedores } from '../electron/main/db/fornecedores.js'
import { makeCompradores } from '../electron/main/db/compradores.js'
import { makeSegmentacoes } from '../electron/main/db/segmentacoes.js'
import { makeVisitas } from '../electron/main/db/visitas.js'
import { makePedidos } from '../electron/main/db/pedidos.js'

function setup() {
  const db = makeDb()
  const col = makeColecoes(db)
  const forn = makeFornecedores(db)
  const comp = makeCompradores(db)
  const seg = makeSegmentacoes(db)
  const vis = makeVisitas(db)
  const ped = makePedidos(db)

  const colecao = col.create({ nome: 'Inverno 2026', estacao: 'inverno', ano: 2026 })
  const fornecedor = forn.create({ nome: 'LUNENDER', contato: '', categoria: 'CONFECCOES' })
  const comprador1 = comp.create({ nome: 'Irmãos Backes', cnpj: '08.889.201/0001-01', cidade: 'Três Coroas/RS' })
  const comprador2 = comp.create({ nome: 'Samuel Backes', cnpj: '15.563.106/0001-70', cidade: 'Três Coroas/RS' })
  const segId = seg.create({ classificacao: 'AD', tipo_produto: 'CALCA', classe: 'MASC', tipo_grade: 'AD', estacao: 'inverno' })

  return { db, col, forn, comp, seg, vis, ped, colecao, fornecedor, comprador1, comprador2, segId }
}

describe('visitas', () => {
  it('creates a visit and returns full object', () => {
    const { vis, colecao, fornecedor } = setup()
    const visita = vis.create({
      fornecedor_id: fornecedor.id,
      colecao_id: colecao.id,
      data_visita: '2026-05-17',
      vendedor: 'Maria',
      cond_pag: '30 dias',
      frete: 'CIF',
      obs: ''
    })
    expect(visita).toMatchObject({ id: 1, fornecedor_id: fornecedor.id })
    expect(visita.fornecedor_nome).toBe('LUNENDER')
  })

  it('lists all visits for a collection with fornecedor name', () => {
    const { vis, colecao, fornecedor } = setup()
    vis.create({ fornecedor_id: fornecedor.id, colecao_id: colecao.id, data_visita: '2026-05-17', vendedor: '', cond_pag: '', frete: '', obs: '' })
    const list = vis.list(colecao.id)
    expect(list).toHaveLength(1)
    expect(list[0].fornecedor_nome).toBe('LUNENDER')
  })

  it('retrieves visit by id with fornecedor name', () => {
    const { vis, colecao, fornecedor } = setup()
    const created = vis.create({ fornecedor_id: fornecedor.id, colecao_id: colecao.id, data_visita: '2026-05-17', vendedor: 'João', cond_pag: '', frete: '', obs: '' })
    const fetched = vis.getById(created.id)
    expect(fetched).toMatchObject({ id: created.id, vendedor: 'João' })
    expect(fetched.fornecedor_nome).toBe('LUNENDER')
  })
})

describe('pedidos', () => {
  it('saves a purchase order with items and returns complete object', () => {
    const { vis, ped, colecao, fornecedor, comprador1, segId } = setup()
    const visita = vis.create({ fornecedor_id: fornecedor.id, colecao_id: colecao.id, data_visita: '2026-05-17', vendedor: 'Maria', cond_pag: '30 dias', frete: 'CIF', obs: '' })

    const pedido = ped.salvar({
      visita_id: visita.id,
      comprador_id: comprador1.id,
      segmentacao_id: segId,
      valor_unitario: 45.00,
      desconto_pct: 0,
      transportadora: '',
      nota_fiscal: '',
      obs: '',
      itens: [
        { tamanho: 'PP', qtd: 10 },
        { tamanho: 'P', qtd: 20 },
        { tamanho: 'M', qtd: 15 }
      ]
    })

    expect(pedido.id).toBeDefined()
    expect(pedido.visita_id).toBe(visita.id)
    expect(pedido.comprador_id).toBe(comprador1.id)
    expect(pedido.itens).toHaveLength(3)
    expect(pedido.itens.find(i => i.tamanho === 'M').qtd).toBe(15)
  })

  it('returns all orders for a visit with buyer and segmentation info', () => {
    const { vis, ped, colecao, fornecedor, comprador1, comprador2, segId } = setup()
    const visita = vis.create({ fornecedor_id: fornecedor.id, colecao_id: colecao.id, data_visita: '2026-05-17', vendedor: '', cond_pag: '', frete: '', obs: '' })

    ped.salvar({
      visita_id: visita.id,
      comprador_id: comprador1.id,
      segmentacao_id: segId,
      valor_unitario: 45,
      desconto_pct: 0,
      transportadora: '',
      nota_fiscal: '',
      obs: '',
      itens: [{ tamanho: 'M', qtd: 10 }]
    })
    ped.salvar({
      visita_id: visita.id,
      comprador_id: comprador2.id,
      segmentacao_id: segId,
      valor_unitario: 45,
      desconto_pct: 0,
      transportadora: '',
      nota_fiscal: '',
      obs: '',
      itens: [{ tamanho: 'M', qtd: 5 }]
    })

    const pedidos = ped.byVisita(visita.id)
    expect(pedidos).toHaveLength(2)
    expect(pedidos[0].comprador_nome).toBeDefined()
    expect(pedidos[0].itens.length).toBeGreaterThan(0)
  })

  it('aggregates quantities by size across all buyers and visits for a segmentation', () => {
    const { vis, ped, colecao, fornecedor, comprador1, comprador2, segId } = setup()
    const v1 = vis.create({ fornecedor_id: fornecedor.id, colecao_id: colecao.id, data_visita: '2026-05-17', vendedor: '', cond_pag: '', frete: '', obs: '' })

    ped.salvar({
      visita_id: v1.id,
      comprador_id: comprador1.id,
      segmentacao_id: segId,
      valor_unitario: 45,
      desconto_pct: 0,
      transportadora: '',
      nota_fiscal: '',
      obs: '',
      itens: [{ tamanho: 'M', qtd: 10 }]
    })
    ped.salvar({
      visita_id: v1.id,
      comprador_id: comprador2.id,
      segmentacao_id: segId,
      valor_unitario: 45,
      desconto_pct: 0,
      transportadora: '',
      nota_fiscal: '',
      obs: '',
      itens: [{ tamanho: 'M', qtd: 5 }]
    })

    const totais = ped.totaisPorTamanho(segId, colecao.id)
    const mRow = totais.find(r => r.tamanho === 'M')
    expect(mRow.total_pedido).toBe(15)
  })
})
