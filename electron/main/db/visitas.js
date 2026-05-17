export function makeVisitas(db) {
  const insert = db.prepare(`
    INSERT INTO visitas (fornecedor_id, colecao_id, data_visita, vendedor, cond_pag, frete, obs)
    VALUES (@fornecedor_id, @colecao_id, @data_visita, @vendedor, @cond_pag, @frete, @obs)
  `)

  const byId = db.prepare(`
    SELECT v.*, f.nome AS fornecedor_nome
    FROM visitas v JOIN fornecedores f ON f.id = v.fornecedor_id
    WHERE v.id = ?
  `)

  const byColecao = db.prepare(`
    SELECT v.*, f.nome AS fornecedor_nome,
           COUNT(p.id) AS num_pedidos
    FROM visitas v
    JOIN fornecedores f ON f.id = v.fornecedor_id
    LEFT JOIN pedidos p ON p.visita_id = v.id
    WHERE v.colecao_id = ?
    GROUP BY v.id
    ORDER BY v.data_visita DESC
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
