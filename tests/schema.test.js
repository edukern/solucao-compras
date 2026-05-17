// tests/schema.test.js
import { describe, it, expect } from 'vitest'
import { makeDb } from './setup.js'

describe('schema', () => {
  it('creates all tables', () => {
    const db = makeDb()
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map(r => r.name)
    expect(tables).toContain('colecoes')
    expect(tables).toContain('segmentacoes')
    expect(tables).toContain('grade_historica')
    expect(tables).toContain('projecoes')
    expect(tables).toContain('fornecedores')
    expect(tables).toContain('pedidos')
  })

  it('enforces foreign keys', () => {
    const db = makeDb()
    expect(() =>
      db.prepare('INSERT INTO grade_historica (segmentacao_id, colecao_id, tamanho, ordem) VALUES (999, 999, "P", 0)').run()
    ).toThrow()
  })

  it('schema migration adds tipo_grade and new tables', () => {
    const db = makeDb()

    const segCols = db.pragma('table_info(segmentacoes)').map(c => c.name)
    expect(segCols).toContain('tipo_grade')

    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all().map(r => r.name)
    expect(tables).toContain('visitas')
    expect(tables).toContain('pedido_itens')

    // pedidos should NOT have 'tamanho' column
    const pedCols = db.pragma('table_info(pedidos)').map(c => c.name)
    expect(pedCols).not.toContain('tamanho')
    expect(pedCols).toContain('visita_id')
    expect(pedCols).toContain('comprador_id')
  })

  it('migration is idempotent — safe to run twice', async () => {
    const db = makeDb()
    const { runMigrations } = await import('../electron/main/db/schema.js')
    expect(() => runMigrations(db)).not.toThrow()
  })

  it('migration preserves existing segmentacoes rows', async () => {
    const db = makeDb()
    db.prepare(`INSERT INTO segmentacoes (classificacao, tipo_produto, classe, estacao, tipo_grade)
      VALUES ('AD','CALCA','MASC','inverno','AD')`).run()
    const { runMigrations } = await import('../electron/main/db/schema.js')
    expect(() => runMigrations(db)).not.toThrow()
    const rows = db.prepare(`SELECT * FROM segmentacoes`).all()
    expect(rows).toHaveLength(1)
    expect(rows[0].tipo_grade).toBe('AD')
  })
})
