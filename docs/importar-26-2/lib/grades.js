const GRADE_DEFS = {
  PP:  { classificacao: 'PP',  tamanhos: ['RN','P','M','G','GG'] },
  BB:  { classificacao: 'BB',  tamanhos: ['1','2','3','4'] },
  INF: { classificacao: 'INF', tamanhos: ['2','4','6','8','10','12'] },
  JUV: { classificacao: 'JUV', tamanhos: ['10','12','14','16','18','20'] },
  AD:  { classificacao: 'AD',  tamanhos: ['PP','P','M','G','GG','XG'] },
  AD1: { classificacao: 'AD',  tamanhos: ['34','36','38','40','42','44','46','48','50','52'] },
  AD2: { classificacao: 'AD',  tamanhos: ['1','2','3','4','5'] },
  EX:  { classificacao: 'EX',  tamanhos: ['G1','G2','G3','G4','G5','G6','G7','G8','G9','G10'] },
  EX1: { classificacao: 'EX',  tamanhos: ['46','48','50','52','54','56','58','60','62','64'] },
  EX2: { classificacao: 'EX',  tamanhos: ['6','7','8','9','10'] },
}

// Escolhe a grade com maior sobreposição de tamanhos. Empate → mais específica (menor grade).
function detectarGrade(tamanhos) {
  const set = new Set(tamanhos.map(t => String(t).trim().toUpperCase()))
  let best = null, bestScore = 0
  for (const [tipo, def] of Object.entries(GRADE_DEFS)) {
    const overlap = def.tamanhos.filter(t => set.has(t.toUpperCase())).length
    const score = overlap - Math.abs(def.tamanhos.length - set.size) * 0.01
    if (overlap > 0 && score > bestScore) { bestScore = score; best = { tipo, def } }
  }
  if (!best) return { tipo_grade: null, classificacao: null }
  return { tipo_grade: best.tipo, classificacao: best.def.classificacao }
}

module.exports = { GRADE_DEFS, detectarGrade }
