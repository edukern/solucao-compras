import { describe, it, expect } from 'vitest'
import { parseProdutoNome, detectGrade, parsePlanilhaRows } from '../electron/main/importar.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRow(col2, nomeProduto, qtdsByCol = {}) {
  const row = new Array(73).fill(0)
  row[2] = col2
  if (nomeProduto) row[1] = nomeProduto
  for (const [col, val] of Object.entries(qtdsByCol)) {
    row[Number(col)] = val
  }
  return row
}

// Minimal fixture: 3 header rows + 1 product block (CALCA FEM, AD grade cols 24-29)
// plus a blank separator row (row index 7)
const AD_QTDS = { 24: 10, 25: 20, 26: 30, 27: 15, 28: 5, 29: 0 }
const AD_VENDA = { 24: 8,  25: 18, 26: 25, 27: 12, 28: 4, 29: 0 }
const AD_EST   = { 24: 2,  25: 2,  26: 5,  27: 3,  28: 1, 29: 0 }

const FIXTURE_ROWS = [
  new Array(73).fill(0), // row 0 — CR header
  new Array(73).fill(0), // row 1 — grade labels
  new Array(73).fill(0), // row 2 — tamanho labels
  makeRow('Compra',  'CALCA FEM', AD_QTDS),
  makeRow('Venda',   null,        AD_VENDA),
  makeRow('Estoque', null,        AD_EST),
  makeRow('Pedido',  null,        { 24: 12, 25: 24 }),
  new Array(73).fill(0), // blank separator
]

// ---------------------------------------------------------------------------
// parseProdutoNome
// ---------------------------------------------------------------------------

describe('parseProdutoNome', () => {
  it('extracts tipo_produto and classe FEM', () => {
    const r = parseProdutoNome('CALCA FEM')
    expect(r).toEqual({ tipo_produto: 'CALCA', classe: 'FEM' })
  })

  it('extracts tipo_produto with multiple words', () => {
    const r = parseProdutoNome('CALCA JE FEM')
    expect(r).toEqual({ tipo_produto: 'CALCA JE', classe: 'FEM' })
  })

  it('extracts classe MASC', () => {
    const r = parseProdutoNome('BASICA MASC')
    expect(r).toEqual({ tipo_produto: 'BASICA', classe: 'MASC' })
  })

  it('extracts classe UNI', () => {
    const r = parseProdutoNome('ROUPAO UNI')
    expect(r).toEqual({ tipo_produto: 'ROUPAO', classe: 'UNI' })
  })

  it('defaults classe to UNI when last word is not FEM/MASC/UNI', () => {
    const r = parseProdutoNome('BERMUDA')
    expect(r).toEqual({ tipo_produto: 'BERMUDA', classe: 'UNI' })
  })

  it('uppercases the input', () => {
    const r = parseProdutoNome('calca fem')
    expect(r).toEqual({ tipo_produto: 'CALCA', classe: 'FEM' })
  })

  it('returns null for falsy input', () => {
    expect(parseProdutoNome(null)).toBeNull()
    expect(parseProdutoNome('')).toBeNull()
    expect(parseProdutoNome(0)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// detectGrade
// ---------------------------------------------------------------------------

describe('detectGrade', () => {
  it('detects AD grade from cols 24-29', () => {
    const row = new Array(73).fill(0)
    row[25] = 10
    const range = detectGrade(row)
    expect(range.tipo_grade).toBe('AD')
  })

  it('detects PP grade from cols 3-7', () => {
    const row = new Array(73).fill(0)
    row[4] = 5
    const range = detectGrade(row)
    expect(range.tipo_grade).toBe('PP')
  })

  it('detects EX grade from cols 30-39', () => {
    const row = new Array(73).fill(0)
    row[35] = 3
    const range = detectGrade(row)
    expect(range.tipo_grade).toBe('EX')
  })

  it('returns null when all grade cols are zero', () => {
    const row = new Array(73).fill(0)
    // put a value in a non-grade col (e.g. col 0)
    row[0] = 99
    expect(detectGrade(row)).toBeNull()
  })

  it('returns first matching grade range when multiple have values', () => {
    const row = new Array(73).fill(0)
    row[3] = 1   // PP col
    row[25] = 2  // AD col
    // PP range comes first in GRADE_RANGES so it should win
    const range = detectGrade(row)
    expect(range.tipo_grade).toBe('PP')
  })
})

// ---------------------------------------------------------------------------
// parsePlanilhaRows
// ---------------------------------------------------------------------------

describe('parsePlanilhaRows', () => {
  it('parses a single product block correctly', () => {
    const blocks = parsePlanilhaRows(FIXTURE_ROWS)
    expect(blocks).toHaveLength(1)
    const b = blocks[0]
    expect(b.nome).toBe('CALCA FEM')
    expect(b.compraRow[24]).toBe(10)
    expect(b.vendaRow[24]).toBe(8)
    expect(b.estoqueRow[24]).toBe(2)
  })

  it('ignores the Pedido row (not exposed on block)', () => {
    const blocks = parsePlanilhaRows(FIXTURE_ROWS)
    // block has no pedidoRow property — Pedido row is skipped
    expect(blocks[0].pedidoRow).toBeUndefined()
  })

  it('skips rows that are not Compra-type', () => {
    const rowsWithJunk = [
      new Array(73).fill(0), // row 0
      new Array(73).fill(0), // row 1
      new Array(73).fill(0), // row 2
      makeRow('Subtotal', null, {}),  // junk row — no col 1 product name
      ...FIXTURE_ROWS.slice(3),
    ]
    const blocks = parsePlanilhaRows(rowsWithJunk)
    expect(blocks).toHaveLength(1)
    expect(blocks[0].nome).toBe('CALCA FEM')
  })

  it('parses multiple product blocks', () => {
    const rows = [
      new Array(73).fill(0), // row 0
      new Array(73).fill(0), // row 1
      new Array(73).fill(0), // row 2
      makeRow('Compra',  'CALCA FEM',   { 24: 10 }),
      makeRow('Venda',   null,          { 24: 8  }),
      makeRow('Estoque', null,          { 24: 2  }),
      makeRow('Pedido',  null,          {}),
      new Array(73).fill(0),
      makeRow('Compra',  'BERMUDA MASC', { 40: 5  }),
      makeRow('Venda',   null,           { 40: 4  }),
      makeRow('Estoque', null,           { 40: 1  }),
      makeRow('Pedido',  null,           {}),
    ]
    const blocks = parsePlanilhaRows(rows)
    expect(blocks).toHaveLength(2)
    expect(blocks[1].nome).toBe('BERMUDA MASC')
    expect(blocks[1].compraRow[40]).toBe(5)
  })

  it('handles missing Venda/Estoque rows gracefully (sets them to null)', () => {
    const rows = [
      new Array(73).fill(0),
      new Array(73).fill(0),
      new Array(73).fill(0),
      makeRow('Compra', 'CALCA FEM', { 24: 10 }),
      // no Venda/Estoque rows — just another Compra immediately after
      makeRow('Compra', 'BERMUDA MASC', { 40: 5 }),
      makeRow('Venda',  null, { 40: 4 }),
      makeRow('Estoque',null, { 40: 1 }),
      makeRow('Pedido', null, {}),
    ]
    const blocks = parsePlanilhaRows(rows)
    // First block: vendaRow and estoqueRow will be null (next row is Compra, not Venda)
    expect(blocks[0].vendaRow).toBeNull()
    expect(blocks[0].estoqueRow).toBeNull()
    // Second block parses normally
    expect(blocks[1].nome).toBe('BERMUDA MASC')
  })
})
