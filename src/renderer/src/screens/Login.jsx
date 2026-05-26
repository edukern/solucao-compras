import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import styles from './Login.module.css'

export default function Login() {
  const { signIn } = useAuth()
  const [email,   setEmail]   = useState('')
  const [senha,   setSenha]   = useState('')
  const [erro,    setErro]    = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)
    setLoading(true)
    const { error } = await signIn(email, senha)
    setLoading(false)
    if (error) setErro(error.message)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Solução Compras</h1>
        <p className={styles.subtitle}>Irmãos Backes</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={styles.input}
            placeholder="seu@email.com"
            required
            autoFocus
          />
          <label className={styles.label}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            className={styles.input}
            placeholder="••••••••"
            required
          />
          {erro && <p className={styles.erro}>{erro}</p>}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
