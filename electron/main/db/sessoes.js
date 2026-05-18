export function makeSessoes(db) {
  const insert = db.prepare(`
    INSERT INTO sessoes (fornecedor_id, colecao_id, data_visita, vendedor, cond_pag, frete, obs, transportadora)
    VALUES (@fornecedor_id, @colecao_id, @data_visita, @vendedor, @cond_pag, @frete, @obs, @transportadora)
  `)

  const insertVisita = db.prepare(`
    INSERT INTO visitas (sessao_id, comprador_id)
    VALUES (@sessao_id, @comprador_id)
  `)

  const selectById = db.prepare(`
    SELECT s.*, f.nome AS fornecedor_nome
    FROM sessoes s
    JOIN fornecedores f ON f.id = s.fornecedor_id
    WHERE s.id = ?
  `)

  const selectVisitasBySessao = db.prepare(`
    SELECT v.id AS visita_id, v.comprador_id,
           c.nome AS comprador_nome, c.cnpj AS comprador_cnpj, c.cidade AS comprador_cidade
    FROM visitas v
    JOIN compradores c ON c.id = v.comprador_id
    WHERE v.sessao_id = ?
    ORDER BY c.nome
  `)

  const selectByColecao = db.prepare(`
    SELECT s.*, f.nome AS fornecedor_nome
    FROM sessoes s
    JOIN fornecedores f ON f.id = s.fornecedor_id
    WHERE s.colecao_id = ?
    ORDER BY s.data_visita DESC
  `)

  const updateSessao = db.prepare(`
    UPDATE sessoes SET data_visita=@data_visita, vendedor=@vendedor,
    cond_pag=@cond_pag, frete=@frete, obs=@obs, transportadora=@transportadora WHERE id=@id
  `)

  const delPedidosBySessao = db.prepare(
    `DELETE FROM pedidos WHERE visita_id IN (SELECT id FROM visitas WHERE sessao_id = ?)`
  )
  const delVisitasBySessao = db.prepare(`DELETE FROM visitas WHERE sessao_id = ?`)
  const delSessao = db.prepare(`DELETE FROM sessoes WHERE id = ?`)
  const cancelarSessaoTx = db.transaction((id) => {
    delPedidosBySessao.run(id)
    delVisitasBySessao.run(id)
    delSessao.run(id)
  })

  return {
    create(data, lojaIds) {
      const {
        fornecedor_id, colecao_id, data_visita,
        vendedor = '', cond_pag = '', frete = '', obs = '', transportadora = ''
      } = data

      const doCreate = db.transaction(() => {
        const { lastInsertRowid: sessao_id } = insert.run({
          fornecedor_id, colecao_id, data_visita, vendedor, cond_pag, frete, obs, transportadora
        })
        const visitas = lojaIds.map(comprador_id => {
          const { lastInsertRowid: visita_id } = insertVisita.run({ sessao_id, comprador_id })
          return { visita_id: Number(visita_id), comprador_id }
        })
        const sessao = selectById.get(Number(sessao_id))
        return { ...sessao, visitas }
      })

      return doCreate()
    },

    list(colecao_id) {
      const sessoes = selectByColecao.all(colecao_id)
      return sessoes.map(s => ({
        ...s,
        visitas: selectVisitasBySessao.all(s.id)
      }))
    },

    getById(id) {
      const sessao = selectById.get(id)
      if (!sessao) return null
      return { ...sessao, visitas: selectVisitasBySessao.all(id) }
    },

    update(id, { data_visita, vendedor = '', cond_pag = '', frete = '', obs = '', transportadora = '' }) {
      updateSessao.run({ id, data_visita, vendedor, cond_pag, frete, obs, transportadora })
      return selectById.get(id)
    },

    cancelar(id) {
      cancelarSessaoTx(id)
    },
  }
}
