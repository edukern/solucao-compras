import { useState } from 'react'

function formatCPF(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

export default function RhConsulta() {
  const [cpf, setCpf]           = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [status, setStatus]     = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const cpfDigits = cpf.replace(/\D/g, '')
    if (cpfDigits.length !== 11) {
      setErrorMsg('CPF deve ter 11 dígitos.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/consultar-rh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfDigits, accessKey }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.error || `Erro ${res.status}`)
        setStatus('error')
        return
      }

      const blob     = await res.blob()
      const url      = URL.createObjectURL(blob)
      const a        = document.createElement('a')
      const filename = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || `relatorio_${cpfDigits}.docx`
      a.href     = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      setStatus('idle')
    } catch {
      setErrorMsg('Falha de rede. Verifique sua conexão.')
      setStatus('error')
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Consulta RH</h1>
        <p style={styles.subtitle}>Background check — Boa Vista + SPC Brasil</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Senha de acesso
            <input
              type="password"
              value={accessKey}
              onChange={e => setAccessKey(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>

          <label style={styles.label}>
            CPF do candidato
            <input
              type="text"
              value={cpf}
              onChange={e => setCpf(formatCPF(e.target.value))}
              style={styles.input}
              placeholder="000.000.000-00"
              inputMode="numeric"
              required
            />
          </label>

          {status === 'error' && (
            <p style={styles.error}>{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{ ...styles.button, ...(status === 'loading' ? styles.buttonLoading : {}) }}
          >
            {status === 'loading' ? 'Consultando…' : 'Gerar relatório'}
          </button>
        </form>

        {status === 'loading' && (
          <p style={styles.hint}>
            Consultando Boa Vista e SPC Brasil em paralelo.<br />
            Isso leva alguns segundos…
          </p>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f4f5f7',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '40px 48px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '24px',
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    margin: '0 0 32px',
    fontSize: '14px',
    color: '#666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#111',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'opacity 0.15s',
  },
  buttonLoading: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  error: {
    margin: '0',
    padding: '10px 14px',
    borderRadius: '8px',
    background: '#fef2f2',
    color: '#b91c1c',
    fontSize: '14px',
  },
  hint: {
    marginTop: '20px',
    fontSize: '13px',
    color: '#888',
    textAlign: 'center',
    lineHeight: '1.6',
  },
}
