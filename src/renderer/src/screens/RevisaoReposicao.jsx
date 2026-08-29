import { useState, useEffect, useCallback, useMemo } from 'react'
import { ArrowLeft, Check, X, ChevronRight, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { reposicao as reposicaoService } from '../services/reposicao'
import { agruparPorReferencia, editState, METRICAS_LEITURA } from './reposicaoGrade'
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
  const [pedido,      setPedido]      = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [erro,        setErro]        = useState(null)
  const [processando, setProcessando] = useState(false)   // transição de status
  const [salvando,    setSalvando]    = useState(false)   // gravação de quantidades
  const [erroSalvar,  setErroSalvar]  = useState(null)
  const [edits,       setEdits]       = useState({})      // { [itemId]: rawString }

  // Recarrega do banco (fonte da verdade) e descarta os edits locais.
  const carregar = useCallback(() => {
    setLoading(true)
    return reposicaoService.byId(id)
      .then(p => { setPedido(p); setEdits({}); setErro(null); return p })
      .catch(e => { setErro(e.message); return null })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    reposicaoService.byId(id)
      .then(p => { if (!cancelled) { setPedido(p); setEdits({}) } })
      .catch(e => { if (!cancelled) setErro(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const grupos = useMemo(() => (pedido ? agruparPorReferencia(pedido.itens) : []), [pedido])
  const editavel = pedido?.status === 'rascunho'

  // Valor efetivo (editado ou original) de um item, como número — pra somar totais.
  function valorEfetivo(it) {
    const st = editState(edits[it.id], it.qtd)
    if (st === 'dirty') return parseInt(String(edits[it.id]).trim(), 10)
    return it.qtd
  }

  const temInvalido  = (pedido?.itens ?? []).some(it => editState(edits[it.id], it.qtd) === 'invalid')
  const temPendente  = (pedido?.itens ?? []).some(it => editState(edits[it.id], it.qtd) === 'dirty')

  const totalGeralEditado   = (pedido?.itens ?? []).reduce((s, it) => s + valorEfetivo(it), 0)
  const totalGeralSugerido  = (pedido?.itens ?? []).reduce((s, it) => s + (it.qtd_sugerida ?? it.qtd), 0)

  function setQtd(itemId, raw) {
    setEdits(prev => ({ ...prev, [itemId]: raw }))
  }

  async function handleSalvarQtds() {
    setErroSalvar(null)
    setSalvando(true)
    try {
      // Relê do servidor antes de gravar: (a) confirma que ainda é 'rascunho',
      // (b) detecta se outra pessoa mexeu na qtd desde que abri.
      const atual = await reposicaoService.byId(id)
      if (atual.status !== 'rascunho') {
        setPedido(atual); setEdits({})
        setErroSalvar('Este rascunho não está mais como "rascunho" (alguém revisou ou descartou). Recarreguei os dados.')
        return
      }
      const serverById = Object.fromEntries(atual.itens.map(i => [i.id, i]))
      const conflito = (pedido?.itens ?? []).some(orig => {
        const s = serverById[orig.id]
        return s && s.qtd !== orig.qtd
      })
      if (conflito) {
        setPedido(atual); setEdits({})
        setErroSalvar('As quantidades mudaram no servidor desde que você abriu (outra pessoa editou). Recarreguei — confira e edite de novo.')
        return
      }

      const rows = Object.entries(edits)
        .map(([itemId, raw]) => ({ base: serverById[itemId], qtd: parseInt(String(raw).trim(), 10) }))
        .filter(({ base, qtd }) => base && Number.isInteger(qtd) && qtd >= 1 && qtd <= 9999 && qtd !== base.qtd)
        .map(({ base, qtd }) => ({
          pedido_reposicao_id: base.pedido_reposicao_id ?? pedido.id,
          referencia:      base.referencia,
          tamanho:         base.tamanho,
          qtd,
          qtd_sugerida:    base.qtd_sugerida ?? base.qtd,
          vendido_periodo: base.vendido_periodo,
          estoque_cd:      base.estoque_cd,
          ja_pedido:       base.ja_pedido,
        }))

      if (!rows.length) { setEdits({}); return }

      await reposicaoService.salvarQuantidades(rows)
      await carregar()            // recarrega do banco (fonte da verdade) e limpa edits
      onStatusChange()            // atualiza o total no card da lista
    } catch (e) {
      setErroSalvar(`Não foi possível salvar: ${e.message}. Nada foi gravado — recarregue e tente de novo.`)
    } finally {
      setSalvando(false)
    }
  }

  async function handleMarcar(status) {
    if (temPendente || temInvalido) return
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

  if (loading && !pedido) return <div className={`${styles.page} ${styles.pageWide}`}><div className={styles.vazio}>Carregando…</div></div>
  if (erro) return <div className={`${styles.page} ${styles.pageWide}`}><div className={styles.erro}>Erro ao carregar: {erro}</div></div>
  if (!pedido) return null

  return (
    <div className={`${styles.page} ${styles.pageWide}`}>
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
        {editavel && (
          <p className={styles.subtitleHint}>
            A linha <strong>Qtd sugerida</strong> é editável. Ajuste o que precisar, clique em <strong>Salvar quantidades</strong> e só então marque como revisado.
          </p>
        )}
      </div>

      <div className={styles.blocos}>
        {grupos.map(g => {
          const totalEditadoGrupo  = g.tamanhos.reduce((s, t) => s + (g.porTamanho[t] ? valorEfetivo(g.porTamanho[t]) : 0), 0)
          const grupoTemInvalido   = g.tamanhos.some(t => g.porTamanho[t] && editState(edits[g.porTamanho[t].id], g.porTamanho[t].qtd) === 'invalid')
          const desc = [g.nome, g.tipo, g.classe].filter(Boolean).join(' · ')
          return (
            <div key={g.referencia} className={styles.refBloco}>
              <div className={styles.refHeader}>
                <span className={styles.refCodigo}>{g.referencia}</span>
                {desc && <span className={styles.refDesc}>{desc}</span>}
              </div>
              <div className={styles.gradeWrap}>
                <table className={styles.grade}>
                  <thead>
                    <tr>
                      <th className={styles.metricaCol}></th>
                      {g.tamanhos.map(t => <th key={t} className={styles.numCol}>{t}</th>)}
                      <th className={styles.totalCol}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={styles.linhaEditavel}>
                      <th className={styles.metricaCol}>Qtd sugerida</th>
                      {g.tamanhos.map(t => {
                        const it = g.porTamanho[t]
                        if (!it) return <td key={t} className={styles.numCol}><span className={styles.semTam}>—</span></td>
                        const st = editState(edits[it.id], it.qtd)
                        const raw = edits[it.id] ?? String(it.qtd)
                        const mostrarSug = it.qtd_sugerida != null && st !== 'clean' && String(it.qtd_sugerida) !== String(raw).trim()
                        return (
                          <td key={t} className={styles.numCol}>
                            {editavel ? (
                              <>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  className={`${styles.qtdInput} ${st === 'invalid' ? styles.qtdInputInvalido : ''} ${st === 'dirty' ? styles.qtdInputDirty : ''}`}
                                  value={raw}
                                  onChange={e => setQtd(it.id, e.target.value)}
                                  aria-label={`Quantidade ${g.referencia} tamanho ${t}`}
                                />
                                {mostrarSug && <span className={styles.sugCell}>sug. {it.qtd_sugerida}</span>}
                              </>
                            ) : (
                              <strong>{it.qtd}</strong>
                            )}
                          </td>
                        )
                      })}
                      <td className={`${styles.totalCol} ${grupoTemInvalido ? styles.totalCol_alerta : ''}`}>
                        <strong>{totalEditadoGrupo}</strong>
                      </td>
                    </tr>
                    {METRICAS_LEITURA.map(m => {
                      const soma = g.tamanhos.reduce((s, t) => s + (g.porTamanho[t]?.[m.key] ?? 0), 0)
                      return (
                        <tr key={m.key}>
                          <th className={styles.metricaCol}>{m.label}</th>
                          {g.tamanhos.map(t => (
                            <td key={t} className={styles.numCol}>
                              {g.porTamanho[t] ? g.porTamanho[t][m.key] : <span className={styles.semTam}>—</span>}
                            </td>
                          ))}
                          <td className={styles.totalCol}>{soma}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.rodapeTotais}>
        <span>Total do pedido: <strong>{totalGeralEditado}</strong> un.</span>
        {totalGeralEditado !== totalGeralSugerido && (
          <span className={styles.rodapeSug}>sugestão original: {totalGeralSugerido} un.</span>
        )}
      </div>

      {erroSalvar && <div className={styles.erro}>{erroSalvar}</div>}
      {temInvalido && !erroSalvar && (
        <div className={styles.avisoInvalido}>Há quantidade inválida — use um número inteiro de 1 a 9999.</div>
      )}

      {editavel && (
        <div className={styles.acoes}>
          {(temPendente || temInvalido) && (
            <button
              className={styles.btnSalvarQtds}
              disabled={salvando || temInvalido || !temPendente}
              onClick={handleSalvarQtds}
            >
              <Save size={14} strokeWidth={1.8} /> {salvando ? 'Salvando…' : 'Salvar quantidades'}
            </button>
          )}
          <button
            className={styles.btnDescartar}
            disabled={processando || salvando || temPendente || temInvalido}
            title={temPendente || temInvalido ? 'Salve as quantidades primeiro' : undefined}
            onClick={() => handleMarcar('descartado')}
          >
            <X size={14} strokeWidth={1.8} /> Descartar
          </button>
          <button
            className={styles.btnRevisar}
            disabled={processando || salvando || temPendente || temInvalido}
            title={temPendente || temInvalido ? 'Salve as quantidades primeiro' : undefined}
            onClick={() => handleMarcar('revisado')}
          >
            <Check size={14} strokeWidth={1.8} /> Marcar como revisado
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Orchestrator ───────────────────────────────────────────────────────────

export default function RevisaoReposicao() {
  const { comprador } = useAuth()
  const [abertoId, setAbertoId] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Menor privilégio: revisar/editar reposição é trabalho da equipe de compras.
  // O item também é escondido do menu em Sidebar.jsx; isto aqui é a trava real.
  if (comprador !== undefined && !comprador?.is_editor) {
    return (
      <div className={styles.page}>
        <div className={styles.vazio}>Acesso restrito à equipe de compras.</div>
      </div>
    )
  }

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
