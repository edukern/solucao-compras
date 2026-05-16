export function makeFornecedores(db) {
  const insert = db.prepare(`INSERT INTO fornecedores (nome, contato) VALUES (@nome, @contato)`)
  const byId = db.prepare(`SELECT * FROM fornecedores WHERE id = ?`)
  const all = db.prepare(`SELECT * FROM fornecedores ORDER BY nome`)
  const upd = db.prepare(`UPDATE fornecedores SET nome = @nome, contato = @contato WHERE id = @id`)

  return {
    create({ nome, contato = '' }) {
      return insert.run({ nome, contato }).lastInsertRowid
    },
    getById(id) { return byId.get(id) },
    list() { return all.all() },
    update(id, { nome, contato }) { upd.run({ id, nome, contato }) }
  }
}
