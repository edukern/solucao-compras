// src/renderer/src/screens/Compras.jsx
import { useState, useEffect } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import SegmentacaoSelect from '../components/SegmentacaoSelect'
import { GRADE_LABEL } from '../utils/gradeConfig'
import styles from './Compras.module.css'

const fmt = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function Compras() {
  const { active } = useCollection()
  const [segs,    setSegs]    = useState([])
  const [forns,   setForns]   = useState([])

  // header fields
  const [fornId,        setFornId]        = useState('')
  const [vendedor,      setVendedor]      = useState('')
  const [dataPed,       setDataPed]       = useState(new Date().toISOString().slice(0, 10))
  const [valor,         setValor]         = useState('')
  const [desconto,      setDesconto]      = useState('')
  const [condPag,       setCondPag]       = useState('')
  const [frete,         setFrete]         = useState('')
  const [transportadora,setTransportadora]= useState('')
  const [notaFiscal,    setNotaFiscal]    = useState('')
  const [obs,           setObs]           = useState('')

  // grade / order
  const [segId,    setSegId]    = useState(null)
  const [proj,     setProj]     = useState([])
  const [totais,   setTotais]   = useState([])
  const [qtds,     setQtds]     = useState({})
  const [success,  setSuccess]  = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    Promise.all([
      window.api.segmentacoes.list(),
      window.api.fornecedores.list(),
    ]).then(([s, f]) => { setSegs(s); setForns(f) })
  }, [])

  useEffect(() => {
    if (!active || !segId) { setProj([]); setTotais([]); setQtds({}); return }
    window.api.projecoes.get(segId, active.id).then(setProj)
    window.api.pedidos.totaisPorTamanho(segId, active.id).then(setTotais)
    setQtds({})
  }, [active?.id, segId])

  const getComprado = t => totais.find(r => r.tamanho === t)?.total_pedido ?? 0
  const getSaldo    = (t, pj) => Math.max(0, pj - getComprado(t))

  function handleQty(tamanho, raw) {
    const val = parseInt(raw, 10)
    setSuccess(false)
    setQtds(prev => ({ ...prev, [tamanho]: isNaN(val) || val < 0 ? 0 : val }))
  }

  const totalQtd     = Object.values(qtds).reduce((s, q) => s + q, 0)
  const valorNum     = parseFloat(valor.replace(',', '.')) || 0
  const descontoNum  = Math.min(100, Math.max(0, parseFloat(desconto.replace(',', '.')) || 0))
  const valorBruto   = totalQtd * valorNum
  const valorLiquido = valorBruto * (1 - descontoNum / 100)

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
        desconto_pct:   descontoNum,
        vendedor,
        cond_pag:       condPag,
        frete,
        transportadora,
        nota_fiscal:    notaFiscal,
        obs,
        itens,
      })
      setTotais(await window.api.pedidos.totaisPorTamanho(segId, active.id))
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

  const selectedSeg = segs.find(s => s.id === segId)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Registrar Pedido{active ? ` — ${active.nome}` : ''}</h1>

      {success && <div className={styles.successBanner}>✓ Pedido registrado com sucesso.</div>}
      {error   && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.panel}>

        {/* Row 1: Fornecedor / Vendedor / Data */}
        <div className={styles.formRow}>
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <span className={styles.fieldLabel}>Fornecedor</span>
            <select value={fornId} onChange={e => setFornId(e.target.value)}>
              <option value="">Selecione…</option>
              {forns.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Vendedor</span>
            <input type="text" placeholder="Nome do vendedor" value={vendedor}
              onChange={e => setVendedor(e.target.value)} style={{ width: 160 }} />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Data do pedido</span>
            <input type="date" value={dataPed} onChange={e => setDataPed(e.target.value)} />
          </div>
        </div>

        {/* Row 2: Valor / Desconto / Cond. Pag / Frete */}
        <div className={styles.formRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Valor unitário (R$)</span>
            <input type="text" placeholder="0,00" value={valor}
              onChange={e => setValor(e.target.value)} style={{ width: 90 }} />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Desconto (%)</span>
            <input type="text" placeholder="0" value={desconto}
              onChange={e => setDesconto(e.target.value)} style={{ width: 64 }} />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Cond. pagamento</span>
            <input type="text" placeholder="Ex: 30/60 dias" value={condPag}
              onChange={e => setCondPag(e.target.value)} style={{ width: 140 }} />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Frete</span>
            <select value={frete} onChange={e => setFrete(e.target.value)} style={{ width: 90 }}>
              <option value="">—</option>
              <option value="CIF">CIF</option>
              <option value="FOB">FOB</option>
            </select>
          </div>
        </div>

        {/* Row 3: Transportadora / NF / Obs */}
        <div className={styles.formRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Transportadora</span>
            <input type="text" placeholder="Nome da transportadora" value={transportadora}
              onChange={e => setTransportadora(e.target.value)} style={{ width: 180 }} />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Nota fiscal</span>
            <input type="text" placeholder="Nº NF" value={notaFiscal}
              onChange={e => setNotaFiscal(e.target.value)} style={{ width: 100 }} />
          </div>
          <div className={`${styles.field} ${styles.fieldGrow}`}>
            <span className={styles.fieldLabel}>Observações</span>
            <input type="text" placeholder="Obs / Trocas…" value={obs}
              onChange={e => setObs(e.target.value)} />
          </div>
        </div>

        {/* Row 4: Segmentação */}
        <div className={styles.formRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Segmentação</span>
            <SegmentacaoSelect segs={segs} value={segId} onChange={setSegId} />
          </div>
          {selectedSeg?.tipo_grade && (
            <div className={styles.field} style={{ alignSelf: 'flex-end' }}>
              <span className={styles.gradeBadge}>
                Grade: {GRADE_LABEL[selectedSeg.tipo_grade] ?? selectedSeg.tipo_grade}
              </span>
            </div>
          )}
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
                    const saldo    = getSaldo(r.tamanho, r.qtd_ajustada)
                    return (
                      <tr key={r.tamanho}>
                        <td>{r.tamanho}</td>
                        <td style={{ color: 'var(--purple)' }}>{r.qtd_ajustada}</td>
                        <td style={{ color: 'var(--green)' }}>{comprado}</td>
                        <td>
                          {saldo === 0
                            ? <span className={styles.checkCell}>0 ✓</span>
                            : <span style={{ color: 'var(--yellow)' }}>{saldo}</span>}
                        </td>
                        <td>
                          <input type="number" min="0" className={styles.qtyInput}
                            value={qtds[r.tamanho] ?? 0}
                            onChange={e => handleQty(r.tamanho, e.target.value)} />
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
              <div className={styles.totals}>
                <span className={styles.totalLine}>
                  Bruto: <strong>R$ {fmt(valorBruto)}</strong>
                </span>
                {descontoNum > 0 && (
                  <span className={styles.totalLine} style={{ color: 'var(--text-muted)' }}>
                    Desconto {descontoNum}%: <strong>− R$ {fmt(valorBruto - valorLiquido)}</strong>
                  </span>
                )}
                <span className={styles.totalLine}>
                  Líquido: <strong className={styles.totalValue}>R$ {fmt(valorLiquido)}</strong>
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
