import { useState, useEffect, useCallback, useMemo } from 'react'
import { ArrowLeft, Check, X, ChevronRight, ChevronDown, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { reposicao as reposicaoService } from '../services/reposicao'
import { tamanhosDeTipoGrade } from '../constants/grades'
import {
  agruparPorReferencia, editState, colunasDaGrade, gradesDoSeletor, METRICAS_LEITURA,
} from './reposicaoGrade'
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

// "SUTIA · AD · FEM" a partir de tipo + classe + gênero embutido no nome.
function descricaoCurta(g) {
  const genero = /\bMASC\b/i.test(g.nome || '') ? 'MASC' : /\bFEM\b/i.test(g.nome || '') ? 'FEM' : null
  return [g.tipo, g.classe, genero].filter(Boolean).join(' · ')
}

// Percorre o mapa de edições { [ref]: { [tam]: raw } } como lista [ref, tam, raw].
function* percorrerEdits(edits) {
  for (const [ref, tams] of Object.entries(edits)) {
    for (const [tam, raw] of Object.entries(tams)) yield [ref, tam, raw]
  }
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

// ─── Detalhe: grade agrupada, uma referência aberta por vez ──────────────────

function DetalheRascunho({ id, onVoltar, onStatusChange }) {
  const { comprador, user } = useAuth()
  const [pedido,      setPedido]      = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [erro,        setErro]        = useState(null)
  const [processando, setProcessando] = useState(false)   // transição de status
  const [salvando,    setSalvando]    = useState(false)   // gravação de quantidades
  const [erroSalvar,  setErroSalvar]  = useState(null)
  const [expandida,   setExpandida]   = useState(null)    // referencia aberta
  const [edits,       setEdits]       = useState({})      // { [ref]: { [tam]: rawString } }
  const [gradeSel,    setGradeSel]    = useState({})      // { [ref]: gradeCode escolhido }

  // Recarrega do banco (fonte da verdade) e descarta edits/seleções locais.
  const carregar = useCallback(() => {
    setLoading(true)
    return reposicaoService.byId(id)
      .then(p => { setPedido(p); setEdits({}); setGradeSel({}); setErro(null); return p })
      .catch(e => { setErro(e.message); return null })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    reposicaoService.byId(id)
      .then(p => { if (!cancelled) { setPedido(p); setEdits({}); setGradeSel({}) } })
      .catch(e => { if (!cancelled) setErro(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const grupos      = useMemo(() => (pedido ? agruparPorReferencia(pedido.itens) : []), [pedido])
  const gruposByRef = useMemo(() => Object.fromEntries(grupos.map(g => [g.referencia, g])), [grupos])
  const editavel    = pedido?.status === 'rascunho'

  const gradeDaRef = (g) => gradeSel[g.referencia] ?? g.gradeInicial

  const rawDe = (ref, tam) => {
    const e = edits[ref]?.[tam]
    if (e !== undefined) return e
    const it = gruposByRef[ref]?.porTamanho[tam]
    return it ? String(it.qtd) : ''
  }
  const estadoDe = (ref, tam) =>
    editState(edits[ref]?.[tam], gruposByRef[ref]?.porTamanho[tam]?.qtd ?? null)
  const valorEfetivo = (ref, tam) => {
    if (estadoDe(ref, tam) === 'dirty') return parseInt(String(edits[ref][tam]).trim(), 10)
    return gruposByRef[ref]?.porTamanho[tam]?.qtd ?? 0
  }

  let temInvalido = false, temPendente = false
  const refsComEdicao = new Set()
  for (const [ref, tam] of percorrerEdits(edits)) {
    const st = estadoDe(ref, tam)
    if (st === 'invalid') temInvalido = true
    if (st === 'dirty') { temPendente = true; refsComEdicao.add(ref) }
  }

  const setQtd = (ref, tam, raw) =>
    setEdits(prev => ({ ...prev, [ref]: { ...prev[ref], [tam]: raw } }))

  const totalEfetivoRef = (g) =>
    colunasDaGrade(gradeDaRef(g), g.tamanhosPresentes)
      .reduce((s, t) => s + valorEfetivo(g.referencia, t), 0)

  async function handleSalvarQtds() {
    setErroSalvar(null)
    setSalvando(true)
    try {
      const atual = await reposicaoService.byId(id)
      if (atual.status !== 'rascunho') {
        setPedido(atual); setEdits({}); setGradeSel({})
        setErroSalvar('Este rascunho não está mais como "rascunho" (alguém revisou ou descartou). Recarreguei os dados.')
        return
      }
      const gRefAtual = Object.fromEntries(
        agruparPorReferencia(atual.itens).map(g => [g.referencia, g])
      )
      const conflito = (pedido?.itens ?? []).some(orig => {
        const itA = gRefAtual[orig.referencia]?.porTamanho[orig.tamanho]
        return itA && itA.qtd !== orig.qtd
      })
      if (conflito) {
        setPedido(atual); setEdits({}); setGradeSel({})
        setErroSalvar('As quantidades mudaram no servidor desde que você abriu (outra pessoa editou). Recarreguei — confira e edite de novo.')
        return
      }

      const rows = []
      for (const [ref, tam, raw] of percorrerEdits(edits)) {
        if (estadoDe(ref, tam) !== 'dirty') continue
        const qtd = parseInt(String(raw).trim(), 10)
        const gA = gRefAtual[ref]
        const existente = gA?.porTamanho[tam]
        const irmao = existente ?? Object.values(gA?.porTamanho ?? {})[0] ?? {}
        rows.push({
          pedido_reposicao_id: irmao.pedido_reposicao_id ?? pedido.id,
          referencia:      ref,
          tamanho:         tam,
          qtd,
          qtd_sugerida:    existente ? (existente.qtd_sugerida ?? existente.qtd) : 0,
          vendido_periodo: existente?.vendido_periodo ?? 0,
          estoque_cd:      existente?.estoque_cd ?? 0,
          ja_pedido:       existente?.ja_pedido ?? 0,
          nome:            irmao.nome ?? null,
          tipo:            irmao.tipo ?? null,
          classe:          irmao.classe ?? null,
          colecao:         irmao.colecao ?? null,
          reffornecedor:   irmao.reffornecedor ?? null,
          codigo_ponto_e:  irmao.codigo_ponto_e ?? null,
          foto_url:        irmao.foto_url ?? null,
          tipo_grade:      gradeSel[ref] ?? irmao.tipo_grade ?? gA?.gradeInicial ?? null,
        })
      }
      if (!rows.length) { setEdits({}); return }

      await reposicaoService.salvarQuantidades(rows)
      await carregar()
      onStatusChange()
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
            Clique numa referência para abrir a grade. A quantidade sugerida já vem preenchida; complete os outros tamanhos se quiser. Depois clique em <strong>Salvar quantidades</strong> e então marque como revisado.
          </p>
        )}
      </div>

      <div className={styles.refLista}>
        {grupos.map(g => {
          const aberta = expandida === g.referencia
          const editada = refsComEdicao.has(g.referencia)
          const grade = gradeDaRef(g)
          const colunas = colunasDaGrade(grade, g.tamanhosPresentes)
          return (
            <div key={g.referencia} className={`${styles.refBloco} ${aberta ? styles.refBlocoAberto : ''}`}>
              <button
                type="button"
                className={styles.refLinha}
                onClick={() => setExpandida(aberta ? null : g.referencia)}
              >
                {aberta
                  ? <ChevronDown size={16} strokeWidth={1.8} className={styles.refChevron} />
                  : <ChevronRight size={16} strokeWidth={1.8} className={styles.refChevron} />}
                <span className={styles.refCod}>{g.referencia}</span>
                <span className={styles.refProd}>{descricaoCurta(g) || g.nome || '—'}</span>
                <span className={styles.refSug}>
                  Sugestão: <strong>{g.totalSugerido}</strong> un.
                  {editada && <span className={styles.refAgora}> → {totalEfetivoRef(g)} un.</span>}
                </span>
              </button>

              {aberta && (
                <div className={styles.expansao}>
                  <div className={styles.expTopo}>
                    {g.foto_url && (
                      <img
                        src={g.foto_url}
                        alt=""
                        className={styles.foto}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                    )}
                    <div className={styles.expInfo}>
                      <div className={styles.expNome}>{g.nome || descricaoCurta(g) || g.referencia}</div>
                      <div className={styles.expMeta}>
                        {[
                          g.reffornecedor && `Ref. forn.: ${g.reffornecedor}`,
                          g.colecao && `Coleção ${g.colecao}`,
                          g.codigo_ponto_e && `cód. ${g.codigo_ponto_e}`,
                        ].filter(Boolean).join(' · ')}
                      </div>
                      <label className={styles.gradeSel}>
                        Grade:{' '}
                        <select
                          value={grade || ''}
                          disabled={!editavel}
                          onChange={e => setGradeSel(p => ({ ...p, [g.referencia]: e.target.value }))}
                        >
                          {gradesDoSeletor(g.classe, grade).map(k => (
                            <option key={k} value={k}>{k} — {tamanhosDeTipoGrade(k).join('/') || '—'}</option>
                          ))}
                        </select>
                        {editavel && !g.tipoGradeSalva && grade === g.gradePalpite && (
                          <span className={styles.gradeHint}> (palpite — confira)</span>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className={styles.gradeWrap}>
                    <table className={styles.grade}>
                      <thead>
                        <tr>
                          <th className={styles.metricaCol}></th>
                          {colunas.map(t => <th key={t} className={styles.numCol}>{t}</th>)}
                          <th className={styles.totalCol}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={styles.linhaEditavel}>
                          <th className={styles.metricaCol}>Qtd</th>
                          {colunas.map(t => {
                            const it = g.porTamanho[t]
                            const st = estadoDe(g.referencia, t)
                            const raw = rawDe(g.referencia, t)
                            const mostrarSug = it && it.qtd_sugerida != null && st !== 'clean'
                              && String(it.qtd_sugerida) !== String(raw).trim()
                            return (
                              <td key={t} className={styles.numCol}>
                                {editavel ? (
                                  <>
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      className={`${styles.qtdInput} ${st === 'invalid' ? styles.qtdInputInvalido : ''} ${st === 'dirty' ? styles.qtdInputDirty : ''} ${!it ? styles.qtdInputNovo : ''}`}
                                      value={raw}
                                      placeholder={it ? '' : '·'}
                                      onChange={e => setQtd(g.referencia, t, e.target.value)}
                                      aria-label={`Quantidade ${g.referencia} tamanho ${t}`}
                                    />
                                    {mostrarSug && <span className={styles.sugCell}>sug. {it.qtd_sugerida}</span>}
                                  </>
                                ) : (
                                  it ? <strong>{it.qtd}</strong> : <span className={styles.semTam}>—</span>
                                )}
                              </td>
                            )
                          })}
                          <td className={styles.totalCol}><strong>{totalEfetivoRef(g)}</strong></td>
                        </tr>
                        {METRICAS_LEITURA.map(m => {
                          const soma = colunas.reduce((s, t) => s + (g.porTamanho[t]?.[m.key] ?? 0), 0)
                          return (
                            <tr key={m.key}>
                              <th className={styles.metricaCol}>{m.label}</th>
                              {colunas.map(t => (
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
              )}
            </div>
          )
        })}
      </div>

      {erroSalvar && <div className={styles.erro}>{erroSalvar}</div>}
      {temInvalido && !erroSalvar && (
        <div className={styles.avisoInvalido}>Há quantidade inválida — use um número inteiro de 1 a 9999 (não dá para zerar uma sugestão pela tela).</div>
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
