import { useState, useEffect } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { useAuth } from '../contexts/AuthContext'
import { aggregateSegmentacao, aggregateDashboard } from '../utils/dashboard'
import { tamanhosDeTipoGrade, GRADE_DEFINITIONS } from '../constants/grades'
import { dashboard as dashboardService } from '../services/dashboard'
import { compradores as compradoresService } from '../services/compradores'
import styles from './Dashboard.module.css'

const fmt = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = iso => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y.slice(2)}`
}
const esc = s => (s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
const fmtV = n => (n ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const COLAB_STYLES = `
  body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; color: #222; }
  h2 { font-size: 13px; margin: 0 0 2px; }
  .sub { font-size: 9px; color: #555; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed; }
  th, td { border: 0.5px solid #bbb; padding: 2px 3px; text-align: center; overflow: hidden; white-space: nowrap; }
  th { background: #e0e0e0; font-weight: bold; font-size: 8px; }
  .cref { text-align: left; width: 100px; white-space: normal; overflow: visible; }
  .cp   { text-align: left; width: 90px; white-space: normal; }
  .ct   { width: 22px; background: #f5f5f5; color: #555; font-size: 8px; }
  .cq   { width: 24px; }
  .cq0  { color: #ccc; }
  .cqt  { width: 32px; font-weight: bold; }
  .cpv  { width: 60px; font-weight: bold; color: #1a5c1a; }
  tr { page-break-inside: avoid; break-inside: avoid; }
  @media print { @page { margin: 10mm; size: A4 landscape; } }`

function gerarHTMLColaborador(sessao, visita, pedidos) {
  if (!pedidos.length) return ''

  const sizeOrder  = []
  const sizeSet    = new Set()
  const sizeHasQty = new Set()
  for (const p of pedidos) {
    const gradeTams = GRADE_DEFINITIONS[p.tipo_grade]?.tamanhos ?? []
    const qtdMap    = Object.fromEntries((p.pedido_itens ?? []).map(i => [i.tamanho, i.qtd]))
    for (const tam of gradeTams) {
      if (!sizeSet.has(tam)) { sizeSet.add(tam); sizeOrder.push(tam) }
      if ((qtdMap[tam] ?? 0) > 0) sizeHasQty.add(tam)
    }
  }
  const activeSizes = sizeOrder.filter(t => sizeHasQty.has(t))
  const headerPairs = activeSizes.map(t => `<th class="ct">${esc(t)}</th><th class="cq">Q</th>`).join('')

  const rows = pedidos.map(p => {
    const qtdMap  = Object.fromEntries((p.pedido_itens ?? []).map(i => [i.tamanho, i.qtd]))
    const cells   = activeSizes.map(tam => {
      const q = qtdMap[tam] ?? 0
      return `<td class="ct">${esc(tam)}</td><td class="${q === 0 ? 'cq cq0' : 'cq'}">${q || '—'}</td>`
    }).join('')
    const totalQ   = (p.pedido_itens ?? []).reduce((s, i) => s + i.qtd, 0)
    const refLabel = [p.referencia, p.cor, p.detalhe].filter(Boolean).join(' ')
    const cls      = [p.tipo_produto, p.classe].filter(Boolean).join(' ')
    const pv       = parseFloat(p.preco_venda) || 0
    return `<tr>
      <td class="cref">${esc(refLabel)}</td>
      <td class="cp">${esc(cls)}</td>
      ${cells}
      <td class="cqt">${totalQ || '—'}</td>
      <td class="cpv">${pv > 0 ? `R$ ${fmtV(pv)}` : '—'}</td>
    </tr>`
  }).join('')

  const fornNome = sessao.fornecedor?.nome || sessao.fornecedor_nome || ''

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Cadastro — ${esc(fornNome)}</title>
    <style>${COLAB_STYLES}</style></head>
    <body onload="window.print()">
    <h2>${esc(visita.comprador_nome ?? '')}</h2>
    <div class="sub">Fornecedor: ${esc(fornNome)} &nbsp;·&nbsp; Data: ${fmtDate(sessao.data_visita)}</div>
    <table>
      <thead><tr>
        <th class="cref">Referência</th>
        <th class="cp">Produto</th>
        ${headerPairs}
        <th class="cqt">Total</th>
        <th class="cpv">R$ Venda</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </body></html>`
}

async function abrirPDFColaboradores(sessaoId, compradorId) {
  const { sessao, visita, pedidos } = await dashboardService.pedidosColaborador(sessaoId, compradorId)
  const html = gerarHTMLColaborador(sessao, visita, pedidos)
  if (!html) { alert('Nenhum pedido encontrado para esta loja.'); return }
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardLabel}>{label}</div>
      <div className={styles.cardValue} style={{ color }}>{value}</div>
      {sub && <div className={styles.cardSub}>{sub}</div>}
    </div>
  )
}

function QuickLink({ icon, label, onClick }) {
  return (
    <button className={styles.quickLink} onClick={onClick}>
      <span className={styles.quickIcon}>{icon}</span>
      <span className={styles.quickLabel}>{label}</span>
    </button>
  )
}

export default function Dashboard({ onNavigate }) {
  const { active } = useCollection()
  const { comprador } = useAuth()

  const [compradores,    setCompradores]    = useState([])
  const [lojaId,         setLojaId]         = useState(undefined) // undefined = ainda carregando default
  const [sessoes,        setSessoes]        = useState([])
  const [loading,        setLoading]        = useState(false)
  const [pdfLoading,     setPdfLoading]     = useState(null) // sessaoId sendo gerado

  // Carrega lista de compradores uma vez
  useEffect(() => {
    compradoresService.list().then(setCompradores)
  }, [])

  // Define loja padrão quando compradores e comprador logado estiverem disponíveis
  useEffect(() => {
    if (lojaId !== undefined) return // já foi definido
    if (compradores.length === 0) return // ainda carregando compradores
    if (comprador === undefined) return  // auth ainda carregando — aguarda
    const defaultId = comprador?.id ?? null
    setLojaId(defaultId)
  }, [compradores, comprador])

  // Carrega dados sempre que coleção ou loja selecionada mudam
  useEffect(() => {
    if (!active || lojaId === undefined) return
    setLoading(true)
    dashboardService.sessoesPorLoja(active.id, lojaId)
      .then(setSessoes)
      .catch(() => setSessoes([]))
      .finally(() => setLoading(false))
  }, [active?.id, lojaId])

  if (!active) {
    return (
      <div className={styles.empty}>
        <span>Nenhuma coleção encontrada.</span>
        <span>Crie uma coleção nas configurações para começar.</span>
      </div>
    )
  }

  const totalSessoes = sessoes.length
  const totalPecas   = sessoes.reduce((s, r) => s + r.pecas, 0)
  const totalValor   = sessoes.reduce((s, r) => s + r.valor, 0)

  const lojaAtual = compradores.find(c => c.id === lojaId)
  const selectorLabel = lojaId ? (lojaAtual?.nome ?? '…') : 'Todas as lojas'

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <h1 className={styles.title}>Visão Geral</h1>
      </div>

      {/* Seletor de loja — contexto principal da página */}
      <div className={styles.lojaBar}>
        <span className={styles.lojaBarLabel}>Loja</span>
        <select
          className={styles.lojaSelect}
          value={lojaId ?? ''}
          onChange={e => setLojaId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Todas as lojas</option>
          {compradores.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      {/* Cards de resumo */}
      <div className={styles.cards}>
        <MetricCard label="Sessões"       value={totalSessoes}                          color="var(--accent-light)" />
        <MetricCard label="Total de peças" value={totalPecas.toLocaleString('pt-BR')}  sub="peças"    color="var(--green)"  />
        <MetricCard label="Total em pedidos" value={`R$ ${fmt(totalValor)}`}            color="var(--green)" />
      </div>

      {/* Links rápidos */}
      <div className={styles.quickLinks}>
        <QuickLink icon="🎯" label="Planejamento" onClick={() => onNavigate('planejamento')} />
        <QuickLink icon="📊" label="Relatórios"   onClick={() => onNavigate('relatorios')}   />
        <QuickLink icon="🛍️" label="Compras"      onClick={() => onNavigate('compras')}      />
        <QuickLink icon="📈" label="Histórico"    onClick={() => onNavigate('historico')}    />
      </div>

      {/* Tabela de sessões */}
      <div className={styles.tableBox}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th>Data</th>
              <th>Vendedor</th>
              <th>Peças</th>
              <th>Valor</th>
              {lojaId && <th></th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={lojaId ? 6 : 5} className={styles.emptyRow}>Carregando…</td></tr>
            )}
            {!loading && sessoes.length === 0 && (
              <tr><td colSpan={lojaId ? 6 : 5} className={styles.emptyRow}>
                {lojaId
                  ? 'Nenhuma sessão encontrada para esta loja na coleção ativa.'
                  : 'Nenhuma sessão encontrada nesta coleção.'}
              </td></tr>
            )}
            {!loading && sessoes.map(s => (
              <tr key={s.id}>
                <td className={styles.fornCell}>{s.fornecedor_nome}</td>
                <td className={styles.dateCell}>{fmtDate(s.data_visita)}</td>
                <td className={styles.vendCell}>{s.vendedor || <span className={styles.muted}>—</span>}</td>
                <td className={styles.numCell}><strong>{s.pecas.toLocaleString('pt-BR')}</strong></td>
                <td className={styles.numCell}>R$ {fmt(s.valor)}</td>
                {lojaId && (
                  <td className={styles.numCell}>
                    <button
                      className={styles.btnPdf}
                      disabled={pdfLoading === s.id}
                      onClick={async () => {
                        setPdfLoading(s.id)
                        try { await abrirPDFColaboradores(s.id, lojaId) }
                        catch { alert('Erro ao gerar PDF.') }
                        finally { setPdfLoading(null) }
                      }}
                    >
                      {pdfLoading === s.id ? '…' : 'PDF cadastro'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {!loading && sessoes.length > 1 && (
            <tfoot>
              <tr>
                <td colSpan={3} className={styles.footLabel}>Total</td>
                <td className={styles.numCell}><strong>{totalPecas.toLocaleString('pt-BR')}</strong></td>
                <td className={styles.numCell}><strong>R$ {fmt(totalValor)}</strong></td>
                {lojaId && <td />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
