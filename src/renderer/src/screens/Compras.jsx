import { useState, useEffect, useRef } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { tamanhosDeTipoGrade, GRADE_DEFINITIONS } from '../constants/grades'
import { TIPOS_PRODUTO } from '../constants/tipoProduto'
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
  const [frete,          setFrete]          = useState('')
  const [transportadora, setTransportadora] = useState('')
  const [obs,            setObs]            = useState('')
  const [lojas,          setLojas]          = useState([])
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
        transportadora: frete === 'FOB' ? transportadora : '',
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
          <select value={frete} onChange={e => { setFrete(e.target.value); if (e.target.value !== 'FOB') setTransportadora('') }}>
            <option value="">—</option>
            <option value="CIF">CIF</option>
            <option value="FOB">FOB</option>
          </select>
        </div>
        {frete === 'FOB' && (
          <div className={styles.field}>
            <span className={styles.label}>Transportadora</span>
            <input type="text" placeholder="Nome da transportadora" value={transportadora}
              onChange={e => setTransportadora(e.target.value)} />
          </div>
        )}
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

// ─── Phase 2: Tabela de itens ─────────────────────────────────────────────

function RegistrarPedidoSessao({ sessao, visitas, colId, colEstacao, onFechar,
  initialItems = [], initialQtds = {}, initialActiveId = null, initialLojaIdx = 0 }) {
  const [items,    setItems]    = useState(initialItems)
  const [activeId, setActiveId] = useState(initialActiveId)
  const [lojaIdx,  setLojaIdx]  = useState(initialLojaIdx)
  const [qtds,     setQtds]     = useState(initialQtds)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState(null)
  const [form,     setForm]     = useState({ ref: '', tipo_produto: '', tipo_grade: 'AD', classe: 'FEM', icms_pct: '', valor: '' })
  const RECOVERY_KEY = `SC_RECOVERY_${colId}`
  const firstInputRef = useRef(null)

  const activeItem = items.find(it => it.localId === activeId) ?? null
  const tamanhos   = activeItem ? tamanhosDeTipoGrade(activeItem.tipo_grade) : []
  const visita     = visitas[lojaIdx]

  // Auto-save para recuperação em caso de crash
  useEffect(() => {
    if (!sessao?.id) return
    localStorage.setItem(RECOVERY_KEY, JSON.stringify({ sessao_id: sessao.id, items, qtds, activeId, lojaIdx }))
  }, [items, qtds, activeId, lojaIdx])

  // Focus first input when active item / loja changes
  useEffect(() => {
    firstInputRef.current?.focus()
  }, [activeId, lojaIdx])

  function getQtd(localId, visitaId, tam) {
    return qtds[localId]?.[visitaId]?.[tam] ?? ''
  }

  function setQtd(localId, visitaId, tam, raw) {
    const val = raw === '' ? '' : Math.max(0, parseInt(raw, 10) || 0)
    setQtds(prev => ({
      ...prev,
      [localId]: { ...prev[localId], [visitaId]: { ...prev[localId]?.[visitaId], [tam]: val } }
    }))
  }

  function totalQtdLoja(localId, visitaId) {
    const loja = qtds[localId]?.[visitaId] ?? {}
    return Object.values(loja).reduce((s, q) => s + (parseInt(q) || 0), 0)
  }

  function totalQtdItem(localId) {
    return visitas.reduce((s, v) => s + totalQtdLoja(localId, v.id), 0)
  }

  function addItem() {
    const { ref, tipo_produto, tipo_grade, classe, icms_pct, valor } = form
    if (!tipo_produto.trim() || !tipo_grade) return
    const localId = `item_${Date.now()}_${Math.random()}`
    const novoItem = {
      localId,
      ref: ref.trim(),
      tipo_produto: tipo_produto.trim().toUpperCase(),
      tipo_grade,
      classe,
      icms_pct: icms_pct || '0',
      valor: valor || '',
    }
    setItems(prev => [...prev, novoItem])
    setActiveId(localId)
    setLojaIdx(0)
    setForm(prev => ({ ...prev, ref: '', valor: '' }))
  }

  function removeItem(localId, e) {
    e.stopPropagation()
    setItems(prev => prev.filter(it => it.localId !== localId))
    setQtds(prev => { const n = { ...prev }; delete n[localId]; return n })
    if (activeId === localId) setActiveId(null)
  }

  function handleEnterOnInput(e, tamIdx) {
    if (e.key !== 'Enter' && !(e.key === 'Tab' && !e.shiftKey)) return
    e.preventDefault()
    if (tamIdx < tamanhos.length - 1) {
      const inputs = e.target.closest(`.${styles.gradeRow}`)?.querySelectorAll('input')
      if (inputs?.[tamIdx + 1]) inputs[tamIdx + 1].focus()
      return
    }
    if (lojaIdx < visitas.length - 1) {
      setLojaIdx(lojaIdx + 1)
    } else {
      const idx = items.findIndex(it => it.localId === activeId)
      if (idx < items.length - 1) {
        setActiveId(items[idx + 1].localId)
        setLojaIdx(0)
      }
    }
  }

  async function handleFechar() {
    setSaving(true)
    setError(null)
    try {
      const batch = []
      const meta  = []
      for (const item of items) {
        const { localId, ref, tipo_produto, tipo_grade, classe, icms_pct, valor } = item
        const valorNum = parseFloat((valor ?? '').replace(',', '.')) || 0
        const icmsNum  = parseFloat((icms_pct ?? '').replace(',', '.')) || 0
        const classDef = GRADE_DEFINITIONS[tipo_grade]
        if (!classDef) continue
        const classificacao = classDef.classificacao

        const segId = await window.api.segmentacoes.findOrCreate({
          classificacao, tipo_produto, classe, tipo_grade,
          estacao: colEstacao ?? 'inverno',
        })

        for (const v of visitas) {
          const lojaTams = qtds[localId]?.[v.id] ?? {}
          const itens = tamanhosDeTipoGrade(tipo_grade)
            .map(tam => ({ tamanho: tam, qtd: parseInt(lojaTams[tam]) || 0 }))
            .filter(i => i.qtd > 0)
          if (!itens.length) continue
          batch.push({
            visita_id: v.id, comprador_id: v.comprador_id, segmentacao_id: segId,
            valor_unitario: valorNum, desconto_pct: 0,
            referencia: ref, icms_pct: icmsNum, obs: '', itens,
          })
          meta.push({
            comprador_nome: v.comprador_nome, comprador_cnpj: v.comprador_cnpj ?? '',
            comprador_cidade: v.comprador_cidade ?? '',
            classificacao, tipo_produto, classe, tipo_grade,
          })
        }
      }
      const salvos = await window.api.pedidos.salvarBatch(batch)
      localStorage.removeItem(RECOVERY_KEY)
      onFechar(salvos.map((p, i) => ({ ...p, ...meta[i] })))
    } catch {
      setError('Erro ao salvar pedidos. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.phase}>
      <div className={styles.visitaBanner}>
        <strong>{sessao.fornecedor_nome}</strong>
        <span className={styles.dot}>·</span>
        <span>{fmtDate(sessao.data_visita)}</span>
        {sessao.vendedor && <><span className={styles.dot}>·</span><span>Vendedor: {sessao.vendedor}</span></>}
        {sessao.cond_pag && <><span className={styles.dot}>·</span><span>{sessao.cond_pag}</span></>}
        {sessao.frete    && <><span className={styles.dot}>·</span><span>Frete: {sessao.frete}</span></>}
        {sessao.frete === 'FOB' && sessao.transportadora && <><span className={styles.dot}>·</span><span>Transp.: {sessao.transportadora}</span></>}
        <span className={styles.dot}>·</span>
        <span>{visitas.length} loja(s)</span>
      </div>

      <h2 className={styles.phaseTitle}>Fase 2 — Registrar Pedidos</h2>

      {/* ── Add item form ── */}
      <datalist id="tipos-produto-list">
        {TIPOS_PRODUTO.map(t => <option key={t} value={t} />)}
      </datalist>

      <div className={styles.addItemForm}>
        <div className={styles.field}>
          <span className={styles.label}>Ref</span>
          <input
            type="text"
            className={styles.addItemRef}
            placeholder="Cód. forn."
            value={form.ref}
            onChange={e => setForm(p => ({ ...p, ref: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') addItem() }}
          />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Produto</span>
          <input
            type="text"
            list="tipos-produto-list"
            className={styles.addItemProd}
            placeholder="Ex: CAMISETA"
            value={form.tipo_produto}
            onChange={e => setForm(p => ({ ...p, tipo_produto: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') addItem() }}
          />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Grade</span>
          <select
            value={form.tipo_grade}
            onChange={e => setForm(p => ({ ...p, tipo_grade: e.target.value }))}
          >
            {Object.keys(GRADE_DEFINITIONS).map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Classe</span>
          <select
            value={form.classe}
            onChange={e => setForm(p => ({ ...p, classe: e.target.value }))}
          >
            <option value="FEM">FEM</option>
            <option value="MASC">MASC</option>
            <option value="UNI">UNI</option>
          </select>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>ICMS %</span>
          <input
            type="text"
            className={styles.addItemIcms}
            placeholder="0"
            value={form.icms_pct}
            onChange={e => setForm(p => ({ ...p, icms_pct: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') addItem() }}
          />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Valor unit.</span>
          <input
            type="text"
            className={styles.addItemValor}
            placeholder="0,00"
            value={form.valor}
            onChange={e => setForm(p => ({ ...p, valor: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') addItem() }}
          />
        </div>
        <button
          className={styles.btnAdd}
          disabled={!form.tipo_produto.trim() || !form.tipo_grade}
          onClick={addItem}
        >
          + Adicionar
        </button>
      </div>

      {/* ── Items table ── */}
      {items.length > 0 ? (
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>Ref</th>
              <th>Produto</th>
              <th>Grade</th>
              <th>Classe</th>
              <th>ICMS</th>
              <th>Valor unit.</th>
              <th>Peças</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => {
              const total = totalQtdItem(it.localId)
              const isActive = it.localId === activeId
              return (
                <tr
                  key={it.localId}
                  className={`${styles.itemRow} ${isActive ? styles.itemRowActive : ''}`}
                  onClick={() => { setActiveId(it.localId); setLojaIdx(0) }}
                >
                  <td>{it.ref || <span className={styles.itemDot}>—</span>}</td>
                  <td>{it.tipo_produto}</td>
                  <td>{it.tipo_grade}</td>
                  <td>{it.classe}</td>
                  <td>{it.icms_pct}%</td>
                  <td>{it.valor ? `R$ ${it.valor}` : <span className={styles.itemDot}>—</span>}</td>
                  <td><strong>{total > 0 ? total : <span className={styles.itemDot}>—</span>}</strong></td>
                  <td>
                    <button
                      className={styles.btnRemoveItem}
                      onClick={e => removeItem(it.localId, e)}
                      title="Remover item"
                    >✕</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <div className={styles.placeholder}>Adicione o primeiro produto acima para começar.</div>
      )}

      {/* ── Grade section ── */}
      {activeItem && tamanhos.length > 0 && (
        <div className={styles.gradeSection}>
          <div className={styles.gradeCaption}>
            {activeItem.ref && <span className={styles.gradeCaptionRef}>{activeItem.ref}</span>}
            <span>{activeItem.tipo_produto} · {activeItem.tipo_grade} · {activeItem.classe}</span>
          </div>

          {/* Loja tabs */}
          <div className={styles.lojaTabs}>
            {visitas.map((v, i) => (
              <button
                key={v.id}
                className={`${styles.lojaTab} ${i === lojaIdx ? styles.lojaTabActive : ''} ${totalQtdLoja(activeItem.localId, v.id) > 0 ? styles.lojaTabHasData : ''}`}
                onClick={() => setLojaIdx(i)}
              >
                {v.comprador_nome}
                {totalQtdLoja(activeItem.localId, v.id) > 0 && (
                  <span className={styles.lojaTabCount}>{totalQtdLoja(activeItem.localId, v.id)}</span>
                )}
              </button>
            ))}
          </div>

          {/* Grade grid */}
          <div className={styles.gradeGrid}>
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
                  value={getQtd(activeItem.localId, visita?.id, tam)}
                  onChange={e => setQtd(activeItem.localId, visita?.id, tam, e.target.value)}
                  onKeyDown={e => handleEnterOnInput(e, tamIdx)}
                  placeholder="0"
                />
              ))}
              <div className={styles.gradeTotal}>
                {totalQtdLoja(activeItem.localId, visita?.id)}
              </div>
            </div>
            {visitas.length > 1 && (
              <div className={`${styles.gradeRow} ${styles.gradeTotaisRow}`}>
                <div className={styles.gradeRowLabel}>Total lojas</div>
                {tamanhos.map(tam => {
                  const tot = visitas.reduce((s, v) => s + (parseInt(qtds[activeItem.localId]?.[v.id]?.[tam]) || 0), 0)
                  return <div key={tam} className={styles.gradeTotalCell}>{tot || ''}</div>
                })}
                <div className={styles.gradeTotal}>
                  {totalQtdItem(activeItem.localId)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.phaseActions}>
        <button
          className={styles.btnSecondary}
          disabled={saving || items.every(it => totalQtdItem(it.localId) === 0)}
          onClick={handleFechar}
        >
          {saving ? 'Salvando…' : 'Fechar sessão e gerar PDFs →'}
        </button>
      </div>
    </div>
  )
}

// ─── PDF generation (shared between FecharSessao and Historico) ──────────

const PDF_STYLES = `
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
    @media print { @page { margin: 15mm; } }`

function wrapDoc(ordersHtml, titulo) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <style>${PDF_STYLES}
  </style>
</head>
<body>${ordersHtml}</body>
</html>`
}

function gerarHTMLOrdem(sessao, vis, visPedidos, isLast = true) {
  const dateStr = new Date().toLocaleDateString('pt-BR')
  const totalGeralComprador = visPedidos.reduce((s, p) => {
    const q = p.itens.reduce((s2, i) => s2 + i.qtd, 0)
    return s + q * p.valor_unitario * (1 - p.desconto_pct / 100)
  }, 0)
  const totalPecasComprador = visPedidos.reduce((s, p) => s + p.itens.reduce((s2, i) => s2 + i.qtd, 0), 0)

  const pedidosHtml = visPedidos.map(p => {
    const segLabel = p.referencia
      ? `${p.referencia} — ${p.tipo_produto ?? ''} — ${p.classe ?? ''} (Grade ${p.tipo_grade ?? ''})`
      : p.classificacao
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
        ${sessao.frete === 'FOB' && sessao.transportadora ? `<div class="row"><span class="lbl">Transportadora:</span><span>${esc(sessao.transportadora)}</span></div>` : ''}
        ${sessao.obs      ? `<div class="row"><span class="lbl">Obs.:</span><span>${esc(sessao.obs)}</span></div>` : ''}
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
}

function gerarPDFSessao(sessao, visitas, pedidosPorVisita) {
  const visitasComPedidos = visitas.filter(v => (pedidosPorVisita[v.id] ?? []).length > 0)
  if (!visitasComPedidos.length) { alert('Nenhum pedido para gerar PDF.'); return }

  const ordersHtml = visitasComPedidos.map((vis, idx) =>
    gerarHTMLOrdem(sessao, vis, pedidosPorVisita[vis.id] ?? [], idx === visitasComPedidos.length - 1)
  ).join('')
  const html = wrapDoc(ordersHtml, `Pedidos — ${esc(sessao.fornecedor_nome)} — ${fmtDate(sessao.data_visita)}`)

  const win = window.open('', '_blank')
  if (!win) { alert('Bloqueador de pop-ups ativo. Permita pop-ups para este site.'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}

// DD-MM-AA a partir de YYYY-MM-DD
const fmtDataPDF = iso => { const [y,m,d] = iso.split('-'); return `${d}-${m}-${y.slice(2)}` }

async function salvarPDFVisita(sessao, vis, visPedidos, pasta) {
  const html = wrapDoc(
    gerarHTMLOrdem(sessao, vis, visPedidos, true),
    `Pedido — ${esc(sessao.fornecedor_nome)} — ${esc(vis.comprador_nome)}`
  )
  const nome = `${fmtDataPDF(sessao.data_visita)} ${vis.comprador_nome} ${sessao.fornecedor_nome}`
    .replace(/[/\\?%*:|"<>]/g, '-')
  return window.api.pdf.salvarNaPasta(html, nome, pasta)
}

// ─── Phase 3: Close Session + PDFs ───────────────────────────────────────

function FecharSessao({ sessao, visitas, segs, pedidos, onNovaSessao }) {
  const [pastaDestino, setPastaDestino] = useState(null)
  const [salvandoPDF,  setSalvandoPDF]  = useState(null) // vis.id em andamento
  const [salvos,       setSalvos]       = useState(new Set())
  const [erroPDF,      setErroPDF]      = useState(null)

  const podeSalvarPDF    = !!window.api?.pdf?.salvarNaPasta
  const visitasComPedidos = visitas.filter(v => pedidos.some(p => p.visita_id === v.id))
  const totalGeral = pedidos.reduce((s, p) => {
    const q = p.itens.reduce((s2, i) => s2 + i.qtd, 0)
    return s + q * p.valor_unitario * (1 - p.desconto_pct / 100)
  }, 0)

  function handleGerarPDFs() {
    const pedMap = {}
    for (const p of pedidos) {
      if (!pedMap[p.visita_id]) pedMap[p.visita_id] = []
      pedMap[p.visita_id].push(p)
    }
    gerarPDFSessao(sessao, visitas, pedMap)
  }

  async function handleSalvarPDF(vis) {
    setErroPDF(null)
    let pasta = pastaDestino

    // Primeira vez: abre dialog de pasta (uma única vez para a sessão)
    if (!pasta) {
      pasta = await window.api.pdf.escolherPasta()
      if (!pasta) return // usuário cancelou
      setPastaDestino(pasta)
    }

    const visPedidos = pedidos.filter(p => p.visita_id === vis.id)
    setSalvandoPDF(vis.id)
    try {
      const result = await salvarPDFVisita(sessao, vis, visPedidos, pasta)
      if (result?.ok) {
        setSalvos(prev => new Set([...prev, vis.id]))
      } else {
        setErroPDF(`Erro ao salvar PDF de ${vis.comprador_nome}.`)
      }
    } catch {
      setErroPDF(`Erro ao salvar PDF de ${vis.comprador_nome}.`)
    } finally {
      setSalvandoPDF(null)
    }
  }

  async function handleSalvarTodos() {
    setErroPDF(null)
    let pasta = pastaDestino
    if (!pasta) {
      pasta = await window.api.pdf.escolherPasta()
      if (!pasta) return
      setPastaDestino(pasta)
    }
    for (const vis of visitasComPedidos) {
      if (salvos.has(vis.id)) continue
      setSalvandoPDF(vis.id)
      try {
        const visPedidos = pedidos.filter(p => p.visita_id === vis.id)
        const result = await salvarPDFVisita(sessao, vis, visPedidos, pasta)
        if (result?.ok) setSalvos(prev => new Set([...prev, vis.id]))
      } catch {
        setErroPDF(`Erro ao salvar PDF de ${vis.comprador_nome}.`)
        setSalvandoPDF(null)
        return
      }
    }
    setSalvandoPDF(null)
  }

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

      {pastaDestino && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
          Pasta: <strong style={{ color: 'var(--text-secondary)' }}>{pastaDestino}</strong>
          <button
            style={{ marginLeft: '0.75rem', background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
            onClick={async () => { const p = await window.api.pdf.escolherPasta(); if (p) { setPastaDestino(p); setSalvos(new Set()) } }}
          >
            trocar
          </button>
        </div>
      )}

      {erroPDF && <div className={styles.errorBanner}>{erroPDF}</div>}

      <div className={styles.resumoGrid}>
        {visitasComPedidos.map(vis => {
          const visPedidos = pedidos.filter(p => p.visita_id === vis.id)
          const totalComp = visPedidos.reduce((s, p) => {
            const q = p.itens.reduce((s2, i) => s2 + i.qtd, 0)
            return s + q * p.valor_unitario * (1 - p.desconto_pct / 100)
          }, 0)
          const foiSalvo = salvos.has(vis.id)
          return (
            <div key={vis.id} className={styles.resumoCard}>
              <div className={styles.resumoCardHeader}>{vis.comprador_nome}</div>
              {visPedidos.map((p, i) => {
                const totalQ = p.itens.reduce((s, i) => s + i.qtd, 0)
                return (
                  <div key={i} className={styles.resumoItem}>
                    <span>
                      {p.referencia ? `[${p.referencia}] ` : ''}
                      {p.tipo_produto ? `${p.tipo_produto} ${p.classe}` : `Seg #${p.segmentacao_id}`}
                    </span>
                    <span>{totalQ} pç</span>
                  </div>
                )
              })}
              <div className={styles.resumoTotal}>R$ {fmt(totalComp)}</div>
              {podeSalvarPDF && (
                <button
                  className={foiSalvo ? styles.btnSecondary : styles.btnPdf}
                  style={{ marginTop: '0.5rem', width: '100%', padding: '0.35rem', fontSize: '0.78rem' }}
                  onClick={() => handleSalvarPDF(vis)}
                  disabled={salvandoPDF !== null}
                >
                  {salvandoPDF === vis.id ? 'Salvando…' : foiSalvo ? '✓ PDF salvo' : '↓ Salvar PDF'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.resumoGeralTotal}>
        Total geral: <strong>R$ {fmt(totalGeral)}</strong>
      </div>

      <div className={styles.phaseActions}>
        <button className={styles.btnSecondary} onClick={onNovaSessao}>← Nova sessão</button>
        {podeSalvarPDF && (
          <button
            className={styles.btnPdf}
            onClick={handleSalvarTodos}
            disabled={salvandoPDF !== null || salvos.size === visitasComPedidos.length}
          >
            {salvos.size === visitasComPedidos.length
              ? '✓ Todos os PDFs salvos'
              : salvandoPDF !== null
                ? 'Salvando…'
                : `↓ Salvar todos os PDFs (${visitasComPedidos.length - salvos.size})`}
          </button>
        )}
        <button className={styles.btnPrimary} onClick={handleGerarPDFs}>
          Imprimir todos ({visitasComPedidos.length})
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
  const [confirmCancelar,     setConfirmCancelar]     = useState(null) // { pedidoId, visitaId }
  const [editSessaoId,        setEditSessaoId]        = useState(null)
  const [editSessaoForm,      setEditSessaoForm]      = useState({})
  const [savingEditSessao,    setSavingEditSessao]    = useState(false)
  const [confirmDeleteSessao, setConfirmDeleteSessao] = useState(null) // sessaoId

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

  function handleStartEditSessao(ses) {
    setEditSessaoId(ses.id)
    setEditSessaoForm({
      data_visita:    ses.data_visita,
      vendedor:       ses.vendedor       ?? '',
      cond_pag:       ses.cond_pag       ?? '',
      frete:          ses.frete          ?? '',
      transportadora: ses.transportadora ?? '',
      obs:            ses.obs            ?? '',
    })
  }

  async function handleSaveEditSessao(id) {
    setSavingEditSessao(true)
    try {
      const updated = await window.api.sessoes.update(id, editSessaoForm)
      setSessoesList(prev => prev.map(s => s.id === id ? { ...updated, visitas: s.visitas } : s))
      setEditSessaoId(null)
    } finally {
      setSavingEditSessao(false)
    }
  }

  async function executarDeleteSessao() {
    const id = confirmDeleteSessao
    setConfirmDeleteSessao(null)
    await window.api.sessoes.cancelar(id)
    setSessoesList(prev => prev.filter(s => s.id !== id))
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
      {confirmDeleteSessao && (
        <ConfirmModal
          message="Excluir esta sessão inteira? Todos os pedidos serão removidos. Essa ação não pode ser desfeita."
          confirmLabel="Excluir sessão"
          danger
          onConfirm={executarDeleteSessao}
          onCancel={() => setConfirmDeleteSessao(null)}
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
            <button
              className={styles.btnReimprimir}
              onClick={() => handleStartEditSessao(ses)}
              disabled={editSessaoId !== null}
              title="Editar dados da sessão"
            >
              ✎
            </button>
            <button
              className={styles.btnReimprimir}
              style={{ color: 'var(--red)' }}
              onClick={() => setConfirmDeleteSessao(ses.id)}
              disabled={editSessaoId !== null}
              title="Excluir sessão"
            >
              🗑
            </button>
          </div>

          {editSessaoId === ses.id && (
            <div className={styles.histEditForm}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <span className={styles.label}>Data</span>
                  <input type="date" value={editSessaoForm.data_visita}
                    onChange={e => setEditSessaoForm(p => ({ ...p, data_visita: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Vendedor</span>
                  <input type="text" value={editSessaoForm.vendedor}
                    onChange={e => setEditSessaoForm(p => ({ ...p, vendedor: e.target.value }))}
                    placeholder="Nome do vendedor" />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Cond. pagamento</span>
                  <input type="text" value={editSessaoForm.cond_pag}
                    onChange={e => setEditSessaoForm(p => ({ ...p, cond_pag: e.target.value }))}
                    placeholder="Ex: 30/60 dias" />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Frete</span>
                  <select value={editSessaoForm.frete}
                    onChange={e => setEditSessaoForm(p => ({ ...p, frete: e.target.value, transportadora: e.target.value !== 'FOB' ? '' : p.transportadora }))}>
                    <option value="">—</option>
                    <option value="CIF">CIF</option>
                    <option value="FOB">FOB</option>
                  </select>
                </div>
                {editSessaoForm.frete === 'FOB' && (
                  <div className={styles.field}>
                    <span className={styles.label}>Transportadora</span>
                    <input type="text" value={editSessaoForm.transportadora}
                      onChange={e => setEditSessaoForm(p => ({ ...p, transportadora: e.target.value }))}
                      placeholder="Nome da transportadora" />
                  </div>
                )}
                <div className={styles.field} style={{ minWidth: 200 }}>
                  <span className={styles.label}>Obs</span>
                  <input type="text" value={editSessaoForm.obs}
                    onChange={e => setEditSessaoForm(p => ({ ...p, obs: e.target.value }))}
                    placeholder="Observações" />
                </div>
              </div>
              <div className={styles.phaseActions} style={{ marginTop: '0.5rem' }}>
                <button className={styles.btnSecondary} onClick={() => setEditSessaoId(null)} disabled={savingEditSessao}>
                  Cancelar
                </button>
                <button className={styles.btnPrimary} onClick={() => handleSaveEditSessao(ses.id)} disabled={savingEditSessao}>
                  {savingEditSessao ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </div>
          )}

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
  const [view,            setView]            = useState('nova') // 'nova' | 'historico'
  const [recoveryData,    setRecoveryData]    = useState(null)
  const [recoveryInitial, setRecoveryInitial] = useState(null)

  useEffect(() => {
    Promise.all([
      window.api.segmentacoes.list(),
      window.api.fornecedores.list(),
      window.api.compradores.list(),
    ]).then(([s, f, c]) => { setSegs(s); setForns(f); setCompradores(c) })
  }, [])

  // Verifica se há sessão interrompida para recuperar
  useEffect(() => {
    if (!active?.id) return
    const key = `SC_RECOVERY_${active.id}`
    const saved = localStorage.getItem(key)
    if (!saved) { setRecoveryData(null); return }
    try {
      const data = JSON.parse(saved)
      window.api.sessoes.byId(data.sessao_id).then(sessaoDb => {
        if (!sessaoDb) { localStorage.removeItem(key); setRecoveryData(null); return }
        const visEnriquecidas = sessaoDb.visitas.map(v => ({
          id: v.visita_id,
          comprador_id:     v.comprador_id,
          comprador_nome:   v.comprador_nome,
          comprador_cnpj:   v.comprador_cnpj   ?? '',
          comprador_cidade: v.comprador_cidade  ?? '',
        }))
        setRecoveryData({ sessao: sessaoDb, visitas: visEnriquecidas, ...data })
      })
    } catch {
      localStorage.removeItem(key)
      setRecoveryData(null)
    }
  }, [active?.id])

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

  function handleRecover() {
    const { sessao, visitas, items, qtds, activeId, lojaIdx } = recoveryData
    setSessao(sessao)
    setVisitas(visitas)
    setRecoveryInitial({ items: items ?? [], qtds: qtds ?? {}, activeId: activeId ?? null, lojaIdx: lojaIdx ?? 0 })
    setRecoveryData(null)
    setPhase(2)
  }

  function handleDismissRecovery() {
    localStorage.removeItem(`SC_RECOVERY_${active.id}`)
    setRecoveryData(null)
  }

  function handleNovaSessao() {
    setSessao(null)
    setVisitas([])
    setPedidosFechados([])
    setRecoveryInitial(null)
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

      {view === 'nova' && phase === 1 && recoveryData && (
        <div className={styles.recoveryBanner}>
          <span>
            Sessão interrompida: <strong>{recoveryData.sessao.fornecedor_nome}</strong>
            {' '}em <strong>{fmtDate(recoveryData.sessao.data_visita)}</strong>. Deseja continuar de onde parou?
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button className={styles.btnPrimary} onClick={handleRecover}>Continuar</button>
            <button className={styles.btnSecondary} onClick={handleDismissRecovery}>Descartar</button>
          </div>
        </div>
      )}

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
          colId={active.id}
          colEstacao={active.estacao}
          onFechar={handleFechar}
          initialItems={recoveryInitial?.items ?? []}
          initialQtds={recoveryInitial?.qtds ?? {}}
          initialActiveId={recoveryInitial?.activeId ?? null}
          initialLojaIdx={recoveryInitial?.lojaIdx ?? 0}
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
