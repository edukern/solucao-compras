import { useState } from 'react'
import { LayoutDashboard, Target, ShoppingBag, TrendingUp, BarChart2, Settings } from 'lucide-react'
import { useCollection } from '../contexts/CollectionContext'
import { useAuth } from '../contexts/AuthContext'
import { colecoes as colecoesService } from '../services/colecoes'
import ColecaoModal from './ColecaoModal'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Visão Geral',   Icon: LayoutDashboard },
  { id: 'planejamento',  label: 'Planejamento',  Icon: Target },
  { id: 'compras',       label: 'Compras',       Icon: ShoppingBag },
  { id: 'historico',     label: 'Histórico',     Icon: TrendingUp },
  { id: 'relatorios',    label: 'Relatórios',    Icon: BarChart2 },
  { id: 'configuracoes', label: 'Configurações', Icon: Settings },
]

export default function Sidebar({ current, onNavigate, theme, onToggleTheme }) {
  const { collections, setCollections, activeId, setActiveId } = useCollection()
  const { signOut, comprador, desvincularComprador } = useAuth()
  const [showModal, setShowModal] = useState(false)

  async function handleCreate(dados) {
    const nova = await colecoesService.create(dados)
    setCollections(prev => [...prev, nova])
    setActiveId(nova.id)
    setShowModal(false)
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>Bolt Compras</div>

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
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`${styles.navBtn} ${current === id ? styles.active : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={15} strokeWidth={1.6} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.themeToggleWrap}>
          <button
            className={`${styles.themeSwitch} ${theme === 'dark' ? styles.themeSwitchActive : ''}`}
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          />
        </div>
        {comprador && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#888', textAlign: 'center' }}>
            <span>{comprador.nome}</span>
            <button
              onClick={desvincularComprador}
              style={{ background: 'none', border: 'none', color: '#3ecf8e', fontSize: '11px', cursor: 'pointer', display: 'block', margin: '2px auto 0', textDecoration: 'underline' }}
            >
              Trocar loja
            </button>
          </div>
        )}
        <button
          onClick={signOut}
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: 'none',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#888',
            width: '100%',
          }}
        >
          Sair
        </button>
      </div>

      {showModal && <ColecaoModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
    </aside>
  )
}
