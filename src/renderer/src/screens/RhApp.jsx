import { useState, useEffect } from 'react'
import Login           from './rh/Login'
import Dashboard       from './rh/Dashboard'
import Vagas           from './rh/Vagas'
import VagaDetalhe     from './rh/VagaDetalhe'
import CandidatoDetalhe from './rh/CandidatoDetalhe'
import Check           from './rh/Check'
import Candidatos      from './rh/Candidatos'
import Roadmap         from './rh/Roadmap'
import Tour            from './rh/Tour'

export default function RhApp() {
  const [session, setSession] = useState(undefined)
  const [page, setPage]       = useState('dashboard')
  const [params, setParams]   = useState({})
  const [tourAtivo, setTourAtivo] = useState(false)

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
      <Sidebar current={page} navigate={navigate} logout={logout} session={session} onTour={() => setTourAtivo(true)} />
      <main style={{ flex: 1, overflow: 'auto', background: '#f5f5f5', padding: '32px 36px' }}>
        {page === 'dashboard'    && <Dashboard       {...nav} />}
        {page === 'vagas'        && <Vagas           {...nav} />}
        {page === 'vaga-detalhe' && <VagaDetalhe     {...nav} vagaId={params.vagaId} vagaTitulo={params.vagaTitulo} />}
        {page === 'candidato'    && <CandidatoDetalhe {...nav} candidatoId={params.candidatoId} vagaId={params.vagaId} vagaTitulo={params.vagaTitulo} />}
        {page === 'candidatos'   && <Candidatos      {...nav} />}
        {page === 'check'        && <Check           {...nav} />}
        {page === 'roadmap'      && <Roadmap />}
      </main>

      {tourAtivo && <Tour navigate={navigate} onClose={() => setTourAtivo(false)} />}
    </div>
  )
}

function Sidebar({ current, navigate, logout, session, onTour }) {
  const items = [
    { key: 'dashboard',  label: 'Dashboard' },
    { key: 'vagas',      label: 'Vagas' },
    { key: 'candidatos', label: 'Candidatos' },
    { key: 'check',      label: 'Checar SPC' },
    { key: 'roadmap',    label: '🚀 Em breve' },
  ]

  return (
    <nav style={sb.nav}>
      <div style={sb.brand}>
        <span style={sb.bolt}>⚡</span>
        <div>
          <div style={sb.brandName}><span style={sb.boltText}>Bolt</span> RH</div>
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

      <div style={{ padding: '0 8px 12px' }}>
        <button onClick={onTour} style={sb.tourBtn}>▶ Tour do sistema</button>
      </div>

      <button onClick={logout} style={sb.logoutBtn}>Sair</button>
    </nav>
  )
}

const sb = {
  nav:        { width: 220, background: '#1e293b', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  brand:      { display: 'flex', alignItems: 'center', gap: 10, padding: '20px 16px', borderBottom: '1px solid #334155' },
  bolt:       { fontSize: 22, lineHeight: 1, flexShrink: 0 },
  brandName:  { fontSize: 14, fontWeight: 600, color: '#94a3b8' },
  boltText:   { color: '#f59e0b', fontWeight: 700 },
  userName:   { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  menu:       { flex: 1, padding: '12px 8px' },
  item:       { display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 400, background: 'transparent', color: '#94a3b8', marginBottom: 2 },
  itemActive: { background: '#334155', color: '#fff', fontWeight: 600 },
  tourBtn:    { display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', border: '1px solid #334155', borderRadius: 6, background: 'transparent', color: '#f59e0b', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  logoutBtn:  { margin: '0 8px 16px', padding: '8px 12px', border: '1px solid #334155', borderRadius: 6, background: 'transparent', color: '#94a3b8', fontSize: 13, cursor: 'pointer', textAlign: 'left' },
}
