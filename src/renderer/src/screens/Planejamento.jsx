import { useState, useEffect, useRef } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { useAuth } from '../contexts/AuthContext'
import { findBaseColecoes } from '../utils/colecoes'
import SegmentacaoSelect from '../components/SegmentacaoSelect'
import styles from './Planejamento.module.css'
import { segmentacoes as segmentacoesService } from '../services/segmentacoes'
import { grades as gradesService } from '../services/grades'
import { projecoes as projecoesService } from '../services/projecoes'

const METODOS = [
  { id: 'media_simples',   label: 'Média simples'   },
  { id: 'media_ponderada', label: 'Média ponderada' },
  { id: 'manual',          label: 'Manual'           },
]

export default function Planejamento() {
  const { active, collections } = useCollection()
  const { comprador, user } = useAuth()
  const [segs,      setSegs]      = useState([])
  const [segId,     setSegId]     = useState(null)
  const [metodo,    setMetodo]    = useState('media_simples')
  const [rows,      setRows]      = useState([])
  const [baseNomes, setBaseNomes] = useState(['', ''])
  const [warning,   setWarning]   = useState(null)
  const [saved,     setSaved]     = useState(false)
  const [importColId,  setImportColId]  = useState('')
  const [importing,    setImporting]    = useState(false)
  const [importResult, setImportResult] = useState(null)

  useEffect(() => {
    segmentacoesService.list().then(setSegs)
  }, [])

  useEffect(() => {
    if (!active || !segId) { setRows([]); setWarning(null); return }
    setSaved(false)
    loadPlanejamento(segId, metodo)
  }, [active?.id, segId, metodo, comprador?.id])

  async function loadPlanejamento(sid, met) {
    if (!active) return
    setWarning(null)
    const base = findBaseColecoes(collections, active)
    if (base.length < 1) {
      setWarning(
        `Nenhuma coleção histórica de ${active.estacao} encontrada. ` +
        `Importe o histórico antes de planejar.`
      )
      setRows([])
      return
    }

    const baseIds = base.map(c => c.id)
    const n2Id = base.length >= 2 ? base[0].id : null
    const n1Id = base.length >= 2 ? base[1].id : base[0].id

    const compradorId = comprador?.id ?? null
    const [gradeN2, gradeN1, projSaved, projCalc] = await Promise.all([
      n2Id ? gradesService.get(sid, n2Id, compradorId) : Promise.resolve([]),
      gradesService.get(sid, n1Id, compradorId),
      projecoesService.get(sid, active.id, compradorId),
      projecoesService.calcular(sid, active.id, baseIds, met !== 'manual' ? met : 'media_simples', compradorId),
    ])

    const savedMap = Object.fromEntries(projSaved.map(r => [r.tamanho, r.qtd_ajustada]))
    const n2Map    = Object.fromEntries(gradeN2.map(r => [r.tamanho, r.qtd_comprada]))
    const n1Map    = Object.fromEntries(gradeN1.map(r => [r.tamanho, r.qtd_comprada]))

    let merged
    if (met === 'manual' && projSaved.length > 0) {
      merged = projSaved.map(r => ({
        tamanho:       r.tamanho,
        ordem:         r.ordem,
        n2:            n2Map[r.tamanho] ?? 0,
        n1:            n1Map[r.tamanho] ?? 0,
        qtd_projetada: r.qtd_projetada,
        qtd_ajustada:  r.qtd_ajustada,
      }))
    } else {
      merged = projCalc.map(r => ({
        tamanho:       r.tamanho,
        ordem:         r.ordem,
        n2:            n2Map[r.tamanho] ?? 0,
        n1:            n1Map[r.tamanho] ?? 0,
        qtd_projetada: r.qtd_projetada,
        qtd_ajustada:  met === 'manual' ? r.qtd_projetada : (savedMap[r.tamanho] ?? r.qtd_projetada),
      }))
    }

    setRows(merged)
    setBaseNomes([base.length >= 2 ? base[0].nome : '—', base[base.length - 1].nome])
  }

  function handleAdjust(tamanho, raw) {
    const val = parseInt(raw, 10)
    if (isNaN(val) || val < 0) return
    setSaved(false)
    setRows(prev => prev.map(r => r.tamanho === tamanho ? { ...r, qtd_ajustada: val } : r))
  }

  function handleRestore() {
    setSaved(false)
    setRows(prev => prev.map(r => ({ ...r, qtd_ajustada: r.qtd_projetada })))
  }

  const fileInputRef = useRef(null)

  function handleImportClick() {
    if (!importColId || !segId) return
    fileInputRef.current?.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      const rows = await gradesService.importar(file, segId, Number(importColId))
      const result = { imported: rows.length, skipped: 0, segIds: [segId] }
      setImportResult(result)
      if (active) {
        const base = findBaseColecoes(collections, active)
        if (base.length >= 1) {
          const baseIds = base.map(c => c.id)
          const compradorId = comprador?.id ?? null
          const userId     = user?.id ?? null
          await Promise.allSettled(
            result.segIds.map(async sid => {
              const projRows = await projecoesService.calcular(sid, active.id, baseIds, metodo, compradorId)
              if (projRows.length > 0) {
                await projecoesService.salvar(sid, active.id, projRows, metodo, compradorId, userId)
              }
            })
          )
        }
      }
      if (segId) loadPlanejamento(segId, metodo)
    } catch (err) {
      setImportResult({ imported: 0, skipped: 0, errors: [String(err)] })
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  async function handleSave() {
    if (!segId || !active || rows.length === 0) return
    const toSave = rows.map(({ tamanho, ordem, qtd_projetada, qtd_ajustada }) =>
      ({ tamanho, ordem, qtd_projetada, qtd_ajustada })
    )
    await projecoesService.salvar(segId, active.id, toSave, metodo, comprador?.id ?? null, user?.id ?? null)
    setSaved(true)
  }

  const totalProjetado = rows.reduce((s, r) => s + r.qtd_projetada, 0)
  const totalAjustado  = rows.reduce((s, r) => s + r.qtd_ajustada,  0)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Planejamento{active ? ` — ${active.nome}` : ''}</h1>

      <details className={styles.importSection}>
        <summary className={styles.importSummary}>Importar Análise de Coleção</summary>
        <div className={styles.importBody}>
          <div className={styles.importRow}>
            <label className={styles.importLabel}>Coleção:</label>
            <select value={importColId} onChange={e => setImportColId(e.target.value)}>
              <option value="">Selecione a coleção…</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            <button
              className={styles.btnImportar}
              disabled={!importColId || !segId || importing}
              onClick={handleImportClick}
            >
              {importing ? 'Importando…' : 'Escolher arquivo e importar →'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          {importResult && (
            <div className={importResult.errors?.length ? styles.importError : styles.importSuccess}>
              {!importResult.errors?.length
                ? `✓ ${importResult.imported} produto(s) importado(s)${importResult.skipped > 0 ? `, ${importResult.skipped} ignorado(s)` : ''}.`
                : `${importResult.imported} importado(s), ${importResult.skipped} ignorado(s). Erros: ${importResult.errors.slice(0, 3).join('; ')}`
              }
            </div>
          )}
        </div>
      </details>

      {warning && <div className={styles.warning}>{warning}</div>}

      <div className={styles.panel}>
        <div className={styles.panelRow}>
          <span className={styles.sectionLabel}>Segmentação</span>
          <SegmentacaoSelect segs={segs} value={segId} onChange={setSegId} />
        </div>

        <div className={styles.panelRow}>
          <span className={styles.sectionLabel}>Método</span>
          <div className={styles.methods}>
            {METODOS.map(m => (
              <button
                key={m.id}
                className={`${styles.method} ${metodo === m.id ? styles.methodActive : ''}`}
                onClick={() => setMetodo(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
          {rows.length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Baseado em: {baseNomes.join(' + ')}
            </span>
          )}
        </div>

        {!segId && (
          <div className={styles.placeholder}>Selecione uma segmentação para visualizar a projeção.</div>
        )}
        {segId && rows.length === 0 && !warning && (
          <div className={styles.placeholder}>Sem dados históricos para esta segmentação.</div>
        )}
        {segId && rows.length > 0 && (
          <>
            <div style={{ overflowX: 'auto', padding: '0 0' }}>
              <table className={styles.table} style={{ margin: '0' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.6rem 1rem' }}>Tamanho</th>
                    <th style={{ color: 'var(--text-secondary)', padding: '0.6rem 1rem' }}>{baseNomes[0] || 'N-2'}</th>
                    <th style={{ color: 'var(--text-secondary)', padding: '0.6rem 1rem' }}>{baseNomes[1] || 'N-1'}</th>
                    <th style={{ color: 'var(--purple)', padding: '0.6rem 1rem' }}>Projeção calc.</th>
                    <th style={{ color: 'var(--yellow)', padding: '0.6rem 1rem' }}>Ajuste manual</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.tamanho}>
                      <td style={{ padding: '0.5rem 1rem' }}>{r.tamanho}</td>
                      <td style={{ padding: '0.5rem 1rem' }}>{r.n2}</td>
                      <td style={{ padding: '0.5rem 1rem' }}>{r.n1}</td>
                      <td style={{ padding: '0.5rem 1rem', color: 'var(--purple)', fontWeight: 600 }}>{r.qtd_projetada}</td>
                      <td style={{ padding: '0.5rem 1rem' }}>
                        <input
                          type="number"
                          min="0"
                          className={`${styles.adjInput} ${r.qtd_ajustada !== r.qtd_projetada ? styles.adjModified : ''}`}
                          value={r.qtd_ajustada}
                          onChange={e => handleAdjust(r.tamanho, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ padding: '0.5rem 1rem' }}>Total</td>
                    <td style={{ padding: '0.5rem 1rem' }}>{rows.reduce((s, r) => s + r.n2, 0)}</td>
                    <td style={{ padding: '0.5rem 1rem' }}>{rows.reduce((s, r) => s + r.n1, 0)}</td>
                    <td style={{ padding: '0.5rem 1rem', color: 'var(--purple)' }}>{totalProjetado}</td>
                    <td style={{ padding: '0.5rem 1rem', color: 'var(--yellow)', textAlign: 'right' }}>
                      <strong>{totalAjustado}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className={styles.actions}>
              {saved && <span className={styles.savedBadge}>✓ Salvo</span>}
              <button className={styles.btnSecondary} onClick={handleRestore}>
                Restaurar calculado
              </button>
              <button className={styles.btnPrimary} onClick={handleSave}>
                Salvar projeção
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
