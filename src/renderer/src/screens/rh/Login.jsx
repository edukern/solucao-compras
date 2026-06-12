import { useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail]   = useState('')
  const [senha, setSenha]   = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [msg, setMsg]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setMsg('')
    try {
      const res = await fetch('/api/auth-rh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error || 'Erro ao fazer login.'); setStatus('error'); return }
      onLogin(data.user)
    } catch {
      setMsg('Falha de rede.')
      setStatus('error')
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>RH</div>
        <h1 style={s.title}>Entrar no sistema</h1>
        <p style={s.sub}>Módulo de Recursos Humanos</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>
            Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={s.input} placeholder="seu@email.com" required autoFocus />
          </label>
          <label style={s.label}>
            Senha
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
              style={s.input} placeholder="••••••••" required />
          </label>
          {status === 'error' && <p style={s.error}>{msg}</p>}
          <button type="submit" disabled={status === 'loading'}
            style={{ ...s.btn, opacity: status === 'loading' ? 0.6 : 1 }}>
            {status === 'loading' ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  page:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', fontFamily: 'system-ui, -apple-system, sans-serif' },
  card:  { background: '#fff', borderRadius: 12, padding: '48px 40px', width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  logo:  { width: 48, height: 48, borderRadius: 12, background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, marginBottom: 24 },
  title: { margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#111' },
  sub:   { margin: '0 0 32px', fontSize: 14, color: '#666' },
  form:  { display: 'flex', flexDirection: 'column', gap: 20 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500, color: '#333' },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15, outline: 'none' },
  error: { margin: 0, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#b91c1c', fontSize: 14 },
  btn:   { padding: '12px', borderRadius: 8, border: 'none', background: '#1e293b', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
}
