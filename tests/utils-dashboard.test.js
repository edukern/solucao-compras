import { describe, it, expect } from 'vitest'
import { aggregateSegmentacao, aggregateDashboard } from '../src/renderer/src/utils/dashboard.js'

describe('aggregateSegmentacao', () => {
  it('calculates projecao as sum of qtd_ajustada', () => {
    const proj = [
      { tamanho: 'P', qtd_ajustada: 50 },
      { tamanho: 'M', qtd_ajustada: 100 },
    ]
    const result = aggregateSegmentacao(proj, [])
    expect(result.projecao).toBe(150)
    expect(result.comprado).toBe(0)
    expect(result.saldo).toBe(150)
    expect(result.pct).toBe(0)
  })

  it('calculates comprado as sum of total_pedido', () => {
    const proj = [{ tamanho: 'P', qtd_ajustada: 100 }]
    const totais = [{ tamanho: 'P', total_pedido: 60 }]
    const result = aggregateSegmentacao(proj, totais)
    expect(result.comprado).toBe(60)
    expect(result.saldo).toBe(40)
    expect(result.pct).toBe(60)
  })

  it('caps pct at 100 when comprado exceeds projecao', () => {
    const proj = [{ tamanho: 'P', qtd_ajustada: 50 }]
    const totais = [{ tamanho: 'P', total_pedido: 60 }]
    const result = aggregateSegmentacao(proj, totais)
    expect(result.pct).toBe(100)
    expect(result.saldo).toBe(0)
  })

  it('returns pct 0 when projecao is 0', () => {
    const result = aggregateSegmentacao([], [])
    expect(result.projecao).toBe(0)
    expect(result.pct).toBe(0)
  })
})

describe('aggregateDashboard', () => {
  it('sums all segmentacao rows', () => {
    const rows = [
      { projecao: 100, comprado: 60, saldo: 40 },
      { projecao: 200, comprado: 100, saldo: 100 },
    ]
    const result = aggregateDashboard(rows)
    expect(result.totalProjecao).toBe(300)
    expect(result.totalComprado).toBe(160)
    expect(result.totalSaldo).toBe(140)
    expect(result.pctGeral).toBe(53)
  })

  it('returns zeros for empty rows', () => {
    const result = aggregateDashboard([])
    expect(result.totalProjecao).toBe(0)
    expect(result.totalComprado).toBe(0)
    expect(result.pctGeral).toBe(0)
  })
})
