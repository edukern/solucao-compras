export const GRADE_DEFINITIONS = {
  PP:      { classificacao: 'PP',    tamanhos: ['RN', 'P', 'M', 'G', 'GG'] },
  BB:      { classificacao: 'BB',    tamanhos: ['1', '2', '3', '4'] },
  INF:     { classificacao: 'INF',   tamanhos: ['2', '4', '6', '8', '10', '12'] },
  INF1:    { classificacao: 'INF',   tamanhos: ['PP', 'P', 'M', 'G', 'GG', 'XG'] },
  JUV:     { classificacao: 'JUV',   tamanhos: ['10', '12', '14', '16', '18', '20'] },
  JUV1:    { classificacao: 'JUV',   tamanhos: ['PP', 'P', 'M', 'G', 'GG', 'XG'] },
  AD:      { classificacao: 'AD',    tamanhos: ['PP', 'P', 'M', 'G', 'GG', 'XG'] },
  AD1:     { classificacao: 'AD',    tamanhos: ['34', '36', '38', '40', '42', '44', '46', '48', '50', '52'] },
  AD2:     { classificacao: 'AD',    tamanhos: ['1', '2', '3', '4', '5'] },
  EX:      { classificacao: 'EX',    tamanhos: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'] },
  EX1:     { classificacao: 'EX',    tamanhos: ['46', '48', '50', '52', '54', '56', '58', '60', '62', '64'] },
  EX2:     { classificacao: 'EX',    tamanhos: ['6', '7', '8', '9', '10'] },
  U:       { classificacao: 'U',     tamanhos: ['F', 'M', 'U'] },
  CASAL:   { classificacao: 'CASAL', tamanhos: ['U'] },
  KING:    { classificacao: 'KING',  tamanhos: ['U'] },
  QUEEN:   { classificacao: 'QUEEN', tamanhos: ['U'] },
  SOLT:    { classificacao: 'SOLT',  tamanhos: ['U'] },
  LAR:     { classificacao: 'LAR',   tamanhos: ['U'] },
  GERAL:   { classificacao: 'GERAL', tamanhos: ['U'] },
  'C-BB':  { classificacao: 'C-BB',  ocultoMenores: 3, ocultoMaiores: 5, tamanhos: ['14','15','16','17','18','19','20','21','22','23','24','25','26','27'] },
  'C-INF': { classificacao: 'C-INF', ocultoMenores: 4, ocultoMaiores: 5, tamanhos: ['20','21','22','23','24','25','26','27','28','29','30','31','32'] },
  'C-JUV': { classificacao: 'C-JUV', ocultoMenores: 2, ocultoMaiores: 2, tamanhos: ['25','26','27','28','29','30','31','32','33','34','35','36'] },
  'C-AD-M':{ classificacao: 'C-AD-M', ocultoMenores: 4, ocultoMaiores: 1, tamanhos: ['34','35','36','37','38','39','40','41','42','43','44','45'] },
  'C-AD-F':{ classificacao: 'C-AD-F', ocultoMenores: 0, ocultoMaiores: 2, tamanhos: ['34','35','36','37','38','39','40','41'] },
}

export const CLASSIFICACOES = [
  'AD', 'BB', 'C-AD-F', 'C-AD-M', 'C-BB', 'C-INF', 'C-JUV', 'CASAL', 'EX', 'GERAL', 'INF', 'JUV', 'KING', 'LAR', 'PP', 'QUEEN', 'SOLT', 'U',
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
