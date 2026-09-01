import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { montarHTMLReposicao } from '../src/renderer/src/lib/pdfHelpers.js'

const pedido = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  marca: 'SCHRAMM',
  janela_dias: 90,
  gerado_por: 'Samuel - Compras',
  gerado_em: '2026-08-31T20:21:33+00:00',
}

const cd = {
  nome: 'Backes Art. Vestuário',
  cnpj: '08.889.201/0004-46',
  ie: '',
  endereco: 'Rua Mundo Novo 1160, Centro',
  cidade: 'Três Coroas/RS',
}

// 2 grades: AD (letras) e EX (G1..)
const grupos = [
  {
    referencia: '112', reffornecedor: '112', codigo_ponto_e: '1.21204',
    nome: 'SUTIA AD FEM 112', tipo: 'SUTIA', classe: 'AD', grade: 'AD',
    colunas: ['PP', 'P', 'M', 'G', 'GG', 'XG'],
    porTamanho: {
      PP: { qtd: 0, vendido_periodo: 0, estoque_cd: 0, ja_pedido: 0 },
      P:  { qtd: 0, vendido_periodo: 0, estoque_cd: 0, ja_pedido: 0 },
      M:  { qtd: 12, vendido_periodo: 14, estoque_cd: 2, ja_pedido: 0 },
      G:  { qtd: 8, vendido_periodo: 9, estoque_cd: 1, ja_pedido: 0 },
      GG: { qtd: 0, vendido_periodo: 0, estoque_cd: 0, ja_pedido: 0 },
      XG: { qtd: 0, vendido_periodo: 0, estoque_cd: 0, ja_pedido: 0 },
    },
    custoRef: 16.9, totalQtd: 20,
  },
  {
    referencia: '125', reffornecedor: '', codigo_ponto_e: '2.14879',
    nome: 'BOXER EX MASC 125', tipo: 'BOXER', classe: 'EX', grade: 'EX',
    colunas: ['G1', 'G2', 'G3', 'G4'],
    porTamanho: {
      G1: { qtd: 3, vendido_periodo: 4, estoque_cd: 0, ja_pedido: 0 },
      G2: { qtd: 7, vendido_periodo: 8, estoque_cd: 1, ja_pedido: 0 },
      G3: { qtd: 10, vendido_periodo: 11, estoque_cd: 2, ja_pedido: 1 },
      G4: { qtd: 6, vendido_periodo: 7, estoque_cd: 0, ja_pedido: 0 },
    },
    custoRef: null, totalQtd: 26,
  },
]

describe('montarHTMLReposicao', () => {
  it('vazio quando não há referência com qtd', () => {
    expect(montarHTMLReposicao(pedido, [])).toBe('')
    expect(montarHTMLReposicao(pedido, [{ ...grupos[0], totalQtd: 0 }])).toBe('')
  })

  it('interno: mostra código interno e as colunas de métrica', () => {
    const html = montarHTMLReposicao(pedido, grupos, { paraFornecedor: false })
    expect(html).toContain('uso interno')
    expect(html).toContain('1.21204')      // codigo_ponto_e aparece
    expect(html).toContain('Vend.')        // cabeçalho de métrica
    expect(html).toContain('Est.CD')
    expect(html).toContain('Já ped.')
    expect(html).toContain('Grade: AD')    // multi-grade -> rótulo por grade
    expect(html).toContain('Grade: EX')
    expect(html).toContain('SCHRAMM')
    expect(html).toContain('Total do pedido: 46 peças')
  })

  it('fornecedor: NÃO vaza código interno nem métricas; usa reffornecedor', () => {
    const html = montarHTMLReposicao(pedido, grupos, { paraFornecedor: true, cd })
    expect(html).not.toContain('1.21204')     // codigo_ponto_e escondido
    expect(html).not.toContain('2.14879')
    expect(html).not.toContain('Vend.')       // sem métricas internas
    expect(html).not.toContain('Est.CD')
    expect(html).not.toContain('uso interno')
    expect(html).toContain('08.889.201/0004-46')  // bloco do CD
    expect(html).toContain('Backes Art. Vestuário')
    // ref 125 sem reffornecedor -> aviso
    expect(html).toContain('sem código do fornecedor')
  })

  it('escapa conteúdo (marca com < >)', () => {
    const html = montarHTMLReposicao({ ...pedido, marca: 'A<b>C' }, grupos)
    expect(html).toContain('A&lt;b&gt;C')
    expect(html).not.toContain('A<b>C')
  })

  it('gera arquivos de amostra pra inspeção visual', () => {
    const out = path.join(process.env.TEMP || '/tmp', 'reposicao-pdf-preview')
    fs.mkdirSync(out, { recursive: true })
    fs.writeFileSync(path.join(out, 'interno.html'), montarHTMLReposicao(pedido, grupos, { paraFornecedor: false }))
    fs.writeFileSync(path.join(out, 'fornecedor.html'), montarHTMLReposicao(pedido, grupos, { paraFornecedor: true, cd }))
    expect(fs.existsSync(path.join(out, 'interno.html'))).toBe(true)
  })
})
