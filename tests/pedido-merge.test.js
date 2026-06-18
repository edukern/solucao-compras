import { describe, it, expect } from 'vitest'
import { computeItensDelta } from '../src/renderer/src/services/pedidoMerge.js'

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
