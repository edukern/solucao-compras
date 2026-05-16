import { colecoes, segmentacoes, fornecedores, projecoes, pedidosBase, compradores } from './mockData.js'

// mutable in-memory pedidos array (resets on page reload — by design)
const pedidos = [...pedidosBase]

function resolve(value) {
  return Promise.resolve(value)
}

const mockApi = {
  colecoes: {
    list: () => resolve([...colecoes]),
    create: () => resolve(null),
  },

  segmentacoes: {
    list: () => resolve([...segmentacoes]),
    create: () => resolve(null),
  },

  fornecedores: {
    list: () => resolve([...fornecedores]),
    create: () => resolve(null),
  },

  pedidos: {
    salvar({ fornecedor_id, colecao_id, segmentacao_id, data_pedido, valor_unitario,
             desconto_pct = 0, vendedor = '', cond_pag = '', frete = '',
             transportadora = '', nota_fiscal = '', obs = '', itens }) {
      for (const item of itens) {
        if (item.qtd_pedida > 0) {
          pedidos.push({
            fornecedor_id, colecao_id, segmentacao_id, data_pedido,
            tamanho: item.tamanho, qtd_pedida: item.qtd_pedida, valor_unitario,
            desconto_pct, vendedor, cond_pag, frete, transportadora, nota_fiscal, obs,
          })
        }
      }
      return resolve(null)
    },

    totaisPorFornecedor(colId, segId = null) {
      let filtered = pedidos.filter(p => p.colecao_id === colId)
      if (segId != null) filtered = filtered.filter(p => p.segmentacao_id === segId)

      const map = new Map()
      for (const p of filtered) {
        if (!map.has(p.fornecedor_id)) {
          const forn = fornecedores.find(f => f.id === p.fornecedor_id)
          map.set(p.fornecedor_id, {
            fornecedor_id: p.fornecedor_id,
            fornecedor_nome: forn.nome,
            segIds: new Set(),
            total_pecas: 0,
            total_valor: 0,
          })
        }
        const entry = map.get(p.fornecedor_id)
        entry.segIds.add(p.segmentacao_id)
        entry.total_pecas += p.qtd_pedida
        entry.total_valor += p.qtd_pedida * p.valor_unitario
      }

      const result = [...map.values()].map(e => ({
        fornecedor_id: e.fornecedor_id,
        fornecedor_nome: e.fornecedor_nome,
        num_skus: e.segIds.size,
        total_pecas: e.total_pecas,
        total_valor: e.total_valor,
      }))
      return resolve(result)
    },

    itensPorFornecedor(fornId, colId) {
      const filtered = pedidos.filter(p => p.fornecedor_id === fornId && p.colecao_id === colId)

      const map = new Map()
      for (const p of filtered) {
        if (!map.has(p.segmentacao_id)) {
          const seg = segmentacoes.find(s => s.id === p.segmentacao_id)
          map.set(p.segmentacao_id, {
            segmentacao_id: p.segmentacao_id,
            classificacao: seg.classificacao,
            tipo_produto: seg.tipo_produto,
            classe: seg.classe,
            total_comprado: 0,
          })
        }
        map.get(p.segmentacao_id).total_comprado += p.qtd_pedida
      }
      return resolve([...map.values()])
    },

    totaisPorTamanho(segId, colId) {
      const filtered = pedidos.filter(p => p.segmentacao_id === segId && p.colecao_id === colId)
      const map = new Map()
      for (const p of filtered) {
        map.set(p.tamanho, (map.get(p.tamanho) ?? 0) + p.qtd_pedida)
      }
      return resolve([...map.entries()].map(([tamanho, total_pedido]) => ({ tamanho, total_pedido })))
    },

    listarVisitas: () => resolve([]),
    listarPorColecao: () => resolve([]),
  },

  projecoes: {
    get(segId, colId) {
      return resolve(
        projecoes
          .filter(p => p.segmentacao_id === segId && p.colecao_id === colId)
          .map(p => ({ tamanho: p.tamanho, qtd_ajustada: p.qtd_ajustada }))
      )
    },
    calcular: () => resolve(null),
    salvar: () => resolve(null),
  },

  grades: {
    get: () => resolve([]),
  },

  compradores: {
    list: () => resolve([...compradores]),
  },
}

export default mockApi
