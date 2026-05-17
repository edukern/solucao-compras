export function makeFornecedores(db) {
  const insert       = db.prepare(`INSERT INTO fornecedores (nome, contato, categoria) VALUES (@nome, @contato, @categoria)`)
  const insertIgnore = db.prepare(`INSERT OR IGNORE INTO fornecedores (nome, contato, categoria) VALUES (@nome, '', @categoria)`)
  const byId         = db.prepare(`SELECT * FROM fornecedores WHERE id = ?`)
  const all          = db.prepare(`SELECT * FROM fornecedores ORDER BY nome`)
  const upd          = db.prepare(`UPDATE fornecedores SET nome = @nome, contato = @contato, categoria = @categoria WHERE id = @id`)
  const del          = db.prepare(`DELETE FROM fornecedores WHERE id = ?`)

  return {
    create({ nome, contato = '', categoria = null }) {
      const id = insert.run({ nome, contato, categoria }).lastInsertRowid
      return byId.get(id)
    },
    getById(id) { return byId.get(id) },
    list() { return all.all() },
    update(id, { nome, contato, categoria }) { upd.run({ id, nome, contato: contato ?? '', categoria: categoria ?? null }) },
    remove(id) { del.run(id) },
    importar(rows) {
      // rows = [{ nome, categoria }]
      const doImport = db.transaction((rows) => {
        let inserted = 0, skipped = 0
        rows.forEach(r => {
          const result = insertIgnore.run({ nome: r.nome, categoria: r.categoria || '' })
          if (result.changes > 0) inserted++
          else skipped++
        })
        return { inserted, skipped }
      })
      return doImport(rows)
    }
  }
}
