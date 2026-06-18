import { describe, it, expect } from 'vitest'
import { computeItensDelta, computeDeltaPorVisita } from '../src/renderer/src/services/pedidoMerge.js'

describe('computeItensDelta', () => {
  it('returns only refs whose item map changed', () => {
    const prev = { 'A|': { 1: { P: 2 } }, 'B|': { 1: { M: 3 } } }
    const next = { 'A|': { 1: { P: 2 } }, 'B|': { 1: { M: 4 } } }
    const delta = computeItensDelta(prev, next)
    expect(delta).toEqual(['B|'])
  })

  it('detects a newly added ref', () => {
    const prev = {}
    const next = { 'A|': { 1: { P: 1 } } }
    expect(computeItensDelta(prev, next)).toEqual(['A|'])
  })

  it('detects removal of a size', () => {
    const prev = { 'A|': { 1: { P: 1, M: 2 } } }
    const next = { 'A|': { 1: { P: 1 } } }
    expect(computeItensDelta(prev, next)).toEqual(['A|'])
  })

  it('returns empty when nothing changed', () => {
    const prev = { 'A|': { 1: { P: 1 } } }
    const next = { 'A|': { 1: { P: 1 } } }
    expect(computeItensDelta(prev, next)).toEqual([])
  })
})

describe('computeDeltaPorVisita', () => {
  it('only flags the visita that actually changed for a ref', () => {
    // ref 'A|' existe nas lojas 1 e 2; só a loja 2 mudou
    const prev = { 'A|': { 1: { P: 1 }, 2: { P: 1 } } }
    const next = { 'A|': { 1: { P: 1 }, 2: { P: 9 } } }
    expect(computeDeltaPorVisita(prev, next)).toEqual({ 2: ['A|'] })
  })

  it('does NOT touch a store that another writer filled (overwrite guard)', () => {
    // organizador só digitou ref A para a loja 2; loja 1 (preenchida por ela mesma) intacta
    const prev = { 'A|': { 1: { P: 5 } } }
    const next = { 'A|': { 1: { P: 5 }, 2: { M: 3 } } }
    // a loja 1 NÃO pode aparecer no delta — senão seria regravada/apagada
    expect(computeDeltaPorVisita(prev, next)).toEqual({ 2: ['A|'] })
  })

  it('groups multiple changed refs under their visita', () => {
    const prev = { 'A|': { 1: { P: 1 } }, 'B|': { 1: { M: 2 } } }
    const next = { 'A|': { 1: { P: 2 } }, 'B|': { 1: { M: 3 } } }
    expect(computeDeltaPorVisita(prev, next)).toEqual({ 1: ['A|', 'B|'] })
  })

  it('returns empty object when nothing changed', () => {
    const prev = { 'A|': { 1: { P: 1 } } }
    const next = { 'A|': { 1: { P: 1 } } }
    expect(computeDeltaPorVisita(prev, next)).toEqual({})
  })
})
