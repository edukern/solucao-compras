import { useState, useEffect } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import SegmentacaoSelect from '../components/SegmentacaoSelect'
import { GRADE_LABEL, GRADE_SIZES } from '../utils/gradeConfig'
import styles from './Compras.module.css'

const fmt = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = iso => { if (!iso) return ''; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}` }
const today = () => new Date().toISOString().slice(0, 10)

// ─── Phase 1: Start Visit ─────────────────────────────────────────────────

function IniciarVisita({ forns, compradores, colId, onStart }) {
  const [fornId,      setFornId]      = useState('')
  const [data,        setData]        = useState(today())
  const [vendedor,    setVendedor]    = useState('')
  const [condPag,     setCondPag]     = useState('')
  const [frete,       setFrete]       = useState('')
  const [presentes,   setPresentes]   = useState([])
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState(null)

  function togglePresente(id) {
    setPresentes(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  async function handleStart() {
    if (!fornId || presentes.length === 0) return
    setSaving(true)
    setError(null)
    try {
      const visita = await window.api.visitas.create({
        fornecedor_id: Number(fornId),
        colecao_id: colId,
        data_visita: data,
        vendedor,
        cond_pag: condPag,
        frete,
        obs: ''
      })
      const compradoresPresentes = compradores.filter(c => presentes.includes(c.id))
      onStart(visita, compradoresPresentes)
    } catch {
      setError('Erro ao iniciar visita.')
    } finally {
      setSaving(false)
    }
  }

  const canStart = fornId && presentes.length > 0 && !saving

  return (
    <div className={styles.phase}>
      <h2 className={styles.phaseTitle}>Fase 1 — Iniciar Visita ao Fornecedor</h2>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <span className={styles.label}>Fornecedor</span>
          <select value={fornId} onChange={e => setFornId(e.target.value)}>
            <option value="">Selecione…</option>
            {forns.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Data da visita</span>
          <input type="date" value={data} onChange={e => setData(e.target.value)} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Vendedor</span>
          <input type="text" placeholder="Nome do vendedor" value={vendedor}
            onChange={e => setVendedor(e.target.value)} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Cond. pagamento</span>
          <input type="text" placeholder="Ex: 30/60 dias" value={condPag}
            onChange={e => setCondPag(e.target.value)} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Frete</span>
          <select value={frete} onChange={e => setFrete(e.target.value)}>
            <option value="">—</option>
            <option value="CIF">CIF</option>
            <option value="FOB">FOB</option>
          </select>
        </div>
      </div>

      <div className={styles.presentesSection}>
        <span className={styles.label}>Compradores presentes nesta visita</span>
        <div className={styles.checkGrid}>
          {compradores.map(c => (
            <label key={c.id} className={styles.checkItem}>
              <input type="checkbox" checked={presentes.includes(c.id)}
                onChange={() => togglePresente(c.id)} />
              <span>{c.nome}</span>
              {c.cidade && <span className={styles.cidade}>{c.cidade}</span>}
            </label>
          ))}
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.phaseActions}>
        <button className={styles.btnPrimary} disabled={!canStart} onClick={handleStart}>
          Iniciar Visita →
        </button>
      </div>
    </div>
  )
}

// ─── Phase 2: Register Orders ─────────────────────────────────────────────

function RegistrarPedido({ visita, compradores, segs, colId, onFechar }) {
  const [pedidosSalvos, setPedidosSalvos] = useState([])
  const [compradorId,   setCompradorId]   = useState(compradores[0]?.id ?? '')
  const [segId,         setSegId]         = useState(null)
  const [proj,          setProj]          = useState([])
  const [totais,        setTotais]        = useState([])
  const [qtds,          setQtds]          = useState({})
  const [valor,         setValor]         = useState('')
  const [desconto,      setDesconto]      = useState('')
  const [transportadora,setTransportadora]= useState('')
  const [notaFiscal,    setNotaFiscal]    = useState('')
  const [obs,           setObs]           = useState('')
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState(null)

  useEffect(() => {
    if (!segId || !colId) { setProj([]); setTotais([]); setQtds({}); return }
    Promise.all([
      window.api.projecoes.get(segId, colId),
      window.api.pedidos.totaisPorTamanho(segId, colId),
    ]).then(([p, t]) => { setProj(p); setTotais(t); setQtds({}) })
  }, [segId, colId])

  const getComprado = t => totais.find(r => r.tamanho === t)?.total_pedido ?? 0
  const getSaldo    = (t, pj) => Math.max(0, pj - getComprado(t))

  function handleQty(tamanho, raw) {
    const val = parseInt(raw, 10)
    setQtds(prev => ({ ...prev, [tamanho]: isNaN(val) || val < 0 ? 0 : val }))
  }

  const totalQtd    = Object.values(qtds).reduce((s, q) => s + q, 0)
  const valorNum    = parseFloat(valor.replace(',', '.')) || 0
  const descontoNum = Math.min(100, Math.max(0, parseFloat(desconto.replace(',', '.')) || 0))
  const valorBruto  = totalQtd * valorNum
  const valorLiq    = valorBruto * (1 - descontoNum / 100)

  const selectedSeg = segs.find(s => s.id === segId)
  const canAdd = !saving && compradorId && segId && totalQtd > 0 && valorNum > 0

  async function handleAdicionar() {
    const itens = proj
      .map(r => ({ tamanho: r.tamanho, qtd: qtds[r.tamanho] ?? 0 }))
      .filter(i => i.qtd > 0)
    if (!itens.length) return

    setSaving(true)
    setError(null)
    try {
      const pedido = await window.api.pedidos.salvar({
        visita_id:      visita.id,
        comprador_id:   Number(compradorId),
        segmentacao_id: segId,
        valor_unitario: valorNum,
        desconto_pct:   descontoNum,
        transportadora,
        nota_fiscal:    notaFiscal,
        obs,
        itens,
      })
      setPedidosSalvos(prev => [...prev, pedido])
      const newTotais = await window.api.pedidos.totaisPorTamanho(segId, colId)
      setTotais(newTotais)
      setQtds({})
      setValor('')
      setDesconto('')
      setTransportadora('')
      setNotaFiscal('')
      setObs('')
    } catch {
      setError('Erro ao salvar pedido.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.phase}>
      <div className={styles.visitaBanner}>
        <strong>{visita.fornecedor_nome}</strong>
        <span className={styles.dot}>·</span>
        <span>{fmtDate(visita.data_visita)}</span>
        {visita.vendedor && <><span className={styles.dot}>·</span><span>Vendedor: {visita.vendedor}</span></>}
        {visita.cond_pag && <><span className={styles.dot}>·</span><span>{visita.cond_pag}</span></>}
        {visita.frete    && <><span className={styles.dot}>·</span><span>Frete: {visita.frete}</span></>}
      </div>

      <h2 className={styles.phaseTitle}>Fase 2 — Registrar Pedidos</h2>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <span className={styles.label}>Comprador</span>
          <select value={compradorId} onChange={e => setCompradorId(Number(e.target.value))}>
            {compradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Segmentação</span>
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

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <span className={styles.label}>Valor unitário (R$)</span>
          <input type="text" placeholder="0,00" value={valor}
            onChange={e => setValor(e.target.value)} style={{ width: 90 }} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Desconto (%)</span>
          <input type="text" placeholder="0" value={desconto}
            onChange={e => setDesconto(e.target.value)} style={{ width: 64 }} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Transportadora</span>
          <input type="text" placeholder="Nome" value={transportadora}
            onChange={e => setTransportadora(e.target.value)} style={{ width: 150 }} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Nota fiscal</span>
          <input type="text" placeholder="Nº NF" value={notaFiscal}
            onChange={e => setNotaFiscal(e.target.value)} style={{ width: 90 }} />
        </div>
        <div className={`${styles.field} ${styles.fieldGrow}`}>
          <span className={styles.label}>Observações</span>
          <input type="text" placeholder="Obs…" value={obs}
            onChange={e => setObs(e.target.value)} />
        </div>
      </div>

      {!segId && <div className={styles.placeholder}>Selecione uma segmentação para ver a grade.</div>}
      {segId && proj.length === 0 && (
        <div className={styles.placeholder}>Sem projeção para esta segmentação. Acesse Planejamento primeiro.</div>
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
                      <td>{saldo === 0 ? <span className={styles.checkCell}>0 ✓</span> : <span style={{ color: 'var(--yellow)' }}>{saldo}</span>}</td>
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
                  <td style={{ color: 'var(--purple)' }}>{proj.reduce((s,r) => s + r.qtd_ajustada, 0)}</td>
                  <td style={{ color: 'var(--green)' }}>{totais.reduce((s,r) => s + r.total_pedido, 0)}</td>
                  <td>{proj.reduce((s,r) => s + getSaldo(r.tamanho, r.qtd_ajustada), 0)}</td>
                  <td>{totalQtd}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className={styles.tableFooter}>
            <div className={styles.totals}>
              <span>Bruto: <strong>R$ {fmt(valorBruto)}</strong></span>
              {descontoNum > 0 && <span style={{ color: 'var(--text-muted)' }}>Desconto {descontoNum}%: <strong>− R$ {fmt(valorBruto - valorLiq)}</strong></span>}
              <span>Líquido: <strong className={styles.totalValue}>R$ {fmt(valorLiq)}</strong></span>
            </div>
            <div className={styles.actions}>
              {error && <span className={styles.inlineError}>{error}</span>}
              <button className={styles.btnPrimary} disabled={!canAdd} onClick={handleAdicionar}>
                + Adicionar pedido
              </button>
            </div>
          </div>
        </>
      )}

      {pedidosSalvos.length > 0 && (
        <div className={styles.pedidosSalvos}>
          <div className={styles.pedidosSalvosTitle}>Pedidos registrados nesta visita ({pedidosSalvos.length})</div>
          {pedidosSalvos.map((p, i) => {
            const comp = compradores.find(c => c.id === p.comprador_id)
            const seg  = segs.find(s => s.id === p.segmentacao_id)
            const totalQ = p.itens.reduce((s, i) => s + i.qtd, 0)
            const totalV = totalQ * p.valor_unitario * (1 - p.desconto_pct / 100)
            return (
              <div key={i} className={styles.pedidoRow}>
                <strong>{comp?.nome ?? `Comprador #${p.comprador_id}`}</strong>
                <span className={styles.dot}>·</span>
                <span>{seg ? `${seg.classificacao} ${seg.tipo_produto} ${seg.classe}` : `Seg #${p.segmentacao_id}`}</span>
                <span className={styles.dot}>·</span>
                <span>{p.itens.map(i => `${i.tamanho}:${i.qtd}`).join(' ')}</span>
                <span className={styles.dot}>·</span>
                <span>R$ {fmt(totalV)}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.phaseActions}>
        <button className={styles.btnSecondary} disabled={pedidosSalvos.length === 0}
          onClick={() => onFechar(pedidosSalvos)}>
          Fechar visita e gerar PDFs →
        </button>
      </div>
    </div>
  )
}

// ─── Phase 3: Close Visit + PDFs ──────────────────────────────────────────

function FecharVisita({ visita, compradores, segs, pedidos, onNovaVisita }) {
  const dateStr = new Date().toLocaleDateString('pt-BR')

  function handleGerarPDFs() {
    const compradoresComPedidos = compradores.filter(c =>
      pedidos.some(p => p.comprador_id === c.id)
    )

    const ordersHtml = compradoresComPedidos.map((comp, idx) => {
      const compPedidos = pedidos.filter(p => p.comprador_id === comp.id)
      const isLast = idx === compradoresComPedidos.length - 1

      const pedidosHtml = compPedidos.map(p => {
        const seg = segs.find(s => s.id === p.segmentacao_id)
        const segLabel = seg
          ? `${seg.classificacao} — ${seg.tipo_produto} — ${seg.classe} (Grade ${GRADE_LABEL[seg.tipo_grade] ?? seg.tipo_grade ?? ''})`
          : `Segmentação #${p.segmentacao_id}`
        const totalQ = p.itens.reduce((s, i) => s + i.qtd, 0)
        const totalV = totalQ * p.valor_unitario * (1 - p.desconto_pct / 100)

        const rowsHtml = p.itens.filter(i => i.qtd > 0).map(i =>
          `<tr><td style="text-align:left; padding:5px 10px;">${i.tamanho}</td><td style="text-align:right; padding:5px 10px;">${i.qtd}</td></tr>`
        ).join('')

        return `
          <div class="seg-block">
            <div class="seg-title">${segLabel}</div>
            <table>
              <thead><tr><th style="text-align:left;">Tamanho</th><th>Quantidade</th></tr></thead>
              <tbody>${rowsHtml}</tbody>
              <tfoot>
                <tr>
                  <td style="text-align:left; font-weight:bold; border-top:2px solid #aaa; padding:5px 10px;">Total</td>
                  <td style="font-weight:bold; border-top:2px solid #aaa; padding:5px 10px; text-align:right;">${totalQ}</td>
                </tr>
              </tfoot>
            </table>
            <div class="totals">
              <div>Valor unitário: <strong>R$ ${p.valor_unitario.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
              ${p.desconto_pct > 0 ? `<div>Desconto: <strong>${p.desconto_pct}%</strong></div>` : ''}
              <div style="font-size:14px; margin-top:4px;">Valor líquido: <strong>R$ ${totalV.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
            </div>
            ${p.transportadora ? `<div class="obs-row">Transportadora: ${p.transportadora}</div>` : ''}
            ${p.nota_fiscal    ? `<div class="obs-row">Nota fiscal: ${p.nota_fiscal}</div>` : ''}
            ${p.obs            ? `<div class="obs-row">Obs: ${p.obs}</div>` : ''}
          </div>`
      }).join('')

      return `
        <div class="order"${isLast ? ' style="page-break-after:avoid;"' : ''}>
          <h1>PEDIDO DE COMPRA</h1>
          <p style="font-size:10px; color:#888; margin-bottom:12px;">Gerado em: ${dateStr}</p>

          <div class="section">
            <div class="section-title">Fornecedor</div>
            <div class="row"><span class="lbl">Fornecedor:</span><span>${visita.fornecedor_nome}</span></div>
            ${visita.vendedor ? `<div class="row"><span class="lbl">Vendedor:</span><span>${visita.vendedor}</span></div>` : ''}
            <div class="row"><span class="lbl">Data pedido:</span><span>${fmtDate(visita.data_visita)}</span></div>
            ${visita.cond_pag ? `<div class="row"><span class="lbl">Cond. pag.:</span><span>${visita.cond_pag}</span></div>` : ''}
            ${visita.frete    ? `<div class="row"><span class="lbl">Frete:</span><span>${visita.frete}</span></div>` : ''}
          </div>

          <div class="section" style="border-top:1px solid #ddd; padding-top:10px;">
            <div class="section-title">Comprador</div>
            <div class="row"><span class="lbl">Nome:</span><span><strong>${comp.nome}</strong></span></div>
            <div class="row"><span class="lbl">CNPJ:</span><span>${comp.cnpj}</span></div>
            ${comp.cidade ? `<div class="row"><span class="lbl">Cidade:</span><span>${comp.cidade}</span></div>` : ''}
          </div>

          ${pedidosHtml}

          <div class="footer">Gerado por Solução Compras — ${dateStr}</div>
        </div>`
    }).join('')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Pedidos — ${visita.fornecedor_nome} — ${fmtDate(visita.data_visita)}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #000; margin: 0; }
    .order { padding: 24px; page-break-after: always; }
    .order:last-child { page-break-after: avoid; }
    h1 { font-size: 16px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 4px; }
    .section { margin: 12px 0; }
    .section-title { font-weight:bold; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:#555; margin-bottom:6px; }
    .row { display: flex; gap: 24px; margin-bottom: 4px; }
    .lbl { font-weight: bold; min-width: 120px; }
    .seg-block { margin: 16px 0; border-top: 1px solid #ddd; padding-top: 10px; }
    .seg-title { font-weight: bold; font-size: 11px; color: #333; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: right; }
    th:first-child, td:first-child { text-align: left; }
    th { background: #f0f0f0; font-weight: bold; }
    .totals { margin-top: 10px; text-align: right; line-height: 1.7; }
    .obs-row { margin-top: 4px; font-size: 11px; color: #555; }
    .footer { margin-top: 24px; font-size: 10px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 8px; }
    @media print { @page { margin: 15mm; } }
  </style>
</head>
<body>${ordersHtml}</body>
</html>`

    const win = window.open('', '_blank')
    if (!win) { alert('Bloqueador de pop-ups ativo. Permita pop-ups para este site.'); return }
    win.document.write(html)
    win.document.close()
    win.focus()
    win.addEventListener('load', () => win.print())
  }

  const compradoresComPedidos = compradores.filter(c => pedidos.some(p => p.comprador_id === c.id))
  const totalGeral = pedidos.reduce((s, p) => {
    const q = p.itens.reduce((s2, i) => s2 + i.qtd, 0)
    return s + q * p.valor_unitario * (1 - p.desconto_pct / 100)
  }, 0)

  return (
    <div className={styles.phase}>
      <div className={styles.visitaBanner}>
        <strong>{visita.fornecedor_nome}</strong>
        <span className={styles.dot}>·</span>
        <span>{fmtDate(visita.data_visita)}</span>
        <span className={styles.dot}>·</span>
        <span>{pedidos.length} pedido(s) · {compradoresComPedidos.length} comprador(es)</span>
      </div>

      <h2 className={styles.phaseTitle}>Fase 3 — Resumo da Visita</h2>

      <div className={styles.resumoGrid}>
        {compradoresComPedidos.map(comp => {
          const compPedidos = pedidos.filter(p => p.comprador_id === comp.id)
          const totalComp = compPedidos.reduce((s, p) => {
            const q = p.itens.reduce((s2, i) => s2 + i.qtd, 0)
            return s + q * p.valor_unitario * (1 - p.desconto_pct / 100)
          }, 0)
          return (
            <div key={comp.id} className={styles.resumoCard}>
              <div className={styles.resumoCardHeader}>{comp.nome}</div>
              {compPedidos.map((p, i) => {
                const seg = segs.find(s => s.id === p.segmentacao_id)
                const totalQ = p.itens.reduce((s, i) => s + i.qtd, 0)
                return (
                  <div key={i} className={styles.resumoItem}>
                    <span>{seg ? `${seg.tipo_produto} ${seg.classe}` : `Seg #${p.segmentacao_id}`}</span>
                    <span>{totalQ} pç</span>
                  </div>
                )
              })}
              <div className={styles.resumoTotal}>R$ {fmt(totalComp)}</div>
            </div>
          )
        })}
      </div>

      <div className={styles.resumoGeralTotal}>
        Total geral: <strong>R$ {fmt(totalGeral)}</strong>
      </div>

      <div className={styles.phaseActions}>
        <button className={styles.btnSecondary} onClick={onNovaVisita}>
          ← Nova visita
        </button>
        <button className={styles.btnPrimary} onClick={handleGerarPDFs}>
          Gerar PDFs ({compradoresComPedidos.length})
        </button>
      </div>
    </div>
  )
}

// ─── Orchestrator ─────────────────────────────────────────────────────────

export default function Compras() {
  const { active } = useCollection()
  const [segs,        setSegs]        = useState([])
  const [forns,       setForns]       = useState([])
  const [compradores, setCompradores] = useState([])
  const [phase,       setPhase]       = useState(1)
  const [visita,      setVisita]      = useState(null)
  const [compPresentes, setCompPresentes] = useState([])
  const [pedidosFechados, setPedidosFechados] = useState([])

  useEffect(() => {
    Promise.all([
      window.api.segmentacoes.list(),
      window.api.fornecedores.list(),
      window.api.compradores.list(),
    ]).then(([s, f, c]) => { setSegs(s); setForns(f); setCompradores(c) })
  }, [])

  function handleStart(novaVisita, presentes) {
    setVisita(novaVisita)
    setCompPresentes(presentes)
    setPhase(2)
  }

  function handleFechar(pedidos) {
    setPedidosFechados(pedidos)
    setPhase(3)
  }

  function handleNovaVisita() {
    setVisita(null)
    setCompPresentes([])
    setPedidosFechados([])
    setPhase(1)
  }

  if (!active) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Compras</h1>
        <div className={styles.placeholder}>Selecione uma coleção ativa na barra lateral.</div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Compras — {active.nome}</h1>
      <div className={styles.stepBar}>
        {['Iniciar visita', 'Registrar pedidos', 'Gerar PDFs'].map((label, i) => (
          <div key={i} className={`${styles.step} ${phase === i + 1 ? styles.stepActive : ''} ${phase > i + 1 ? styles.stepDone : ''}`}>
            <span className={styles.stepNum}>{i + 1}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {phase === 1 && (
        <IniciarVisita
          forns={forns}
          compradores={compradores}
          colId={active.id}
          onStart={handleStart}
        />
      )}
      {phase === 2 && visita && (
        <RegistrarPedido
          visita={visita}
          compradores={compPresentes}
          segs={segs}
          colId={active.id}
          onFechar={handleFechar}
        />
      )}
      {phase === 3 && visita && (
        <FecharVisita
          visita={visita}
          compradores={compPresentes}
          segs={segs}
          pedidos={pedidosFechados}
          onNovaVisita={handleNovaVisita}
        />
      )}
    </div>
  )
}
