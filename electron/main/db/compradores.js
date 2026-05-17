export function makeCompradores(db) {
  const insert = db.prepare(`INSERT INTO compradores (nome, cnpj, cidade) VALUES (@nome, @cnpj, @cidade)`)
  const byId = db.prepare(`SELECT * FROM compradores WHERE id = ?`)
  const all = db.prepare(`SELECT * FROM compradores ORDER BY id`)
  const upd = db.prepare(`UPDATE compradores SET nome = @nome, cnpj = @cnpj, cidade = @cidade WHERE id = @id`)
  const del = db.prepare(`DELETE FROM compradores WHERE id = ?`)

  return {
    create({ nome, cnpj = '', cidade = '' }) {
      const id = insert.run({ nome, cnpj, cidade }).lastInsertRowid
      return byId.get(id)
    },
    list() { return all.all() },
    update(id, { nome, cnpj = '', cidade = '' }) {
      upd.run({ nome, cnpj, cidade, id })
      return byId.get(id)
    },
    remove(id) {
      del.run(id)
    }
  }
}
