export function makeVisitas(db) {
  const insert = db.prepare(`
    INSERT INTO visitas (sessao_id, comprador_id)
    VALUES (@sessao_id, @comprador_id)
  `)

  const byId = db.prepare(`
    SELECT v.id, v.sessao_id, v.comprador_id,
           ses.fornecedor_id, ses.colecao_id, ses.data_visita,
           ses.vendedor, ses.cond_pag, ses.frete, ses.obs,
           f.nome AS fornecedor_nome
    FROM visitas v
    JOIN sessoes ses ON ses.id = v.sessao_id
    JOIN fornecedores f ON f.id = ses.fornecedor_id
    WHERE v.id = ?
  `)

  const byColecao = db.prepare(`
    SELECT v.id, v.sessao_id, v.comprador_id,
           ses.fornecedor_id, ses.colecao_id, ses.data_visita,
           ses.vendedor, ses.cond_pag, ses.frete, ses.obs,
           f.nome AS fornecedor_nome,
           COUNT(p.id) AS num_pedidos
    FROM visitas v
    JOIN sessoes ses ON ses.id = v.sessao_id
    JOIN fornecedores f ON f.id = ses.fornecedor_id
    LEFT JOIN pedidos p ON p.visita_id = v.id
    WHERE ses.colecao_id = ?
    GROUP BY v.id
    ORDER BY ses.data_visita DESC
  `)

  return {
    create(data) {
      const id = insert.run(data).lastInsertRowid
      return byId.get(id)
    },
    list(colId) {
      return byColecao.all(colId)
    },
    getById(id) {
      return byId.get(id)
    }
  }
}
