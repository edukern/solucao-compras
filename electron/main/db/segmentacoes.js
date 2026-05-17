export function makeSegmentacoes(db) {
  const insert = db.prepare(
    `INSERT INTO segmentacoes (classificacao, tipo_produto, classe, tipo_grade, estacao)
     VALUES (@classificacao, @tipo_produto, @classe, @tipo_grade, @estacao)`
  )
  const byId = db.prepare(`SELECT * FROM segmentacoes WHERE id = ?`)
  const all = db.prepare(
    `SELECT * FROM segmentacoes ORDER BY classificacao, tipo_produto, classe`
  )
  const byClass = db.prepare(
    `SELECT * FROM segmentacoes WHERE classificacao = ? ORDER BY tipo_produto, classe`
  )
  const findExact = db.prepare(
    `SELECT id FROM segmentacoes
     WHERE classificacao = @classificacao AND tipo_produto = @tipo_produto
       AND classe = @classe AND tipo_grade = @tipo_grade`
  )
  const del = db.prepare(`DELETE FROM segmentacoes WHERE id = ?`)

  return {
    create(data) {
      return insert.run(data).lastInsertRowid
    },
    getById(id) {
      return byId.get(id)
    },
    list() {
      return all.all()
    },
    listByClass(classificacao) {
      return byClass.all(classificacao)
    },
    upsert(data) {
      const existing = findExact.get(data)
      if (existing) return existing.id
      return insert.run(data).lastInsertRowid
    },
    remove(id) {
      del.run(id)
    }
  }
}
