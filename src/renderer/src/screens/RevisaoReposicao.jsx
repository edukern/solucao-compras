import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Check, X, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { reposicao as reposicaoService } from '../services/reposicao'
import styles from './RevisaoReposicao.module.css'

const STATUS_LABEL = {
  rascunho:   'Rascunho',
  revisado:   'Revisado',
  descartado: 'Descartado',
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ─── Lista ──────────────────────────────────────────────────────────────────

function ListaRascunhos({ onAbrir }) {
  const { comprador, user } = useAuth()
  const [abaStatus,    setAbaStatus]    = useState('rascunho')
  const [lista,        setLista]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [erro,         setErro]         = useState(null)
  const [descartandoId, setDescartandoId] = useState(null)

  const carregar = useCallback(() => {
    setLoading(true)
    setErro(null)
    reposicaoService.list(abaStatus)
      .then(setLista)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [abaStatus])

  useEffect(() => { carregar() }, [carregar])

  async function handleDescartar(e, id) {
    e.stopPropagation()
    if (!window.confirm('Descartar este rascunho? Ele sai da aba "Rascunho" e não tem desfazer pela tela.')) return
    const revisadoPor = comprador?.nome ?? user?.email ?? 'desconhecido'
    setDescartandoId(id)
    try {
      await reposicaoService.marcarStatus(id, 'descartado', revisadoPor)
      carregar()
    } catch (err) {
      alert(`Erro ao descartar: ${err.message}`)
    } finally {
      setDescartandoId(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reposição — rascunhos do CD</h1>
        <p className={styles.subtitle}>
          Pedidos de reposição (repor o que vendeu, sem projeção) enviados pelo ponto-e-stock, aguardando revisão.
        </p>
      </div>

      <div className={styles.abas}>
        {['rascunho', 'revisado', 'descartado'].map(s => (
          <button
            key={s}
            className={`${styles.aba} ${abaStatus === s ? styles.abaAtiva : ''}`}
            onClick={() => setAbaStatus(s)}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {erro && <div className={styles.erro}>Erro ao carregar: {erro}</div>}
      {loading && <div className={styles.vazio}>Carregando…</div>}

      {!loading && !erro && lista.length === 0 && (
        <div className={styles.vazio}>Nenhum rascunho com status "{STATUS_LABEL[abaStatus]}".</div>
      )}

      {!loading && lista.length > 0 && (
        <div className={styles.lista}>
          {lista.map(r => (
            <div
              key={r.id}
              className={styles.cardLista}
              role="button"
              tabIndex={0}
              onClick={() => onAbrir(r.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAbrir(r.id) } }}
            >
              <div className={styles.cardListaTopo}>
                <span className={styles.cardListaMarca}>{r.marca}</span>
                <span className={`${styles.badge} ${styles['badge_' + r.status]}`}>{STATUS_LABEL[r.status]}</span>
              </div>
              <div className={styles.cardListaMeta}>
                <span>Janela: {r.janela_dias} dias</span>
                <span>{r.qtd_referencias ?? 0} ref. · {r.qtd_total ?? 0} un.</span>
                <span>Gerado por: {r.gerado_por || '—'}</span>
                <span>{fmtDateTime(r.gerado_em)}</span>
              </div>
              {r.status !== 'rascunho' && (
                <div className={styles.cardListaRevisao}>
                  {STATUS_LABEL[r.status]} por {r.revisado_por || '—'} em {fmtDateTime(r.revisado_em)}
                </div>
              )}
              {r.status === 'rascunho' && (
                <div className={styles.cardListaRodape}>
                  <button
                    type="button"
                    className={styles.btnDescartarLista}
                    disabled={descartandoId === r.id}
                    onClick={e => handleDescartar(e, r.id)}
                  >
                    <X size={12} strokeWidth={1.8} /> Descartar
                  </button>
                </div>
              )}
              <ChevronRight className={styles.cardListaChevron} size={18} strokeWidth={1.8} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Detalhe ────────────────────────────────────────────────────────────────

function DetalheRascunho({ id, onVoltar, onStatusChange }) {
  const { comprador, user } = useAuth()
  const [pedido,     setPedido]     = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [erro,       setErro]       = useState(null)
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    reposicaoService.byId(id)
      .then(p => { if (!cancelled) setPedido(p) })
      .catch(e => { if (!cancelled) setErro(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  async function handleMarcar(status) {
    const revisadoPor = comprador?.nome ?? user?.email ?? 'desconhecido'
    setProcessando(true)
    try {
      await reposicaoService.marcarStatus(id, status, revisadoPor)
      onStatusChange()
      onVoltar()
    } catch (e) {
      alert(`Erro ao atualizar status: ${e.message}`)
    } finally {
      setProcessando(false)
    }
  }

  if (loading) return <div className={styles.page}><div className={styles.vazio}>Carregando…</div></div>
  if (erro) return <div className={styles.page}><div className={styles.erro}>Erro ao carregar: {erro}</div></div>
  if (!pedido) return null

  const totalQtd = pedido.itens.reduce((s, i) => s + i.qtd, 0)

  return (
    <div className={styles.page}>
      <button className={styles.voltar} onClick={onVoltar}>
        <ArrowLeft size={14} strokeWidth={1.8} /> Voltar
      </button>

      <div className={styles.header}>
        <div className={styles.detalheTopo}>
          <h1 className={styles.title}>{pedido.marca}</h1>
          <span className={`${styles.badge} ${styles['badge_' + pedido.status]}`}>{STATUS_LABEL[pedido.status]}</span>
        </div>
        <p className={styles.subtitle}>
          Janela de {pedido.janela_dias} dias · gerado por {pedido.gerado_por || '—'} em {fmtDateTime(pedido.gerado_em)}
          {pedido.status !== 'rascunho' && (
            <> · {STATUS_LABEL[pedido.status].toLowerCase()} por {pedido.revisado_por || '—'} em {fmtDateTime(pedido.revisado_em)}</>
          )}
        </p>
      </div>

      <div className={styles.tabelaWrap}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Referência</th>
              <th>Tamanho</th>
              <th className={styles.colNum}>Qtd sugerida</th>
              <th className={styles.colNum}>Vendido no período</th>
              <th className={styles.colNum}>Estoque CD</th>
              <th className={styles.colNum}>Já pedido</th>
            </tr>
          </thead>
          <tbody>
            {pedido.itens.map(it => (
              <tr key={it.id}>
                <td>{it.referencia}</td>
                <td>{it.tamanho}</td>
                <td className={styles.colNum}><strong>{it.qtd}</strong></td>
                <td className={styles.colNum}>{it.vendido_periodo}</td>
                <td className={styles.colNum}>{it.estoque_cd}</td>
                <td className={styles.colNum}>{it.ja_pedido}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>Total</td>
              <td className={styles.colNum}><strong>{totalQtd}</strong></td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {pedido.status === 'rascunho' && (
        <div className={styles.acoes}>
          <button className={styles.btnDescartar} disabled={processando} onClick={() => handleMarcar('descartado')}>
            <X size={14} strokeWidth={1.8} /> Descartar
          </button>
          <button className={styles.btnRevisar} disabled={processando} onClick={() => handleMarcar('revisado')}>
            <Check size={14} strokeWidth={1.8} /> Marcar como revisado
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Orchestrator ───────────────────────────────────────────────────────────

export default function RevisaoReposicao() {
  const [abertoId, setAbertoId] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  if (abertoId) {
    return (
      <DetalheRascunho
        id={abertoId}
        onVoltar={() => setAbertoId(null)}
        onStatusChange={() => setRefreshKey(k => k + 1)}
      />
    )
  }

  return <ListaRascunhos key={refreshKey} onAbrir={setAbertoId} />
}
