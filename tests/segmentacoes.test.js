import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeSegmentacoes } from '../electron/main/db/segmentacoes.js'

let db, seg

beforeEach(() => {
  db = makeDb()
  seg = makeSegmentacoes(db)
})

describe('segmentacoes', () => {
  it('creates and retrieves a segmentation', () => {
    const id = seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', tipo_grade: 'AD', estacao: 'VERAO' })
    const s = seg.getById(id)
    expect(s.classificacao).toBe('AD')
    expect(s.tipo_produto).toBe('BERMUDA')
  })

  it('create includes tipo_grade', () => {
    const id = seg.create({ classificacao: 'AD', tipo_produto: 'CALCA', classe: 'MASC', tipo_grade: 'AD', estacao: 'inverno' })
    const row = seg.getById(id)
    expect(row.tipo_grade).toBe('AD')
  })

  it('enforces unique (classificacao, tipo_produto, classe, tipo_grade)', () => {
    seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', tipo_grade: 'AD', estacao: 'VERAO' })
    expect(() =>
      seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', tipo_grade: 'AD', estacao: 'VERAO' })
    ).toThrow()
  })

  it('lists all segmentations', () => {
    seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', tipo_grade: 'AD', estacao: 'VERAO' })
    seg.create({ classificacao: 'EX', tipo_produto: 'BERMUDA', classe: 'FEM', tipo_grade: 'EX', estacao: 'VERAO' })
    expect(seg.list()).toHaveLength(2)
  })

  it('lists filtered by classificacao', () => {
    seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', tipo_grade: 'AD', estacao: 'VERAO' })
    seg.create({ classificacao: 'EX', tipo_produto: 'BERMUDA', classe: 'FEM', tipo_grade: 'EX', estacao: 'VERAO' })
    expect(seg.listByClass('AD')).toHaveLength(1)
  })

  it('upsert deduplicates by all 4 key fields including tipo_grade', () => {
    const id1 = seg.upsert({ classificacao: 'AD', tipo_produto: 'CALCA', classe: 'MASC', tipo_grade: 'AD', estacao: 'inverno' })
    const id2 = seg.upsert({ classificacao: 'AD', tipo_produto: 'CALCA', classe: 'MASC', tipo_grade: 'AD', estacao: 'inverno' })
    expect(id1).toBe(id2)
  })

  it('upsert allows same (classificacao, tipo_produto, classe) with different tipo_grade', () => {
    const id1 = seg.upsert({ classificacao: 'EX', tipo_produto: 'CALCA', classe: 'MASC', tipo_grade: 'EX', estacao: 'inverno' })
    const id2 = seg.upsert({ classificacao: 'AD', tipo_produto: 'CALCA', classe: 'MASC', tipo_grade: 'AD', estacao: 'inverno' })
    expect(id1).not.toBe(id2)
  })

  it('list returns tipo_grade for all rows', () => {
    seg.create({ classificacao: 'INF', tipo_produto: 'VESTIDO', classe: 'FEM', tipo_grade: 'INF', estacao: 'verao' })
    const list = seg.list()
    expect(list[0].tipo_grade).toBe('INF')
  })
})
