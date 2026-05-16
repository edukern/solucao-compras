import { describe, it, expect } from 'vitest'
import { findBaseColecoes } from '../src/renderer/src/utils/colecoes.js'

const COLLECTIONS = [
  { id: 1, nome: 'Verão 2024',   estacao: 'verao',   ano: 2024 },
  { id: 2, nome: 'Inverno 2024', estacao: 'inverno', ano: 2024 },
  { id: 3, nome: 'Verão 2025',   estacao: 'verao',   ano: 2025 },
  { id: 4, nome: 'Inverno 2025', estacao: 'inverno', ano: 2025 },
  { id: 5, nome: 'Verão 2026',   estacao: 'verao',   ano: 2026 },
]

describe('findBaseColecoes', () => {
  it('returns 2 previous same-season collections, oldest first [n-2, n-1]', () => {
    const target = COLLECTIONS.find(c => c.id === 5)
    const base = findBaseColecoes(COLLECTIONS, target)
    expect(base).toHaveLength(2)
    expect(base[0].id).toBe(1)
    expect(base[1].id).toBe(3)
  })

  it('returns at most 2 even when more previous same-season collections exist', () => {
    const many = [
      { id: 10, estacao: 'verao', ano: 2022 },
      { id: 11, estacao: 'verao', ano: 2023 },
      { id: 12, estacao: 'verao', ano: 2024 },
      { id: 13, estacao: 'verao', ano: 2025 },
      { id: 14, estacao: 'verao', ano: 2026 },
    ]
    const base = findBaseColecoes(many, many[4])
    expect(base).toHaveLength(2)
    expect(base[0].id).toBe(12)
    expect(base[1].id).toBe(13)
  })

  it('does not include different-season collections', () => {
    const target = COLLECTIONS.find(c => c.id === 5)
    const base = findBaseColecoes(COLLECTIONS, target)
    expect(base.every(c => c.estacao === 'verao')).toBe(true)
  })

  it('returns empty array when no previous same-season collections exist', () => {
    const target = { id: 99, estacao: 'verao', ano: 2023 }
    expect(findBaseColecoes([target], target)).toHaveLength(0)
  })

  it('returns 1 when only one previous same-season collection exists', () => {
    const target = COLLECTIONS.find(c => c.id === 3)
    const base = findBaseColecoes(COLLECTIONS, target)
    expect(base).toHaveLength(1)
    expect(base[0].id).toBe(1)
  })
})
