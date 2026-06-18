// Mapa Formato A (nome de aba = chave técnica) → comprador_id
const ABAS_A = {
  BACKES_ART: 1, BACKES_PROG_1: 2, BACKES_PROG_2: 3,
  RAFAEL_J_BACKES: 4, RAFAEL_FILIAL_1: 5, RAFAEL_FILIAL_2: 6,
  STREIT_CONF: 7, FMV_STREIT_CONF: 8,
}

// Mapa Formato B/C (nome humano) → comprador_id.
// Correspondência confirmada na validação de amostra (Task 6).
const ABAS_B = {
  'CD': 1, 'CD PROG 1': 2, 'CD PROG 2': 3,
  'RAFAEL': 4, 'ELISANGELA': 5, 'ALEXANDRE': 6,
  'STREIT': 7, 'FMV': 8,
}

// Lojas do Formato B sem contraparte no Bolt (pendência de confirmação com a equipe).
const ABAS_EXTRAS = ['Nilson', 'Flavia', 'Clovis', 'Marcia', 'Arnoldo', 'Gambeta', 'Paulinho']

const NAO_LOJA = /^(PEDIDO|DADOS|CAD_GRADE|CAD_CLASSE|CAD_PRODUTOS)$|^SOMA_/i

function isExtra(nome) {
  return ABAS_EXTRAS.map(e => e.toUpperCase()).includes(String(nome).trim().toUpperCase())
}

function mapAba(nome) {
  const raw = String(nome ?? '').trim()
  if (!raw || NAO_LOJA.test(raw) || isExtra(raw)) return null
  if (ABAS_A[raw] != null) return ABAS_A[raw]
  const up = raw.toUpperCase()
  if (ABAS_B[up] != null) return ABAS_B[up]
  return null
}

module.exports = { mapAba, isExtra, ABAS_EXTRAS, ABAS_A, ABAS_B }
