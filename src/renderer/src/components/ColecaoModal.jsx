import { useState } from 'react'
import styles from './ColecaoModal.module.css'

export default function ColecaoModal({ onClose, onSave }) {
  const [nome, setNome] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim()) return
    onSave({ nome: nome.trim() })
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
              placeholder="Ex: 27/1"
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
