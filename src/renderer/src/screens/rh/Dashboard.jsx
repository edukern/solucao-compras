import { useState, useEffect } from 'react'

export default function Dashboard({ navigate }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/vagas').then(r => r.json()),
      fetch('/api/candidatos').then(r => r.json()),
    ]).then(([vagas, candidatos]) => {
      setStats({
        vagasAbertas:   Array.isArray(vagas)      ? vagas.filter(v => v.status === 'aberta').length : 0,
        totalVagas:     Array.isArray(vagas)      ? vagas.length : 0,
        totalCandidatos: Array.isArray(candidatos) ? candidatos.length : 0,
      })
    }).catch(() => setStats({ vagasAbertas: 0, totalVagas: 0, totalCandidatos: 0 }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 style={s.heading}>Dashboard</h1>

      {loading ? (
        <p style={{ color: '#666', fontSize: 14 }}>Carregando…</p>
      ) : (
        <div style={s.grid}>
          <StatCard label="Vagas abertas"     value={stats.vagasAbertas}    onClick={() => navigate('vagas')} />
          <StatCard label="Total de vagas"    value={stats.totalVagas}      onClick={() => navigate('vagas')} />
          <StatCard label="Candidatos"        value={stats.totalCandidatos} />
        </div>
      )}

      <div style={s.actions}>
        <h2 style={s.sub}>Acesso rápido</h2>
        <div style={s.links}>
          <QuickLink label="Gerenciar vagas"    onClick={() => navigate('vagas')} />
          <QuickLink label="Checar SPC"          onClick={() => navigate('check')} />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, onClick }) {
  return (
    <div onClick={onClick} style={{ ...s.card, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#111' }}>{value}</div>
    </div>
  )
}

function QuickLink({ label, onClick }) {
  return (
    <button onClick={onClick} style={s.link}>{label} →</button>
  )
}

const s = {
  heading: { margin: '0 0 24px', fontSize: 24, fontWeight: 700, color: '#111' },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 40 },
  card:    { background: '#fff', borderRadius: 12, padding: '24px 20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'box-shadow 0.15s' },
  actions: { background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  sub:     { margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#111' },
  links:   { display: 'flex', gap: 12, flexWrap: 'wrap' },
  link:    { padding: '10px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: 14, fontWeight: 500, color: '#111', cursor: 'pointer' },
}
