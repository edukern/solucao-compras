import { useState, useEffect } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { aggregateSegmentacao, aggregateDashboard } from '../utils/dashboard'
import { tamanhosDeTipoGrade } from '../constants/grades'
import styles from './Dashboard.module.css'
import { dashboard as dashboardService } from '../services/dashboard'

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
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (!active) { setRows([]); return }
    setLoading(true)
    loadData(active.id).finally(() => setLoading(false))
  }, [active?.id])

  async function loadData(colId) {
    const flatRows = await dashboardService.data(colId)
    // Group flat rows (one per seg+tamanho) into per-seg structure
    const bySegId = {}
    for (const r of flatRows) {
      if (!bySegId[r.seg_id]) {
        bySegId[r.seg_id] = {
          seg: { id: r.seg_id, classificacao: r.classificacao, tipo_produto: r.tipo_produto,
                 classe: r.classe, tipo_grade: r.tipo_grade, estacao: r.estacao },
          proj: [],
          totais: [],
        }
      }
      bySegId[r.seg_id].proj.push({ tamanho: r.tamanho, qtd_ajustada: r.qtd_ajustada, ordem: r.ordem })
      if (r.total_pedido > 0) {
        bySegId[r.seg_id].totais.push({ tamanho: r.tamanho, total_pedido: r.total_pedido })
      }
    }
    const rowData = Object.values(bySegId).map(({ seg, proj, totais }) => ({
      seg, proj, totais, ...aggregateSegmentacao(proj, totais)
    }))
    setRows(rowData.filter(r => r.projecao > 0))
  }

  function toggleExpand(id) {
    setExpandedId(prev => prev === id ? null : id)
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
            {!loading && rows.map(({ seg, proj, totais, projecao, comprado, saldo, pct }) => {
              const isExpanded = expandedId === seg.id
              const tamanhos = tamanhosDeTipoGrade(seg.tipo_grade)
              const hasDrilldown = tamanhos.length > 0
              const getProjQtd = tam => proj.find(r => r.tamanho === tam)?.qtd_ajustada ?? 0
              const getCompQtd = tam => totais.find(r => r.tamanho === tam)?.total_pedido ?? 0
              const getSaldoQtd = tam => Math.max(0, getProjQtd(tam) - getCompQtd(tam))
              const lowSaldo = tam => getProjQtd(tam) > 0 && getSaldoQtd(tam) / getProjQtd(tam) < 0.2

              return [
                <tr
                  key={seg.id}
                  className={`${pct >= 100 ? styles.rowDone : pct === 0 ? styles.rowNone : ''} ${hasDrilldown ? styles.rowClickable : ''}`}
                  onClick={hasDrilldown ? () => toggleExpand(seg.id) : undefined}
                >
                  <td>
                    <div className={styles.segCell}>
                      {hasDrilldown && (
                        <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
                      )}
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
                </tr>,
                isExpanded && hasDrilldown && (
                  <tr key={`${seg.id}-drill`} className={styles.drillRow}>
                    <td colSpan={5} className={styles.drillCell}>
                      <div className={styles.drillGrid} style={{ overflowX: 'auto' }}>
                        <table className={styles.drillTable}>
                          <thead>
                            <tr>
                              <th className={styles.drillMetricHead} />
                              {tamanhos.map(tam => (
                                <th key={tam} className={styles.drillHead}>{tam}</th>
                              ))}
                              <th className={styles.drillHead}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className={styles.drillMetric} style={{ color: 'var(--purple)' }}>Projeção</td>
                              {tamanhos.map(tam => (
                                <td key={tam} className={styles.drillNum} style={{ color: 'var(--purple)' }}>{getProjQtd(tam) || '—'}</td>
                              ))}
                              <td className={`${styles.drillNum} ${styles.drillTotalCol}`} style={{ color: 'var(--purple)' }}>{projecao}</td>
                            </tr>
                            <tr>
                              <td className={styles.drillMetric} style={{ color: 'var(--green)' }}>Comprado</td>
                              {tamanhos.map(tam => (
                                <td key={tam} className={styles.drillNum} style={{ color: 'var(--green)' }}>{getCompQtd(tam) || '—'}</td>
                              ))}
                              <td className={`${styles.drillNum} ${styles.drillTotalCol}`} style={{ color: 'var(--green)' }}>{comprado}</td>
                            </tr>
                            <tr>
                              <td className={styles.drillMetric} style={{ color: 'var(--yellow)' }}>Saldo</td>
                              {tamanhos.map(tam => {
                                const s = getSaldoQtd(tam)
                                return (
                                  <td key={tam} className={styles.drillNum} style={{ color: lowSaldo(tam) ? 'var(--red)' : 'var(--yellow)', fontWeight: lowSaldo(tam) ? 700 : 400 }}>
                                    {s > 0 ? s : s === 0 && getProjQtd(tam) > 0 ? <span style={{ color: 'var(--green)' }}>✓</span> : '—'}
                                  </td>
                                )
                              })}
                              <td className={`${styles.drillNum} ${styles.drillTotalCol}`} style={{ color: 'var(--yellow)' }}>{saldo}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )
              ]
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
