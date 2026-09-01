// Helpers puros da grade de revisão de reposição (RevisaoReposicao.jsx).
// Sem React nem CSS de propósito: dá pra testar isolado em ambiente node.
import { GRADE_DEFINITIONS, tamanhosDeTipoGrade } from '../constants/grades'

export const METRICAS_LEITURA = [
  { key: 'vendido_periodo', label: 'Vendido no período' },
  { key: 'estoque_cd',      label: 'Estoque CD' },
  { key: 'ja_pedido',       label: 'Já pedido' },
]

// Default de grade por classe quando o palpite pelos tamanhos não fecha.
// Lingerie usa as grades "de letras" — por isso INF -> INF1 e JUV -> JUV1.
const DEFAULT_GRADE_POR_CLASSE = {
  AD: 'AD', EX: 'EX', INF: 'INF1', JUV: 'JUV1', PP: 'PP', BB: 'BB', U: 'U',
}

// Palpite de tipo_grade a partir da classe (classificacao) + o conjunto de
// tamanhos que efetivamente chegaram do ponto-e-stock para aquela referência.
// A classe resolve a ambiguidade INF1/JUV1/AD (mesmo conjunto de tamanhos):
// "INF" -> INF1, "JUV" -> JUV1, "AD" -> AD. Os próprios labels resolvem
// AD x AD1 x AD2 (letras x 34-52 x 1-5). Sem classe e sem match -> primeira
// grade conhecida, ou null.
export function adivinharGrade(classe, tamanhosChegaram = []) {
  const cls = (classe || '').trim().toUpperCase()
  const candidatas = Object.entries(GRADE_DEFINITIONS)
    .filter(([, d]) => !cls || d.classificacao === cls)

  const cabe = candidatas.find(([, d]) =>
    tamanhosChegaram.length > 0 && tamanhosChegaram.every(t => d.tamanhos.includes(t)))
  if (cabe) return cabe[0]

  if (cls && DEFAULT_GRADE_POR_CLASSE[cls]) return DEFAULT_GRADE_POR_CLASSE[cls]
  return candidatas[0]?.[0] ?? null
}

// Opções do seletor de grade: as da mesma classe primeiro, depois "outras".
// gradeAtual entra garantido na lista (caso seja uma grade de outra classe).
export function gradesDoSeletor(classe, gradeAtual) {
  const cls = (classe || '').trim().toUpperCase()
  const todas = Object.keys(GRADE_DEFINITIONS)
  const daClasse = todas.filter(k => GRADE_DEFINITIONS[k].classificacao === cls)
  const base = [...daClasse, ...todas.filter(k => !daClasse.includes(k))]
  // Grade escolhida fora da classe fica fixada no topo, pra ficar à vista.
  if (gradeAtual && !daClasse.includes(gradeAtual)) {
    return [gradeAtual, ...base.filter(k => k !== gradeAtual)]
  }
  return base
}

// Colunas de tamanho a exibir: a régua canônica da grade escolhida + qualquer
// tamanho que chegou com dado e está fora dela (nunca esconder tamanho com
// quantidade — mesmo princípio do "não descarta tamanho fora da grade" do Compras).
export function colunasDaGrade(gradeCode, tamanhosPresentes = []) {
  const canon = tamanhosDeTipoGrade(gradeCode)
  const extras = tamanhosPresentes.filter(t => !canon.includes(t))
  return [...canon, ...extras]
}

// Agrupa os itens do rascunho por referência. Cada grupo traz os campos
// descritivos (de qualquer item da ref), o índice tamanho -> item, o palpite de
// grade e a grade inicial (tipo_grade já gravado, se houver e for conhecido,
// senão o palpite), mais os totais sugerido e atual.
export function agruparPorReferencia(itens) {
  const map = new Map()
  for (const it of itens) {
    if (!map.has(it.referencia)) {
      map.set(it.referencia, {
        referencia:     it.referencia,
        nome:           it.nome ?? null,
        tipo:           it.tipo ?? null,
        classe:         it.classe ?? null,
        colecao:        it.colecao ?? null,
        reffornecedor:  it.reffornecedor ?? null,
        codigo_ponto_e: it.codigo_ponto_e ?? null,
        foto_url:       it.foto_url ?? null,
        tipoGradeSalva: it.tipo_grade ?? null,
        porTamanho:     {},
      })
    }
    const g = map.get(it.referencia)
    g.porTamanho[it.tamanho] = it
    if (!g.tipoGradeSalva && it.tipo_grade) g.tipoGradeSalva = it.tipo_grade
  }

  return [...map.values()].map(g => {
    const tamanhosPresentes = Object.keys(g.porTamanho)
    const gradePalpite = adivinharGrade(g.classe, tamanhosPresentes)
    const gradeInicial = (g.tipoGradeSalva && GRADE_DEFINITIONS[g.tipoGradeSalva])
      ? g.tipoGradeSalva
      : gradePalpite
    // Custo por referência: um valor só. Se as linhas irmãs divergirem (ex.: ERP
    // mandou custo por SKU), pega o maior — a tela grava uniforme no 1º save.
    const custos = tamanhosPresentes
      .map(t => g.porTamanho[t].valor_unitario)
      .filter(v => v != null && !Number.isNaN(Number(v)))
      .map(Number)
    const custoRef = custos.length ? Math.max(...custos) : null

    return {
      ...g,
      tamanhosPresentes,
      gradePalpite,
      gradeInicial,
      custoRef,
      totalSugerido: tamanhosPresentes.reduce((s, t) => s + (g.porTamanho[t].qtd_sugerida ?? g.porTamanho[t].qtd), 0),
      totalAtual:    tamanhosPresentes.reduce((s, t) => s + g.porTamanho[t].qtd, 0),
    }
  })
}

// "16,90" / "16.90" / "R$ 16,90" -> 16.9 ; "" -> null ; inválido -> NaN.
// Arredonda a 2 casas (a coluna no banco é numeric(10,2)).
export function parseValorBR(raw) {
  if (raw == null) return null
  const s = String(raw).replace(/[R$\s]/gi, '').replace(',', '.').trim()
  if (s === '') return null
  const n = Number(s)
  if (Number.isNaN(n)) return NaN
  return Math.round(n * 100) / 100
}

export function fmtValorBR(n) {
  if (n == null || Number.isNaN(Number(n))) return ''
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Estado do campo de custo de uma referência.
//   original = custoRef atual (número) ou null.
//   'clean'   = não mexeu / voltou ao original / limpou um custo que já era vazio
//   'dirty'   = número >= 0 diferente do original, OU limpou um custo que existia
//   'invalid' = texto não numérico ou negativo
export function custoState(raw, original) {
  if (raw === undefined) return 'clean'
  const orig = original == null ? null : Math.round(Number(original) * 100) / 100
  const n = parseValorBR(raw)
  if (Number.isNaN(n)) return 'invalid'
  if (n != null && n < 0) return 'invalid'
  if (n === orig) return 'clean'
  if (n == null && orig == null) return 'clean'
  return 'dirty'
}

// Estado de um campo editável.
//   original = número da linha que já existe, ou null/undefined se aquele
//   tamanho ainda não tem linha (comprador preenchendo do zero).
//   'clean'   = não mexeu / voltou ao original / tamanho novo deixado vazio ou 0
//   'dirty'   = inteiro de 0 a 9999, diferente do original. 0 numa linha que já
//               existe é válido e significa "não repor este tamanho" (grava qtd 0,
//               mantém qtd_sugerida ao lado). Só o rascunho inteiro se descarta.
//   'invalid' = negativo, > 9999, texto, ou campo de linha existente apagado
//               (deixe 0 explícito em vez de vazio)
export function editState(raw, original) {
  if (raw === undefined) return 'clean'
  const temLinha = original != null && original !== ''
  const s = String(raw).trim()
  if (temLinha && s === String(original)) return 'clean'
  if (!temLinha && (s === '' || s === '0')) return 'clean'
  if (!/^\d+$/.test(s)) return 'invalid'
  const n = parseInt(s, 10)
  if (n > 9999) return 'invalid'
  return 'dirty'
}
