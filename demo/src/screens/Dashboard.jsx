import { useState, useEffect } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { aggregateSegmentacao, aggregateDashboard } from '../utils/dashboard'
import styles from './Dashboard.module.css'

function ProgressBar({ pct, height = 8 }) {
  const safe = Math.min(100, Math.max(0, pct))
  const color = safe >= 100 ? 'var(--green)' : safe > 0 ? 'var(--accent)' : 'var(--red)'
  return (
    <div className={styles.bar} style={{ height }}>
      <div className={styles.barFill} style={{ width: `${safe}%`, background: color }} />
    </div>
  )
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

export default function Dashboard() {
  const { active } = useCollection()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!active) { setRows([]); return }
    setLoading(true)
    loadData(active.id).finally(() => setLoading(false))
  }, [active?.id])

  async function loadData(colId) {
    const segs = await window.api.segmentacoes.list()
    const rowData = await Promise.all(
      segs.map(async seg => {
        const [proj, totais] = await Promise.all([
          window.api.projecoes.get(seg.id, colId),
          window.api.pedidos.totaisPorTamanho(seg.id, colId),
        ])
        return { seg, ...aggregateSegmentacao(proj, totais) }
      })
    )
    setRows(rowData.filter(r => r.projecao > 0))
  }

  if (!active) {
    return (
      <div className={styles.empty}>
        <span>Nenhuma coleção encontrada.</span>
        <span>Crie uma coleção nas configurações para começar.</span>
      </div>
    )
  }

  const { totalProjecao, totalComprado, totalSaldo, pctGeral } = aggregateDashboard(rows)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{active.nome}</h1>
        <span className={styles.badge}>{active.status}</span>
      </div>

      <div className={styles.cards}>
        <MetricCard label="Projeção total"   value={totalProjecao.toLocaleString('pt-BR')} sub="peças"      color="var(--purple)" />
        <MetricCard label="Já comprado"      value={totalComprado.toLocaleString('pt-BR')} sub="peças"      color="var(--green)"  />
        <MetricCard label="Saldo a comprar"  value={totalSaldo.toLocaleString('pt-BR')}    sub="peças"      color="var(--yellow)" />
        <MetricCard label="Progresso"        value={`${pctGeral}%`}                         sub="da coleção" color="var(--accent-light)" />
      </div>

      <div className={styles.progressBox}>
        <div className={styles.progressLabel}>
          <span>Progresso geral da coleção</span>
          <span>{pctGeral}%</span>
        </div>
        <ProgressBar pct={pctGeral} height={10} />
      </div>

      <div className={styles.tableBox}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Segmentação</th>
              <th>Projeção</th>
              <th>Comprado</th>
              <th>Saldo</th>
              <th style={{ minWidth: 140 }}>Progresso</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className={styles.emptyRow}>Carregando…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} className={styles.emptyRow}>
                Nenhuma projeção cadastrada para esta coleção.
              </td></tr>
            )}
            {!loading && rows.map(({ seg, projecao, comprado, saldo, pct }) => (
              <tr
                key={seg.id}
                className={pct >= 100 ? styles.rowDone : pct === 0 ? styles.rowNone : ''}
              >
                <td>
                  <div className={styles.segCell}>
                    {pct >= 100 && <span className={styles.checkMark}>✓</span>}
                    <span>{seg.classificacao} · {seg.tipo_produto} · {seg.classe}</span>
                  </div>
                </td>
                <td className={styles.numCell}>{projecao.toLocaleString('pt-BR')}</td>
                <td className={styles.numCell}>{comprado.toLocaleString('pt-BR')}</td>
                <td className={styles.numCell}>{saldo.toLocaleString('pt-BR')}</td>
                <td>
                  <div className={styles.barCell}>
                    <div style={{ flex: 1 }}><ProgressBar pct={pct} /></div>
                    <span className={styles.pctText}>{pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
