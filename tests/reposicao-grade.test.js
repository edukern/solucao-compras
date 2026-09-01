import { describe, it, expect } from 'vitest'
import {
  adivinharGrade, colunasDaGrade, gradesDoSeletor, agruparPorReferencia, editState,
  parseValorBR, fmtValorBR, custoState,
} from '../src/renderer/src/screens/reposicaoGrade.js'

describe('adivinharGrade', () => {
  it('classe AD + tamanhos de letra -> AD', () => {
    expect(adivinharGrade('AD', ['M', 'G', 'GG'])).toBe('AD')
  })

  it('classe AD + tamanhos 34-52 -> AD1 (distingue pela régua, não pela classe)', () => {
    expect(adivinharGrade('AD', ['38', '40', '46'])).toBe('AD1')
  })

  it('classe AD + tamanhos 1-5 -> AD2', () => {
    expect(adivinharGrade('AD', ['1', '2', '3'])).toBe('AD2')
  })

  it('classe INF + tamanhos de letra -> INF1 (não INF numérica)', () => {
    expect(adivinharGrade('INF', ['P', 'G', 'GG'])).toBe('INF1')
  })

  it('classe JUV + tamanhos de letra -> JUV1', () => {
    expect(adivinharGrade('JUV', ['GG', 'P'])).toBe('JUV1')
  })

  it('classe EX + G1..G4 -> EX', () => {
    expect(adivinharGrade('EX', ['G1', 'G2', 'G3', 'G4'])).toBe('EX')
  })

  it('classe EX + tamanho que não cabe em nenhuma grade EX -> default da classe (EX)', () => {
    expect(adivinharGrade('EX', ['XG'])).toBe('EX')
  })

  it('só um tamanho comum (M) + classe AD -> AD (default de letras)', () => {
    expect(adivinharGrade('AD', ['M'])).toBe('AD')
  })

  it('sem classe -> não quebra (retorna alguma grade ou null)', () => {
    const g = adivinharGrade('', ['M'])
    expect(g === null || typeof g === 'string').toBe(true)
  })
})

describe('colunasDaGrade', () => {
  it('devolve a régua canônica da grade', () => {
    expect(colunasDaGrade('AD', [])).toEqual(['PP', 'P', 'M', 'G', 'GG', 'XG'])
  })

  it('acrescenta ao final tamanho presente que está fora da régua (nunca esconder dado)', () => {
    expect(colunasDaGrade('EX', ['XG'])).toEqual(['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'XG'])
  })

  it('não duplica tamanho que já está na régua', () => {
    expect(colunasDaGrade('AD', ['M', 'G'])).toEqual(['PP', 'P', 'M', 'G', 'GG', 'XG'])
  })

  it('grade desconhecida -> só os tamanhos presentes', () => {
    expect(colunasDaGrade('XXX', ['M', 'G'])).toEqual(['M', 'G'])
  })
})

describe('gradesDoSeletor', () => {
  it('coloca as grades da classe primeiro', () => {
    const opts = gradesDoSeletor('AD', 'AD')
    expect(opts.slice(0, 3)).toEqual(['AD', 'AD1', 'AD2'])
    expect(opts).toContain('EX')
  })

  it('garante a grade atual na lista mesmo sendo de outra classe', () => {
    expect(gradesDoSeletor('AD', 'EX')[0]).toBe('EX')
  })
})

describe('agruparPorReferencia', () => {
  const itens = [
    { id: 'a', pedido_reposicao_id: 'P', referencia: '117', tamanho: 'G',  qtd: 5, qtd_sugerida: 5, vendido_periodo: 5, estoque_cd: 0, ja_pedido: 0, nome: 'SUTIA AD FEM 117', tipo: 'SUTIA', classe: 'AD', colecao: '2026/2', reffornecedor: '117', codigo_ponto_e: '1.2280', foto_url: 'http://x/117.jpg', tipo_grade: null },
    { id: 'b', pedido_reposicao_id: 'P', referencia: '117', tamanho: 'GG', qtd: 3, qtd_sugerida: 4, vendido_periodo: 4, estoque_cd: 1, ja_pedido: 0, nome: 'SUTIA AD FEM 117', tipo: 'SUTIA', classe: 'AD', colecao: '2026/2', reffornecedor: '117', codigo_ponto_e: '1.2280', foto_url: 'http://x/117.jpg', tipo_grade: null },
    { id: 'c', pedido_reposicao_id: 'P', referencia: '125', tamanho: 'G2', qtd: 7, qtd_sugerida: 7, vendido_periodo: 8, estoque_cd: 2, ja_pedido: 1, nome: 'BOXER EX MASC 125', tipo: 'BOXER', classe: 'EX', colecao: '2026/2', reffornecedor: '125', codigo_ponto_e: '2.148', foto_url: null, tipo_grade: null },
  ]

  it('um grupo por referência, na ordem de aparição', () => {
    expect(agruparPorReferencia(itens).map(g => g.referencia)).toEqual(['117', '125'])
  })

  it('carrega campos descritivos e foto de qualquer item da ref', () => {
    const [r117] = agruparPorReferencia(itens)
    expect(r117.nome).toBe('SUTIA AD FEM 117')
    expect(r117.classe).toBe('AD')
    expect(r117.foto_url).toBe('http://x/117.jpg')
  })

  it('gradePalpite pela classe + tamanhos presentes', () => {
    const [r117, r125] = agruparPorReferencia(itens)
    expect(r117.gradePalpite).toBe('AD')
    expect(r125.gradePalpite).toBe('EX')
  })

  it('gradeInicial usa tipo_grade gravado quando ele é uma grade conhecida', () => {
    const comGrade = itens.map(i => i.referencia === '117' ? { ...i, tipo_grade: 'AD1' } : i)
    const [r117] = agruparPorReferencia(comGrade)
    expect(r117.tipoGradeSalva).toBe('AD1')
    expect(r117.gradeInicial).toBe('AD1')
  })

  it('gradeInicial ignora tipo_grade gravado inválido e cai no palpite', () => {
    const comLixo = itens.map(i => i.referencia === '117' ? { ...i, tipo_grade: 'GENERICA' } : i)
    const [r117] = agruparPorReferencia(comLixo)
    expect(r117.gradeInicial).toBe('AD')
  })

  it('totalSugerido soma qtd_sugerida; totalAtual soma qtd', () => {
    const [r117] = agruparPorReferencia(itens)
    expect(r117.totalSugerido).toBe(9) // 5 + 4
    expect(r117.totalAtual).toBe(8)    // 5 + 3
  })

  it('indexa itens por tamanho', () => {
    const [r117] = agruparPorReferencia(itens)
    expect(r117.porTamanho['GG'].id).toBe('b')
  })

  it('custoRef = valor das linhas irmãs; null quando nenhuma tem', () => {
    const comCusto = itens.map(i =>
      i.referencia === '117' ? { ...i, valor_unitario: '16.90' } : { ...i, valor_unitario: null })
    const [r117, r125] = agruparPorReferencia(comCusto)
    expect(r117.custoRef).toBe(16.9)
    expect(r125.custoRef).toBeNull()
  })

  it('custoRef pega o maior quando as irmãs divergem', () => {
    const div = [
      { ...itens[0], valor_unitario: 16.9 },
      { ...itens[1], valor_unitario: 17.5 },
    ]
    expect(agruparPorReferencia(div)[0].custoRef).toBe(17.5)
  })
})

describe('parseValorBR / fmtValorBR', () => {
  it('aceita vírgula, ponto e R$', () => {
    expect(parseValorBR('16,90')).toBe(16.9)
    expect(parseValorBR('16.90')).toBe(16.9)
    expect(parseValorBR('R$ 16,90')).toBe(16.9)
    expect(parseValorBR(' 1234,5 ')).toBe(1234.5)
  })
  it('vazio -> null; texto -> NaN', () => {
    expect(parseValorBR('')).toBeNull()
    expect(parseValorBR(null)).toBeNull()
    expect(Number.isNaN(parseValorBR('abc'))).toBe(true)
  })
  it('arredonda a 2 casas', () => {
    expect(parseValorBR('16,999')).toBe(17)
    expect(parseValorBR('16,004')).toBe(16)
  })
  it('fmtValorBR formata pt-BR com 2 casas; vazio p/ null', () => {
    expect(fmtValorBR(16.9)).toBe('16,90')
    expect(fmtValorBR(null)).toBe('')
  })
})

describe('custoState', () => {
  it('não tocado -> clean', () => {
    expect(custoState(undefined, 16.9)).toBe('clean')
  })
  it('igual ao original (formatos diferentes) -> clean', () => {
    expect(custoState('16,90', 16.9)).toBe('clean')
    expect(custoState('16.9', 16.9)).toBe('clean')
  })
  it('número diferente -> dirty', () => {
    expect(custoState('17,50', 16.9)).toBe('dirty')
    expect(custoState('20', null)).toBe('dirty')
  })
  it('limpar um custo que existia -> dirty; limpar vazio -> clean', () => {
    expect(custoState('', 16.9)).toBe('dirty')
    expect(custoState('', null)).toBe('clean')
  })
  it('texto ou negativo -> invalid', () => {
    expect(custoState('abc', 16.9)).toBe('invalid')
    expect(custoState('-5', null)).toBe('invalid')
  })
})

describe('editState', () => {
  it('linha existente: não tocado / igual / com espaços -> clean', () => {
    expect(editState(undefined, 5)).toBe('clean')
    expect(editState('5', 5)).toBe('clean')
    expect(editState(' 5 ', 5)).toBe('clean')
  })

  it('linha existente: inteiro 1..9999 diferente -> dirty', () => {
    expect(editState('12', 5)).toBe('dirty')
    expect(editState('1', 5)).toBe('dirty')
  })

  it('linha existente: 0 -> dirty (zerar = "não repor este tamanho", salva qtd 0)', () => {
    expect(editState('0', 5)).toBe('dirty')
    expect(editState('00', 5)).toBe('dirty')
  })

  it('linha existente: já era 0 e continua 0 -> clean', () => {
    expect(editState('0', 0)).toBe('clean')
  })

  it('linha existente: negativo / >9999 / texto / vazio -> invalid', () => {
    expect(editState('-1', 5)).toBe('invalid')
    expect(editState('10000', 5)).toBe('invalid')
    expect(editState('x', 5)).toBe('invalid')
    expect(editState('', 5)).toBe('invalid')
  })

  it('tamanho novo (sem linha): vazio ou 0 -> clean', () => {
    expect(editState('', null)).toBe('clean')
    expect(editState('0', null)).toBe('clean')
    expect(editState(undefined, null)).toBe('clean')
  })

  it('tamanho novo: inteiro 1..9999 -> dirty', () => {
    expect(editState('8', null)).toBe('dirty')
  })

  it('tamanho novo: texto / >9999 -> invalid', () => {
    expect(editState('abc', null)).toBe('invalid')
    expect(editState('99999', null)).toBe('invalid')
  })
})
