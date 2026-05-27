import { useState, useEffect } from 'react'
import { historico } from '../../services/historico'
import styles from './Historico.module.css'

export default function GradeHistorica() {
  const [segmentacoes, setSegmentacoes] = useState([])
  const [segId,        setSegId]        = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [erro,         setErro]         = useState(null)

  useEffect(() => {
    historico.segmentacoesComHistorico()
      .then(segs => {
        setSegmentacoes(segs)
        if (segs.length) setSegId(String(segs[0].id))
      })
      .catch(e => setErro(e.message))
  }, [])

  useEffect(() => {
    if (!segId) { setRows([]); return }
    setLoading(true)
    setErro(null)
    historico.gradeHistorica(Number(segId))
      .then(setRows)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [segId])

  // Pivotar rows: {colecao_id → {tamanho → qtd}}
  const colecoes = [...new Set(rows.map(r => r.colecao_id))].sort((a, b) => b.localeCompare(a))
  const tamanhos = [...new Set(rows.map(r => r.tamanho))]
  const pivot    = new Map()
  for (const r of rows) {
    const cel = pivot.get(r.colecao_id) ?? {}
    cel[r.tamanho] = r.qtd_total_comprada
    pivot.set(r.colecao_id, cel)
  }

  const segLabel = s => `${s.tipo_produto} ${s.classe} ${s.tipo_grade}`

  return (
    <div className={styles.subpanel}>
      <div className={styles.filtros}>
        <label className={styles.filterLabel}>Segmentação</label>
        <select
          className={styles.filterSelect}
          value={segId}
          onChange={e => setSegId(e.target.value)}
        >
          {segmentacoes.map(s => (
            <option key={s.id} value={s.id}>{segLabel(s)}</option>
          ))}
        </select>
      </div>

      {loading && <p className={styles.hint}>Carregando…</p>}
      {erro    && <p className={styles.erro}>{erro}</p>}

      {!loading && !erro && rows.length === 0 && segId && (
        <p className={styles.hint}>Sem dados históricos para esta segmentação.</p>
      )}

      {!loading && colecoes.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Coleção</th>
                {tamanhos.map(t => <th key={t} className={styles.numCol}>{t}</th>)}
                <th className={styles.numCol}>Total</th>
              </tr>
            </thead>
            <tbody>
              {colecoes.map(col => {
                const cel   = pivot.get(col) ?? {}
                const total = tamanhos.reduce((s, t) => s + (cel[t] ?? 0), 0)
                return (
                  <tr key={col}>
                    <td>{col}</td>
                    {tamanhos.map(t => (
                      <td key={t} className={styles.numCol}>
                        {cel[t] != null ? cel[t].toLocaleString('pt-BR') : '—'}
                      </td>
                    ))}
                    <td className={`${styles.numCol} ${styles.totalCell}`}>
                      {total.toLocaleString('pt-BR')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
