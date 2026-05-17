import { useState } from 'react'
import styles from './ColecaoModal.module.css'

export default function ColecaoModal({ onClose, onSave }) {
  const [nome, setNome] = useState('')
  const [estacao, setEstacao] = useState('verao')
  const [ano, setAno] = useState(new Date().getFullYear() + 1)

  function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim()) return
    onSave({ nome: nome.trim(), estacao, ano: Number(ano) })
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Nova coleção</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Nome</span>
            <input
              autoFocus
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Verão 2027"
            />
          </label>
          <label className={styles.field}>
            <span>Estação</span>
            <select value={estacao} onChange={e => setEstacao(e.target.value)}>
              <option value="verao">Verão</option>
              <option value="inverno">Inverno</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Ano</span>
            <input
              type="number"
              value={ano}
              onChange={e => setAno(e.target.value)}
              min={2020}
              max={2099}
            />
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.save} disabled={!nome.trim()}>Criar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
