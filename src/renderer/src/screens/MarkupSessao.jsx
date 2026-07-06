import { useState, useEffect } from 'react'
import styles from './Compras.module.css'
import { pedidos as pedidosService } from '../services/pedidos'
import { fmtDate } from '../lib/format'
import { fmtV } from '../lib/pdfHelpers'

export function MarkupSessao({ sessao, onClose }) {
  const [index1,     setIndex1]     = useState(sessao.markup_index1 ? String(sessao.markup_index1) : '')
  const [index2,     setIndex2]     = useState(sessao.markup_index2 ? String(sessao.markup_index2) : '')
  const [items,      setItems]      = useState([])
  const [precos,     setPrecos]     = useState({})
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [editingRef, setEditingRef] = useState(null)

  useEffect(() => {
    pedidosService.itensPorFornecedor(sessao.id).then(visitasData => {
      const seen = new Map()
      for (const vis of visitasData ?? []) {
        for (const ped of vis.pedidos ?? []) {
          if (!seen.has(ped.referencia)) {
            seen.set(ped.referencia, {
              referencia:     ped.referencia,
              tipo_produto:   ped.tipo_produto ?? ped.segmentacao?.tipo_produto ?? '',
              classe:         ped.classe ?? ped.segmentacao?.classe ?? '',
              valor_unitario: ped.valor_unitario ?? 0,
              icms_pct:       ped.icms_pct ?? 0,
              desconto_pct:   ped.desconto_pct ?? 0,
              preco_venda:    ped.preco_venda ?? '',
              cor:            ped.cor ?? '',
              detalhe:        ped.detalhe ?? '',
            })
          }
        }
      }
      const list = [...seen.values()]
      setItems(list)
      setPrecos(Object.fromEntries(list.map(it => [it.referencia, it.preco_venda ? String(it.preco_venda) : ''])))
      setLoading(false)
    })
  }, [sessao.id])

  function calcBase(item) {
    const v = item.valor_unitario
    const d = parseFloat(String(item.desconto_pct ?? sessao.desconto_pct ?? 0).replace(',', '.')) || 0
    const icms = parseFloat(String(item.icms_pct ?? 0).replace(',', '.')) || 0
    const afterDesc = v * (1 - d / 100)
    return icms > 0 ? afterDesc * (1 - icms / 100) : afterDesc
  }

  function calcIdx(item, idxStr) {
    const m = parseFloat(String(idxStr ?? '').replace(',', '.'))
    if (!idxStr || isNaN(m) || m <= 0) return ''
    return (calcBase(item) * (1 + m)).toFixed(2)
  }

  function r99(val) {
    const n = parseFloat(val)
    if (!val || isNaN(n) || n <= 0) return val
    return (Math.floor(n) + 0.99).toFixed(2)
  }

  function applyIdxAll(idxStr) {
    setPrecos(prev => {
      const next = { ...prev }
      for (const it of items) {
        const c = calcIdx(it, idxStr)
        if (c) next[it.referencia] = r99(c)
      }
      return next
    })
  }

  async function handleSalvar() {
    setSaving(true)
    try {
      await pedidosService.atualizarMarkupSessao(sessao.id, precos, index1, index2)
      onClose()
    } catch (e) {
      alert(`Erro ao salvar: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  const hasIdx2 = index2.trim() !== ''
  const temIcms = items.some(it => (it.icms_pct ?? 0) > 0)

  return (
    <div className={styles.markupOverlay}>
      <div className={styles.markupModal}>
        <div className={styles.markupModalHeader}>
          <div>
            <strong>{sessao.fornecedor?.nome || '—'}</strong>
            {sessao.data_visita && <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: '0.9em' }}>{fmtDate(sessao.data_visita)}</span>}
          </div>
          <button className={styles.btnBack} onClick={onClose}>✕ Fechar</button>
        </div>

        <div className={styles.markupIndices}>
          <div className={styles.field}>
            <span className={styles.label}>Índice 1</span>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input type="text" className={styles.addItemMarkup} placeholder="ex: 1.5" value={index1} onChange={e => setIndex1(e.target.value)} />
              <button className={styles.btnSecondary} onClick={() => applyIdxAll(index1)} disabled={!index1.trim()}>Aplicar em todos</button>
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Índice 2 <span style={{ fontWeight: 'normal', textTransform: 'none' }}>(opcional)</span></span>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input type="text" className={styles.addItemMarkup} placeholder="ex: 1.8" value={index2} onChange={e => setIndex2(e.target.value)} />
              {hasIdx2 && <button className={styles.btnSecondary} onClick={() => applyIdxAll(index2)} disabled={!index2.trim()}>Aplicar em todos</button>}
            </div>
          </div>
        </div>

        {loading && <p className={styles.muted}>Carregando itens…</p>}
        {!loading && items.length === 0 && <p className={styles.muted}>Nenhum item encontrado nesta sessão.</p>}
        {!loading && items.length > 0 && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Produto</th>
                    <th>Valor unit.</th>
                    {temIcms && <th>ICMS</th>}
                    <th>Base c/ desc{temIcms ? '/icms' : ''}</th>
                    <th>× Idx1{index1 ? ` (${index1})` : ''}</th>
                    {hasIdx2 && <th>× Idx2 ({index2})</th>}
                    <th>Preço sugerido</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(it => {
                    const base   = calcBase(it)
                    const c1     = calcIdx(it, index1)
                    const c2     = hasIdx2 ? calcIdx(it, index2) : ''
                    const isEdit = editingRef === it.referencia
                    const label  = [it.referencia, it.cor, it.detalhe].filter(Boolean).join(' · ')
                    return (
                      <tr key={it.referencia}>
                        <td>{label}</td>
                        <td>{[it.tipo_produto, it.classe].filter(Boolean).join(' · ')}</td>
                        <td>R$ {fmtV(it.valor_unitario)}</td>
                        {temIcms && <td>{it.icms_pct > 0 ? `${it.icms_pct}%` : '—'}</td>}
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>R$ {base.toFixed(2)}</td>
                        <td>
                          {c1 ? (
                            <button className={styles.btnMarkupCalc} onClick={() => setPrecos(p => ({ ...p, [it.referencia]: r99(c1) }))} title={`→ R$ ${r99(c1)}`}>
                              R$ {c1}
                            </button>
                          ) : '—'}
                        </td>
                        {hasIdx2 && (
                          <td>
                            {c2 ? (
                              <button className={styles.btnMarkupCalc} onClick={() => setPrecos(p => ({ ...p, [it.referencia]: r99(c2) }))} title={`→ R$ ${r99(c2)}`}>
                                R$ {c2}
                              </button>
                            ) : '—'}
                          </td>
                        )}
                        <td onClick={e => { e.stopPropagation(); setEditingRef(it.referencia) }} style={{ cursor: 'pointer', minWidth: 90 }}>
                          {isEdit ? (
                            <input
                              autoFocus
                              value={precos[it.referencia] ?? ''}
                              style={{ width: 80 }}
                              onChange={e => setPrecos(p => ({ ...p, [it.referencia]: e.target.value }))}
                              onBlur={() => setEditingRef(null)}
                              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingRef(null) }}
                              onClick={e => e.stopPropagation()}
                            />
                          ) : (
                            precos[it.referencia]
                              ? <strong>R$ {precos[it.referencia]}</strong>
                              : <span className={styles.itemDot}>— clicar para editar</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className={styles.markupModalFooter}>
              <button className={styles.btnPrimary} onClick={handleSalvar} disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar preços sugeridos'}
              </button>
              <button className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
