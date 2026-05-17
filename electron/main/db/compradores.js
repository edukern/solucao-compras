export function makeCompradores(db) {
  const insert = db.prepare(`INSERT INTO compradores (nome, cnpj, cidade) VALUES (@nome, @cnpj, @cidade)`)
  const byId = db.prepare(`SELECT * FROM compradores WHERE id = ?`)
  const all = db.prepare(`SELECT * FROM compradores ORDER BY id`)

  return {
    create({ nome, cnpj = '', cidade = '' }) {
      const id = insert.run({ nome, cnpj, cidade }).lastInsertRowid
      return byId.get(id)
    },
    list() { return all.all() },
  }
}
