import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeColecoes } from '../electron/main/db/colecoes.js'
import { makeSegmentacoes } from '../electron/main/db/segmentacoes.js'
import { makeGrades } from '../electron/main/db/grades.js'

let db, col, seg, gr, colId, segId

beforeEach(() => {
  db = makeDb()
  col = makeColecoes(db)
  seg = makeSegmentacoes(db)
  gr = makeGrades(db)
  colId = col.create({ nome: 'Verão 2025', estacao: 'verao', ano: 2025 }).id
  segId = seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', tipo_grade: 'AD', estacao: 'VERAO' })
})

describe('grades', () => {
  it('saves and retrieves grade for a segmentation+collection', () => {
    gr.saveGrade(segId, colId, [
      { tamanho: 'P', ordem: 0, qtd_comprada: 100, qtd_vendida: 80, qtd_estoque: 20 },
      { tamanho: 'M', ordem: 1, qtd_comprada: 200, qtd_vendida: 180, qtd_estoque: 20 },
    ])
    const rows = gr.getGrade(segId, colId)
    expect(rows).toHaveLength(2)
    expect(rows[0].tamanho).toBe('P')
    expect(rows[0].qtd_comprada).toBe(100)
  })

  it('upserts on conflict (same seg+col+tamanho)', () => {
    gr.saveGrade(segId, colId, [{ tamanho: 'P', ordem: 0, qtd_comprada: 100, qtd_vendida: 80, qtd_estoque: 20 }])
    gr.saveGrade(segId, colId, [{ tamanho: 'P', ordem: 0, qtd_comprada: 150, qtd_vendida: 90, qtd_estoque: 60 }])
    const rows = gr.getGrade(segId, colId)
    expect(rows).toHaveLength(1)
    expect(rows[0].qtd_comprada).toBe(150)
  })

  it('returns rows ordered by ordem', () => {
    gr.saveGrade(segId, colId, [
      { tamanho: 'GG', ordem: 3, qtd_comprada: 50, qtd_vendida: 40, qtd_estoque: 10 },
      { tamanho: 'P',  ordem: 0, qtd_comprada: 100, qtd_vendida: 80, qtd_estoque: 20 },
    ])
    const rows = gr.getGrade(segId, colId)
    expect(rows[0].tamanho).toBe('P')
    expect(rows[1].tamanho).toBe('GG')
  })
})
