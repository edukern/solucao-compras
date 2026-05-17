import { useState } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import ColecaoModal from './ColecaoModal'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '◉' },
  { id: 'planejamento', label: 'Planejamento', icon: '🎯' },
  { id: 'compras',      label: 'Compras',      icon: '🛍️' },
  { id: 'relatorios',   label: 'Relatórios',   icon: '📊' },
  { id: 'configuracoes', label: 'Configurações', icon: '⚙️' },
]

export default function Sidebar({ current, onNavigate, theme, onToggleTheme }) {
  const { collections, setCollections, activeId, setActiveId } = useCollection()
  const [showModal, setShowModal] = useState(false)

  async function handleCreate(dados) {
    const nova = await window.api.colecoes.create(dados)
    setCollections(prev => [...prev, nova])
    setActiveId(nova.id)
    setShowModal(false)
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>Solução Compras</div>

      <div className={styles.collectionSection}>
        <div className={styles.colHeader}>
          <span className={styles.label}>Coleção ativa</span>
          <button className={styles.addBtn} onClick={() => setShowModal(true)} title="Nova coleção">+</button>
        </div>
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

      {showModal && <ColecaoModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
    </aside>
  )
}
