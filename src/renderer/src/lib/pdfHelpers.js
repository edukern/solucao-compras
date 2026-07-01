import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { GRADE_DEFINITIONS } from '../constants/grades'
import { fmtDate, esc } from './format'

export const PDF_STYLES = `
  body { font-family: Arial, sans-serif; font-size: 10px; color: #000; margin: 0; }
  .order { padding: 12px 14px; page-break-after: always; }
  .order:last-child { page-break-after: avoid; }

  /* Header */
  .ph { display:flex; gap:16px; border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:10px; }
  .ph-store { flex:1.5; min-width:0; }
  .ph-store-name { font-size:14px; font-weight:bold; line-height:1.3; margin-bottom:3px; }
  .ph-store-line { font-size:9px; margin-top:3px; }
  .ph-order { min-width:200px; max-width:240px; border-left:1.5px solid #ccc; padding-left:14px; font-size:9px; }
  .ph-sup { font-size:14px; font-weight:bold; letter-spacing:.05em; margin-bottom:6px; color:#222; }
  .ph-tbl { border-collapse:collapse; width:100%; }
  .ph-tbl td { padding:2px 4px; }
  .ph-tbl td:first-child { font-weight:bold; white-space:nowrap; padding-right:8px; }
  .ph-note { font-size:8px; color:#555; margin:5px 0 2px; font-style:italic; }
  .ph-credit { font-size:11px; font-weight:bold; margin-top:5px; }

  /* Products table */
  .pt { width:100%; border-collapse:collapse; font-size:9px; table-layout:fixed; margin-top:6px; }
  .pt th,.pt td { border:0.5px solid #bbb; padding:2px 3px; text-align:center; overflow:hidden; white-space:nowrap; }
  .pt th { background:#e0e0e0; font-weight:bold; font-size:8px; padding:3px; }
  .pt .cp { text-align:left; width:96px; font-size:9px; white-space:normal; }
  .pt .ct { width:22px; background:#f5f5f5; color:#555; font-size:8px; }
  .pt .cq { width:24px; }
  .pt .cq0 { color:#ccc; }
  .pt .cd { color:#ddd; font-size:8px; }
  .pt .cqt { width:32px; font-weight:bold; }
  .pt .cpr { width:46px; }
  .pt .ctot { width:66px; font-weight:bold; }
  .pt .cic { width:24px; font-size:8px; }
  .pt .crl { width:46px; }
  .pt .cvnd { width:46px; color:#1a7a3a; font-weight:bold; }
  .pt .cref { text-align:left; width:100px; font-size:9px; white-space:normal; overflow:visible; }
  .pt tbody tr { page-break-inside: avoid; break-inside: avoid; }
  .pt tfoot { page-break-inside: avoid; break-inside: avoid; }
  .pt tfoot td { font-weight:bold; background:#f0f0f0; border-top:1.5px solid #777; }
  .pt .tl { text-align:right; font-size:9px; }
  .pt .tv { text-align:right; font-size:10px; }
  .pt .tv-big { font-size:12px; font-weight:900; }

  @media print { @page { margin:10mm; size:A4 landscape; } }`

export function wrapDoc(ordersHtml, titulo) {
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

export const MESES_PT = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']
export const fmtEntrega = iso => {
  if (!iso) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [, m, d] = iso.split('-')
    return `${parseInt(d, 10)} DE ${MESES_PT[parseInt(m, 10) - 1]}`
  }
  return iso.toUpperCase()
}
export const fmtV = n => (n ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })


export function gerarHTMLOrdem(sessao, vis, visPedidos, isLast = true) {
  if (!visPedidos.length) return ''

  // ── totals ───────────────────────────────────────────────────────────────
  const totalBruto = visPedidos.reduce((s, p) => {
    const itens = p.itens ?? []
    const q = itens.reduce((s2, i) => s2 + i.qtd, 0)
    return s + q * (p.valor_unitario ?? 0)
  }, 0)
  const totalLiquido = visPedidos.reduce((s, p) => {
    const itens = p.itens ?? []
    const q = itens.reduce((s2, i) => s2 + i.qtd, 0)
    return s + q * (p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100)
  }, 0)
  const totalPecas = visPedidos.reduce((s, p) => s + (p.itens ?? []).reduce((s2, i) => s2 + i.qtd, 0), 0)
  const temDesconto = visPedidos.some(p => (p.desconto_pct ?? 0) > 0)
  const temICMS = pedidosOrdenados.some(p => (p.icms_pct ?? 0) > 0) || (sessao.icms_credito_pct != null && sessao.icms_credito_pct !== '')
  const temVenda = pedidosOrdenados.some(p => (p.preco_venda ?? 0) > 0)

  const pedidosOrdenados = visPedidos

  // ── active sizes: union of sizes that have qty > 0 in any product ────────
  const sizeOrder = []
  const sizeSet   = new Set()
  const sizeHasQty = new Set()
  for (const p of pedidosOrdenados) {
    const tipo_grade = p.tipo_grade ?? p.segmentacao?.tipo_grade ?? 'AD'
    const gradeTams  = GRADE_DEFINITIONS[tipo_grade]?.tamanhos ?? []
    const qtdMap     = Object.fromEntries((p.itens ?? []).map(i => [i.tamanho, i.qtd]))
    for (const tam of gradeTams) {
      if (!sizeSet.has(tam)) { sizeSet.add(tam); sizeOrder.push(tam) }
      if ((qtdMap[tam] ?? 0) > 0) sizeHasQty.add(tam)
    }
  }
  const activeSizes = sizeOrder.filter(t => sizeHasQty.has(t))

  // ── product rows ─────────────────────────────────────────────────────────
  const prodRows = pedidosOrdenados.map(p => {
    const itens = p.itens ?? []
    const tipo_produto = p.tipo_produto ?? p.segmentacao?.tipo_produto ?? ''
    const qtdMap       = Object.fromEntries(itens.map(i => [i.tamanho, i.qtd]))

    const cells = activeSizes.map(tam => {
      const q = qtdMap[tam] ?? 0
      return `<td class="ct">${esc(tam)}</td><td class="${q === 0 ? 'cq cq0' : 'cq'}">${q || '—'}</td>`
    })

    const totalQ = itens.reduce((s, i) => s + i.qtd, 0)
    const totalV = totalQ * (p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100)

    const refLabel = [p.referencia, p.cor, p.detalhe].filter(Boolean).join(' ')
    const classeLabel = [tipo_produto, p.classe ?? p.segmentacao?.classe ?? ''].filter(Boolean).join(' ')
    return `<tr>
      <td class="cref">${esc(refLabel)}</td>
      <td class="cp">${esc(classeLabel)}</td>
      ${cells.join('')}
      <td class="cqt">${totalQ || '—'}</td>
      <td class="cpr">${fmtV(p.valor_unitario ?? 0)}</td>
      <td class="ctot">${totalV > 0 ? fmtV(totalV) : '—'}</td>
      <td class="crl">${fmtV((p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100))}</td>
      ${temVenda ? `<td class="cvnd">${(p.preco_venda ?? 0) > 0 ? fmtV(p.preco_venda) : '—'}</td>` : ''}
      ${temICMS ? `<td class="cic">${(p.icms_pct ?? 0) > 0 ? p.icms_pct + '%' : '—'}</td>` : ''}
    </tr>`
  }).join('')

  // ── table header (only active sizes) ─────────────────────────────────────
  const headerPairs = activeSizes.map(() => '<th>T</th><th>Q</th>').join('')

  // ── store info (left) ────────────────────────────────────────────────────
  const storeHtml = `
    <div class="ph-store">
      <div class="ph-store-name">${esc(vis.comprador_nome)}</div>
      ${vis.comprador_cnpj     ? `<div class="ph-store-line">CNPJ: ${esc(vis.comprador_cnpj)}</div>` : ''}
      ${vis.comprador_fantasia ? `<div class="ph-store-line">Fantasia: ${esc(vis.comprador_fantasia)}${vis.comprador_ie ? `&nbsp;&nbsp;&nbsp;I.E.: ${esc(vis.comprador_ie)}` : ''}</div>` : ''}
      ${vis.comprador_email    ? `<div class="ph-store-line">e-mail: ${esc(vis.comprador_email)}</div>` : ''}
      ${vis.comprador_telefone ? `<div class="ph-store-line">${esc(vis.comprador_telefone)}</div>` : ''}
      ${vis.comprador_endereco
        ? `<div class="ph-store-line">End.: ${esc(vis.comprador_endereco)}</div>`
        : vis.comprador_cidade ? `<div class="ph-store-line">${esc(vis.comprador_cidade)}</div>` : ''}
    </div>`

  // ── order info (right) ───────────────────────────────────────────────────
  const suppName = esc(sessao.fornecedor_nome ?? sessao.fornecedor?.nome ?? '')
  const orderHtml = `
    <div class="ph-order">
      ${suppName ? `<div class="ph-sup">${suppName}</div>` : ''}
      <table class="ph-tbl">
        <tr><td>Data:</td><td>${fmtDate(sessao.data_visita)}</td></tr>
        ${sessao.data_entrega    ? `<tr><td>Entrega:</td><td>${fmtEntrega(sessao.data_entrega)}</td></tr>` : ''}
        ${sessao.cond_pag        ? `<tr><td>Cond. Pagt.:</td><td>${esc(sessao.cond_pag)}</td></tr>` : ''}
        ${sessao.frete           ? `<tr><td>Frete:</td><td>${esc(sessao.frete)}</td></tr>` : ''}
      </table>
      ${sessao.icms_credito_pct != null && sessao.icms_credito_pct !== ''
        ? `<div class="ph-note">Empresa de lucro presumido, precisa do crédito de ICMS</div>` : ''}
      <table class="ph-tbl" style="margin-top:4px;">
        ${sessao.vendedor        ? `<tr><td>Vendedor:</td><td>${esc(sessao.vendedor)}</td></tr>` : ''}
        ${sessao.contato         ? `<tr><td>Fone:</td><td>${esc(sessao.contato)}</td></tr>` : ''}
        ${sessao.transportadora  ? `<tr><td>Transp.:</td><td>${esc(sessao.transportadora)}</td></tr>` : ''}
      </table>
      ${sessao.icms_credito_pct != null && sessao.icms_credito_pct !== ''
        ? `<div class="ph-credit">Crédito: ${sessao.icms_credito_pct}%</div>` : ''}
    </div>`

  // ── footer totals: colspan dinâmico baseado em colunas ativas ───────────
  // ref + produto + (T+Q)*activeSizes + quant + preco = total label cols, depois ctot, depois crl + cvnd? + cic?
  const totalDesconto = totalBruto - totalLiquido
  const descontoPct = totalBruto > 0 ? Math.round((totalDesconto / totalBruto) * 100) : 0
  const footerLabelCols = 2 + activeSizes.length * 2 + 2
  const footerRightCols = 1 + (temVenda ? 1 : 0) + (temICMS ? 1 : 0)

  const footerRows = `
    <tr>
      <td class="tl" colspan="${footerLabelCols}">Total Bruto</td>
      <td class="tv">${fmtV(totalBruto)}</td>
      <td colspan="${footerRightCols}"></td>
    </tr>
    ${temDesconto ? `<tr>
      <td class="tl" colspan="${footerLabelCols}">Desconto ${descontoPct}%</td>
      <td class="tv" style="color:#b00;">- ${fmtV(totalDesconto)}</td>
      <td colspan="${footerRightCols}"></td>
    </tr>` : ''}
    <tr>
      <td class="tl" colspan="${footerLabelCols}">Total Liquido</td>
      <td class="tv tv-big">${fmtV(totalLiquido)}</td>
      <td colspan="${footerRightCols}" style="font-size:8px; text-align:right; color:#555;">${totalPecas} peças</td>
    </tr>`

  return `
    <div class="order"${isLast ? ' style="page-break-after:avoid;"' : ''}>
      <div class="ph">
        ${storeHtml}
        ${orderHtml}
      </div>
      <table class="pt">
        <thead>
          <tr>
            <th class="cref">Referência</th>
            <th class="cp">Produto</th>
            ${headerPairs}
            <th class="cqt">Quant</th>
            <th class="cpr">R$ un.</th>
            <th class="ctot">Total</th>
            <th class="crl">R$ Liq</th>
            ${temVenda ? '<th class="cvnd">R$ Venda</th>' : ''}
            ${temICMS ? '<th class="cic">ICMS%</th>' : ''}
          </tr>
        </thead>
        <tbody>${prodRows}</tbody>
        <tfoot>${footerRows}</tfoot>
      </table>
      ${sessao.obs ? `<div style="margin-top:6px;font-size:9px;"><strong>Obs.:</strong> ${esc(sessao.obs)}</div>` : ''}
    </div>`
}

export function gerarPDFSessao(sessao, visitas, pedidosPorVisita, lojaOverrides = {}) {
  const visitasComPedidos = visitas.filter(v => (pedidosPorVisita[v.id] ?? []).length > 0)
  if (!visitasComPedidos.length) { alert('Nenhum pedido para gerar PDF.'); return }

  const ordersHtml = visitasComPedidos.map((vis, idx) => {
    const ovr = lojaOverrides[vis.id]
    const sessaoVis = ovr ? { ...sessao, ...ovr } : sessao
    return gerarHTMLOrdem(sessaoVis, vis, pedidosPorVisita[vis.id] ?? [], idx === visitasComPedidos.length - 1)
  }).join('')
  const html = wrapDoc(ordersHtml, `Pedidos — ${esc(sessao.fornecedor_nome)} — ${fmtDate(sessao.data_visita)}`)

  const win = window.open('', '_blank')
  if (!win) { alert('Bloqueador de pop-ups ativo. Permita pop-ups para este site.'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}

export const FICHA_STYLES = `
  body { font-family: Arial, sans-serif; font-size: 10px; color: #000; margin: 0; }
  .ficha { padding: 12px 14px; page-break-after: always; }
  .ficha:last-child { page-break-after: avoid; }
  .fh { display:flex; gap:16px; border-bottom:2px solid #000; padding-bottom:8px; margin-bottom:8px; justify-content:space-between; }
  .fh-store { flex:1; }
  .fh-store-name { font-size:14px; font-weight:bold; margin-bottom:3px; }
  .fh-store-line { font-size:9px; }
  .fh-info { text-align:right; }
  .fh-forn { font-size:12px; font-weight:bold; margin-bottom:3px; }
  .fh-date { font-size:9px; }
  .ft-table { width:100%; border-collapse:collapse; font-size:9px; table-layout:fixed; margin-top:6px; }
  .ft-table th, .ft-table td { border:0.5px solid #bbb; padding:2px 3px; text-align:center; overflow:hidden; white-space:nowrap; }
  .ft-table th { background:#e0e0e0; font-weight:bold; font-size:8px; padding:3px; }
  .ft-table tbody tr { page-break-inside: avoid; break-inside: avoid; }
  .ft-table tfoot td { font-weight:bold; background:#f0f0f0; border-top:1.5px solid #777; }
  .fref { text-align:left; width:100px; font-size:9px; white-space:normal; overflow:visible; }
  .fprod { text-align:left; width:90px; font-size:9px; white-space:normal; }
  .ft { width:22px; background:#f5f5f5; color:#555; font-size:8px; }
  .fq { width:24px; }
  .fq0 { color:#ccc; }
  .fqt { width:32px; font-weight:bold; }
  .tl { text-align:right; font-size:9px; }
  @media print { @page { margin:10mm; size:A4 portrait; } }`

export function gerarHTMLFichaLoja(sessao, vis, visPedidos, isLast = true) {
  if (!visPedidos.length) return ''

  const sizeOrder = [], sizeSet = new Set(), sizeHasQty = new Set()
  for (const p of visPedidos) {
    const gradeTams = GRADE_DEFINITIONS[p.tipo_grade ?? 'AD']?.tamanhos ?? []
    const qtdMap = Object.fromEntries((p.itens ?? []).map(i => [i.tamanho, i.qtd]))
    for (const tam of gradeTams) {
      if (!sizeSet.has(tam)) { sizeSet.add(tam); sizeOrder.push(tam) }
      if ((qtdMap[tam] ?? 0) > 0) sizeHasQty.add(tam)
    }
  }
  const activeSizes = sizeOrder.filter(t => sizeHasQty.has(t))

  const fornNome = sessao.fornecedor_nome ?? sessao.fornecedor?.nome ?? ''
  const totalPecas = visPedidos.reduce((s, p) => s + (p.itens ?? []).reduce((s2, i) => s2 + i.qtd, 0), 0)

  const prodRows = visPedidos.map(p => {
    const qtdMap = Object.fromEntries((p.itens ?? []).map(i => [i.tamanho, i.qtd]))
    const totalQ = (p.itens ?? []).reduce((s, i) => s + i.qtd, 0)
    const refLabel = [p.referencia, p.cor, p.detalhe].filter(Boolean).join(' ')
    const prodLabel = [p.tipo_produto ?? '', p.classe ?? ''].filter(Boolean).join(' ')
    const cells = activeSizes.map(tam => {
      const q = qtdMap[tam] ?? 0
      return `<td class="ft">${esc(tam)}</td><td class="${q === 0 ? 'fq fq0' : 'fq'}">${q || '—'}</td>`
    })
    return `<tr>
      <td class="fref">${esc(refLabel)}</td>
      <td class="fprod">${esc(prodLabel)}</td>
      ${cells.join('')}
      <td class="fqt">${totalQ || '—'}</td>
    </tr>`
  }).join('')

  const headerPairs = activeSizes.map(() => '<th>T</th><th>Q</th>').join('')
  const footerCols = 2 + activeSizes.length * 2

  return `
    <div class="ficha"${isLast ? ' style="page-break-after:avoid;"' : ''}>
      <div class="fh">
        <div class="fh-store">
          <div class="fh-store-name">${esc(vis.comprador_nome)}</div>
          ${vis.comprador_cnpj ? `<div class="fh-store-line">CNPJ: ${esc(vis.comprador_cnpj)}</div>` : ''}
          ${vis.comprador_cidade ? `<div class="fh-store-line">${esc(vis.comprador_cidade)}</div>` : ''}
        </div>
        <div class="fh-info">
          <div class="fh-forn">${esc(fornNome)}</div>
          <div class="fh-date">Visita: ${fmtDate(sessao.data_visita)}</div>
          ${sessao.data_entrega ? `<div class="fh-date">Entrega: ${fmtEntrega(sessao.data_entrega)}</div>` : ''}
        </div>
      </div>
      <table class="ft-table">
        <thead>
          <tr>
            <th class="fref">Referência</th>
            <th class="fprod">Produto</th>
            ${headerPairs}
            <th class="fqt">Total</th>
          </tr>
        </thead>
        <tbody>${prodRows}</tbody>
        <tfoot>
          <tr>
            <td class="tl" colspan="${footerCols}">Total de peças</td>
            <td class="fqt">${totalPecas}</td>
          </tr>
        </tfoot>
      </table>
    </div>`
}

export function gerarFichasLojas(sessao, visitas, pedidosPorVisita) {
  const visitasComPedidos = visitas.filter(v => (pedidosPorVisita[v.id] ?? []).length > 0)
  if (!visitasComPedidos.length) { alert('Nenhum pedido para gerar fichas.'); return }

  const fichasHtml = visitasComPedidos.map((vis, idx) =>
    gerarHTMLFichaLoja(sessao, vis, pedidosPorVisita[vis.id] ?? [], idx === visitasComPedidos.length - 1)
  ).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Fichas — ${esc(sessao.fornecedor_nome ?? '')} — ${fmtDate(sessao.data_visita)}</title><style>${FICHA_STYLES}</style></head><body>${fichasHtml}</body></html>`
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) { URL.revokeObjectURL(url); alert('Bloqueador de pop-ups ativo. Permita pop-ups para este site.'); return }
  win.addEventListener('load', () => { win.print(); URL.revokeObjectURL(url) })
}

// DD-MM-AA a partir de YYYY-MM-DD
export const fmtDataPDF = iso => { const [y,m,d] = iso.split('-'); return `${d}-${m}-${y.slice(2)}` }

export async function salvarPDFVisita(sessao, vis, visPedidos, sessaoOverride = {}) {
  if (!visPedidos.length) return { ok: false }
  const sessaoFinal = Object.keys(sessaoOverride).length ? { ...sessao, ...sessaoOverride } : sessao

  const fornNome = sessaoFinal.fornecedor_nome ?? sessaoFinal.fornecedor?.nome ?? ''
  const forn = fornNome.replace(/[^a-zA-Z0-9À-ú ]/g, '').trim()
  const loja = (vis.comprador_nome ?? '').replace(/[^a-zA-Z0-9À-ú ]/g, '').trim()
  const data = (sessaoFinal.data_visita ?? '').replace(/-/g, '')
  const filename = `${forn} - ${loja} - ${data}.pdf`

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    // A4 portrait: 210 x 297 mm, margins 8mm each side → usable 194mm width
    const ML = 8, MR = 8, MT = 8
    const PW = 210 - ML - MR  // 194mm usable width
    const temICMS = visPedidos.some(p => (p.icms_pct ?? 0) > 0) || (sessaoFinal.icms_credito_pct != null && sessaoFinal.icms_credito_pct !== '')
    const temVenda = visPedidos.some(p => (p.preco_venda ?? 0) > 0)

    // ── HEADER ────────────────────────────────────────────────────────────
    let y = MT
    const colLeft  = PW * 0.58  // loja ocupa 58% da largura
    const colRight = PW * 0.42  // fornecedor/pedido ocupa 42%
    const xLeft  = ML
    const xRight = ML + colLeft + 4

    // Loja — nome
    doc.setFontSize(13).setFont('helvetica', 'bold')
    doc.text(vis.comprador_nome ?? '', xLeft, y)
    y += 5

    // Loja — linhas de info
    doc.setFontSize(8).setFont('helvetica', 'normal')
    const storeLines = [
      vis.comprador_cnpj     ? `CNPJ: ${vis.comprador_cnpj}` : null,
      vis.comprador_fantasia ? `Fantasia: ${vis.comprador_fantasia}${vis.comprador_ie ? `   I.E.: ${vis.comprador_ie}` : ''}` : null,
      vis.comprador_email    ? `e-mail: ${vis.comprador_email}` : null,
      vis.comprador_telefone ? vis.comprador_telefone : null,
      vis.comprador_endereco ? `End.: ${vis.comprador_endereco}` : (vis.comprador_cidade || null),
    ].filter(Boolean)
    for (const line of storeLines) {
      doc.text(line, xLeft, y)
      y += 4
    }

    // Fornecedor + dados do pedido (coluna direita)
    let yR = MT
    doc.setFontSize(13).setFont('helvetica', 'bold')
    doc.text(fornNome, xRight, yR)
    yR += 5

    doc.setFontSize(8).setFont('helvetica', 'normal')
    const orderLines = [
      ['Data:', fmtDate(sessaoFinal.data_visita)],
      sessaoFinal.data_entrega   ? ['Entrega:', fmtEntrega(sessaoFinal.data_entrega)]   : null,
      sessaoFinal.cond_pag       ? ['Cond. Pagt.:', sessaoFinal.cond_pag]               : null,
      sessaoFinal.frete          ? ['Frete:', sessaoFinal.frete]                        : null,
      sessaoFinal.vendedor       ? ['Vendedor:', sessaoFinal.vendedor]                  : null,
      sessaoFinal.contato        ? ['Fone:', sessaoFinal.contato]                       : null,
      sessaoFinal.transportadora ? ['Transp.:', sessaoFinal.transportadora]             : null,
    ].filter(Boolean)
    for (const [label, value] of orderLines) {
      doc.setFont('helvetica', 'bold').text(label, xRight, yR)
      doc.setFont('helvetica', 'normal').text(value, xRight + 22, yR)
      yR += 4
    }
    if (temICMS) {
      doc.setFont('helvetica', 'bold').setFontSize(9)
      doc.text(`Crédito ICMS: ${sessaoFinal.icms_credito_pct}%`, xRight, yR)
      yR += 4
    }

    // Linha separadora do header
    const headerBottom = Math.max(y, yR) + 2
    doc.setDrawColor(0).setLineWidth(0.5)
    doc.line(ML, headerBottom, ML + PW, headerBottom)
    const tableStart = headerBottom + 3

    // ── TABLE — agrupado por tipo_grade, uma coluna por tamanho ──────────
    const W_REF  = 24, W_PROD = 22, W_SZ = 11
    const W_QTOT = 10, W_PREC = 16, W_TOT = 18, W_RLIQ = 16, W_VEND = 16, W_ICMS = 10
    const fixedCols = W_REF + W_PROD + W_QTOT + W_PREC + W_TOT + W_RLIQ + (temVenda ? W_VEND : 0) + (temICMS ? W_ICMS : 0)
    const availForSizes = PW - fixedCols

    // Agrupar pedidos por tipo_grade preservando a ordem de entrada
    const gradeOrder = []
    const gradeGroups = {}
    for (const p of visPedidos) {
      const tg = p.tipo_grade ?? p.segmentacao?.tipo_grade ?? 'AD'
      if (!gradeGroups[tg]) { gradeGroups[tg] = []; gradeOrder.push(tg) }
      gradeGroups[tg].push(p)
    }

    function renderGrupo(grupoPedidos, startY) {
      // Tamanhos ativos só deste grupo
      const sizeOrder = [], sizeSet = new Set(), sizeHasQty = new Set()
      for (const p of grupoPedidos) {
        const tg = p.tipo_grade ?? p.segmentacao?.tipo_grade ?? 'AD'
        for (const tam of GRADE_DEFINITIONS[tg]?.tamanhos ?? []) {
          if (!sizeSet.has(tam)) { sizeSet.add(tam); sizeOrder.push(tam) }
          const qtdMap = Object.fromEntries((p.itens ?? []).map(i => [i.tamanho, i.qtd]))
          if ((qtdMap[tam] ?? 0) > 0) sizeHasQty.add(tam)
        }
      }
      const activeSizes = sizeOrder.filter(t => sizeHasQty.has(t))
      // Uma coluna por tamanho; comprimir se não couber
      const idealSz = activeSizes.length * W_SZ
      const wSZ = idealSz > availForSizes ? availForSizes / activeSizes.length : W_SZ

      // Cabeçalho: tamanho como nome da coluna
      const head = [[
        'Referência', 'Produto',
        ...activeSizes,
        'Qtd', 'R$ un.', 'Total', 'R$ Liq',
        ...(temVenda ? ['R$ Venda'] : []),
        ...(temICMS ? ['ICMS%'] : []),
      ]]

      const body = grupoPedidos.map(p => {
        const itens  = p.itens ?? []
        const qtdMap = Object.fromEntries(itens.map(i => [i.tamanho, i.qtd]))
        const totalQ = itens.reduce((s, i) => s + i.qtd, 0)
        const totalV = totalQ * (p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100)
        const tipo_produto = p.tipo_produto ?? p.segmentacao?.tipo_produto ?? ''
        const classe       = p.classe ?? p.segmentacao?.classe ?? ''
        return [
          [p.referencia, p.cor, p.detalhe].filter(Boolean).join(' '),
          [tipo_produto, classe].filter(Boolean).join(' '),
          ...activeSizes.map(t => (qtdMap[t] ?? 0) || '—'),
          totalQ || '—',
          fmtV(p.valor_unitario ?? 0),
          totalV > 0 ? fmtV(totalV) : '—',
          fmtV((p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100)),
          ...(temVenda ? [(p.preco_venda ?? 0) > 0 ? fmtV(p.preco_venda) : '—'] : []),
          ...(temICMS ? [(p.icms_pct ?? 0) > 0 ? `${p.icms_pct}%` : '—'] : []),
        ]
      })

      const totalBruto   = grupoPedidos.reduce((s, p) => s + (p.itens ?? []).reduce((s2, i) => s2 + i.qtd, 0) * (p.valor_unitario ?? 0), 0)
      const totalLiquido = grupoPedidos.reduce((s, p) => s + (p.itens ?? []).reduce((s2, i) => s2 + i.qtd, 0) * (p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100), 0)
      const totalPecas   = grupoPedidos.reduce((s, p) => s + (p.itens ?? []).reduce((s2, i) => s2 + i.qtd, 0), 0)
      const iTotal = 2 + activeSizes.length

      autoTable(doc, {
        startY,
        margin: { left: ML, right: MR },
        head,
        body,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1.5, overflow: 'hidden', halign: 'center' },
        headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold', fontSize: 7.5 },
        columnStyles: {
          0: { halign: 'left', cellWidth: W_REF },
          1: { halign: 'left', cellWidth: W_PROD },
          ...Object.fromEntries(activeSizes.map((_, i) => [
            2 + i, { cellWidth: wSZ, fontStyle: 'bold', fontSize: 9 },
          ])),
          [iTotal]:     { cellWidth: W_QTOT, fontStyle: 'bold' },
          [iTotal + 1]: { cellWidth: W_PREC, halign: 'right' },
          [iTotal + 2]: { cellWidth: W_TOT,  halign: 'right', fontStyle: 'bold' },
          [iTotal + 3]: { cellWidth: W_RLIQ, halign: 'right' },
          ...(temVenda ? { [iTotal + 4]: { cellWidth: W_VEND, halign: 'right', textColor: [26, 122, 58] } } : {}),
          ...(temICMS ? { [iTotal + (temVenda ? 5 : 4)]: { cellWidth: W_ICMS } } : {}),
        },
      })
      return { totalBruto, totalLiquido, totalPecas }
    }

    const multiGrade = gradeOrder.length > 1
    let nextY = tableStart
    let totalBrutoGeral = 0, totalLiquidoGeral = 0, totalPecasGeral = 0
    for (const tg of gradeOrder) {
      if (multiGrade) {
        doc.setFontSize(7).setFont('helvetica', 'bold').setTextColor(80, 80, 80)
        doc.text(`Grade: ${tg}`, ML, nextY + 3)
        doc.setTextColor(0)
        nextY += 5
      }
      const totals = renderGrupo(gradeGroups[tg], nextY)
      totalBrutoGeral += totals.totalBruto
      totalLiquidoGeral += totals.totalLiquido
      totalPecasGeral += totals.totalPecas
      nextY = doc.lastAutoTable.finalY + (multiGrade ? 4 : 0)
    }

    // Rodapé consolidado com totais de todas as grades
    const temDescontoGeral = totalBrutoGeral - totalLiquidoGeral > 0.001
    const totalDescontoGeral = totalBrutoGeral - totalLiquidoGeral
    const descontoPctGeral = totalBrutoGeral > 0 ? Math.round((totalDescontoGeral / totalBrutoGeral) * 100) : 0
    const footerSummary = [
      ['Total Bruto', fmtV(totalBrutoGeral)],
      ...(temDescontoGeral ? [[`Desconto ${descontoPctGeral}%`, `- ${fmtV(totalDescontoGeral)}`]] : []),
      [`Total Líquido — ${totalPecasGeral} peças`, fmtV(totalLiquidoGeral)],
    ]
    autoTable(doc, {
      startY: nextY + 2,
      margin: { left: ML + PW - 90, right: MR },
      body: footerSummary,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 1.5 },
      columnStyles: {
        0: { cellWidth: 55, halign: 'right' },
        1: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
      },
      didParseCell(data) {
        if (temDescontoGeral && data.row.index === 1) {
          data.cell.styles.textColor = [176, 0, 0]
        }
        if (data.row.index === footerSummary.length - 1) {
          data.cell.styles.fontStyle = 'bold'
          if (data.column.index === 1) data.cell.styles.fontSize = 9
        }
      },
    })

    // Obs
    if (sessaoFinal.obs) {
      const finalY = doc.lastAutoTable.finalY + 3
      doc.setFontSize(8).setFont('helvetica', 'normal')
      doc.text(`Obs.: ${sessaoFinal.obs}`, ML, finalY)
    }

    doc.save(filename)
    return { ok: true }
  } catch (err) {
    console.error('jspdf error:', err)
    alert(`Erro ao gerar PDF de ${vis.comprador_nome}: ${err.message}`)
    return { ok: false }
  }
}
