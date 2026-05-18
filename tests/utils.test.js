import { describe, it, expect } from 'vitest'
import { aggregateSegmentacao, aggregateDashboard } from '../src/renderer/src/utils/dashboard.js'
import { findBaseColecoes } from '../src/renderer/src/utils/colecoes.js'
import { tamanhosDeTipoGrade, gradesPorClassificacao } from '../src/renderer/src/constants/grades.js'

// ─── aggregateSegmentacao ────────────────────────────────────────────────────

describe('aggregateSegmentacao', () => {
  it('sem pedidos: comprado=0, saldo=projecao, pct=0', () => {
    const proj = [{ qtd_ajustada: 10 }, { qtd_ajustada: 20 }]
    const result = aggregateSegmentacao(proj, [])
    expect(result).toEqual({ projecao: 30, comprado: 0, saldo: 30, pct: 0 })
  })

  it('comprado = projecao: saldo=0, pct=100', () => {
    const proj = [{ qtd_ajustada: 50 }]
    const totais = [{ total_pedido: 50 }]
    const result = aggregateSegmentacao(proj, totais)
    expect(result).toEqual({ projecao: 50, comprado: 50, saldo: 0, pct: 100 })
  })

  it('comprado > projecao: saldo nunca fica negativo, pct máximo 100', () => {
    const proj = [{ qtd_ajustada: 30 }]
    const totais = [{ total_pedido: 40 }]
    const result = aggregateSegmentacao(proj, totais)
    expect(result.saldo).toBe(0)
    expect(result.pct).toBe(100)
  })

  it('projeção zero: pct=0, não divide por zero', () => {
    const result = aggregateSegmentacao([], [{ total_pedido: 5 }])
    expect(result.pct).toBe(0)
    expect(result.projecao).toBe(0)
  })

  it('arredonda pct corretamente', () => {
    const proj = [{ qtd_ajustada: 3 }]
    const totais = [{ total_pedido: 1 }]
    const result = aggregateSegmentacao(proj, totais)
    expect(result.pct).toBe(33) // Math.round(1/3 * 100)
  })
})

// ─── aggregateDashboard ──────────────────────────────────────────────────────

describe('aggregateDashboard', () => {
  it('sem linhas: tudo zero', () => {
    expect(aggregateDashboard([])).toEqual({ totalProjecao: 0, totalComprado: 0, totalSaldo: 0, pctGeral: 0 })
  })

  it('soma corretamente várias segmentações', () => {
    const rows = [
      { projecao: 100, comprado: 60, saldo: 40 },
      { projecao: 50,  comprado: 50, saldo: 0  },
    ]
    const result = aggregateDashboard(rows)
    expect(result.totalProjecao).toBe(150)
    expect(result.totalComprado).toBe(110)
    expect(result.totalSaldo).toBe(40)
    expect(result.pctGeral).toBe(73) // Math.round(110/150*100)
  })
})

// ─── findBaseColecoes ────────────────────────────────────────────────────────

describe('findBaseColecoes', () => {
  const cols = [
    { id: 1, estacao: 'verao',   ano: 2022 },
    { id: 2, estacao: 'verao',   ano: 2023 },
    { id: 3, estacao: 'verao',   ano: 2024 },
    { id: 4, estacao: 'inverno', ano: 2023 },
    { id: 5, estacao: 'verao',   ano: 2025 },
  ]

  it('retorna as 2 coleções mais recentes da mesma estação, excluindo o alvo', () => {
    const target = { id: 5, estacao: 'verao', ano: 2025 }
    const result = findBaseColecoes(cols, target)
    expect(result).toHaveLength(2)
    expect(result[0].ano).toBe(2023) // N-2
    expect(result[1].ano).toBe(2024) // N-1
  })

  it('exclui coleções de outra estação', () => {
    const target = { id: 5, estacao: 'verao', ano: 2025 }
    const result = findBaseColecoes(cols, target)
    expect(result.every(c => c.estacao === 'verao')).toBe(true)
  })

  it('retorna vazio se não há histórico suficiente', () => {
    const target = { id: 1, estacao: 'verao', ano: 2022 }
    const result = findBaseColecoes(cols, target)
    expect(result).toHaveLength(0)
  })
})

// ─── grades ─────────────────────────────────────────────────────────────────

describe('tamanhosDeTipoGrade', () => {
  it('AD retorna tamanhos corretos', () => {
    expect(tamanhosDeTipoGrade('AD')).toEqual(['PP', 'P', 'M', 'G', 'GG', 'XG'])
  })

  it('AD1 retorna tamanhos numéricos de adulto', () => {
    expect(tamanhosDeTipoGrade('AD1')).toContain('34')
    expect(tamanhosDeTipoGrade('AD1')).toContain('52')
  })

  it('PP retorna tamanhos de bebê prematuro', () => {
    expect(tamanhosDeTipoGrade('PP')).toContain('RN')
  })

  it('grade desconhecida retorna array vazio', () => {
    expect(tamanhosDeTipoGrade('INEXISTENTE')).toEqual([])
  })

  it('grades TBD retornam tamanho U', () => {
    for (const g of ['CASAL', 'KING', 'QUEEN', 'SOLT', 'LAR', 'GERAL']) {
      expect(tamanhosDeTipoGrade(g)).toEqual(['U'])
    }
  })
})

describe('gradesPorClassificacao', () => {
  it('AD tem 3 opções (AD, AD1, AD2)', () => {
    const opts = gradesPorClassificacao('AD')
    expect(opts).toHaveLength(3)
    expect(opts.map(o => o.tipo_grade)).toContain('AD')
    expect(opts.map(o => o.tipo_grade)).toContain('AD1')
    expect(opts.map(o => o.tipo_grade)).toContain('AD2')
  })

  it('PP tem apenas 1 opção', () => {
    expect(gradesPorClassificacao('PP')).toHaveLength(1)
  })

  it('EX tem 3 opções (EX, EX1, EX2)', () => {
    expect(gradesPorClassificacao('EX')).toHaveLength(3)
  })

  it('classificação desconhecida retorna vazio', () => {
    expect(gradesPorClassificacao('NAOEXISTE')).toEqual([])
  })
})
