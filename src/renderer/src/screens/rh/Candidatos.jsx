import { useState, useEffect, useRef } from 'react'

export default function Candidatos({ navigate }) {
  const [resultados, setResultados] = useState([])
  const [query, setQuery]           = useState('')
  const [loading, setLoading]       = useState(true)
  const debounceRef                 = useRef(null)

  function buscar(q) {
    setLoading(true)
    const url = q.trim() ? `/api/candidatos?q=${encodeURIComponent(q.trim())}` : '/api/candidatos'
    fetch(url)
      .then(r => r.json())
      .then(data => setResultados(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { buscar('') }, [])

  function handleQuery(e) {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => buscar(val), 350)
  }

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.heading}>Candidatos</h1>
        <div style={{ fontSize: 13, color: '#888' }}>{resultados.length} encontrado{resultados.length !== 1 ? 's' : ''}</div>
      </div>

      <div style={s.searchWrap}>
        <input
          value={query}
          onChange={handleQuery}
          placeholder="Buscar por nome ou CPF…"
          style={s.searchInput}
          autoFocus
        />
      </div>

      {loading ? (
        <p style={{ color: '#666', fontSize: 14 }}>Buscando…</p>
      ) : resultados.length === 0 ? (
        <p style={{ color: '#888', fontSize: 14 }}>Nenhum candidato encontrado.</p>
      ) : (
        <div style={s.list}>
          {resultados.map(c => (
            <div key={c.id} style={s.row} onClick={() => navigate('candidato', { candidatoId: c.id })}>
              <div style={s.nome}>{c.nome || '(sem nome)'}</div>
              <div style={s.meta}>
                {c.cpf ? <span>{formatCPF(c.cpf)}</span> : null}
                {c.email ? <span>{c.email}</span> : null}
                {c.telefone ? <span>{c.telefone}</span> : null}
                {c.cidade ? <span>📍 {c.cidade}</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatCPF(cpf) {
  const d = String(cpf).replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const s = {
  header:      { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 },
  heading:     { margin: 0, fontSize: 24, fontWeight: 700, color: '#111' },
  searchWrap:  { marginBottom: 20 },
  searchInput: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  list:        { display: 'flex', flexDirection: 'column', gap: 2 },
  row:         { display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 16px', borderRadius: 10, background: '#fff', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'box-shadow 0.15s' },
  nome:        { fontSize: 15, fontWeight: 600, color: '#111' },
  meta:        { display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#666' },
}
