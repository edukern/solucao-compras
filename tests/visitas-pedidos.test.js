import { describe, it, expect } from 'vitest'
import { makeDb } from './setup.js'
import { makeColecoes } from '../electron/main/db/colecoes.js'
import { makeFornecedores } from '../electron/main/db/fornecedores.js'
import { makeCompradores } from '../electron/main/db/compradores.js'
import { makeSegmentacoes } from '../electron/main/db/segmentacoes.js'
import { makeSessoes } from '../electron/main/db/sessoes.js'
import { makePedidos } from '../electron/main/db/pedidos.js'

function setup() {
  const db = makeDb()
  const col = makeColecoes(db)
  const forn = makeFornecedores(db)
  const comp = makeCompradores(db)
  const seg = makeSegmentacoes(db)
  const sess = makeSessoes(db)
  const ped = makePedidos(db)

  const colecao = col.create({ nome: 'Inverno 2026', estacao: 'inverno', ano: 2026 })
  const fornecedor = forn.create({ nome: 'LUNENDER', contato: '', categoria: 'CONFECCOES' })
  const comprador1 = comp.create({ nome: 'Irmãos Backes', cnpj: '08.889.201/0001-01', cidade: 'Três Coroas/RS' })
  const comprador2 = comp.create({ nome: 'Samuel Backes', cnpj: '15.563.106/0001-70', cidade: 'Três Coroas/RS' })
  const segId = seg.create({ classificacao: 'AD', tipo_produto: 'CALCA', classe: 'MASC', tipo_grade: 'AD', estacao: 'inverno' })

  return { db, col, forn, comp, seg, sess, ped, colecao, fornecedor, comprador1, comprador2, segId }
}

describe('visitas via sessoes', () => {
  it('creates a sessao with visitas and returns fornecedor data', () => {
    const { sess, colecao, fornecedor, comprador1 } = setup()
    const sessao = sess.create({
      fornecedor_id: fornecedor.id,
      colecao_id: colecao.id,
      data_visita: '2026-05-17',
      vendedor: 'Maria',
      cond_pag: '30 dias',
      frete: 'CIF',
      obs: ''
    }, [comprador1.id])

    expect(sessao.visitas).toHaveLength(1)
    expect(sessao.visitas[0].visita_id).toBeDefined()
    expect(sessao.fornecedor_id).toBe(fornecedor.id)
    expect(sessao.fornecedor_nome).toBe('LUNENDER')
  })

  it('lists all sessoes for a collection with fornecedor name', () => {
    const { sess, colecao, fornecedor, comprador1 } = setup()
    sess.create({ fornecedor_id: fornecedor.id, colecao_id: colecao.id, data_visita: '2026-05-17', vendedor: '', cond_pag: '', frete: '', obs: '' }, [comprador1.id])
    const list = sess.list(colecao.id)
    expect(list).toHaveLength(1)
    expect(list[0].fornecedor_nome).toBe('LUNENDER')
    expect(list[0].visitas).toHaveLength(1)
  })

  it('retrieves sessao by id with vendedor and fornecedor name', () => {
    const { sess, colecao, fornecedor, comprador1 } = setup()
    const sessao = sess.create({ fornecedor_id: fornecedor.id, colecao_id: colecao.id, data_visita: '2026-05-17', vendedor: 'João', cond_pag: '', frete: '', obs: '' }, [comprador1.id])
    const fetched = sess.getById(sessao.id)
    expect(fetched.id).toBe(sessao.id)
    expect(fetched.vendedor).toBe('João')
    expect(fetched.fornecedor_nome).toBe('LUNENDER')
    expect(fetched.visitas[0].visita_id).toBe(sessao.visitas[0].visita_id)
  })
})

describe('pedidos', () => {
  it('saves a purchase order with items and returns complete object', () => {
    const { sess, ped, colecao, fornecedor, comprador1, segId } = setup()
    const sessao = sess.create({ fornecedor_id: fornecedor.id, colecao_id: colecao.id, data_visita: '2026-05-17', vendedor: 'Maria', cond_pag: '30 dias', frete: 'CIF', obs: '' }, [comprador1.id])
    const visitaId = sessao.visitas[0].visita_id

    const pedido = ped.salvar({
      visita_id: visitaId,
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
    expect(pedido.visita_id).toBe(visitaId)
    expect(pedido.comprador_id).toBe(comprador1.id)
    expect(pedido.itens).toHaveLength(3)
    expect(pedido.itens.find(i => i.tamanho === 'M').qtd).toBe(15)
  })

  it('returns all orders for a visit with buyer and segmentation info', () => {
    const { sess, ped, colecao, fornecedor, comprador1, comprador2, segId } = setup()
    const sessao = sess.create({ fornecedor_id: fornecedor.id, colecao_id: colecao.id, data_visita: '2026-05-17', vendedor: '', cond_pag: '', frete: '', obs: '' }, [comprador1.id, comprador2.id])
    const visitaId = sessao.visitas[0].visita_id

    ped.salvar({ visita_id: visitaId, comprador_id: comprador1.id, segmentacao_id: segId, valor_unitario: 45, itens: [{ tamanho: 'M', qtd: 10 }] })
    ped.salvar({ visita_id: visitaId, comprador_id: comprador2.id, segmentacao_id: segId, valor_unitario: 45, itens: [{ tamanho: 'M', qtd: 5 }] })

    const pedidos = ped.byVisita(visitaId)
    expect(pedidos).toHaveLength(2)
    expect(pedidos[0].comprador_nome).toBeDefined()
    expect(pedidos[0].itens.length).toBeGreaterThan(0)
  })

  it('aggregates quantities by size across all buyers for a segmentation', () => {
    const { sess, ped, colecao, fornecedor, comprador1, comprador2, segId } = setup()
    const sessao = sess.create({ fornecedor_id: fornecedor.id, colecao_id: colecao.id, data_visita: '2026-05-17', vendedor: '', cond_pag: '', frete: '', obs: '' }, [comprador1.id, comprador2.id])
    const [v1, v2] = sessao.visitas

    ped.salvar({ visita_id: v1.visita_id, comprador_id: comprador1.id, segmentacao_id: segId, valor_unitario: 45, itens: [{ tamanho: 'M', qtd: 10 }] })
    ped.salvar({ visita_id: v2.visita_id, comprador_id: comprador2.id, segmentacao_id: segId, valor_unitario: 45, itens: [{ tamanho: 'M', qtd: 5 }] })

    const totais = ped.totaisPorTamanho(segId, colecao.id)
    const mRow = totais.find(r => r.tamanho === 'M')
    expect(mRow.total_pedido).toBe(15)
  })
})
