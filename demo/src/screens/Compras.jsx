// src/renderer/src/screens/Compras.jsx
import { useState, useEffect } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import SegmentacaoSelect from '../components/SegmentacaoSelect'
import styles from './Compras.module.css'

export default function Compras() {
  const { active } = useCollection()
  const [segs,    setSegs]    = useState([])
  const [forns,   setForns]   = useState([])
  const [fornId,  setFornId]  = useState('')
  const [segId,   setSegId]   = useState(null)
  const [dataPed, setDataPed] = useState(new Date().toISOString().slice(0, 10))
  const [valor,   setValor]   = useState('')
  const [proj,    setProj]    = useState([])   // { tamanho, qtd_ajustada }
  const [totais,  setTotais]  = useState([])   // { tamanho, total_pedido }
  const [qtds,    setQtds]    = useState({})   // { [tamanho]: number }
  const [success, setSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      window.api.segmentacoes.list(),
      window.api.fornecedores.list(),
    ]).then(([s, f]) => { setSegs(s); setForns(f) })
  }, [])

  useEffect(() => {
    if (!active || !segId) { setProj([]); setTotais([]); setQtds({}); return }
    loadGrade(segId, active.id)
  }, [active?.id, segId])

  async function loadGrade(sid, colId) {
    const [projRows, totaisRows] = await Promise.all([
      window.api.projecoes.get(sid, colId),
      window.api.pedidos.totaisPorTamanho(sid, colId),
    ])
    setProj(projRows)
    setTotais(totaisRows)
    setQtds({})
  }

  function getComprado(tamanho) {
    return totais.find(r => r.tamanho === tamanho)?.total_pedido ?? 0
  }

  function getSaldo(tamanho, projecao) {
    return Math.max(0, projecao - getComprado(tamanho))
  }

  function handleQty(tamanho, raw) {
    const val = parseInt(raw, 10)
    setSuccess(false)
    setQtds(prev => ({ ...prev, [tamanho]: isNaN(val) || val < 0 ? 0 : val }))
  }

  const totalQtd   = Object.values(qtds).reduce((s, q) => s + q, 0)
  const valorNum   = parseFloat(valor.replace(',', '.')) || 0
  const totalValor = totalQtd * valorNum

  const canConfirm = !isSaving && fornId && segId && totalQtd > 0 && valorNum > 0 && active

  async function handleConfirm() {
    const itens = proj
      .map(r => ({ tamanho: r.tamanho, qtd_pedida: qtds[r.tamanho] ?? 0 }))
      .filter(i => i.qtd_pedida > 0)
    if (!itens.length) return

    setIsSaving(true)
    setError(null)
    try {
      await window.api.pedidos.salvar({
        fornecedor_id:  Number(fornId),
        colecao_id:     active.id,
        segmentacao_id: segId,
        data_pedido:    dataPed,
        valor_unitario: valorNum,
        itens,
      })
      const newTotais = await window.api.pedidos.totaisPorTamanho(segId, active.id)
      setTotais(newTotais)
      setQtds({})
      setSuccess(true)
    } catch {
      setError('Erro ao registrar pedido. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancel() {
    setQtds({})
    setSuccess(false)
    setError(null)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Registrar Pedido{active ? ` — ${active.nome}` : ''}</h1>

      {success && (
        <div className={styles.successBanner}>✓ Pedido registrado com sucesso.</div>
      )}
      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.panel}>
        {/* Form header */}
        <div className={styles.formRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Fornecedor</span>
            <select value={fornId} onChange={e => setFornId(e.target.value)}>
              <option value="">Selecione…</option>
              {forns.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Data do pedido</span>
            <input type="date" value={dataPed} onChange={e => setDataPed(e.target.value)} />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Valor unitário (R$)</span>
            <input
              type="text"
              placeholder="0,00"
              value={valor}
              onChange={e => setValor(e.target.value)}
              style={{ width: 90 }}
            />
          </div>
        </div>

        {/* Segmentation row */}
        <div className={styles.formRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Segmentação</span>
            <SegmentacaoSelect segs={segs} value={segId} onChange={setSegId} />
          </div>
        </div>

        {/* Grade table */}
        {!segId && (
          <div className={styles.placeholder}>Selecione uma segmentação para ver a grade.</div>
        )}
        {segId && proj.length === 0 && (
          <div className={styles.placeholder}>
            Sem projeção cadastrada para esta segmentação. Acesse Planejamento primeiro.
          </div>
        )}
        {segId && proj.length > 0 && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tamanho</th>
                    <th style={{ color: 'var(--purple)' }}>Projeção</th>
                    <th style={{ color: 'var(--green)' }}>Já comprado</th>
                    <th style={{ color: 'var(--yellow)' }}>Saldo</th>
                    <th>Qtd neste pedido</th>
                  </tr>
                </thead>
                <tbody>
                  {proj.map(r => {
                    const comprado = getComprado(r.tamanho)
                    const saldo = getSaldo(r.tamanho, r.qtd_ajustada)
                    return (
                      <tr key={r.tamanho}>
                        <td>{r.tamanho}</td>
                        <td style={{ color: 'var(--purple)' }}>{r.qtd_ajustada}</td>
                        <td style={{ color: 'var(--green)' }}>{comprado}</td>
                        <td>
                          {saldo === 0
                            ? <span className={styles.checkCell}>0 ✓</span>
                            : <span style={{ color: 'var(--yellow)' }}>{saldo}</span>
                          }
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className={styles.qtyInput}
                            value={qtds[r.tamanho] ?? 0}
                            onChange={e => handleQty(r.tamanho, e.target.value)}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td style={{ color: 'var(--purple)' }}>{proj.reduce((s, r) => s + r.qtd_ajustada, 0)}</td>
                    <td style={{ color: 'var(--green)' }}>{totais.reduce((s, r) => s + r.total_pedido, 0)}</td>
                    <td>{proj.reduce((s, r) => s + getSaldo(r.tamanho, r.qtd_ajustada), 0)}</td>
                    <td>{totalQtd}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className={styles.footer}>
              <div className={styles.total}>
                Valor total do pedido:{' '}
                <span className={styles.totalValue}>
                  R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className={styles.actions}>
                <button className={styles.btnCancel} onClick={handleCancel}>Cancelar</button>
                <button className={styles.btnConfirm} onClick={handleConfirm} disabled={!canConfirm}>
                  Confirmar pedido
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
