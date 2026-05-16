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
})
