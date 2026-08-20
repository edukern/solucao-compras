import { useState, useEffect } from 'react'
import { tamanhosDeTipoGrade } from '../constants/grades'
import styles from './Compras.module.css'
import { supabase } from '../lib/supabase'
import { sessoes as sessoesService } from '../services/sessoes'
import { pedidos as pedidosService } from '../services/pedidos'
import SaveStatus from '../components/SaveStatus'
import { fmt, fmtDate, PLUS_SIZE_DEFAULT } from '../lib/format'

export function PreencherMinhaLoja({ sessaoId, visitaId, compradorNome, colEstacao, onBack }) {
  const [sessao,       setSessao]       = useState(null)
  const [pedidos,      setPedidos]      = useState([])
  const [qtds,         setQtds]         = useState({}) // { [pedido_id]: { [tamanho]: qty } }
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [error,        setError]        = useState(null)
  const [otherDevices, setOtherDevices] = useState(0)
  const [visibleUpTo,  setVisibleUpTo]  = useState({}) // { [pedido_id]: maxVisibleIdx }

  // Estado único para o indicador de salvamento (Salvando… / ✓ Salvo / ⚠ Falha)
  const saveState5 = saving ? 'saving' : error ? 'error' : saved ? 'saved' : 'idle'

  // Presence: detect other devices editing same session
  useEffect(() => {
    if (!sessaoId) return
    let deviceId = localStorage.getItem('SC_DEVICE_ID')
    if (!deviceId) {
      deviceId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
      localStorage.setItem('SC_DEVICE_ID', deviceId)
    }
    let channel
    try {
      channel = supabase.channel(`session-presence-${sessaoId}`, {
        config: { presence: { key: deviceId } }
      })
      channel.on('presence', { event: 'sync' }, () => {
        try { setOtherDevices(Math.max(0, Object.keys(channel.presenceState()).length - 1)) } catch (_) {}
      })
      channel.subscribe(async status => {
        try { if (status === 'SUBSCRIBED') await channel.track({ at: new Date().toISOString() }) } catch (_) {}
      })
    } catch (e) {
      console.warn('Realtime presence indisponível:', e?.message)
    }
    return () => {
      if (channel) { try { supabase.removeChannel(channel) } catch (_) {} }
    }
  }, [sessaoId])

  // Load session + this store's pedidos
  useEffect(() => {
    let cancelled = false
    Promise.all([
      sessoesService.byId(sessaoId),
      pedidosService.byVisita(visitaId),
    ]).then(([ses, peds]) => {
      if (cancelled) return
      setSessao(ses)
      const pedList = peds ?? []
      setPedidos(pedList)
      // Seed local qtds from existing pedido_itens
      const init = {}
      for (const ped of pedList) {
        init[ped.id] = {}
        for (const it of ped.itens ?? []) {
          if (it.qtd > 0) init[ped.id][it.tamanho] = it.qtd
        }
      }
      setQtds(init)
      // Auto-expand visibleUpTo for pedidos that already have data beyond default
      const initVis = {}
      for (const ped of pedList) {
        const tams5 = tamanhosDeTipoGrade(ped.segmentacao?.tipo_grade || ped.tipo_grade || '')
        if (tams5.length <= PLUS_SIZE_DEFAULT) continue
        let maxIdx = PLUS_SIZE_DEFAULT - 1
        for (let i = PLUS_SIZE_DEFAULT; i < tams5.length; i++) {
          if ((init[ped.id]?.[tams5[i]] || 0) > 0) maxIdx = i
        }
        if (maxIdx > PLUS_SIZE_DEFAULT - 1) initVis[ped.id] = maxIdx
      }
      if (Object.keys(initVis).length > 0) setVisibleUpTo(initVis)
      setLoading(false)
    }).catch(e => { if (!cancelled) { setError(e.message); setLoading(false) } })
    return () => { cancelled = true }
  }, [sessaoId, visitaId])

  function getQtd(pedId, tam) { return qtds[pedId]?.[tam] ?? '' }

  function setQtd(pedId, tam, raw) {
    setSaved(false)
    const val = raw === '' ? '' : Math.max(0, parseInt(raw, 10) || 0)
    setQtds(prev => ({ ...prev, [pedId]: { ...prev[pedId], [tam]: val } }))
  }

  async function handleSalvar() {
    setSaving(true)
    setError(null)
    try {
      const updates = pedidos
        .filter(ped => ped.segmentacao_id && ped.referencia)
        .map(ped => ({
            segmentacao_id: ped.segmentacao_id,
            valor_unitario: ped.valor_unitario ?? 0,
            desconto_pct:   ped.desconto_pct   ?? 0,
            icms_pct:       ped.icms_pct        ?? 0,
            markup_pct:     ped.markup_pct      ?? 0,
            preco_venda:    ped.preco_venda     ?? 0,
            referencia:     ped.referencia      || '',
            cor:            ped.cor             || '',
            detalhe:        ped.detalhe         || '',
            obs:            ped.obs             || '',
            // Salva TODAS as chaves com qtd>0 do estado local, não só as da grade canônica —
            // se o coordenador adicionou um tamanho extra pontual nesta sessão (fora da grade
            // padrão), filtrar por tams aqui apagaria essa quantidade ao salvar.
            itens: Object.entries(qtds[ped.id] ?? {})
              .map(([t, v]) => ({ tamanho: t, qtd: parseInt(v) || 0 }))
              .filter(i => i.qtd > 0),
          }))
      await pedidosService.salvarPedidosVisita(visitaId, updates)
      setSaved(true)
    } catch (e) {
      setError(`Erro ao salvar: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Soma por todas as chaves realmente lançadas (não só a grade canônica), senão um
  // tamanho extra fica fora do total mostrado embora já esteja salvo/lançado.
  function totalPedido(pedId) {
    return Object.values(qtds[pedId] ?? {}).reduce((a, v) => a + (parseInt(v) || 0), 0)
  }
  const totalPcs   = pedidos.reduce((s, ped) => s + totalPedido(ped.id), 0)
  const totalValor = pedidos.reduce((s, ped) => s + totalPedido(ped.id) * (ped.valor_unitario || 0), 0)

  return (
    <div className={styles.phase}>
      {otherDevices > 0 && (
        <div className={styles.multiDeviceWarn}>
          ⚠️ Esta sessão está aberta em {otherDevices} outro{otherDevices > 1 ? 's' : ''} dispositivo{otherDevices > 1 ? 's' : ''}.
        </div>
      )}

      <div className={styles.viewOnlyHeader}>
        <button className={styles.btnBack} onClick={onBack}>← Voltar</button>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <SaveStatus state={saveState5} onRetry={error ? handleSalvar : undefined} />
          <button className={styles.btnPrimary} onClick={handleSalvar} disabled={saving || pedidos.length === 0}>
            {saving ? 'Salvando…' : 'Salvar pedido'}
          </button>
        </div>
      </div>

      {sessao && (
        <div className={styles.visitaBanner}>
          <strong>{sessao.fornecedor?.nome || sessao.fornecedor_nome}</strong>
          <span className={styles.dot}>·</span>
          <span>{fmtDate(sessao.data_visita)}</span>
          {sessao.cond_pag && <><span className={styles.dot}>·</span><span>{sessao.cond_pag}</span></>}
          <span className={styles.dot}>·</span>
          <strong className={styles.preencherLojaName}>{compradorNome}</strong>
          <span className={styles.viewOnlyBadge}>Preenchimento colaborativo</span>
        </div>
      )}

      {error && <div className={styles.errorBanner}>{error}</div>}
      {loading && <p className={styles.muted}>Carregando itens…</p>}

      {!loading && pedidos.length === 0 && (
        <div className={styles.preencherWaiting}>
          ⏳ Aguardando o coordenador liberar os itens para preenchimento.
          <br />
          <span className={styles.preencherWaitingSub}>Quando ele clicar em "⇢ Liberar para preenchimento", os itens aparecerão aqui.</span>
        </div>
      )}

      {pedidos.map((ped, pedIdx) => {
        const tipoGrade = ped.segmentacao?.tipo_grade || ped.tipo_grade || ''
        const tams = tamanhosDeTipoGrade(tipoGrade)
        const total = totalPedido(ped.id)
        const valor = parseFloat(ped.valor_unitario) || 0
        const maxIdx5 = tams.length > PLUS_SIZE_DEFAULT ? (visibleUpTo[ped.id] ?? PLUS_SIZE_DEFAULT - 1) : tams.length - 1
        // Tamanho(s) fora da grade canônica com qtd>0 já salva (ex.: extra adicionado pelo
        // coordenador em RegistrarPedidoSessao) — sempre visíveis, senão a loja não consegue
        // nem ver nem editar essa quantidade aqui.
        const extrasPed = Object.keys(qtds[ped.id] ?? {}).filter(t => !tams.includes(t))
        const visibleTams5 = [...tams.slice(0, maxIdx5 + 1), ...extrasPed]
        const nextTam5 = maxIdx5 + 1 < tams.length ? tams[maxIdx5 + 1] : null
        return (
          <div key={ped.id} className={`${styles.porLojaItemBlock} ${total > 0 ? styles.porLojaItemBlockFilled : ''}`}>
            <div className={styles.porLojaItemHeader}>
              <span className={styles.porLojaItemRef}>
                {ped.referencia || ped.segmentacao?.tipo_produto || '—'}
                {(ped.cor || ped.detalhe) && (
                  <span className={styles.itemRefDetail}>{[ped.cor, ped.detalhe].filter(Boolean).join(' · ')}</span>
                )}
              </span>
              <span className={styles.porLojaItemMeta}>
                {ped.segmentacao?.tipo_produto} · {tipoGrade} · {ped.segmentacao?.classe}
              </span>
              {valor > 0 && <span className={styles.porLojaItemValor}>R$ {fmt(valor)}</span>}
              <span className={styles.porLojaItemTotalBadge}>{total > 0 ? `${total} pç` : '—'}</span>
            </div>
            <div className={styles.porLojaGradeRow}>
              {visibleTams5.map((tam, tamIdx) => (
                <div key={tam} className={styles.porLojaGradeTam}>
                  <div className={styles.porLojaGradeTamLabel}>{tam}</div>
                  <input
                    type="number" min="0"
                    className={styles.porLojaGradeInput}
                    value={getQtd(ped.id, tam)}
                    onChange={e => setQtd(ped.id, tam, e.target.value)}
                    onKeyDown={e => {
                      const r = pedIdx, c = tamIdx
                      const sel = attr => document.querySelector(`[data-colab-input][data-row="${attr[0]}"][data-col="${attr[1]}"]`)
                      const nearestInRow = (row, fromCol) => {
                        for (let dc = 0; dc <= fromCol; dc++) {
                          const el = sel([row, fromCol - dc])
                          if (el) return el
                        }
                        return null
                      }
                      if (e.key === 'ArrowRight') {
                        e.preventDefault()
                        sel([r, c + 1])?.focus()
                      } else if (e.key === 'ArrowLeft') {
                        e.preventDefault()
                        if (c > 0) sel([r, c - 1])?.focus()
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        nearestInRow(r + 1, c)?.focus()
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        if (r > 0) nearestInRow(r - 1, c)?.focus()
                      } else if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
                        e.preventDefault()
                        const all = Array.from(document.querySelectorAll('[data-colab-input]'))
                        const idx = all.indexOf(e.target)
                        if (idx >= 0 && idx < all.length - 1) all[idx + 1].focus()
                      } else if (e.key === 'Tab' && e.shiftKey) {
                        e.preventDefault()
                        const all = Array.from(document.querySelectorAll('[data-colab-input]'))
                        const idx = all.indexOf(e.target)
                        if (idx > 0) all[idx - 1].focus()
                      }
                    }}
                    placeholder="0"
                    data-colab-input="1"
                    data-row={pedIdx}
                    data-col={tamIdx}
                  />
                </div>
              ))}
              {nextTam5 && (
                <button
                  className={styles.btnExpandSize}
                  onClick={() => setVisibleUpTo(prev => ({ ...prev, [ped.id]: maxIdx5 + 1 }))}
                  title={`Mostrar ${nextTam5}`}
                >+{nextTam5}</button>
              )}
            </div>
            {total > 0 && (
              <div className={styles.preencherItemFooter}>
                {total} pç · R$ {(total * valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </div>
        )
      })}

      {totalPcs > 0 && (
        <div className={styles.viewTotalGeral}>
          <span>Total do pedido — {compradorNome}</span>
          <span>{totalPcs} pç · R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      )}

      {pedidos.length > 0 && (
        <div className={styles.phaseActions} style={{ marginTop: '1.25rem' }}>
          {saved && <span className={styles.savedBadge}>✓ Salvo com sucesso</span>}
          <button className={styles.btnPrimary} onClick={handleSalvar} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar pedido'}
          </button>
        </div>
      )}
    </div>
  )
}
