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
    const id = seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
    const s = seg.getById(id)
    expect(s.classificacao).toBe('AD')
    expect(s.tipo_produto).toBe('BERMUDA')
  })

  it('enforces unique (classificacao, tipo_produto, classe)', () => {
    seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
    expect(() =>
      seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
    ).toThrow()
  })

  it('lists all segmentations', () => {
    seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
    seg.create({ classificacao: 'EX', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
    expect(seg.list()).toHaveLength(2)
  })

  it('lists filtered by classificacao', () => {
    seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
    seg.create({ classificacao: 'EX', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
    expect(seg.listByClass('AD')).toHaveLength(1)
  })

  it('upserts — returns existing id if already exists', () => {
    const id1 = seg.upsert({ classificacao: 'AD', tipo_produto: 'CAMISETA', classe: 'MASC', estacao: 'ANO TODO' })
    const id2 = seg.upsert({ classificacao: 'AD', tipo_produto: 'CAMISETA', classe: 'MASC', estacao: 'ANO TODO' })
    expect(id1).toBe(id2)
  })
})
