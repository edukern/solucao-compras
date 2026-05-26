export function makePedidos(db) {
  const insertHeader = db.prepare(`
    INSERT INTO pedidos
      (visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct,
       referencia, icms_pct, markup_pct, preco_venda, cor, detalhe, obs)
    VALUES
      (@visita_id, @comprador_id, @segmentacao_id, @valor_unitario, @desconto_pct,
       @referencia, @icms_pct, @markup_pct, @preco_venda, @cor, @detalhe, @obs)
  `)

  const insertItem = db.prepare(`
    INSERT INTO pedido_itens (pedido_id, tamanho, qtd) VALUES (?, ?, ?)
  `)

  const salvarTx = db.transaction((header, itens) => {
    const id = insertHeader.run(header).lastInsertRowid
    for (const item of itens) {
      insertItem.run(id, item.tamanho, item.qtd)
    }
    return id
  })

  const salvarBatchTx = db.transaction((pedidosData) => {
    const results = []
    for (const { visita_id, comprador_id, segmentacao_id, valor_unitario,
                  desconto_pct = 0, referencia = '', icms_pct = 0,
                  markup_pct = 0, preco_venda = 0, cor = '', detalhe = '',
                  obs = '', itens } of pedidosData) {
      const id = insertHeader.run({ visita_id, comprador_id, segmentacao_id, valor_unitario,
                                    desconto_pct, referencia, icms_pct,
                                    markup_pct, preco_venda, cor, detalhe, obs }).lastInsertRowid
      for (const item of itens) {
        insertItem.run(id, item.tamanho, item.qtd)
      }
      results.push({ ...byId.get(id), itens: itensByPedido.all(id) })
    }
    return results
  })

  const delPedido = db.prepare(`DELETE FROM pedidos WHERE id = ?`)
  const byId = db.prepare(`SELECT * FROM pedidos WHERE id = ?`)
  const itensByPedido = db.prepare(`SELECT * FROM pedido_itens WHERE pedido_id = ? ORDER BY tamanho`)

  const byVisita = db.prepare(`
    SELECT p.*,
           c.nome AS comprador_nome, c.cnpj, c.cidade,
           s.classificacao, s.tipo_produto, s.classe, s.tipo_grade
    FROM pedidos p
    JOIN compradores c ON c.id = p.comprador_id
    JOIN segmentacoes s ON s.id = p.segmentacao_id
    WHERE p.visita_id = ?
    ORDER BY c.nome, s.tipo_produto
  `)

  const totaisPorTamanho = db.prepare(`
    SELECT pi.tamanho, SUM(pi.qtd) AS total_pedido
    FROM pedido_itens pi
    JOIN pedidos p ON p.id = pi.pedido_id
    JOIN visitas v ON v.id = p.visita_id
    JOIN sessoes ses ON ses.id = v.sessao_id
    WHERE p.segmentacao_id = ? AND ses.colecao_id = ?
    GROUP BY pi.tamanho
  `)

  const totaisPorFornecedorAll = db.prepare(`
    SELECT f.id AS fornecedor_id, f.nome AS fornecedor_nome,
           COUNT(DISTINCT p.segmentacao_id) AS num_skus,
           SUM(pi.qtd) AS total_pecas,
           SUM(pi.qtd * p.valor_unitario * (1.0 - p.desconto_pct / 100.0)) AS total_valor
    FROM pedidos p
    JOIN visitas v ON v.id = p.visita_id
    JOIN sessoes ses ON ses.id = v.sessao_id
    JOIN fornecedores f ON f.id = ses.fornecedor_id
    JOIN pedido_itens pi ON pi.pedido_id = p.id
    WHERE ses.colecao_id = ?
    GROUP BY f.id, f.nome
    ORDER BY f.nome
  `)

  const totaisPorFornecedorSeg = db.prepare(`
    SELECT f.id AS fornecedor_id, f.nome AS fornecedor_nome,
           COUNT(DISTINCT p.segmentacao_id) AS num_skus,
           SUM(pi.qtd) AS total_pecas,
           SUM(pi.qtd * p.valor_unitario * (1.0 - p.desconto_pct / 100.0)) AS total_valor
    FROM pedidos p
    JOIN visitas v ON v.id = p.visita_id
    JOIN sessoes ses ON ses.id = v.sessao_id
    JOIN fornecedores f ON f.id = ses.fornecedor_id
    JOIN pedido_itens pi ON pi.pedido_id = p.id
    WHERE ses.colecao_id = ? AND p.segmentacao_id = ?
    GROUP BY f.id, f.nome
    ORDER BY f.nome
  `)

  const dashboardAgg = db.prepare(`
    SELECT
      s.id AS seg_id, s.classificacao, s.tipo_produto, s.classe, s.tipo_grade, s.estacao,
      p.tamanho, p.ordem, p.qtd_ajustada,
      COALESCE(agg.total_pedido, 0) AS total_pedido
    FROM projecoes p
    JOIN segmentacoes s ON s.id = p.segmentacao_id
    LEFT JOIN (
      SELECT pi.tamanho, ped.segmentacao_id, SUM(pi.qtd) AS total_pedido
      FROM pedido_itens pi
      JOIN pedidos ped ON ped.id = pi.pedido_id
      JOIN visitas v ON v.id = ped.visita_id
      JOIN sessoes ses ON ses.id = v.sessao_id
      WHERE ses.colecao_id = @colId
      GROUP BY ped.segmentacao_id, pi.tamanho
    ) agg ON agg.segmentacao_id = p.segmentacao_id AND agg.tamanho = p.tamanho
    WHERE p.colecao_id = @colId AND p.qtd_ajustada > 0
    ORDER BY s.classificacao, s.tipo_produto, s.classe, p.ordem
  `)

  const itensPorFornecedor = db.prepare(`
    SELECT s.id AS segmentacao_id, s.classificacao, s.tipo_produto, s.classe, s.tipo_grade,
           SUM(pi.qtd) AS total_comprado
    FROM pedidos p
    JOIN visitas v ON v.id = p.visita_id
    JOIN sessoes ses ON ses.id = v.sessao_id
    JOIN segmentacoes s ON s.id = p.segmentacao_id
    JOIN pedido_itens pi ON pi.pedido_id = p.id
    WHERE ses.fornecedor_id = ? AND ses.colecao_id = ?
    GROUP BY s.id, s.classificacao, s.tipo_produto, s.classe, s.tipo_grade
    ORDER BY s.classificacao, s.tipo_produto, s.classe
  `)

  return {
    salvar({ visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct = 0,
             referencia = '', icms_pct = 0, markup_pct = 0, preco_venda = 0,
             cor = '', detalhe = '', obs = '', itens }) {
      const id = salvarTx(
        { visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct,
          referencia, icms_pct, markup_pct, preco_venda, cor, detalhe, obs },
        itens
      )
      return { ...byId.get(id), itens: itensByPedido.all(id) }
    },
    byVisita(visitaId) {
      const pedidos = byVisita.all(visitaId)
      return pedidos.map(p => ({ ...p, itens: itensByPedido.all(p.id) }))
    },
    totaisPorTamanho(segId, colId) {
      return totaisPorTamanho.all(segId, colId)
    },
    totaisPorFornecedor(colId, segId) {
      return segId != null
        ? totaisPorFornecedorSeg.all(colId, segId)
        : totaisPorFornecedorAll.all(colId)
    },
    itensPorFornecedor(fornId, colId) {
      return itensPorFornecedor.all(fornId, colId)
    },
    cancelar(id) {
      delPedido.run(id)
    },
    salvarBatch(pedidosData) {
      return salvarBatchTx(pedidosData)
    },
    dashboardData(colId) {
      return dashboardAgg.all({ colId })
    }
  }
}
