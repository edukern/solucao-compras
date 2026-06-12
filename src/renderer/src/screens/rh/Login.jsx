import { useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail]   = useState('')
  const [senha, setSenha]   = useState('')
  const [status, setStatus] = useState('idle')
  const [msg, setMsg]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setMsg('')
    try {
      const res  = await fetch('/api/auth-rh', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, senha }),
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
    <div style={s.container}>
      <div style={s.card}>
        <h1 style={s.title}>Módulo RH</h1>
        <p style={s.subtitle}>Irmãos Backes</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={s.input}
            placeholder="seu@email.com"
            required
            autoFocus
            onFocus={e => Object.assign(e.target.style, s.inputFocus)}
            onBlur={e => Object.assign(e.target.style, { borderColor: '#ddd', boxShadow: 'none' })}
          />
          <label style={s.label}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            style={s.input}
            placeholder="••••••••"
            required
            onFocus={e => Object.assign(e.target.style, s.inputFocus)}
            onBlur={e => Object.assign(e.target.style, { borderColor: '#ddd', boxShadow: 'none' })}
          />
          {status === 'error' && <p style={s.erro}>{msg}</p>}
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{ ...s.button, opacity: status === 'loading' ? 0.6 : 1 }}
          >
            {status === 'loading' ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  container: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    background: 'white', borderRadius: 12, padding: 40,
    width: '100%', maxWidth: 380, boxShadow: '0 4px 24px rgba(0,0,0,.08)',
  },
  title:    { fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: '#111' },
  subtitle: { fontSize: 14, color: '#888', margin: '0 0 28px' },
  form:     { display: 'flex', flexDirection: 'column', gap: 8 },
  label:    { fontSize: 13, fontWeight: 600, color: '#444' },
  input: {
    padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8,
    fontSize: 14, marginBottom: 8, outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  inputFocus: { borderColor: '#111', boxShadow: '0 0 0 3px rgba(17,17,17,.1)' },
  button: {
    marginTop: 8, padding: 12, background: '#111', color: 'white',
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', width: '100%',
  },
  erro: { fontSize: 13, color: '#e74c3c', margin: 0 },
}
