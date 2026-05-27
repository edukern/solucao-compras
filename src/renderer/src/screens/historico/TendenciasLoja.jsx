import { Fragment, useState, useEffect } from 'react'
import { historico } from '../../services/historico'
import { fmtColecao } from '../../lib/utils'
import styles from './Historico.module.css'

const fmt = v => (v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function TendenciasLoja() {
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
    historico.tendenciasPorLoja(Number(segId))
      .then(setRows)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [segId])

  // Pivotar: {comprador_id → {colecao_id → {qtd, valor}}}
  const colecoes     = [...new Set(rows.map(r => r.colecao_id))].sort((a, b) => b.localeCompare(a))
  const compradores  = []
  const comprById    = new Map()
  for (const r of rows) {
    if (r.compradores && !comprById.has(r.compradores.id)) {
      comprById.set(r.compradores.id, r.compradores)
      compradores.push(r.compradores)
    }
  }
  compradores.sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99))

  const pivot = new Map()
  for (const r of rows) {
    if (!r.compradores) continue
    const cid = r.compradores.id
    const col = r.colecao_id
    const entry = pivot.get(`${cid}|${col}`) ?? { qtd: 0, valor: 0 }
    entry.qtd   += r.qtd_total ?? 0
    entry.valor += parseFloat(r.valor_total ?? 0)
    pivot.set(`${cid}|${col}`, entry)
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
        <p className={styles.hint}>Sem dados de tendência para esta segmentação.</p>
      )}

      {!loading && colecoes.length > 0 && compradores.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Loja</th>
                {colecoes.map(c => (
                  <th key={c} colSpan={2} className={styles.colecaoHeader}>{fmtColecao(c)}</th>
                ))}
              </tr>
              <tr>
                <th></th>
                {colecoes.map(c => (
                  <Fragment key={c}>
                    <th className={styles.numCol}>Peças</th>
                    <th className={styles.numCol}>R$</th>
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {compradores.map(comp => (
                <tr key={comp.id}>
                  <td>{comp.nome}</td>
                  {colecoes.map(col => {
                    const entry = pivot.get(`${comp.id}|${col}`)
                    return (
                      <Fragment key={col}>
                        <td className={styles.numCol}>
                          {entry ? entry.qtd.toLocaleString('pt-BR') : '—'}
                        </td>
                        <td className={styles.numCol}>
                          {entry ? fmt(entry.valor) : '—'}
                        </td>
                      </Fragment>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
