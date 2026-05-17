// tests/projecoes.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeColecoes } from '../electron/main/db/colecoes.js'
import { makeSegmentacoes } from '../electron/main/db/segmentacoes.js'
import { makeGrades } from '../electron/main/db/grades.js'
import { makeProjecoes } from '../electron/main/db/projecoes.js'

let db, col, seg, gr, proj
let colV24, colV25, colV26, segId

beforeEach(() => {
  db = makeDb()
  col = makeColecoes(db)
  seg = makeSegmentacoes(db)
  gr = makeGrades(db)
  proj = makeProjecoes(db)

  colV24 = col.create({ nome: 'Verão 2024', estacao: 'verao', ano: 2024 }).id
  colV25 = col.create({ nome: 'Verão 2025', estacao: 'verao', ano: 2025 }).id
  colV26 = col.create({ nome: 'Verão 2026', estacao: 'verao', ano: 2026 }).id
  segId = seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', tipo_grade: 'AD', estacao: 'VERAO' })

  gr.saveGrade(segId, colV24, [
    { tamanho: 'P', ordem: 0, qtd_comprada: 100, qtd_vendida: 90, qtd_estoque: 10 },
    { tamanho: 'M', ordem: 1, qtd_comprada: 200, qtd_vendida: 180, qtd_estoque: 20 },
    { tamanho: 'G', ordem: 2, qtd_comprada: 150, qtd_vendida: 130, qtd_estoque: 20 },
  ])
  gr.saveGrade(segId, colV25, [
    { tamanho: 'P', ordem: 0, qtd_comprada: 120, qtd_vendida: 110, qtd_estoque: 10 },
    { tamanho: 'M', ordem: 1, qtd_comprada: 240, qtd_vendida: 220, qtd_estoque: 20 },
    { tamanho: 'G', ordem: 2, qtd_comprada: 180, qtd_vendida: 160, qtd_estoque: 20 },
  ])
})

describe('projecoes - calcular', () => {
  it('calculates simple average from 2 previous equivalent collections', () => {
    // P: (100+120)/2 = 110, M: (200+240)/2 = 220, G: (150+180)/2 = 165
    const rows = proj.calcular(segId, colV26, [colV24, colV25], 'media_simples')
    expect(rows.find(r => r.tamanho === 'P').qtd_projetada).toBe(110)
    expect(rows.find(r => r.tamanho === 'M').qtd_projetada).toBe(220)
    expect(rows.find(r => r.tamanho === 'G').qtd_projetada).toBe(165)
  })

  it('calculates weighted average (0.4 * n-2 + 0.6 * n-1)', () => {
    // P: 0.4*100 + 0.6*120 = 40+72 = 112, M: 0.4*200 + 0.6*240 = 80+144 = 224
    const rows = proj.calcular(segId, colV26, [colV24, colV25], 'media_ponderada')
    expect(rows.find(r => r.tamanho === 'P').qtd_projetada).toBe(112)
    expect(rows.find(r => r.tamanho === 'M').qtd_projetada).toBe(224)
  })

  it('rounds results to nearest integer', () => {
    // P: (100+121)/2 = 110.5 → 111
    gr.saveGrade(segId, colV25, [
      { tamanho: 'P', ordem: 0, qtd_comprada: 121, qtd_vendida: 110, qtd_estoque: 11 },
      { tamanho: 'M', ordem: 1, qtd_comprada: 240, qtd_vendida: 220, qtd_estoque: 20 },
      { tamanho: 'G', ordem: 2, qtd_comprada: 180, qtd_vendida: 160, qtd_estoque: 20 },
    ])
    const rows = proj.calcular(segId, colV26, [colV24, colV25], 'media_simples')
    expect(rows.find(r => r.tamanho === 'P').qtd_projetada).toBe(111)
  })
})

describe('projecoes - salvar e ajustar', () => {
  it('saves calculated projection with qtd_ajustada = qtd_projetada', () => {
    const rows = proj.calcular(segId, colV26, [colV24, colV25], 'media_simples')
    proj.salvar(segId, colV26, rows, 'media_simples')
    const saved = proj.getProjecao(segId, colV26)
    expect(saved.find(r => r.tamanho === 'P').qtd_ajustada).toBe(110)
  })

  it('allows manual adjustment of individual sizes', () => {
    const rows = proj.calcular(segId, colV26, [colV24, colV25], 'media_simples')
    proj.salvar(segId, colV26, rows, 'media_simples')
    proj.ajustar(segId, colV26, 'P', 90)
    const saved = proj.getProjecao(segId, colV26)
    expect(saved.find(r => r.tamanho === 'P').qtd_ajustada).toBe(90)
    expect(saved.find(r => r.tamanho === 'P').qtd_projetada).toBe(110)
  })

  it('restores calculated value on reset', () => {
    const rows = proj.calcular(segId, colV26, [colV24, colV25], 'media_simples')
    proj.salvar(segId, colV26, rows, 'media_simples')
    proj.ajustar(segId, colV26, 'P', 90)
    proj.restaurar(segId, colV26, 'P')
    const saved = proj.getProjecao(segId, colV26)
    expect(saved.find(r => r.tamanho === 'P').qtd_ajustada).toBe(110)
  })
})
