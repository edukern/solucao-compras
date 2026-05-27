import { useState, useEffect } from 'react'
import { historico } from '../../services/historico'
import { GRADE_DEFINITIONS } from '../../constants/grades'
import styles from './Historico.module.css'

export default function Projecoes() {
  const [segmentacoes, setSegmentacoes] = useState([])
  const [segId,        setSegId]        = useState('')
  const [nColecoes,    setNColecoes]    = useState(4)
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
    historico.projecaoGrade(Number(segId), nColecoes)
      .then(setRows)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [segId, nColecoes])

  const selectedSeg  = segmentacoes.find(s => String(s.id) === segId)
  const gradeOrder   = GRADE_DEFINITIONS[selectedSeg?.tipo_grade]?.tamanhos ?? []
  const sortedRows   = [...rows].sort((a, b) => {
    const ia = gradeOrder.indexOf(a.tamanho), ib = gradeOrder.indexOf(b.tamanho)
    if (ia === -1 && ib === -1) return a.tamanho.localeCompare(b.tamanho)
    if (ia === -1) return 1; if (ib === -1) return -1
    return ia - ib
  })
  const totalProjetado = sortedRows.reduce((s, r) => s + r.qtd_projetada, 0)
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

        <label className={styles.filterLabel} style={{ marginLeft: '1.5rem' }}>
          Base (coleções)
        </label>
        <select
          className={styles.filterSelect}
          value={nColecoes}
          onChange={e => setNColecoes(Number(e.target.value))}
        >
          {[2, 3, 4, 6, 8].map(n => <option key={n} value={n}>{n} últimas</option>)}
        </select>
      </div>

      {loading && <p className={styles.hint}>Calculando…</p>}
      {erro    && <p className={styles.erro}>{erro}</p>}

      {!loading && !erro && rows.length === 0 && segId && (
        <p className={styles.hint}>
          Sem histórico suficiente para projetar (mín. 1 coleção).
        </p>
      )}

      {!loading && rows.length > 0 && (
        <>
          <p className={styles.hint} style={{ marginBottom: '0.75rem' }}>
            Média das últimas {nColecoes} coleções com dados disponíveis.
          </p>
          <div className={styles.tableWrap} style={{ maxWidth: '480px' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tamanho</th>
                  <th className={styles.numCol}>Qtd projetada</th>
                  <th className={styles.numCol}>% do total</th>
                  <th className={styles.numCol}>Coleções base</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map(r => (
                  <tr key={r.tamanho}>
                    <td><strong>{r.tamanho}</strong></td>
                    <td className={styles.numCol}>{r.qtd_projetada.toLocaleString('pt-BR')}</td>
                    <td className={styles.numCol}>
                      {totalProjetado > 0 ? ((r.qtd_projetada / totalProjetado) * 100).toFixed(1) + '%' : '—'}
                    </td>
                    <td className={styles.numCol}>{r.colecoes_base}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total</strong></td>
                  <td className={styles.numCol}><strong>{totalProjetado.toLocaleString('pt-BR')}</strong></td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
