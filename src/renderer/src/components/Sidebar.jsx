import { useCollection } from '../contexts/CollectionContext'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '◉' },
  { id: 'planejamento', label: 'Planejamento', icon: '🎯' },
  { id: 'compras',      label: 'Compras',      icon: '🛍️' },
]

export default function Sidebar({ current, onNavigate, theme, onToggleTheme }) {
  const { collections, activeId, setActiveId } = useCollection()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>Solução Compras</div>

      <div className={styles.collectionSection}>
        <span className={styles.label}>Coleção ativa</span>
        <select
          className={styles.colSelect}
          value={activeId ?? ''}
          onChange={e => setActiveId(Number(e.target.value))}
        >
          {collections.length === 0 && <option value="">— nenhuma —</option>}
          {collections.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`${styles.navBtn} ${current === item.id ? styles.active : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button className={styles.themeBtn} onClick={onToggleTheme}>
          {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo escuro'}
        </button>
      </div>
    </aside>
  )
}
