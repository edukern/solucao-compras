import { describe, it, expect } from 'vitest'
import { ordenarTamanhos, agruparPorReferencia, editState } from '../src/renderer/src/screens/reposicaoGrade.js'

describe('ordenarTamanhos', () => {
  it('usa a ordem da grade AD quando todos os tamanhos cabem nela', () => {
    expect(ordenarTamanhos(['XG', 'P', 'GG', 'M', 'PP', 'G'])).toEqual(['PP', 'P', 'M', 'G', 'GG', 'XG'])
  })

  it('usa a ordem da grade EX (G1..G10) para tamanhos G1/G2/G3 fora de ordem', () => {
    expect(ordenarTamanhos(['G3', 'G1', 'G2'])).toEqual(['G1', 'G2', 'G3'])
  })

  it('usa a ordem de uma grade numérica (AD1) quando o subconjunto cabe nela', () => {
    expect(ordenarTamanhos(['46', '38', '40'])).toEqual(['38', '40', '46'])
  })

  it('sem grade que sirva, põe numéricos crescentes antes do texto', () => {
    // nenhuma grade tem "0" e "U" juntos -> cai no fallback
    expect(ordenarTamanhos(['U', '0'])).toEqual(['0', 'U'])
  })

  it('fallback ordena rótulos de texto alfabeticamente', () => {
    expect(ordenarTamanhos(['XPTO', 'ABC'])).toEqual(['ABC', 'XPTO'])
  })

  it('tamanho único passa sem mexer', () => {
    expect(ordenarTamanhos(['U'])).toEqual(['U'])
  })

  it('não muta o array recebido', () => {
    const orig = ['XG', 'P', 'M']
    ordenarTamanhos(orig)
    expect(orig).toEqual(['XG', 'P', 'M'])
  })
})

describe('agruparPorReferencia', () => {
  const itens = [
    { id: 'a', referencia: 'R1', tamanho: 'G',  qtd: 7, nome: 'CAMISETA', tipo: 'AD', classe: 'FEM' },
    { id: 'b', referencia: 'R1', tamanho: 'P',  qtd: 4, nome: 'CAMISETA', tipo: 'AD', classe: 'FEM' },
    { id: 'c', referencia: 'R1', tamanho: 'M',  qtd: 10, nome: 'CAMISETA', tipo: 'AD', classe: 'FEM' },
    { id: 'd', referencia: 'R2', tamanho: 'U',  qtd: 15 },
  ]

  it('cria um grupo por referência, na ordem de aparição', () => {
    const g = agruparPorReferencia(itens)
    expect(g.map(x => x.referencia)).toEqual(['R1', 'R2'])
  })

  it('ordena os tamanhos de cada grupo pela grade', () => {
    const [r1] = agruparPorReferencia(itens)
    expect(r1.tamanhos).toEqual(['P', 'M', 'G'])
  })

  it('indexa os itens por tamanho', () => {
    const [r1] = agruparPorReferencia(itens)
    expect(r1.porTamanho['M'].id).toBe('c')
    expect(r1.porTamanho['G'].qtd).toBe(7)
  })

  it('carrega nome/tipo/classe quando existem e null quando não', () => {
    const [r1, r2] = agruparPorReferencia(itens)
    expect(r1.nome).toBe('CAMISETA')
    expect(r1.classe).toBe('FEM')
    expect(r2.nome).toBeNull()
    expect(r2.tipo).toBeNull()
  })
})

describe('editState', () => {
  it('não tocado -> clean', () => {
    expect(editState(undefined, 10)).toBe('clean')
  })

  it('igual ao original (com ou sem espaços) -> clean', () => {
    expect(editState('10', 10)).toBe('clean')
    expect(editState('  10 ', 10)).toBe('clean')
  })

  it('inteiro diferente dentro de 1..9999 -> dirty', () => {
    expect(editState('12', 10)).toBe('dirty')
    expect(editState('1', 10)).toBe('dirty')
    expect(editState('9999', 10)).toBe('dirty')
  })

  it('zero, negativo, acima de 9999, texto ou vazio -> invalid', () => {
    expect(editState('0', 10)).toBe('invalid')
    expect(editState('-1', 10)).toBe('invalid')
    expect(editState('10000', 10)).toBe('invalid')
    expect(editState('abc', 10)).toBe('invalid')
    expect(editState('', 10)).toBe('invalid')
    expect(editState('3,5', 10)).toBe('invalid')
  })
})
