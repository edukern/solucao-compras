import { useState, useEffect } from 'react'
import { relatorios } from '../../services/relatorios'
import { historico }  from '../../services/historico'
import styles         from '../relatorios/PorFornecedor.module.css'
import abcStyles      from './CurvaABC.module.css'

const TIPOS = [
  { id: 'segmentacao', label: 'Segmentações' },
  { id: 'fornecedor',  label: 'Fornecedores'  },
]

const CLASSE_LABEL = { A: 'Classe A', B: 'Classe B', C: 'Classe C' }

const fmtR$ = v =>
  (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtPct = v =>
  ((v ?? 0) * 100).toFixed(1) + '%'

export default function CurvaABC() {
  const [colecoes,   setColecoes]   = useState([])
  const [colecaoId,  setColecaoId]  = useState('')
  const [tipo,       setTipo]       = useState('segmentacao')
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [erro,       setErro]       = useState(null)

  // Load available historical collections once
  useEffect(() => {
    historico.colecoes()
      .then(cols => {
        setColecoes(cols)
        if (cols.length) setColecaoId(cols[0])   // most recent first
      })
      .catch(e => setErro(e.message))
  }, [])

  // Reload whenever collection or tipo changes
  useEffect(() => {
    if (!colecaoId) { setRows([]); return }
    setLoading(true)
    setErro(null)
    relatorios.curvaABC(colecaoId, tipo)
      .then(setRows)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [colecaoId, tipo])

  const totalValor = rows.reduce((s, r) => s + r.valor, 0)
  const counts     = { A: 0, B: 0, C: 0 }
  const values     = { A: 0, B: 0, C: 0 }
  for (const r of rows) { counts[r.classe]++; values[r.classe] += r.valor }

  return (
    <div className={abcStyles.page}>
      {/* ─── Filtros ─── */}
      <div className={abcStyles.filtros}>
        <div className={abcStyles.filterGroup}>
          <label className={abcStyles.filterLabel}>Coleção</label>
          <select
            className={abcStyles.filterSelect}
            value={colecaoId}
            onChange={e => setColecaoId(e.target.value)}
          >
            {colecoes.map(c => (
              <option key={c} value={c}>{c.replace('-', '/')}</option>
            ))}
          </select>
        </div>

        <div className={abcStyles.filterGroup}>
          <label className={abcStyles.filterLabel}>Agrupar por</label>
          <div className={abcStyles.toggle}>
            {TIPOS.map(t => (
              <button
                key={t.id}
                className={`${abcStyles.toggleBtn} ${tipo === t.id ? abcStyles.active : ''}`}
                onClick={() => setTipo(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <p className={abcStyles.hint}>Calculando…</p>}
      {erro    && <p className={abcStyles.erro}>{erro}</p>}

      {/* ─── Resumo por classe ─── */}
      {!loading && rows.length > 0 && (
        <>
          <div className={abcStyles.summary}>
            {['A', 'B', 'C'].map(cls => (
              <div key={cls} className={`${abcStyles.summaryCard} ${abcStyles['cls' + cls]}`}>
                <div className={abcStyles.summaryClass}>{cls}</div>
                <div className={abcStyles.summaryCount}>{counts[cls]} itens</div>
                <div className={abcStyles.summaryVal}>{fmtR$(values[cls])}</div>
                <div className={abcStyles.summaryPct}>{fmtPct(values[cls] / totalValor)}</div>
              </div>
            ))}
          </div>

          {/* ─── Tabela ─── */}
          <div className={abcStyles.tableWrap}>
            <table className={abcStyles.table}>
              <thead>
                <tr>
                  <th className={abcStyles.rankCol}>#</th>
                  <th>{tipo === 'segmentacao' ? 'Segmentação' : 'Fornecedor'}</th>
                  <th className={abcStyles.numCol}>Valor total</th>
                  <th className={abcStyles.numCol}>% próprio</th>
                  <th className={abcStyles.numCol}>% acumulado</th>
                  <th className={abcStyles.clsCol}>Classe</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className={abcStyles['row' + r.classe]}>
                    <td className={abcStyles.rankCol}>{r.rank}</td>
                    <td>{r.label}</td>
                    <td className={abcStyles.numCol}>{fmtR$(r.valor)}</td>
                    <td className={abcStyles.numCol}>{fmtPct(r.pct_proprio)}</td>
                    <td className={abcStyles.numCol}>{fmtPct(r.pct_acum)}</td>
                    <td className={abcStyles.clsCol}>
                      <span className={`${abcStyles.badge} ${abcStyles['badge' + r.classe]}`}>
                        {r.classe}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}><strong>Total ({rows.length} itens)</strong></td>
                  <td className={abcStyles.numCol}><strong>{fmtR$(totalValor)}</strong></td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {!loading && !erro && rows.length === 0 && colecaoId && (
        <p className={abcStyles.hint}>Sem dados para a coleção selecionada.</p>
      )}
    </div>
  )
}
