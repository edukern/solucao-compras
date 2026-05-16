import { useState, useEffect } from 'react'

export default function SegmentacaoSelect({ segs, value, onChange }) {
  const selected = segs.find(s => s.id === value)

  const [selClass,  setSelClass]  = useState(selected?.classificacao ?? '')
  const [selTipo,   setSelTipo]   = useState(selected?.tipo_produto  ?? '')
  const [selClasse, setSelClasse] = useState(selected?.classe        ?? '')

  const classificacoes = [...new Set(segs.map(s => s.classificacao))].sort()
  const tipos  = [...new Set(segs.filter(s => s.classificacao === selClass).map(s => s.tipo_produto))].sort()
  const classes = [...new Set(segs.filter(s => s.classificacao === selClass && s.tipo_produto === selTipo).map(s => s.classe))].sort()

  useEffect(() => {
    const seg = segs.find(
      s => s.classificacao === selClass && s.tipo_produto === selTipo && s.classe === selClasse
    )
    onChange(seg?.id ?? null)
  }, [selClass, selTipo, selClasse, segs])

  function handleClass(v) { setSelClass(v); setSelTipo(''); setSelClasse('') }
  function handleTipo(v)  { setSelTipo(v);  setSelClasse('') }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <select value={selClass} onChange={e => handleClass(e.target.value)}>
        <option value="">Classificação</option>
        {classificacoes.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={selTipo} onChange={e => handleTipo(e.target.value)} disabled={!selClass}>
        <option value="">Tipo de produto</option>
        {tipos.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <select value={selClasse} onChange={e => setSelClasse(e.target.value)} disabled={!selTipo}>
        <option value="">Classe</option>
        {classes.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  )
}
