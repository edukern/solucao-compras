export const GRADE_DEFINITIONS = {
  PP:  { classificacao: 'PP',  tamanhos: ['RN', 'P', 'M', 'G', 'GG'] },
  BB:  { classificacao: 'BB',  tamanhos: ['1', '2', '3', '4'] },
  INF: { classificacao: 'INF', tamanhos: ['2', '4', '6', '8', '10', '12'] },
  JUV: { classificacao: 'JUV', tamanhos: ['10', '12', '14', '16', '18', '20'] },
  AD:  { classificacao: 'AD',  tamanhos: ['PP', 'P', 'M', 'G', 'GG', 'XG'] },
  AD1: { classificacao: 'AD',  tamanhos: ['34', '36', '38', '40', '42', '44', '46', '48', '50', '52'] },
  AD2: { classificacao: 'AD',  tamanhos: ['1', '2', '3', '4', '5'] },
  EX:  { classificacao: 'EX',  tamanhos: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'] },
  EX1: { classificacao: 'EX',  tamanhos: ['46', '48', '50', '52', '54', '56', '58', '60', '62', '64'] },
  EX2: { classificacao: 'EX',  tamanhos: ['6', '7', '8', '9', '10'] },
  // TBD — tamanhos ainda não definidos
  CASAL: { classificacao: 'CASAL', tamanhos: [] },
  KING:  { classificacao: 'KING',  tamanhos: [] },
  QUEEN: { classificacao: 'QUEEN', tamanhos: [] },
  SOLT:  { classificacao: 'SOLT',  tamanhos: [] },
  LAR:   { classificacao: 'LAR',   tamanhos: [] },
  GERAL: { classificacao: 'GERAL', tamanhos: [] },
}

export const CLASSIFICACOES = [
  'AD', 'BB', 'CASAL', 'EX', 'GERAL', 'INF', 'JUV', 'KING', 'LAR', 'PP', 'QUEEN', 'SOLT',
]

// Returns grade options for a given classificacao.
// If only one option exists, returns it directly so the UI can auto-fill.
export function gradesPorClassificacao(classificacao) {
  return Object.entries(GRADE_DEFINITIONS)
    .filter(([, def]) => def.classificacao === classificacao)
    .map(([tipo_grade, def]) => ({ tipo_grade, tamanhos: def.tamanhos }))
}

export function tamanhosDeTipoGrade(tipo_grade) {
  return GRADE_DEFINITIONS[tipo_grade]?.tamanhos ?? []
}
