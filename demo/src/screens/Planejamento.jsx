import styles from './Planejamento.module.css'

export default function Planejamento() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Planejamento</h1>
      <div className={styles.notice}>
        <div className={styles.icon}>🔧</div>
        <p>Esta funcionalidade requer o histórico de coleções anteriores importado.</p>
        <p className={styles.sub}>Disponível na próxima fase do projeto.</p>
      </div>
    </div>
  )
}
