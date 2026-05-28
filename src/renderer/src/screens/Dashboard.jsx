import { useState, useEffect } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { useAuth } from '../contexts/AuthContext'
import { aggregateSegmentacao, aggregateDashboard } from '../utils/dashboard'
import { tamanhosDeTipoGrade } from '../constants/grades'
import { dashboard as dashboardService } from '../services/dashboard'
import { compradores as compradoresService } from '../services/compradores'
import styles from './Dashboard.module.css'

const fmt = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = iso => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardLabel}>{label}</div>
      <div className={styles.cardValue} style={{ color }}>{value}</div>
      {sub && <div className={styles.cardSub}>{sub}</div>}
    </div>
  )
}

function QuickLink({ icon, label, onClick }) {
  return (
    <button className={styles.quickLink} onClick={onClick}>
      <span className={styles.quickIcon}>{icon}</span>
      <span className={styles.quickLabel}>{label}</span>
    </button>
  )
}

export default function Dashboard({ onNavigate }) {
  const { active } = useCollection()
  const { comprador } = useAuth()

  const [compradores,    setCompradores]    = useState([])
  const [lojaId,         setLojaId]         = useState(undefined) // undefined = ainda carregando default
  const [sessoes,        setSessoes]        = useState([])
  const [loading,        setLoading]        = useState(false)

  // Carrega lista de compradores uma vez
  useEffect(() => {
    compradoresService.list().then(setCompradores)
  }, [])

  // Define loja padrão quando compradores e comprador logado estiverem disponíveis
  useEffect(() => {
    if (lojaId !== undefined) return // já foi definido
    if (compradores.length === 0) return // ainda carregando compradores
    const defaultId = comprador?.id ?? null
    setLojaId(defaultId)
  }, [compradores, comprador])

  // Carrega dados sempre que coleção ou loja selecionada mudam
  useEffect(() => {
    if (!active || lojaId === undefined) return
    setLoading(true)
    dashboardService.sessoesPorLoja(active.id, lojaId)
      .then(setSessoes)
      .catch(() => setSessoes([]))
      .finally(() => setLoading(false))
  }, [active?.id, lojaId])

  if (!active) {
    return (
      <div className={styles.empty}>
        <span>Nenhuma coleção encontrada.</span>
        <span>Crie uma coleção nas configurações para começar.</span>
      </div>
    )
  }

  const totalSessoes = sessoes.length
  const totalPecas   = sessoes.reduce((s, r) => s + r.pecas, 0)
  const totalValor   = sessoes.reduce((s, r) => s + r.valor, 0)

  const lojaAtual = compradores.find(c => c.id === lojaId)
  const selectorLabel = lojaId ? (lojaAtual?.nome ?? '…') : 'Todas as lojas'

  return (
    <div className={styles.page}>

      {/* Cabeçalho com seletor de loja */}
      <div className={styles.header}>
        <h1 className={styles.title}>Visão Geral</h1>
        <select
          className={styles.lojaSelect}
          value={lojaId ?? ''}
          onChange={e => setLojaId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Todas as lojas</option>
          {compradores.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      {/* Cards de resumo */}
      <div className={styles.cards}>
        <MetricCard label="Sessões"       value={totalSessoes}                          color="var(--accent-light)" />
        <MetricCard label="Total de peças" value={totalPecas.toLocaleString('pt-BR')}  sub="peças"    color="var(--green)"  />
        <MetricCard label="Total em pedidos" value={`R$ ${fmt(totalValor)}`}            color="var(--purple)" />
      </div>

      {/* Links rápidos */}
      <div className={styles.quickLinks}>
        <QuickLink icon="🎯" label="Planejamento" onClick={() => onNavigate('planejamento')} />
        <QuickLink icon="📊" label="Relatórios"   onClick={() => onNavigate('relatorios')}   />
        <QuickLink icon="🛍️" label="Compras"      onClick={() => onNavigate('compras')}      />
        <QuickLink icon="📈" label="Histórico"    onClick={() => onNavigate('historico')}    />
      </div>

      {/* Tabela de sessões */}
      <div className={styles.tableBox}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th>Data</th>
              <th>Vendedor</th>
              <th>Peças</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className={styles.emptyRow}>Carregando…</td></tr>
            )}
            {!loading && sessoes.length === 0 && (
              <tr><td colSpan={5} className={styles.emptyRow}>
                {lojaId
                  ? 'Nenhuma sessão encontrada para esta loja na coleção ativa.'
                  : 'Nenhuma sessão encontrada nesta coleção.'}
              </td></tr>
            )}
            {!loading && sessoes.map(s => (
              <tr key={s.id}>
                <td className={styles.fornCell}>{s.fornecedor_nome}</td>
                <td className={styles.dateCell}>{fmtDate(s.data_visita)}</td>
                <td className={styles.vendCell}>{s.vendedor || <span className={styles.muted}>—</span>}</td>
                <td className={styles.numCell}><strong>{s.pecas.toLocaleString('pt-BR')}</strong></td>
                <td className={styles.numCell}>R$ {fmt(s.valor)}</td>
              </tr>
            ))}
          </tbody>
          {!loading && sessoes.length > 1 && (
            <tfoot>
              <tr>
                <td colSpan={3} className={styles.footLabel}>Total</td>
                <td className={styles.numCell}><strong>{totalPecas.toLocaleString('pt-BR')}</strong></td>
                <td className={styles.numCell}><strong>R$ {fmt(totalValor)}</strong></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
