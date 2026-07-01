import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import styles from './Compras.module.css'
import { sessoes as sessoesService } from '../services/sessoes'
import { pedidos as pedidosService } from '../services/pedidos'
import { fmt, fmtDate } from '../lib/format'
import { MarkupSessao } from './MarkupSessao'

export function VisualizarSessao({ sessaoId, onBack }) {
  const { comprador } = useAuth()
  const [sessao,     setSessao]     = useState(null)
  const [visitaData, setVisitaData] = useState([]) // [{id, comprador_nome, pedidos:[...]}]
  const [loading,    setLoading]    = useState(true)
  const [lastFetch,  setLastFetch]  = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [error,      setError]      = useState(null)
  const [showMarkup, setShowMarkup] = useState(false)

  async function fetchData(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    try {
      const [ses, vis] = await Promise.all([
        sessoesService.byId(sessaoId),
        pedidosService.itensPorFornecedor(sessaoId),
      ])
      setSessao(ses)
      setVisitaData(vis ?? [])
      setLastFetch(new Date())
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 30_000)
    return () => clearInterval(interval)
  }, [sessaoId])

  const totalGeral = visitaData.reduce((s, vis) => {
    for (const ped of vis.pedidos ?? []) {
      const pcs = (ped.itens ?? []).reduce((a, i) => a + (i.qtd || 0), 0)
      s.pcs += pcs
      s.valor += pcs * (ped.valor_unitario || 0)
    }
    return s
  }, { pcs: 0, valor: 0 })

  return (
    <div className={styles.phase}>
      {/* Header */}
      <div className={styles.viewOnlyHeader}>
        <button className={styles.btnBack} onClick={onBack}>← Voltar</button>
        <div className={styles.viewOnlyRefreshArea}>
          {comprador?.is_editor && sessao && (
            <button
              className={`${styles.btnHistAction} ${styles.btnHistMarkup}`}
              onClick={() => setShowMarkup(true)}
              title="Definir markup e preços sugeridos para esta sessão"
            >
              Markup
            </button>
          )}
          {lastFetch && (
            <span className={styles.viewOnlyTimestamp}>
              Atualizado {lastFetch.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            className={styles.btnRefresh}
            onClick={() => fetchData(true)}
            disabled={refreshing}
            title="Atualizar dados"
          >
            {refreshing ? '↻ Atualizando…' : '↻ Atualizar'}
          </button>
        </div>
      </div>

      {showMarkup && sessao && (
        <MarkupSessao sessao={sessao} onClose={() => setShowMarkup(false)} />
      )}

      {loading && <p className={styles.muted}>Carregando sessão…</p>}
      {error && <div className={styles.errorBanner}>{error}</div>}

      {sessao && (
        <>
          <div className={styles.visitaBanner}>
            <strong>{sessao.fornecedor?.nome || sessao.fornecedor_nome}</strong>
            {sessao.data_visita && <><span className={styles.dot}>·</span><span>{fmtDate(sessao.data_visita)}</span></>}
            {sessao.vendedor && <><span className={styles.dot}>·</span><span>{sessao.vendedor}</span></>}
            {sessao.cond_pag && <><span className={styles.dot}>·</span><span>{sessao.cond_pag}</span></>}
            {sessao.frete    && <><span className={styles.dot}>·</span><span>Frete: {sessao.frete}</span></>}
            <span className={styles.dot}>·</span>
            <span className={styles.viewOnlyBadge}>Modo visualização</span>
          </div>

          <div className={styles.viewOnlyBody}>
            {visitaData.length === 0 && !loading && (
              <p className={styles.muted}>Nenhuma loja nesta sessão.</p>
            )}
            {visitaData.map(vis => {
              const peds = vis.pedidos ?? []
              const visPcs = peds.reduce((s, p) => s + (p.itens ?? []).reduce((a, i) => a + (i.qtd || 0), 0), 0)
              const visValor = peds.reduce((s, p) => {
                const pcs = (p.itens ?? []).reduce((a, i) => a + (i.qtd || 0), 0)
                return s + pcs * (p.valor_unitario || 0)
              }, 0)

              return (
                <div key={vis.id} className={styles.viewVisita}>
                  <div className={styles.viewVisitaHeader}>
                    <span className={styles.viewVisitaNome}>{vis.comprador?.nome ?? `Loja #${vis.comprador_id}`}</span>
                    <span className={styles.viewVisitaStats}>
                      {visPcs > 0
                        ? `${visPcs} pç · R$ ${visValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : 'sem pedidos'}
                    </span>
                  </div>

                  {peds.length === 0 ? (
                    <p className={styles.muted} style={{ padding: '0.5rem 1rem', margin: 0 }}>Nenhum pedido registrado.</p>
                  ) : (
                    <div className={styles.viewPedidos}>
                      {peds.map(ped => {
                        const itens = ped.itens ?? []
                        const pcs = itens.reduce((s, i) => s + (i.qtd || 0), 0)
                        const total = pcs * (ped.valor_unitario || 0)
                        const tamsComQtd = itens.filter(i => i.qtd > 0)
                        return (
                          <div key={ped.id} className={styles.viewPedidoBlock}>
                            <div className={styles.viewPedidoTop}>
                              <span className={styles.viewPedidoSeg}>
                                {ped.referencia && <strong>{ped.referencia}</strong>}
                                {ped.referencia && <span className={styles.dot}>·</span>}
                                {ped.segmentacao?.classificacao} · {ped.segmentacao?.tipo_produto} · {ped.segmentacao?.classe}
                              </span>
                              <span className={styles.viewPedidoValor}>R$ {fmt(ped.valor_unitario)}/pç</span>
                            </div>
                            <div className={styles.viewPedidoGrade}>
                              {tamsComQtd.length === 0 ? (
                                <span className={styles.viewPedidoVazio}>— vazio</span>
                              ) : tamsComQtd.map(i => (
                                <span key={i.tamanho} className={styles.viewGradePill}>
                                  <span className={styles.viewGradeTam}>{i.tamanho}</span>
                                  <span className={styles.viewGradeQtd}>{i.qtd}</span>
                                </span>
                              ))}
                            </div>
                            <div className={styles.viewPedidoFooter}>
                              {pcs} pç · R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {visitaData.length > 0 && totalGeral.pcs > 0 && (
              <div className={styles.viewTotalGeral}>
                <span>Total geral</span>
                <span>{totalGeral.pcs} pç · R$ {totalGeral.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
