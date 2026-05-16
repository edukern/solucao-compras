export function makeColecoes(db) {
  const insert = db.prepare(
    `INSERT INTO colecoes (nome, estacao, ano) VALUES (@nome, @estacao, @ano)`
  )
  const byId = db.prepare(`SELECT * FROM colecoes WHERE id = ?`)
  const all = db.prepare(`SELECT * FROM colecoes ORDER BY ano DESC, estacao`)
  const updateStatus = db.prepare(`UPDATE colecoes SET status = ? WHERE id = ?`)

  return {
    create({ nome, estacao, ano }) {
      return insert.run({ nome, estacao, ano }).lastInsertRowid
    },
    getById(id) {
      return byId.get(id)
    },
    list() {
      return all.all()
    },
    setStatus(id, status) {
      updateStatus.run(status, id)
    }
  }
}
