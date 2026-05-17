import styles from './ConfirmModal.module.css'

export default function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = 'Confirmar', danger = false }) {
  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onCancel}>Cancelar</button>
          <button
            className={`${styles.btnConfirm} ${danger ? styles.danger : ''}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
