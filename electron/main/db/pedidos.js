export function makePedidos(db) {
  const insertItem = db.prepare(`
    INSERT INTO pedidos (fornecedor_id, colecao_id, segmentacao_id, data_pedido, tamanho, qtd_pedida, valor_unitario)
    VALUES (@fornecedor_id, @colecao_id, @segmentacao_id, @data_pedido, @tamanho, @qtd_pedida, @valor_unitario)
  `)

  const saveAll = db.transaction((base, itens) => {
    for (const item of itens) {
      insertItem.run({ ...base, ...item })
    }
  })

  const totaisBySegCol = db.prepare(`
    SELECT tamanho, SUM(qtd_pedida) AS total_pedido
    FROM pedidos WHERE segmentacao_id = ? AND colecao_id = ?
    GROUP BY tamanho
  `)

  const byColecao = db.prepare(`SELECT * FROM pedidos WHERE colecao_id = ? ORDER BY data_pedido DESC`)

  const visitas = db.prepare(`
    SELECT p.fornecedor_id, f.nome AS fornecedor_nome, p.data_pedido,
           SUM(p.qtd_pedida) AS total_pecas,
           SUM(p.qtd_pedida * p.valor_unitario) AS total_valor
    FROM pedidos p JOIN fornecedores f ON f.id = p.fornecedor_id
    WHERE p.colecao_id = ?
    GROUP BY p.fornecedor_id, p.data_pedido
    ORDER BY p.data_pedido DESC
  `)

  const totaisForn = db.prepare(`
    SELECT f.id AS fornecedor_id, f.nome AS fornecedor_nome,
           COUNT(DISTINCT p.segmentacao_id) AS num_skus,
           SUM(p.qtd_pedida) AS total_pecas,
           SUM(p.qtd_pedida * p.valor_unitario) AS total_valor
    FROM pedidos p JOIN fornecedores f ON f.id = p.fornecedor_id
    WHERE p.colecao_id = ?
    GROUP BY p.fornecedor_id ORDER BY f.nome
  `)

  const totaisFornBySeg = db.prepare(`
    SELECT f.id AS fornecedor_id, f.nome AS fornecedor_nome,
           COUNT(DISTINCT p.segmentacao_id) AS num_skus,
           SUM(p.qtd_pedida) AS total_pecas,
           SUM(p.qtd_pedida * p.valor_unitario) AS total_valor
    FROM pedidos p JOIN fornecedores f ON f.id = p.fornecedor_id
    WHERE p.colecao_id = ? AND p.segmentacao_id = ?
    GROUP BY p.fornecedor_id ORDER BY f.nome
  `)

  const itensForn = db.prepare(`
    SELECT s.id AS segmentacao_id,
           s.classificacao, s.tipo_produto, s.classe,
           SUM(p.qtd_pedida) AS total_comprado
    FROM pedidos p JOIN segmentacoes s ON s.id = p.segmentacao_id
    WHERE p.fornecedor_id = ? AND p.colecao_id = ?
    GROUP BY p.segmentacao_id
    ORDER BY s.classificacao, s.tipo_produto, s.classe
  `)

  return {
    salvar({ fornecedor_id, colecao_id, segmentacao_id, data_pedido, valor_unitario, itens }) {
      saveAll({ fornecedor_id, colecao_id, segmentacao_id, data_pedido, valor_unitario }, itens)
    },
    getTotaisPorTamanho(segId, colId) {
      return totaisBySegCol.all(segId, colId)
    },
    listarPorColecao(colId) {
      return byColecao.all(colId)
    },
    listarVisitas(colId) {
      return visitas.all(colId)
    },
    totaisPorFornecedor(colId, segId = null) {
      return segId !== null ? totaisFornBySeg.all(colId, segId) : totaisForn.all(colId)
    },
    itensPorFornecedor(fornId, colId) {
      return itensForn.all(fornId, colId)
    }
  }
}
