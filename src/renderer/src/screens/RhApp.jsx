import { useState, useEffect } from 'react'
import Login          from './rh/Login'
import Dashboard      from './rh/Dashboard'
import Vagas          from './rh/Vagas'
import VagaDetalhe    from './rh/VagaDetalhe'
import CandidatoDetalhe from './rh/CandidatoDetalhe'
import Check          from './rh/Check'

export default function RhApp() {
  const [session, setSession] = useState(undefined) // undefined=loading, null=sem auth, obj=autenticado
  const [page, setPage]       = useState('dashboard')
  const [params, setParams]   = useState({})

  useEffect(() => {
    fetch('/api/auth-rh')
      .then(r => r.ok ? r.json().then(d => setSession(d.user)) : setSession(null))
      .catch(() => setSession(null))
  }, [])

  function navigate(p, ps = {}) { setPage(p); setParams(ps) }
  function logout() { fetch('/api/auth-rh', { method: 'DELETE' }).finally(() => setSession(null)) }

  if (session === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui', color: '#888', fontSize: 14 }}>
        Carregando…
      </div>
    )
  }

  if (session === null) return <Login onLogin={setSession} />

  const nav = { navigate, session }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Sidebar current={page} navigate={navigate} logout={logout} session={session} />
      <main style={{ flex: 1, overflow: 'auto', background: '#f5f5f5', padding: '32px 36px' }}>
        {page === 'dashboard'    && <Dashboard      {...nav} />}
        {page === 'vagas'        && <Vagas          {...nav} />}
        {page === 'vaga-detalhe' && <VagaDetalhe    {...nav} vagaId={params.vagaId} vagaTitulo={params.vagaTitulo} />}
        {page === 'candidato'    && <CandidatoDetalhe {...nav} candidatoId={params.candidatoId} />}
        {page === 'check'        && <Check          {...nav} />}
      </main>
    </div>
  )
}

function Sidebar({ current, navigate, logout, session }) {
  const items = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'vagas',     label: 'Vagas' },
    { key: 'check',     label: 'Checar SPC' },
  ]

  return (
    <nav style={sb.nav}>
      <div style={sb.brand}>
        <div style={sb.logo}>RH</div>
        <div>
          <div style={sb.brandName}>Bolt RH</div>
          <div style={sb.userName}>{session.nome}</div>
        </div>
      </div>

      <div style={sb.menu}>
        {items.map(item => (
          <button key={item.key} onClick={() => navigate(item.key)}
            style={{ ...sb.item, ...(current === item.key ? sb.itemActive : {}) }}>
            {item.label}
          </button>
        ))}
      </div>

      <button onClick={logout} style={sb.logoutBtn}>Sair</button>
    </nav>
  )
}

const sb = {
  nav:        { width: 220, background: '#1e293b', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  brand:      { display: 'flex', alignItems: 'center', gap: 12, padding: '20px 16px', borderBottom: '1px solid #334155' },
  logo:       { width: 36, height: 36, borderRadius: 8, background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  brandName:  { fontSize: 14, fontWeight: 600, color: '#fff' },
  userName:   { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  menu:       { flex: 1, padding: '12px 8px' },
  item:       { display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 400, background: 'transparent', color: '#94a3b8', marginBottom: 2 },
  itemActive: { background: '#334155', color: '#fff', fontWeight: 600 },
  logoutBtn:  { margin: '0 8px 16px', padding: '8px 12px', border: '1px solid #334155', borderRadius: 6, background: 'transparent', color: '#94a3b8', fontSize: 13, cursor: 'pointer', textAlign: 'left' },
}
