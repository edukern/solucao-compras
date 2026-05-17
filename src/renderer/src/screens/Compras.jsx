// src/renderer/src/screens/Compras.jsx
import { useState, useEffect } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import SegmentacaoSelect from '../components/SegmentacaoSelect'
import { GRADE_LABEL } from '../utils/gradeConfig'
import styles from './Compras.module.css'

const fmt = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = iso => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function Compras() {
  const { active } = useCollection()
  const [segs,         setSegs]         = useState([])
  const [forns,        setForns]        = useState([])
  const [compradores,  setCompradores]  = useState([])

  // header fields
  const [fornId,         setFornId]         = useState('')
  const [vendedor,       setVendedor]       = useState('')
  const [dataPed,        setDataPed]        = useState(new Date().toISOString().slice(0, 10))
  const [valor,          setValor]          = useState('')
  const [desconto,       setDesconto]       = useState('')
  const [condPag,        setCondPag]        = useState('')
  const [frete,          setFrete]          = useState('')
  const [transportadora, setTransportadora] = useState('')
  const [notaFiscal,     setNotaFiscal]     = useState('')
  const [obs,            setObs]            = useState('')

  // grade / order
  const [segId,    setSegId]    = useState(null)
  const [proj,     setProj]     = useState([])
  const [totais,   setTotais]   = useState([])
  const [qtds,     setQtds]     = useState({})
  const [success,  setSuccess]  = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error,    setError]    = useState(null)

  // distribution phase
  const [lastOrder,    setLastOrder]    = useState(null) // saved order details after confirm
  const [showDistrib,  setShowDistrib]  = useState(false)
  const [distribQtds,  setDistribQtds]  = useState({})   // { compradorId_tamanho: number }

  useEffect(() => {
    Promise.all([
      window.api.segmentacoes.list(),
      window.api.fornecedores.list(),
      window.api.compradores.list(),
    ]).then(([s, f, c]) => { setSegs(s); setForns(f); setCompradores(c) })
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

    const selectedForn = forns.find(f => f.id === Number(fornId))
    const selectedSeg  = segs.find(s => s.id === segId)

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
      const newTotais = await window.api.pedidos.totaisPorTamanho(segId, active.id)
      setTotais(newTotais)

      // Save order snapshot for distribution
      setLastOrder({
        fornecedorNome: selectedForn?.nome ?? '',
        vendedor,
        dataPedido: dataPed,
        condPag,
        frete,
        transportadora,
        notaFiscal,
        obs,
        colecaoNome: active.nome,
        segmentacao: selectedSeg,
        itens, // [{ tamanho, qtd_pedida }]
        valorNum,
        descontoNum,
        totalQtd,
        valorBruto: totalQtd * valorNum,
        valorLiquido: totalQtd * valorNum * (1 - descontoNum / 100),
      })

      setQtds({})
      setSuccess(true)
      setShowDistrib(false)
      setDistribQtds({})
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

  function handleOpenDistrib() {
    // Initialize all cells to 0
    const initial = {}
    if (lastOrder) {
      for (const comp of compradores) {
        for (const item of lastOrder.itens) {
          initial[`${comp.id}_${item.tamanho}`] = 0
        }
      }
    }
    setDistribQtds(initial)
    setShowDistrib(true)
  }

  function handleDistribInput(compradorId, tamanho, raw) {
    const val = parseInt(raw, 10)
    const key = `${compradorId}_${tamanho}`
    setDistribQtds(prev => ({ ...prev, [key]: isNaN(val) || val < 0 ? 0 : val }))
  }

  function getDistribVal(compradorId, tamanho) {
    return distribQtds[`${compradorId}_${tamanho}`] ?? 0
  }

  function getSizeSumDistrib(tamanho) {
    return compradores.reduce((s, c) => s + getDistribVal(c.id, tamanho), 0)
  }

  function getCompradorTotal(compradorId) {
    if (!lastOrder) return 0
    return lastOrder.itens.reduce((s, item) => s + getDistribVal(compradorId, item.tamanho), 0)
  }

  const allSizesBalance = lastOrder
    ? lastOrder.itens.every(item => getSizeSumDistrib(item.tamanho) === item.qtd_pedida)
    : false

  function handleGerarPDFs() {
    if (!lastOrder) return

    const dateStr = new Date().toLocaleDateString('pt-BR')
    const { fornecedorNome, vendedor: vend, dataPedido, condPag: cp, frete: ft,
            transportadora: transp, notaFiscal: nf, obs: ob,
            colecaoNome, segmentacao, itens, valorNum: vu, descontoNum: desc } = lastOrder

    const segLabel = segmentacao
      ? `${segmentacao.classificacao} — ${segmentacao.tipo_produto} — ${segmentacao.classe} (Grade ${GRADE_LABEL[segmentacao.tipo_grade] ?? segmentacao.tipo_grade})`
      : ''

    const ordersHtml = compradores.map((comp, idx) => {
      const compItens = itens.map(item => ({
        tamanho: item.tamanho,
        qtd: getDistribVal(comp.id, item.tamanho),
      })).filter(i => i.qtd > 0)

      const totalPecas  = compItens.reduce((s, i) => s + i.qtd, 0)
      const valorBrutoC = totalPecas * vu
      const valorLiqC   = valorBrutoC * (1 - desc / 100)

      const rowsHtml = compItens.length > 0
        ? compItens.map(i => `
            <tr>
              <td style="text-align:left; padding:5px 10px;">${i.tamanho}</td>
              <td style="text-align:right; padding:5px 10px;">${i.qtd}</td>
            </tr>`).join('')
        : `<tr><td colspan="2" style="text-align:center; padding:10px; color:#888;">Sem itens</td></tr>`

      const isLast = idx === compradores.length - 1

      return `
        <div class="order"${isLast ? ' style="page-break-after:avoid;"' : ''}>
          <h1>PEDIDO DE COMPRA</h1>
          <p style="font-size:10px; color:#888; margin-bottom:12px;">Gerado em: ${dateStr}</p>

          <div class="section">
            <div style="font-weight:bold; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:#555; margin-bottom:6px;">Fornecedor</div>
            <div class="row"><span class="label">Fornecedor:</span><span>${fornecedorNome}</span></div>
            <div class="row"><span class="label">Vendedor:</span><span>${vend || '—'}</span></div>
            <div class="row"><span class="label">Data pedido:</span><span>${fmtDate(dataPedido)}</span></div>
            <div class="row"><span class="label">Cond. pag.:</span><span>${cp || '—'}</span></div>
            <div class="row"><span class="label">Frete:</span><span>${ft || '—'}</span></div>
            ${transp ? `<div class="row"><span class="label">Transportadora:</span><span>${transp}</span></div>` : ''}
            ${nf ? `<div class="row"><span class="label">Nota fiscal:</span><span>${nf}</span></div>` : ''}
            ${ob ? `<div class="row"><span class="label">Obs:</span><span>${ob}</span></div>` : ''}
          </div>

          <div class="section" style="border-top:1px solid #ddd; padding-top:10px;">
            <div style="font-weight:bold; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:#555; margin-bottom:6px;">Comprador</div>
            <div class="row"><span class="label">Nome:</span><span><strong>${comp.nome}</strong></span></div>
            <div class="row"><span class="label">CNPJ:</span><span>${comp.cnpj}</span></div>
            ${comp.cidade ? `<div class="row"><span class="label">Cidade:</span><span>${comp.cidade}</span></div>` : ''}
          </div>

          <div class="section" style="border-top:1px solid #ddd; padding-top:10px;">
            <div style="font-weight:bold; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:#555; margin-bottom:6px;">Produto</div>
            <div class="row"><span class="label">Coleção:</span><span>${colecaoNome}</span></div>
            <div class="row"><span class="label">Segmentação:</span><span>${segLabel}</span></div>
            <div class="row"><span class="label">Valor unitário:</span><span>R$ ${vu.toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })}</span></div>
            ${desc > 0 ? `<div class="row"><span class="label">Desconto:</span><span>${desc}%</span></div>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align:left;">Tamanho</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="text-align:left; font-weight:bold; border-top:2px solid #aaa; padding:5px 10px;">Total</td>
                <td style="font-weight:bold; border-top:2px solid #aaa; padding:5px 10px; text-align:right;">${totalPecas}</td>
              </tr>
            </tfoot>
          </table>

          <div class="totals">
            <div>Valor bruto: <strong>R$ ${valorBrutoC.toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })}</strong></div>
            ${desc > 0 ? `<div>Desconto ${desc}%: <strong>− R$ ${(valorBrutoC - valorLiqC).toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })}</strong></div>` : ''}
            <div style="font-size:14px; margin-top:4px;">Valor líquido: <strong>R$ ${valorLiqC.toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })}</strong></div>
          </div>

          <div class="footer">Gerado por Solução Compras — ${dateStr}</div>
        </div>`
    }).join('')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Pedidos — ${fornecedorNome}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #000; margin: 0; }
    .order { padding: 24px; page-break-after: always; }
    .order:last-child { page-break-after: avoid; }
    h1 { font-size: 16px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 4px; }
    .section { margin: 12px 0; }
    .row { display: flex; gap: 24px; margin-bottom: 4px; }
    .label { font-weight: bold; min-width: 120px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: right; }
    th:first-child, td:first-child { text-align: left; }
    th { background: #f0f0f0; font-weight: bold; }
    .totals { margin-top: 16px; text-align: right; line-height: 1.7; }
    .footer { margin-top: 24px; font-size: 10px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 8px; }
    @media print { @page { margin: 15mm; } }
  </style>
</head>
<body>
  ${ordersHtml}
</body>
</html>`

    const win = window.open('', '_blank')
    if (!win) {
      alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desativado.')
      return
    }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 400)
  }

  const selectedSeg = segs.find(s => s.id === segId)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Registrar Pedido{active ? ` — ${active.nome}` : ''}</h1>

      {success && (
        <div className={styles.successBanner}>
          ✓ Pedido registrado com sucesso.{' '}
          {lastOrder && !showDistrib && (
            <button className={styles.btnDistrib} onClick={handleOpenDistrib}>
              Distribuir por comprador →
            </button>
          )}
        </div>
      )}
      {error && <div className={styles.errorBanner}>{error}</div>}

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

        {/* Distribution panel (shown after confirm, when user clicks "Distribuir") */}
        {showDistrib && lastOrder && (
          <div className={styles.distribPanel}>
            <div className={styles.distribHeader}>
              <div>
                <span className={styles.distribTitle}>Distribuição por Comprador</span>
                <span className={styles.distribSubtitle}>
                  {lastOrder.fornecedorNome} — {lastOrder.colecaoNome}
                </span>
              </div>
              <button className={styles.btnCancel} onClick={() => setShowDistrib(false)}>
                Cancelar distribuição
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className={styles.distribTable}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Comprador</th>
                    {lastOrder.itens.map(item => (
                      <th key={item.tamanho}>{item.tamanho}</th>
                    ))}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {compradores.map(comp => (
                    <tr key={comp.id}>
                      <td className={styles.distribCompradorCell}>
                        <div>{comp.nome}</div>
                        <div className={styles.distribCidade}>{comp.cidade}</div>
                      </td>
                      {lastOrder.itens.map(item => (
                        <td key={item.tamanho}>
                          <input
                            type="number"
                            min="0"
                            className={styles.distribInput}
                            value={getDistribVal(comp.id, item.tamanho)}
                            onChange={e => handleDistribInput(comp.id, item.tamanho, e.target.value)}
                          />
                        </td>
                      ))}
                      <td className={styles.distribTotal}>
                        {getCompradorTotal(comp.id)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ textAlign: 'left', fontWeight: 600 }}>Total pedido</td>
                    {lastOrder.itens.map(item => {
                      const sum     = getSizeSumDistrib(item.tamanho)
                      const ordered = item.qtd_pedida
                      const ok      = sum === ordered
                      return (
                        <td key={item.tamanho} className={ok ? styles.sizeOk : styles.sizeErr}>
                          {sum}/{ordered}
                        </td>
                      )
                    })}
                    <td className={styles.distribTotal}>
                      {lastOrder.itens.reduce((s, i) => s + i.qtd_pedida, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className={styles.distribFooter}>
              {!allSizesBalance && (
                <span className={styles.distribAlert}>
                  Ajuste as quantidades até que todos os tamanhos estejam balanceados.
                </span>
              )}
              {allSizesBalance && (
                <span className={styles.distribOk}>Todas as quantidades estão balanceadas.</span>
              )}
              <button
                className={styles.btnPdf}
                disabled={!allSizesBalance}
                onClick={handleGerarPDFs}
              >
                Gerar PDFs
              </button>
            </div>
          </div>
        )}

        {/* Grade table */}
        {!showDistrib && !segId && (
          <div className={styles.placeholder}>Selecione uma segmentação para ver a grade.</div>
        )}
        {!showDistrib && segId && proj.length === 0 && (
          <div className={styles.placeholder}>
            Sem projeção cadastrada para esta segmentação. Acesse Planejamento primeiro.
          </div>
        )}
        {!showDistrib && segId && proj.length > 0 && (
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
