export function makeCompradores(db) {
  const insert = db.prepare(`INSERT INTO compradores (nome, cnpj, cidade) VALUES (@nome, @cnpj, @cidade)`)
  const all = db.prepare(`SELECT * FROM compradores ORDER BY id`)

  return {
    create({ nome, cnpj = '', cidade = '' }) {
      return insert.run({ nome, cnpj, cidade }).lastInsertRowid
    },
    list() { return all.all() },
  }
}
