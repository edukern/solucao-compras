// src/renderer/src/screens/SelecionarLoja.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { compradores as compradoresService } from '../services/compradores'
import styles from './SelecionarLoja.module.css'

export default function SelecionarLoja() {
  const { vincularComprador, signOut } = useAuth()
  const [lista,    setLista]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [salvando, setSalvando] = useState(null)  // id sendo salvo
  const [erro,     setErro]     = useState(null)

  useEffect(() => {
    compradoresService.list()
      .then(setLista)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSelecionar(compradorId) {
    setSalvando(compradorId)
    setErro(null)
    try {
      await vincularComprador(compradorId)
      // AuthContext atualiza comprador → App.jsx roteia para o app
    } catch (e) {
      setErro(e.message)
      setSalvando(null)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Qual é a sua loja?</h1>
        <p className={styles.subtitle}>Selecione para vincular sua conta</p>
        {loading && <p className={styles.info}>Carregando…</p>}
        {erro    && <p className={styles.erro}>{erro}</p>}
        <ul className={styles.lista}>
          {lista.map(c => (
            <li key={c.id}>
              <button
                className={styles.item}
                onClick={() => handleSelecionar(c.id)}
                disabled={salvando !== null}
              >
                <span className={styles.nome}>{c.nome}</span>
                {c.cidade && <span className={styles.cidade}>{c.cidade}</span>}
                {salvando === c.id && <span className={styles.spinner}>…</span>}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className={styles.sair} onClick={signOut}>
          Sair
        </button>
      </div>
    </div>
  )
}
