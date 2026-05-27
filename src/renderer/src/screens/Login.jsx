import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import styles from './Login.module.css'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [modo,        setModo]        = useState('login')  // 'login' | 'cadastro'
  const [email,       setEmail]       = useState('')
  const [senha,       setSenha]       = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')
  const [erro,        setErro]        = useState(null)
  const [loading,     setLoading]     = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)

    if (modo === 'cadastro') {
      if (senha !== confirmaSenha) { setErro('As senhas não coincidem.'); return }
      if (senha.length < 6)        { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    }

    setLoading(true)
    const fn = modo === 'login' ? signIn : signUp
    const { error } = await fn(email, senha)
    setLoading(false)
    if (error) setErro(error.message)
    // Em caso de sucesso, onAuthStateChange no AuthContext redireciona automaticamente
  }

  function trocarModo() {
    setModo(m => m === 'login' ? 'cadastro' : 'login')
    setErro(null)
    setSenha('')
    setConfirmaSenha('')
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
          {modo === 'cadastro' && (
            <>
              <label className={styles.label}>Confirmar senha</label>
              <input
                type="password"
                value={confirmaSenha}
                onChange={e => setConfirmaSenha(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                required
              />
            </>
          )}
          {erro && <p className={styles.erro}>{erro}</p>}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading
              ? (modo === 'login' ? 'Entrando…' : 'Cadastrando…')
              : (modo === 'login' ? 'Entrar' : 'Criar conta')}
          </button>
        </form>
        <p className={styles.link}>
          {modo === 'login' ? 'Novo aqui? ' : 'Já tem conta? '}
          <button type="button" className={styles.linkBtn} onClick={trocarModo}>
            {modo === 'login' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  )
}
