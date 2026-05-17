import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeColecoes } from '../electron/main/db/colecoes.js'

let db, col

beforeEach(() => {
  db = makeDb()
  col = makeColecoes(db)
})

describe('colecoes', () => {
  it('creates a collection and returns it by id', () => {
    const c = col.create({ nome: 'Verão 2026', estacao: 'verao', ano: 2026 })
    expect(c.id).toBeDefined()
    expect(c.nome).toBe('Verão 2026')
    expect(c.estacao).toBe('verao')
    expect(c.status).toBe('planejamento')
  })

  it('create returns full object, not just id', () => {
    const result = col.create({ nome: 'Verão 2026', estacao: 'verao', ano: 2026 })
    expect(result).toMatchObject({ id: 1, nome: 'Verão 2026', estacao: 'verao', ano: 2026 })
    expect(typeof result).toBe('object')
  })

  it('lists all collections', () => {
    col.create({ nome: 'Verão 2025', estacao: 'verao', ano: 2025 })
    col.create({ nome: 'Inverno 2025', estacao: 'inverno', ano: 2025 })
    expect(col.list()).toHaveLength(2)
  })

  it('updates status', () => {
    const c = col.create({ nome: 'Verão 2026', estacao: 'verao', ano: 2026 })
    col.setStatus(c.id, 'em_compra')
    expect(col.getById(c.id).status).toBe('em_compra')
  })

  it('rejects invalid estacao', () => {
    expect(() =>
      col.create({ nome: 'X', estacao: 'outono', ano: 2026 })
    ).toThrow()
  })
})
