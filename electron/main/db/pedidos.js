export function makePedidos(db) {
  const insertHeader = db.prepare(`
    INSERT INTO pedidos
      (visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct,
       transportadora, nota_fiscal, obs)
    VALUES
      (@visita_id, @comprador_id, @segmentacao_id, @valor_unitario, @desconto_pct,
       @transportadora, @nota_fiscal, @obs)
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
    WHERE p.segmentacao_id = ? AND v.colecao_id = ?
    GROUP BY pi.tamanho
  `)

  return {
    salvar({ visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct = 0,
             transportadora = '', nota_fiscal = '', obs = '', itens }) {
      const id = salvarTx(
        { visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct,
          transportadora, nota_fiscal, obs },
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
    }
  }
}
