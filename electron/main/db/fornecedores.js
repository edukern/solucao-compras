export function makeFornecedores(db) {
  const insert = db.prepare(`INSERT INTO fornecedores (nome, contato, categoria) VALUES (@nome, @contato, @categoria)`)
  const byId = db.prepare(`SELECT * FROM fornecedores WHERE id = ?`)
  const all = db.prepare(`SELECT * FROM fornecedores ORDER BY nome`)
  const upd = db.prepare(`UPDATE fornecedores SET nome = @nome, contato = @contato, categoria = @categoria WHERE id = @id`)

  return {
    create({ nome, contato = '', categoria = null }) {
      const id = insert.run({ nome, contato, categoria }).lastInsertRowid
      return byId.get(id)
    },
    getById(id) { return byId.get(id) },
    list() { return all.all() },
    update(id, { nome, contato, categoria }) { upd.run({ id, nome, contato: contato ?? '', categoria: categoria ?? null }) }
  }
}
