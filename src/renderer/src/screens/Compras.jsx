import { useState, useEffect, useRef } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { tamanhosDeTipoGrade } from '../constants/grades'
import ConfirmModal from '../components/ConfirmModal'
import styles from './Compras.module.css'

const fmt = n => (n ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = iso => { if (!iso) return ''; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}` }
const today = () => new Date().toISOString().slice(0, 10)
const esc = s => (s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

// ─── Phase 1: Start Session ───────────────────────────────────────────────

function IniciarSessao({ forns, compradores, colId, onStart }) {
  const [fornId,    setFornId]    = useState('')
  const [data,      setData]      = useState(today())
  const [vendedor,  setVendedor]  = useState('')
  const [condPag,   setCondPag]   = useState('')
  const [frete,     setFrete]     = useState('')
  const [obs,       setObs]       = useState('')
  const [lojas,     setLojas]     = useState([])
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState(null)

  function toggleLoja(id) {
    setLojas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleStart() {
    if (!fornId || lojas.length === 0) return
    setSaving(true)
    setError(null)
    try {
      const sessao = await window.api.sessoes.create({
        fornecedor_id: Number(fornId),
        colecao_id: colId,
        data_visita: data,
        vendedor,
        cond_pag: condPag,
        frete,
        obs
      }, lojas)
      const lojasPresentes = compradores.filter(c => lojas.includes(c.id))
      onStart(sessao, lojasPresentes)
    } catch {
      setError('Erro ao iniciar sessão.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.phase}>
      <h2 className={styles.phaseTitle}>Fase 1 — Iniciar Sessão de Compras</h2>

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

      <div className={styles.field} style={{ width: '100%' }}>
        <span className={styles.label}>Observações (opcional)</span>
        <textarea
          rows={2}
          placeholder="Condições especiais, prazo de entrega, etc."
          value={obs}
          onChange={e => setObs(e.target.value)}
          style={{ resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      <div className={styles.presentesSection}>
        <span className={styles.label}>Lojas participantes desta sessão</span>
        <div className={styles.checkGrid}>
          {compradores.map(c => (
            <label key={c.id} className={styles.checkItem}>
              <input type="checkbox" checked={lojas.includes(c.id)} onChange={() => toggleLoja(c.id)} />
              <span>{c.nome}</span>
              {c.cidade && <span className={styles.cidade}>{c.cidade}</span>}
            </label>
          ))}
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.phaseActions}>
        <button className={styles.btnPrimary} disabled={!fornId || lojas.length === 0 || saving} onClick={handleStart}>
          Iniciar Sessão →
        </button>
      </div>
    </div>
  )
}

// ─── Phase 2: SKU-by-SKU Order Entry ──────────────────────────────────────

function RegistrarPedidoSessao({ sessao, visitas, segs, colId, onFechar }) {
  const [skuIdx,   setSkuIdx]   = useState(0)
  const [lojaIdx,  setLojaIdx]  = useState(0)
  // valor/desconto/obs por SKU: { [segId]: { valor, desconto, obs } }
  const [skuConfig, setSkuConfig] = useState({})
  // qtds: { [segId]: { [visitaId]: { [tamanho]: qty } } }
  const [qtds, setQtds] = useState({})
  // projecoes por segId: { [segId]: [{ tamanho, qtd_ajustada }] }
  const [projs, setProjs] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Refs para focar o primeiro input ao trocar de loja
  const firstInputRef = useRef(null)

  const seg = segs[skuIdx]
  const visita = visitas[lojaIdx]
  const tamanhos = seg ? tamanhosDeTipoGrade(seg.tipo_grade) : []
  const valorStr = skuConfig[seg?.id]?.valor ?? ''
  const descontoStr = skuConfig[seg?.id]?.desconto ?? ''
  const obsStr = skuConfig[seg?.id]?.obs ?? ''

  // Load projecao for current SKU
  useEffect(() => {
    if (!seg || projs[seg.id] !== undefined) return
    window.api.projecoes.get(seg.id, colId).then(p => {
      setProjs(prev => ({ ...prev, [seg.id]: p ?? [] }))
    })
  }, [seg?.id, colId])

  // Focus first input when loja changes
  useEffect(() => {
    firstInputRef.current?.focus()
  }, [lojaIdx, skuIdx])

  function getQtd(segId, visitaId, tam) {
    return qtds[segId]?.[visitaId]?.[tam] ?? ''
  }

  function setQtd(segId, visitaId, tam, raw) {
    const val = raw === '' ? '' : Math.max(0, parseInt(raw, 10) || 0)
    setQtds(prev => ({
      ...prev,
      [segId]: { ...prev[segId], [visitaId]: { ...prev[segId]?.[visitaId], [tam]: val } }
    }))
  }

  function setSkuVal(segId, field, val) {
    setSkuConfig(prev => ({ ...prev, [segId]: { ...prev[segId], [field]: val } }))
  }

  function handleTabOnLastInput(e) {
    if (e.key !== 'Tab' || e.shiftKey) return
    e.preventDefault()
    if (lojaIdx < visitas.length - 1) {
      setLojaIdx(lojaIdx + 1)
    } else if (skuIdx < segs.length - 1) {
      setSkuIdx(skuIdx + 1)
      setLojaIdx(0)
    }
  }

  function totalQtdLoja(segId, visitaId) {
    const loja = qtds[segId]?.[visitaId] ?? {}
    return Object.values(loja).reduce((s, q) => s + (parseInt(q) || 0), 0)
  }

  function hasAnyData(segId) {
    return visitas.some(v => totalQtdLoja(segId, v.id) > 0)
  }

  async function handleFechar() {
    setSaving(true)
    setError(null)
    try {
      // Monta lista de pedidos para salvar em uma única transação
      const batch = []
      const meta = [] // { comprador_nome, comprador_cnpj, comprador_cidade, classificacao, tipo_produto, classe, tipo_grade }
      for (const s of segs) {
        const conf = skuConfig[s.id] ?? {}
        const valorNum = parseFloat((conf.valor ?? '').replace(',', '.')) || 0
        const descontoNum = Math.min(100, Math.max(0, parseFloat((conf.desconto ?? '').replace(',', '.')) || 0))
        for (const v of visitas) {
          const lojaTams = qtds[s.id]?.[v.id] ?? {}
          const itens = tamanhosDeTipoGrade(s.tipo_grade)
            .map(tam => ({ tamanho: tam, qtd: parseInt(lojaTams[tam]) || 0 }))
            .filter(i => i.qtd > 0)
          if (!itens.length) continue
          batch.push({ visita_id: v.id, comprador_id: v.comprador_id, segmentacao_id: s.id,
                       valor_unitario: valorNum, desconto_pct: descontoNum,
                       transportadora: '', nota_fiscal: '', obs: conf.obs ?? '', itens })
          meta.push({ comprador_nome: v.comprador_nome, comprador_cnpj: v.comprador_cnpj ?? '',
                      comprador_cidade: v.comprador_cidade ?? '',
                      classificacao: s.classificacao, tipo_produto: s.tipo_produto,
                      classe: s.classe, tipo_grade: s.tipo_grade })
        }
      }
      const salvos = await window.api.pedidos.salvarBatch(batch)
      const allPedidos = salvos.map((p, i) => ({ ...p, ...meta[i] }))
      onFechar(allPedidos)
    } catch {
      setError('Erro ao salvar pedidos. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const skuProj = projs[seg?.id] ?? []
  const getProjQtd = tam => skuProj.find(r => r.tamanho === tam)?.qtd_ajustada ?? 0
  const valorNum = parseFloat(valorStr.replace(',', '.')) || 0
  const descontoNum = Math.min(100, Math.max(0, parseFloat(descontoStr.replace(',', '.')) || 0))

  return (
    <div className={styles.phase}>
      <div className={styles.visitaBanner}>
        <strong>{sessao.fornecedor_nome}</strong>
        <span className={styles.dot}>·</span>
        <span>{fmtDate(sessao.data_visita)}</span>
        {sessao.vendedor && <><span className={styles.dot}>·</span><span>Vendedor: {sessao.vendedor}</span></>}
        {sessao.cond_pag && <><span className={styles.dot}>·</span><span>{sessao.cond_pag}</span></>}
        {sessao.frete    && <><span className={styles.dot}>·</span><span>Frete: {sessao.frete}</span></>}
        <span className={styles.dot}>·</span>
        <span>{visitas.length} loja(s)</span>
      </div>

      <h2 className={styles.phaseTitle}>Fase 2 — Registrar Pedidos por SKU</h2>

      <div className={styles.skuLayout}>
        {/* SKU sidebar */}
        <div className={styles.skuList}>
          {segs.map((s, i) => (
            <button
              key={s.id}
              className={`${styles.skuItem} ${i === skuIdx ? styles.skuItemActive : ''} ${hasAnyData(s.id) ? styles.skuItemHasData : ''}`}
              onClick={() => { setSkuIdx(i); setLojaIdx(0) }}
            >
              <span className={styles.skuItemClass}>{s.classificacao} · {s.tipo_grade}</span>
              <span className={styles.skuItemName}>{s.tipo_produto} · {s.classe}</span>
              {hasAnyData(s.id) && <span className={styles.skuDot} />}
            </button>
          ))}
        </div>

        {/* SKU detail */}
        <div className={styles.skuDetail}>
          {!seg ? (
            <div className={styles.placeholder}>Nenhuma segmentação cadastrada.</div>
          ) : tamanhos.length === 0 ? (
            <div className={styles.placeholder}>
              Grade {seg.tipo_grade} ainda sem tamanhos definidos (TBD).
            </div>
          ) : (
            <>
              <div className={styles.skuHeader}>
                <span className={styles.skuHeaderName}>{seg.tipo_produto} · {seg.classe}</span>
                <span className={styles.skuHeaderGrade}>{seg.classificacao} · {seg.tipo_grade} · {tamanhos.join(', ')}</span>
              </div>

              {/* Valor e desconto compartilhados por SKU */}
              <div className={styles.skuPricing}>
                <div className={styles.field}>
                  <span className={styles.label}>Valor unit. (R$)</span>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={valorStr}
                    onChange={e => setSkuVal(seg.id, 'valor', e.target.value)}
                    style={{ width: 80 }}
                  />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Desconto (%)</span>
                  <input
                    type="text"
                    placeholder="0"
                    value={descontoStr}
                    onChange={e => setSkuVal(seg.id, 'desconto', e.target.value)}
                    style={{ width: 64 }}
                  />
                </div>
              </div>

              {/* Loja tabs */}
              <div className={styles.lojaTabs}>
                {visitas.map((v, i) => (
                  <button
                    key={v.id}
                    className={`${styles.lojaTab} ${i === lojaIdx ? styles.lojaTabActive : ''} ${totalQtdLoja(seg.id, v.id) > 0 ? styles.lojaTabHasData : ''}`}
                    onClick={() => setLojaIdx(i)}
                  >
                    {v.comprador_nome}
                    {totalQtdLoja(seg.id, v.id) > 0 && (
                      <span className={styles.lojaTabCount}>{totalQtdLoja(seg.id, v.id)}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Grade grid */}
              <div className={styles.gradeGrid}>
                <div className={styles.gradeRow}>
                  {skuProj.length > 0 && <div className={styles.gradeRowLabel}>Projeção</div>}
                  {skuProj.length > 0 && tamanhos.map(tam => (
                    <div key={tam} className={styles.gradeProjCell}>{getProjQtd(tam)}</div>
                  ))}
                </div>
                <div className={styles.gradeHeader}>
                  <div className={styles.gradeHeaderLabel} />
                  {tamanhos.map(tam => (
                    <div key={tam} className={styles.gradeHeaderCell}>{tam}</div>
                  ))}
                  <div className={styles.gradeHeaderCell}>Total</div>
                </div>
                <div className={styles.gradeRow}>
                  <div className={styles.gradeRowLabel}>{visita?.comprador_nome}</div>
                  {tamanhos.map((tam, tamIdx) => (
                    <input
                      key={tam}
                      ref={tamIdx === 0 ? firstInputRef : null}
                      type="number"
                      min="0"
                      className={styles.qtyInput}
                      value={getQtd(seg.id, visita?.id, tam)}
                      onChange={e => setQtd(seg.id, visita?.id, tam, e.target.value)}
                      onKeyDown={tamIdx === tamanhos.length - 1 ? handleTabOnLastInput : undefined}
                      placeholder="0"
                    />
                  ))}
                  <div className={styles.gradeTotal}>
                    {totalQtdLoja(seg.id, visita?.id)}
                  </div>
                </div>
              </div>

              {/* Obs por SKU */}
              <div className={styles.field} style={{ marginTop: '0.5rem' }}>
                <span className={styles.label}>Obs do produto (opcional)</span>
                <textarea
                  rows={1}
                  placeholder="Ex: entrega em 45 dias, apenas cor X…"
                  value={obsStr}
                  onChange={e => setSkuVal(seg.id, 'obs', e.target.value)}
                  style={{ resize: 'vertical', width: '100%', boxSizing: 'border-box', fontSize: '0.82rem' }}
                />
              </div>

              {/* Totais por tamanho (todas as lojas) */}
              {visitas.length > 1 && (
                <div className={`${styles.gradeRow} ${styles.gradeTotaisRow}`}>
                  <div className={styles.gradeRowLabel}>Total lojas</div>
                  {tamanhos.map(tam => {
                    const tot = visitas.reduce((s, v) => s + (parseInt(qtds[seg.id]?.[v.id]?.[tam]) || 0), 0)
                    return <div key={tam} className={styles.gradeTotalCell}>{tot || ''}</div>
                  })}
                  <div className={styles.gradeTotal}>
                    {visitas.reduce((s, v) => s + totalQtdLoja(seg.id, v.id), 0)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.phaseActions}>
        <button
          className={styles.btnSecondary}
          disabled={saving || !segs.some(s => hasAnyData(s.id))}
          onClick={handleFechar}
        >
          {saving ? 'Salvando…' : 'Fechar sessão e gerar PDFs →'}
        </button>
      </div>
    </div>
  )
}

// ─── PDF generation (shared between FecharSessao and Historico) ──────────
//
// sessao:          { fornecedor_nome, data_visita, vendedor, cond_pag, frete }
// visitas:         [{ id, comprador_nome, comprador_cnpj, comprador_cidade }]
// pedidosPorVisita: { [visitaId]: pedido[] }  — each pedido has
//                  { visita_id, itens, valor_unitario, desconto_pct,
//                    classificacao, tipo_produto, classe, tipo_grade }

function gerarPDFSessao(sessao, visitas, pedidosPorVisita) {
  const dateStr = new Date().toLocaleDateString('pt-BR')
  const visitasComPedidos = visitas.filter(v => (pedidosPorVisita[v.id] ?? []).length > 0)
  if (!visitasComPedidos.length) { alert('Nenhum pedido para gerar PDF.'); return }

  const ordersHtml = visitasComPedidos.map((vis, idx) => {
    const visPedidos = pedidosPorVisita[vis.id] ?? []
    const isLast = idx === visitasComPedidos.length - 1

    const totalGeralComprador = visPedidos.reduce((s, p) => {
      const q = p.itens.reduce((s2, i) => s2 + i.qtd, 0)
      return s + q * p.valor_unitario * (1 - p.desconto_pct / 100)
    }, 0)
    const totalPecasComprador = visPedidos.reduce((s, p) => s + p.itens.reduce((s2, i) => s2 + i.qtd, 0), 0)

    const pedidosHtml = visPedidos.map(p => {
      const segLabel = p.classificacao
        ? `${p.classificacao} — ${p.tipo_produto} — ${p.classe} (Grade ${p.tipo_grade})`
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
            <tfoot><tr>
              <td style="text-align:left; font-weight:bold; border-top:2px solid #aaa; padding:5px 10px;">Total</td>
              <td style="font-weight:bold; border-top:2px solid #aaa; padding:5px 10px; text-align:right;">${totalQ}</td>
            </tr></tfoot>
          </table>
          <div class="totals">
            <div>Valor unitário: <strong>R$ ${p.valor_unitario.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
            ${p.desconto_pct > 0 ? `<div>Desconto: <strong>${p.desconto_pct}%</strong></div>` : ''}
            <div style="font-size:14px; margin-top:4px;">Valor líquido: <strong>R$ ${totalV.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
          </div>
        </div>`
    }).join('')

    return `
      <div class="order"${isLast ? ' style="page-break-after:avoid;"' : ''}>
        <h1>PEDIDO DE COMPRA</h1>
        <p style="font-size:10px; color:#888; margin-bottom:12px;">Gerado em: ${dateStr}</p>
        <div class="section">
          <div class="section-title">Fornecedor</div>
          <div class="row"><span class="lbl">Fornecedor:</span><span>${esc(sessao.fornecedor_nome)}</span></div>
          ${sessao.vendedor ? `<div class="row"><span class="lbl">Vendedor:</span><span>${esc(sessao.vendedor)}</span></div>` : ''}
          <div class="row"><span class="lbl">Data pedido:</span><span>${fmtDate(sessao.data_visita)}</span></div>
          ${sessao.cond_pag ? `<div class="row"><span class="lbl">Cond. pag.:</span><span>${esc(sessao.cond_pag)}</span></div>` : ''}
          ${sessao.frete    ? `<div class="row"><span class="lbl">Frete:</span><span>${esc(sessao.frete)}</span></div>` : ''}
          ${sessao.obs      ? `<div class="row"><span class="lbl">Obs.:</span><span>${esc(sessao.obs)}</span></div>`      : ''}
        </div>
        <div class="section" style="border-top:1px solid #ddd; padding-top:10px;">
          <div class="section-title">Comprador</div>
          <div class="row"><span class="lbl">Nome:</span><span><strong>${esc(vis.comprador_nome)}</strong></span></div>
          ${vis.comprador_cnpj   ? `<div class="row"><span class="lbl">CNPJ:</span><span>${esc(vis.comprador_cnpj)}</span></div>`   : ''}
          ${vis.comprador_cidade ? `<div class="row"><span class="lbl">Cidade:</span><span>${esc(vis.comprador_cidade)}</span></div>` : ''}
        </div>
        ${pedidosHtml}
        <div class="total-geral">
          <span>${totalPecasComprador} peça(s)</span>
          <span>Total do pedido: <strong>R$ ${totalGeralComprador.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></span>
        </div>
        <div class="footer">Gerado por Solução Compras — ${dateStr}</div>
      </div>`
  }).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Pedidos — ${esc(sessao.fornecedor_nome)} — ${fmtDate(sessao.data_visita)}</title>
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
    .total-geral { display:flex; justify-content:space-between; align-items:center; margin-top:20px; padding:10px 12px; background:#f5f5f5; border:2px solid #333; border-radius:4px; font-size:13px; }
    .footer { margin-top: 24px; font-size: 10px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 8px; }
    @media print { @page { margin: 15mm; } }
  </style>
</head>
<body>${ordersHtml}</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) { alert('Bloqueador de pop-ups ativo. Permita pop-ups para este site.'); return }
  win.onload = () => win.print()
  win.document.write(html)
  win.document.close()
  win.focus()
  if (win.document.readyState === 'complete') win.print()
}

// ─── Phase 3: Close Session + PDFs ───────────────────────────────────────

function FecharSessao({ sessao, visitas, segs, pedidos, onNovaSessao }) {
  function handleGerarPDFs() {
    const pedMap = {}
    for (const p of pedidos) {
      if (!pedMap[p.visita_id]) pedMap[p.visita_id] = []
      pedMap[p.visita_id].push(p)
    }
    gerarPDFSessao(sessao, visitas, pedMap)
  }

  const visitasComPedidos = visitas.filter(v => pedidos.some(p => p.visita_id === v.id))
  const totalGeral = pedidos.reduce((s, p) => {
    const q = p.itens.reduce((s2, i) => s2 + i.qtd, 0)
    return s + q * p.valor_unitario * (1 - p.desconto_pct / 100)
  }, 0)

  return (
    <div className={styles.phase}>
      <div className={styles.visitaBanner}>
        <strong>{sessao.fornecedor_nome}</strong>
        <span className={styles.dot}>·</span>
        <span>{fmtDate(sessao.data_visita)}</span>
        <span className={styles.dot}>·</span>
        <span>{pedidos.length} pedido(s) · {visitasComPedidos.length} loja(s)</span>
      </div>

      <h2 className={styles.phaseTitle}>Fase 3 — Resumo da Sessão</h2>

      <div className={styles.resumoGrid}>
        {visitasComPedidos.map(vis => {
          const visPedidos = pedidos.filter(p => p.visita_id === vis.id)
          const totalComp = visPedidos.reduce((s, p) => {
            const q = p.itens.reduce((s2, i) => s2 + i.qtd, 0)
            return s + q * p.valor_unitario * (1 - p.desconto_pct / 100)
          }, 0)
          return (
            <div key={vis.id} className={styles.resumoCard}>
              <div className={styles.resumoCardHeader}>{vis.comprador_nome}</div>
              {visPedidos.map((p, i) => {
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
        <button className={styles.btnSecondary} onClick={onNovaSessao}>← Nova sessão</button>
        <button className={styles.btnPrimary} onClick={handleGerarPDFs}>
          Gerar PDFs ({visitasComPedidos.length})
        </button>
      </div>
    </div>
  )
}

// ─── Historico ────────────────────────────────────────────────────────────

function Historico({ colId }) {
  const [sessoesList,      setSessoesList]      = useState([])
  const [loading,          setLoading]          = useState(true)
  const [expandedSessao,   setExpandedSessao]   = useState(null)
  const [expandedVisita,   setExpandedVisita]   = useState(null)
  const [pedidosPorVisita, setPedidosPorVisita] = useState({})
  const [reimprimindo,     setReimprimindo]     = useState(null) // sessao.id em andamento
  const [confirmCancelar,  setConfirmCancelar]  = useState(null) // { pedidoId, visitaId }

  useEffect(() => {
    window.api.sessoes.list(colId).then(list => {
      setSessoesList(list)
      setLoading(false)
    })
  }, [colId])

  async function handleExpandVisita(visitaId) {
    if (expandedVisita === visitaId) { setExpandedVisita(null); return }
    setExpandedVisita(visitaId)
    if (!pedidosPorVisita[visitaId]) {
      const peds = await window.api.pedidos.byVisita(visitaId)
      setPedidosPorVisita(prev => ({ ...prev, [visitaId]: peds }))
    }
  }

  async function executarCancelar() {
    if (!confirmCancelar) return
    const { pedidoId, visitaId } = confirmCancelar
    setConfirmCancelar(null)
    await window.api.pedidos.cancelar(pedidoId)
    setPedidosPorVisita(prev => ({
      ...prev,
      [visitaId]: (prev[visitaId] ?? []).filter(p => p.id !== pedidoId)
    }))
  }

  async function handleReimprimir(ses) {
    setReimprimindo(ses.id)
    try {
      // Carrega pedidos de todas as visitas que ainda não foram abertas
      const toLoad = ses.visitas.filter(v => !pedidosPorVisita[v.visita_id])
      let allPeds = pedidosPorVisita
      if (toLoad.length > 0) {
        const loaded = await Promise.all(
          toLoad.map(v => window.api.pedidos.byVisita(v.visita_id).then(peds => [v.visita_id, peds]))
        )
        allPeds = { ...pedidosPorVisita, ...Object.fromEntries(loaded) }
        setPedidosPorVisita(allPeds)
      }
      const visitasForPDF = ses.visitas.map(v => ({
        id: v.visita_id,
        comprador_nome:   v.comprador_nome,
        comprador_cnpj:   v.comprador_cnpj   ?? '',
        comprador_cidade: v.comprador_cidade  ?? '',
      }))
      gerarPDFSessao(ses, visitasForPDF, allPeds)
    } finally {
      setReimprimindo(null)
    }
  }

  if (loading) return <p className={styles.muted}>Carregando histórico…</p>
  if (sessoesList.length === 0) return <p className={styles.muted}>Nenhuma sessão registrada nesta coleção.</p>

  return (
    <div className={styles.historico}>
      {confirmCancelar && (
        <ConfirmModal
          message="Cancelar este pedido? Essa ação não pode ser desfeita."
          confirmLabel="Cancelar pedido"
          danger
          onConfirm={executarCancelar}
          onCancel={() => setConfirmCancelar(null)}
        />
      )}
      {sessoesList.map(ses => (
        <div key={ses.id} className={styles.histSessao}>
          <div className={styles.histSessaoHeader}>
            <button
              className={styles.histSessaoToggle}
              onClick={() => setExpandedSessao(expandedSessao === ses.id ? null : ses.id)}
            >
              <strong>{ses.fornecedor_nome}</strong>
              <span className={styles.dot}>·</span>
              <span>{fmtDate(ses.data_visita)}</span>
              {ses.vendedor && <><span className={styles.dot}>·</span><span>{ses.vendedor}</span></>}
              <span className={styles.histChevron}>{expandedSessao === ses.id ? '▲' : '▼'}</span>
            </button>
            <button
              className={styles.btnReimprimir}
              onClick={() => handleReimprimir(ses)}
              disabled={reimprimindo === ses.id}
              title="Reimprimir PDFs desta sessão"
            >
              {reimprimindo === ses.id ? '…' : '🖨'}
            </button>
          </div>

          {expandedSessao === ses.id && (
            <div className={styles.histSessaoBody}>
              {(ses.visitas ?? []).length === 0 ? (
                <p className={styles.muted}>Nenhuma loja nesta sessão.</p>
              ) : (ses.visitas ?? []).map(vis => (
                <div key={vis.visita_id} className={styles.histVisita}>
                  <button
                    className={styles.histVisitaHeader}
                    onClick={() => handleExpandVisita(vis.visita_id)}
                  >
                    <span>{vis.comprador_nome}</span>
                    <span className={styles.histChevron}>{expandedVisita === vis.visita_id ? '▲' : '▼'}</span>
                  </button>

                  {expandedVisita === vis.visita_id && (
                    <div className={styles.histPedidos}>
                      {!(pedidosPorVisita[vis.visita_id]) ? (
                        <p className={styles.muted}>Carregando…</p>
                      ) : pedidosPorVisita[vis.visita_id].length === 0 ? (
                        <p className={styles.muted}>Nenhum pedido.</p>
                      ) : (
                        <table className={styles.histTable}>
                          <thead>
                            <tr>
                              <th>Segmentação</th>
                              <th>Peças</th>
                              <th>Valor unit.</th>
                              <th>Total</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {pedidosPorVisita[vis.visita_id].map(p => {
                              const pecas = p.itens.reduce((s, i) => s + i.qtd, 0)
                              const total = pecas * p.valor_unitario * (1 - p.desconto_pct / 100)
                              return (
                                <tr key={p.id}>
                                  <td>{p.classificacao} · {p.tipo_produto} · {p.classe}</td>
                                  <td>{pecas}</td>
                                  <td>R$ {fmt(p.valor_unitario)}</td>
                                  <td>R$ {fmt(total)}</td>
                                  <td>
                                    <button
                                      className={styles.btnCancelar}
                                      onClick={() => setConfirmCancelar({ pedidoId: p.id, visitaId: vis.visita_id })}
                                    >
                                      Cancelar
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
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
  const [sessao,      setSessao]      = useState(null)
  const [visitas,     setVisitas]     = useState([])
  const [pedidosFechados, setPedidosFechados] = useState([])
  const [view,        setView]        = useState('nova') // 'nova' | 'historico'

  useEffect(() => {
    Promise.all([
      window.api.segmentacoes.list(),
      window.api.fornecedores.list(),
      window.api.compradores.list(),
    ]).then(([s, f, c]) => { setSegs(s); setForns(f); setCompradores(c) })
  }, [])

  function handleStart(novaSessao, lojas) {
    const visitasEnriquecidas = novaSessao.visitas.map(v => {
      const loja = lojas.find(l => l.id === v.comprador_id)
      return {
        id: v.visita_id,
        comprador_id: v.comprador_id,
        comprador_nome:   loja?.nome   ?? `Loja #${v.comprador_id}`,
        comprador_cnpj:   loja?.cnpj   ?? '',
        comprador_cidade: loja?.cidade  ?? '',
      }
    })
    setSessao(novaSessao)
    setVisitas(visitasEnriquecidas)
    setPhase(2)
  }

  function handleFechar(pedidos) {
    setPedidosFechados(pedidos)
    setPhase(3)
  }

  function handleNovaSessao() {
    setSessao(null)
    setVisitas([])
    setPedidosFechados([])
    setPhase(1)
  }

  const sessaoDisplay = sessao ?? null
  const inSession = phase > 1

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

      {!inSession && (
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${view === 'nova' ? styles.toggleActive : ''}`}
            onClick={() => setView('nova')}
          >
            Nova sessão
          </button>
          <button
            className={`${styles.toggleBtn} ${view === 'historico' ? styles.toggleActive : ''}`}
            onClick={() => setView('historico')}
          >
            Histórico
          </button>
        </div>
      )}

      {(inSession || view === 'nova') && (
        <div className={styles.stepBar}>
          {['Iniciar sessão', 'Registrar pedidos', 'Gerar PDFs'].map((label, i) => (
            <div key={i} className={`${styles.step} ${phase === i + 1 ? styles.stepActive : ''} ${phase > i + 1 ? styles.stepDone : ''}`}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}

      {view === 'nova' && phase === 1 && (
        <IniciarSessao
          forns={forns}
          compradores={compradores}
          colId={active.id}
          onStart={handleStart}
        />
      )}
      {phase === 2 && sessao && (
        <RegistrarPedidoSessao
          sessao={sessaoDisplay}
          visitas={visitas}
          segs={segs}
          colId={active.id}
          onFechar={handleFechar}
        />
      )}
      {phase === 3 && sessao && (
        <FecharSessao
          sessao={sessaoDisplay}
          visitas={visitas}
          segs={segs}
          pedidos={pedidosFechados}
          onNovaSessao={handleNovaSessao}
        />
      )}

      {view === 'historico' && !inSession && (
        <Historico colId={active.id} />
      )}
    </div>
  )
}
