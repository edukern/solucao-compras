import { useState, useEffect } from 'react'
import styles from './Compras.module.css'
import { pedidos as pedidosService } from '../services/pedidos'
import { fornecedores as fornecedoresService } from '../services/fornecedores'
import { fmt, fmtDate } from '../lib/format'
import { gerarFichasLojas, salvarPDFVisita } from '../lib/pdfHelpers'

export function FecharSessao({ sessao, visitas, segs, pedidos: pedidosProp, onNovaSessao }) {
  const [salvandoPDF,   setSalvandoPDF]   = useState(null)
  const [salvos,        setSalvos]        = useState(new Set())
  const [erroPDF,       setErroPDF]       = useState(null)
  const [showPDFModal,  setShowPDFModal]  = useState(false)
  const [fornFull,      setFornFull]      = useState(null)
  const [modalFields,   setModalFields]   = useState({})
  const [lojaOverrides, setLojaOverrides] = useState({})
  const [showLojaConfig,setShowLojaConfig]= useState(false)
  // Pedidos com itens carregados do banco (pedidosProp vem do estado do Phase 2 sem itens completos)
  const [pedidos, setPedidos] = useState(pedidosProp)
  useEffect(() => {
    pedidosService.itensPorFornecedor(sessao.id).then(visitasData => {
      const flat = visitasData.flatMap(v =>
        (v.pedidos ?? []).map(p => ({ ...p, visita_id: v.id }))
      )
      if (flat.length) setPedidos(flat)
    }).catch(() => {})
  }, [sessao.id])

  // Returns only non-empty override fields for a given visita
  function buildVisitaOverride(visId) {
    const ovr = lojaOverrides[visId] ?? {}
    const out = {}
    if (ovr.cond_pag)        out.cond_pag       = ovr.cond_pag
    if (ovr.frete)           out.frete          = ovr.frete
    if (ovr.transportadora)  out.transportadora = ovr.transportadora
    if (ovr.obs)             out.obs            = ovr.obs
    return out
  }

  function setLojaField(visId, field, value) {
    setLojaOverrides(prev => ({
      ...prev,
      [visId]: { ...prev[visId], [field]: value }
    }))
  }

  const podeSalvarPDF = true
  const visitasComPedidos = visitas.filter(v =>
    pedidos.some(p => p.visita_id === v.id && (p.itens ?? []).some(i => i.qtd > 0))
  )
  const totalGeral = pedidos.reduce((s, p) => {
    const q = (p.itens ?? []).reduce((s2, i) => s2 + i.qtd, 0)
    return s + q * (p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100)
  }, 0)

  useEffect(() => {
    if (!sessao?.fornecedor_id) return
    fornecedoresService.getById(sessao.fornecedor_id).then(setFornFull).catch(() => {})
  }, [sessao?.fornecedor_id])

  function handleGerarPDFs() {
    setModalFields({
      contato:          fornFull?.contato          ?? '',
      vendedor:         sessao.vendedor            ?? '',
      cond_pag:         sessao.cond_pag            ?? '',
      frete:            sessao.frete               ?? '',
      icms_credito_pct: String(fornFull?.icms_credito_pct ?? ''),
      data_visita:      sessao.data_visita         ?? '',
      data_entrega:     sessao.data_entrega        ?? '',
      obs:              sessao.obs                 ?? '',
    })
    setShowPDFModal(true)
  }

  async function handleConfirmarPDF() {
    setShowPDFModal(false)
    if (fornFull) {
      const updates = {}
      if (modalFields.contato?.trim())         updates.contato        = modalFields.contato.trim()
      if (modalFields.vendedor?.trim())        updates.vendedor_padrao = modalFields.vendedor.trim()
      if (modalFields.cond_pag?.trim())        updates.cond_pag_padrao = modalFields.cond_pag.trim()
      if (modalFields.frete?.trim())           updates.frete_padrao   = modalFields.frete.trim()
      const icms = parseFloat(modalFields.icms_credito_pct)
      if (!isNaN(icms))                        updates.icms_credito_pct = icms
      if (Object.keys(updates).length) {
        fornecedoresService.update(fornFull.id, updates).catch(() => {})
      }
    }
    const pedMap = {}
    for (const p of pedidos) {
      if (!pedMap[p.visita_id]) pedMap[p.visita_id] = []
      pedMap[p.visita_id].push(p)
    }
    // Session-level fields from modal; per-store overrides (lojaOverrides) take precedence per store
    const sessaoComModal = {
      ...sessao,
      vendedor:     modalFields.vendedor,
      cond_pag:     modalFields.cond_pag,
      frete:        modalFields.frete,
      obs:          modalFields.obs,
      data_entrega: modalFields.data_entrega,
    }
    for (const vis of visitasComPedidos) {
      const visPedidos = pedMap[vis.id] ?? []
      if (!visPedidos.length) continue
      const ovr = buildVisitaOverride(vis.id)
      await salvarPDFVisita(sessaoComModal, vis, visPedidos, ovr)
    }
  }

  async function handleSalvarPDF(vis) {
    setErroPDF(null)
    const visPedidos = pedidos.filter(p => p.visita_id === vis.id)
    setSalvandoPDF(vis.id)
    try {
      const ovr = buildVisitaOverride(vis.id)
      const result = await salvarPDFVisita(sessao, vis, visPedidos, ovr)
      if (result?.ok) {
        if (Object.keys(ovr).length) pedidosService.updateVisita(vis.id, ovr).catch(() => {})
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
    const pendentes = visitasComPedidos.filter(v => !salvos.has(v.id))
    setSalvandoPDF('all')
    const results = await Promise.all(pendentes.map(async vis => {
      const visPedidos = pedidos.filter(p => p.visita_id === vis.id)
      const ovr = buildVisitaOverride(vis.id)
      try {
        const result = await salvarPDFVisita(sessao, vis, visPedidos, ovr)
        if (result?.ok) {
          if (Object.keys(ovr).length) pedidosService.updateVisita(vis.id, ovr).catch(() => {})
          return { visId: vis.id, ok: true }
        }
        return { visId: vis.id, ok: false, nome: vis.comprador_nome }
      } catch {
        return { visId: vis.id, ok: false, nome: vis.comprador_nome }
      }
    }))
    const salvosNovos = results.filter(r => r.ok).map(r => r.visId)
    if (salvosNovos.length) setSalvos(prev => new Set([...prev, ...salvosNovos]))
    const erros = results.filter(r => !r.ok).map(r => r.nome)
    if (erros.length) setErroPDF(`Erro ao salvar PDF de: ${erros.join(', ')}`)
    setSalvandoPDF(null)
  }

  function handleFichasLojas() {
    const pedMap = {}
    for (const p of pedidos) {
      if (!pedMap[p.visita_id]) pedMap[p.visita_id] = []
      pedMap[p.visita_id].push(p)
    }
    gerarFichasLojas(sessao, visitas, pedMap)
  }

  return (
    <div className={styles.phase}>
      {showPDFModal && (
        <div className={styles.pdfModalBackdrop} onClick={() => setShowPDFModal(false)}>
          <div className={styles.pdfModalDialog} onClick={e => e.stopPropagation()}>
            <div className={styles.pdfModalTitle}>
              Confirmar pedido — {sessao.fornecedor_nome ?? fornFull?.nome ?? ''}
            </div>

            <div className={styles.pdfModalSection}>
              <div className={styles.pdfModalSectionTitle}>Fornecedor</div>
              <div className={styles.pdfModalGrid}>
                <div className={styles.pdfModalField}>
                  <label>Telefone / Contato</label>
                  <input type="text" value={modalFields.contato ?? ''}
                    onChange={e => setModalFields(p => ({ ...p, contato: e.target.value }))} />
                </div>
                <div className={styles.pdfModalField}>
                  <label>ICMS Crédito (%)</label>
                  <input type="number" step="0.01" min="0" max="100" value={modalFields.icms_credito_pct ?? ''}
                    onChange={e => setModalFields(p => ({ ...p, icms_credito_pct: e.target.value }))}
                    placeholder="Ex: 12" />
                </div>
                <div className={styles.pdfModalField}>
                  <label>Vendedor</label>
                  <input type="text" value={modalFields.vendedor ?? ''}
                    onChange={e => setModalFields(p => ({ ...p, vendedor: e.target.value }))} />
                </div>
                <div className={styles.pdfModalField}>
                  <label>Cond. Pagamento</label>
                  <input type="text" value={modalFields.cond_pag ?? ''}
                    onChange={e => setModalFields(p => ({ ...p, cond_pag: e.target.value }))} />
                </div>
                <div className={styles.pdfModalField}>
                  <label>Frete</label>
                  <select value={modalFields.frete ?? ''}
                    onChange={e => setModalFields(p => ({ ...p, frete: e.target.value }))}>
                    <option value="">—</option>
                    <option value="CIF">CIF</option>
                    <option value="FOB">FOB</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.pdfModalSection}>
              <div className={styles.pdfModalSectionTitle}>Sessão</div>
              <div className={styles.pdfModalGrid}>
                <div className={styles.pdfModalField}>
                  <label>Data da visita</label>
                  <input type="date" value={modalFields.data_visita ?? ''}
                    onChange={e => setModalFields(p => ({ ...p, data_visita: e.target.value }))} />
                </div>
                <div className={styles.pdfModalField}>
                  <label>Data de entrega</label>
                  <input type="date" value={modalFields.data_entrega ?? ''}
                    onChange={e => setModalFields(p => ({ ...p, data_entrega: e.target.value }))} />
                </div>
                <div className={styles.pdfModalField} style={{ gridColumn: '1 / -1' }}>
                  <label>Obs.</label>
                  <input type="text" value={modalFields.obs ?? ''}
                    onChange={e => setModalFields(p => ({ ...p, obs: e.target.value }))}
                    placeholder="Observações" />
                </div>
              </div>
            </div>

            <div className={styles.pdfModalActions}>
              <button className={styles.btnSecondary} onClick={() => setShowPDFModal(false)}>
                Cancelar
              </button>
              <button className={styles.btnPrimary} onClick={handleConfirmarPDF}>
                Confirmar e Gerar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.visitaBanner}>
        <strong>{sessao.fornecedor?.nome || sessao.fornecedor_nome}</strong>
        <span className={styles.dot}>·</span>
        <span>{fmtDate(sessao.data_visita)}</span>
        <span className={styles.dot}>·</span>
        <span>{pedidos.filter(p => (p.itens ?? []).some(i => i.qtd > 0)).length} pedido(s) · {visitasComPedidos.length} loja(s)</span>
      </div>

      <h2 className={styles.phaseTitle}>Fase 3 — Resumo da Sessão</h2>

      {erroPDF && <div className={styles.errorBanner}>{erroPDF}</div>}

      {/* ── Per-store frete/cond_pag config ── */}
      <div className={styles.lojaConfigWrap}>
        <div className={styles.lojaConfigBar}>
          <span className={styles.lojaConfigLabel}>Condições padrão:</span>
          <span className={styles.lojaConfigDefaults}>
            {sessao.cond_pag || '—'} · Frete {sessao.frete || '—'}
          </span>
          <button
            className={styles.lojaConfigToggleBtn}
            onClick={() => setShowLojaConfig(s => !s)}
          >
            {showLojaConfig ? '▲ Ocultar' : '▼ Personalizar por loja'}
          </button>
        </div>
        {showLojaConfig && (
          <div className={styles.lojaConfigTable}>
            <div className={styles.lojaConfigHead}>
              <div className={styles.lcLojaCell}>Loja</div>
              <div className={styles.lcFieldCell}>Cond. Pagamento</div>
              <div className={styles.lcFieldCell}>Frete</div>
              <div className={styles.lcFieldCell}>Transportadora</div>
              <div className={styles.lcFieldCell} style={{ flex: 2 }}>OBS (por loja)</div>
            </div>
            {visitasComPedidos.map(vis => {
              const ovr = lojaOverrides[vis.id] ?? {}
              const effectiveFrete = ovr.frete || sessao.frete
              return (
                <div key={vis.id} className={styles.lojaConfigRow}>
                  <div className={styles.lcLojaCell}>{vis.comprador_nome}</div>
                  <div className={styles.lcFieldCell}>
                    <input
                      type="text"
                      className={styles.lcInput}
                      placeholder={sessao.cond_pag || '—'}
                      value={ovr.cond_pag ?? ''}
                      onChange={e => setLojaField(vis.id, 'cond_pag', e.target.value)}
                    />
                  </div>
                  <div className={styles.lcFieldCell}>
                    <select
                      className={styles.lcSelect}
                      value={ovr.frete ?? ''}
                      onChange={e => {
                        setLojaField(vis.id, 'frete', e.target.value)
                        if (e.target.value !== 'FOB') setLojaField(vis.id, 'transportadora', '')
                      }}
                    >
                      <option value="">— padrão ({sessao.frete || '—'})</option>
                      <option value="CIF">CIF</option>
                      <option value="FOB">FOB</option>
                    </select>
                  </div>
                  <div className={styles.lcFieldCell}>
                    <input
                      type="text"
                      className={styles.lcInput}
                      placeholder={sessao.transportadora || '—'}
                      value={ovr.transportadora ?? ''}
                      disabled={effectiveFrete !== 'FOB'}
                      onChange={e => setLojaField(vis.id, 'transportadora', e.target.value)}
                    />
                  </div>
                  <div className={styles.lcFieldCell} style={{ flex: 2 }}>
                    <input
                      type="text"
                      className={styles.lcInput}
                      placeholder={sessao.obs || 'Obs. específica desta loja'}
                      value={ovr.obs ?? ''}
                      onChange={e => setLojaField(vis.id, 'obs', e.target.value)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className={styles.phaseActions} style={{ marginBottom: '1rem' }}>
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
                : `↓ PDFs Fornecedor (${visitasComPedidos.length - salvos.size})`}
          </button>
        )}
        <button className={styles.btnPrimary} onClick={handleGerarPDFs}>
          Imprimir Fornecedor ({visitasComPedidos.length})
        </button>
        <button className={styles.btnSecondary} onClick={handleFichasLojas} disabled={visitasComPedidos.length === 0}>
          Fichas das Lojas ({visitasComPedidos.length})
        </button>
      </div>

      <table className={styles.resumoTable}>
        <thead>
          <tr>
            <th className={styles.resumoThLoja}>Loja</th>
            <th className={styles.resumoTh}>Peças</th>
            <th className={styles.resumoTh}>Valor Total</th>
            {podeSalvarPDF && <th className={styles.resumoTh}>PDF</th>}
          </tr>
        </thead>
        <tbody>
          {visitasComPedidos.map(vis => {
            const visPedidos = pedidos.filter(p => p.visita_id === vis.id)
            const totalPecas = visPedidos.reduce((s, p) => s + (p.itens ?? []).reduce((s2, i) => s2 + i.qtd, 0), 0)
            const totalComp  = visPedidos.reduce((s, p) => {
              const q = (p.itens ?? []).reduce((s2, i) => s2 + i.qtd, 0)
              return s + q * (p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100)
            }, 0)
            const foiSalvo = salvos.has(vis.id)
            return (
              <tr key={vis.id}>
                <td className={styles.resumoTdLoja}>{vis.comprador_nome}</td>
                <td className={styles.resumoTd}><strong>{totalPecas.toLocaleString('pt-BR')}</strong></td>
                <td className={styles.resumoTd}>R$ {fmt(totalComp)}</td>
                {podeSalvarPDF && (
                  <td className={styles.resumoTd}>
                    <button
                      className={foiSalvo ? styles.btnSecondary : styles.btnPdf}
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.78rem' }}
                      onClick={() => handleSalvarPDF(vis)}
                      disabled={salvandoPDF !== null}
                    >
                      {salvandoPDF === vis.id ? 'Salvando…' : foiSalvo ? '✓ Salvo' : '↓ PDF'}
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td className={styles.resumoTdLoja}><strong>Total geral</strong></td>
            <td className={styles.resumoTd}><strong>{visitasComPedidos.reduce((s, vis) => s + pedidos.filter(p => p.visita_id === vis.id).reduce((s2, p) => s2 + (p.itens ?? []).reduce((s3, i) => s3 + i.qtd, 0), 0), 0).toLocaleString('pt-BR')}</strong></td>
            <td className={styles.resumoTd}><strong>R$ {fmt(totalGeral)}</strong></td>
            {podeSalvarPDF && <td />}
          </tr>
        </tfoot>
      </table>

    </div>
  )
}
