import styles from './SaveStatus.module.css'

// state: 'idle' | 'saving' | 'saved' | 'error'
export default function SaveStatus({ state, onRetry }) {
  if (state === 'idle') return null
  if (state === 'saving') return <span className={styles.saving}>Salvando…</span>
  if (state === 'saved')  return <span className={styles.saved}>✓ Salvo</span>
  return (
    <span className={styles.error}>
      ⚠ Falha ao salvar
      {onRetry && <button className={styles.retry} onClick={onRetry}>tentar de novo</button>}
    </span>
  )
}
