import { useState, useEffect, useCallback, useMemo, useRef, Fragment } from 'react'
import { ArrowLeft, Check, X, ChevronRight, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { reposicao as reposicaoService } from '../services/reposicao'
import { tamanhosDeTipoGrade } from '../constants/grades'
import {
  agruparPorReferencia, editState, custoState, parseValorBR, fmtValorBR,
  colunasDaGrade, gradesDoSeletor, METRICAS_LEITURA,
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

// "SUTIA · AD · FEM" — mesmo formato de "Produto · Grade · Classe" do Compras.
// A grade do meio é a escolhida no seletor (muda quando o comprador troca).
function descricaoCurta(g, grade) {
  const genero = /\bMASC\b/i.test(g.nome || '') ? 'MASC' : /\bFEM\b/i.test(g.nome || '') ? 'FEM' : null
  return [g.tipo, grade, genero].filter(Boolean).join(' · ')
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

// ─── Detalhe: mesma tabela do Compras (Registrar Pedidos / Por referência) ───

function DetalheRascunho({ id, onVoltar, onStatusChange }) {
  const { comprador, user } = useAuth()
  const [pedido,      setPedido]      = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [erro,        setErro]        = useState(null)
  const [processando, setProcessando] = useState(false)   // transição de status
  const [salvando,    setSalvando]    = useState(false)   // gravação de quantidades
  const [erroSalvar,  setErroSalvar]  = useState(null)
  const [expandida,   setExpandida]   = useState(null)    // referencia aberta
  const [edits,       setEdits]       = useState({})      // { [ref]: { [tam]: rawString } }  qtd
  const [custoEdits,  setCustoEdits]  = useState({})      // { [ref]: rawString }  valor unit.
  const [gradeSel,    setGradeSel]    = useState({})      // { [ref]: gradeCode escolhido }

  const firstQtdRef     = useRef(null)   // 1º input da linha Qtd da ref aberta
  const focusOnExpand   = useRef(false)  // pedir foco no 1º input ao expandir (nav por teclado)

  const limparEdits = () => { setEdits({}); setCustoEdits({}); setGradeSel({}) }

  // Recarrega do banco (fonte da verdade) e descarta edits/seleções locais.
  const carregar = useCallback(() => {
    setLoading(true)
    return reposicaoService.byId(id)
      .then(p => { setPedido(p); setEdits({}); setCustoEdits({}); setGradeSel({}); setErro(null); return p })
      .catch(e => { setErro(e.message); return null })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    reposicaoService.byId(id)
      .then(p => { if (!cancelled) { setPedido(p); setEdits({}); setCustoEdits({}); setGradeSel({}) } })
      .catch(e => { if (!cancelled) setErro(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  // Foco no 1º campo ao abrir uma ref via Enter/Tab (não em clique).
  useEffect(() => {
    if (focusOnExpand.current && firstQtdRef.current) {
      firstQtdRef.current.focus()
    }
    focusOnExpand.current = false
  }, [expandida])

  const grupos      = useMemo(() => (pedido ? agruparPorReferencia(pedido.itens) : []), [pedido])
  const gruposByRef = useMemo(() => Object.fromEntries(grupos.map(g => [g.referencia, g])), [grupos])
  const editavel    = pedido?.status === 'rascunho'

  const gradeDaRef = (g) => gradeSel[g.referencia] ?? g.gradeInicial
  const gradeMudou = (g) => gradeSel[g.referencia] !== undefined && gradeSel[g.referencia] !== g.gradeInicial

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

  // Custo por referência: valor cru mostrado no campo, estado e valor efetivo.
  const custoRawDe = (ref) => {
    if (custoEdits[ref] !== undefined) return custoEdits[ref]
    const c = gruposByRef[ref]?.custoRef
    return c != null ? fmtValorBR(c) : ''
  }
  const custoStateDe = (ref) => custoState(custoEdits[ref], gruposByRef[ref]?.custoRef ?? null)
  const custoEfetivo = (ref) => {
    if (custoStateDe(ref) === 'dirty') return parseValorBR(custoEdits[ref])
    return gruposByRef[ref]?.custoRef ?? null
  }

  let temInvalido = false, temPendente = false
  const refsComEdicao = new Set()
  for (const [ref, tam] of percorrerEdits(edits)) {
    const st = estadoDe(ref, tam)
    if (st === 'invalid') temInvalido = true
    if (st === 'dirty') { temPendente = true; refsComEdicao.add(ref) }
  }
  for (const ref of Object.keys(custoEdits)) {
    const st = custoStateDe(ref)
    if (st === 'invalid') temInvalido = true
    if (st === 'dirty') { temPendente = true; refsComEdicao.add(ref) }
  }
  for (const g of grupos) {
    if (gradeMudou(g)) { temPendente = true; refsComEdicao.add(g.referencia) }
  }

  const setQtd = (ref, tam, raw) =>
    setEdits(prev => ({ ...prev, [ref]: { ...prev[ref], [tam]: raw } }))
  const setCusto = (ref, raw) =>
    setCustoEdits(prev => ({ ...prev, [ref]: raw }))

  const totalEfetivoRef = (g) =>
    colunasDaGrade(gradeDaRef(g), g.tamanhosPresentes)
      .reduce((s, t) => s + valorEfetivo(g.referencia, t), 0)
  const valorTotalRef = (g) => {
    const c = custoEfetivo(g.referencia)
    return c != null ? totalEfetivoRef(g) * c : null
  }

  // Navegação por teclado igual ao Compras: Enter/Tab avança pelo próximo campo
  // da linha; no fim da linha, abre a próxima referência e foca o 1º campo dela.
  // Esc fecha a referência.
  function handleKeyNavQtd(e) {
    if (e.key === 'Escape') { e.currentTarget.blur(); setExpandida(null); return }
    const avancar = e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)
    if (!avancar) return
    e.preventDefault()
    const row = e.target.closest('[data-qtd-row]')
    const inputs = row ? Array.from(row.querySelectorAll('input')) : []
    const i = inputs.indexOf(e.target)
    if (i >= 0 && i < inputs.length - 1) { inputs[i + 1].focus(); return }
    const idx = grupos.findIndex(g => g.referencia === expandida)
    if (idx >= 0 && idx < grupos.length - 1) {
      focusOnExpand.current = true
      setExpandida(grupos[idx + 1].referencia)
    }
  }

  async function handleSalvar() {
    setErroSalvar(null)
    setSalvando(true)
    try {
      const atual = await reposicaoService.byId(id)
      if (atual.status !== 'rascunho') {
        setPedido(atual); limparEdits()
        setErroSalvar('Este rascunho não está mais como "rascunho" (alguém revisou ou descartou). Recarreguei os dados.')
        return
      }
      const gRefAtual = Object.fromEntries(
        agruparPorReferencia(atual.itens).map(g => [g.referencia, g])
      )
      // Alguém mexeu na qtd ou no custo de algo que eu já tinha carregado?
      const conflito = (pedido?.itens ?? []).some(orig => {
        const itA = gRefAtual[orig.referencia]?.porTamanho[orig.tamanho]
        if (!itA) return false
        const custoIgual = String(itA.valor_unitario ?? '') === String(orig.valor_unitario ?? '')
        return itA.qtd !== orig.qtd || !custoIgual
      })
      if (conflito) {
        setPedido(atual); limparEdits()
        setErroSalvar('As quantidades ou o custo mudaram no servidor desde que você abriu (outra pessoa editou). Recarreguei — confira e edite de novo.')
        return
      }

      // Refs a gravar = qtd editada  ∪  custo editado  ∪  grade trocada.
      const refsAlteradas = new Set()
      for (const [ref, tam] of percorrerEdits(edits)) {
        if (estadoDe(ref, tam) === 'dirty') refsAlteradas.add(ref)
      }
      for (const ref of Object.keys(custoEdits)) {
        if (custoStateDe(ref) === 'dirty') refsAlteradas.add(ref)
      }
      for (const g of grupos) if (gradeMudou(g)) refsAlteradas.add(g.referencia)
      if (!refsAlteradas.size) { limparEdits(); return }

      const rows = []
      for (const ref of refsAlteradas) {
        const gA = gRefAtual[ref]
        if (!gA) continue
        const irmao = Object.values(gA.porTamanho)[0] ?? {}
        // valor_unitario da ref: o editado (se sujo) senão o atual do banco.
        const custo = custoStateDe(ref) === 'dirty'
          ? parseValorBR(custoEdits[ref])
          : (gA.custoRef ?? null)
        // tipo_grade: só a escolha explícita do comprador OU o que já estava salvo
        // — nunca o palpite (senão o aviso "confira" some sem ninguém confirmar).
        const tipoGrade = gradeSel[ref] ?? gA.tipoGradeSalva ?? null

        const mkRow = (tam, qtd, existente) => ({
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
          tipo_grade:      tipoGrade,
          valor_unitario:  custo,
        })

        // Todas as linhas que já existem da ref (mantém qtd atual, ou a editada).
        for (const [tam, it] of Object.entries(gA.porTamanho)) {
          const ed = edits[ref]?.[tam]
          const qtd = editState(ed, it.qtd) === 'dirty' ? parseInt(String(ed).trim(), 10) : it.qtd
          rows.push(mkRow(tam, qtd, it))
        }
        // Tamanhos novos que o comprador preencheu (qtd >= 1) e ainda não têm linha.
        for (const [tam, ed] of Object.entries(edits[ref] ?? {})) {
          if (gA.porTamanho[tam]) continue
          if (editState(ed, null) !== 'dirty') continue
          rows.push(mkRow(tam, parseInt(String(ed).trim(), 10), null))
        }
      }
      if (!rows.length) { limparEdits(); return }

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
            Clique numa referência para abrir a grade. A quantidade sugerida já vem preenchida; complete os outros tamanhos e o custo se quiser (Enter/Tab anda pelos campos). Depois clique em <strong>Salvar alterações</strong> e então marque como revisado.
          </p>
        )}
      </div>

      <table className={styles.itemsTable}>
        <thead>
          <tr>
            <th>Ref</th>
            <th>Produto · Grade · Classe</th>
            <th>Valor unit.</th>
            <th>Peças</th>
          </tr>
        </thead>
        <tbody>
          {grupos.map(g => {
            const aberta  = expandida === g.referencia
            const editada = refsComEdicao.has(g.referencia)
            const grade   = gradeDaRef(g)
            const colunas = colunasDaGrade(grade, g.tamanhosPresentes)
            const pecas   = totalEfetivoRef(g)
            const custoSt = custoStateDe(g.referencia)
            return (
              <Fragment key={g.referencia}>
                <tr
                  className={`${styles.itemRow} ${aberta ? styles.itemRowActive : ''}`}
                  onClick={() => setExpandida(aberta ? null : g.referencia)}
                >
                  <td>{g.referencia || <span className={styles.itemDot}>—</span>}</td>
                  <td>
                    {descricaoCurta(g, grade) || g.nome || '—'}
                    {editada && g.totalSugerido !== pecas && (
                      <span className={styles.itemRefDetail}>sugestão: {g.totalSugerido}</span>
                    )}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    {editavel ? (
                      <span className={styles.custoWrap}>
                        R$&nbsp;<input
                          type="text"
                          inputMode="decimal"
                          className={`${styles.custoInput} ${custoSt === 'invalid' ? styles.custoInputInvalido : ''} ${custoSt === 'dirty' ? styles.custoInputDirty : ''}`}
                          value={custoRawDe(g.referencia)}
                          placeholder="—"
                          onChange={e => setCusto(g.referencia, e.target.value)}
                          aria-label={`Valor unitário ${g.referencia}`}
                        />
                      </span>
                    ) : (
                      g.custoRef != null ? `R$ ${fmtValorBR(g.custoRef)}` : <span className={styles.itemDot}>—</span>
                    )}
                  </td>
                  <td><strong>{pecas > 0 ? pecas : <span className={styles.itemDot}>—</span>}</strong></td>
                </tr>

                {aberta && (
                  <tr className={styles.gradeExpansionRow}>
                    <td colSpan={4} className={styles.gradeExpansionCell}>
                      <div className={styles.gradeInlineWrap}>
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
                            <div className={styles.expNome}>{g.nome || descricaoCurta(g, grade) || g.referencia}</div>
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

                        <div className={styles.gradeInlineHeader}>
                          <div className={styles.gradeInlineLoja} />
                          {colunas.map(t => (
                            <div key={t} className={styles.gradeInlineSize}>{t}</div>
                          ))}
                          <div className={styles.gradeInlineTotalHead}>Total</div>
                        </div>

                        <div className={styles.gradeInlineRow} data-qtd-row>
                          <div className={styles.gradeInlineLoja}>Qtd</div>
                          {colunas.map((t, ci) => {
                            const it  = g.porTamanho[t]
                            const st  = estadoDe(g.referencia, t)
                            const raw = rawDe(g.referencia, t)
                            return (
                              <div key={t} className={styles.gradeInlineSize}>
                                {editavel ? (
                                  <input
                                    ref={ci === 0 ? firstQtdRef : null}
                                    type="number"
                                    min="0"
                                    className={`${styles.qtyInput} ${st === 'invalid' ? styles.qtyInputInvalido : ''} ${st === 'dirty' ? styles.qtyInputDirty : ''} ${!it ? styles.qtyInputNovo : ''}`}
                                    value={raw}
                                    placeholder={it ? '0' : '·'}
                                    onChange={e => setQtd(g.referencia, t, e.target.value)}
                                    onKeyDown={handleKeyNavQtd}
                                    aria-label={`Quantidade ${g.referencia} tamanho ${t}`}
                                  />
                                ) : (
                                  it ? <strong>{it.qtd}</strong> : <span className={styles.semTam}>—</span>
                                )}
                              </div>
                            )
                          })}
                          <div className={styles.gradeInlineTotalReadonly}>{pecas || '—'}</div>
                        </div>

                        {METRICAS_LEITURA.map(m => {
                          const soma = colunas.reduce((s, t) => s + (g.porTamanho[t]?.[m.key] ?? 0), 0)
                          return (
                            <div key={m.key} className={`${styles.gradeInlineRow} ${styles.gradeInlineRowRead}`}>
                              <div className={styles.gradeInlineLoja}>{m.label}</div>
                              {colunas.map(t => (
                                <div key={t} className={styles.gradeInlineSize}>
                                  {g.porTamanho[t] ? g.porTamanho[t][m.key] : <span className={styles.semTam}>—</span>}
                                </div>
                              ))}
                              <div className={styles.gradeInlineTotalReadonly}>{soma}</div>
                            </div>
                          )
                        })}

                        <div className={styles.expRodape}>
                          {custoEfetivo(g.referencia) != null
                            ? <>Total: <strong>R$ {fmtValorBR(valorTotalRef(g))}</strong> · {pecas} pç × R$ {fmtValorBR(custoEfetivo(g.referencia))}</>
                            : <>{pecas} peças · sem custo informado</>}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>

      {erroSalvar && <div className={styles.erro}>{erroSalvar}</div>}
      {temInvalido && !erroSalvar && (
        <div className={styles.avisoInvalido}>Há valor inválido — quantidade tem que ser inteiro de 1 a 9999 (não dá para zerar uma sugestão), e o custo tem que ser um número (ex.: 16,90).</div>
      )}

      {editavel && (
        <div className={styles.acoes}>
          {(temPendente || temInvalido) && (
            <button
              className={styles.btnSalvarQtds}
              disabled={salvando || temInvalido || !temPendente}
              onClick={handleSalvar}
            >
              <Save size={14} strokeWidth={1.8} /> {salvando ? 'Salvando…' : 'Salvar alterações'}
            </button>
          )}
          <button
            className={styles.btnDescartar}
            disabled={processando || salvando || temPendente || temInvalido}
            title={temPendente || temInvalido ? 'Salve as alterações primeiro' : undefined}
            onClick={() => handleMarcar('descartado')}
          >
            <X size={14} strokeWidth={1.8} /> Descartar
          </button>
          <button
            className={styles.btnRevisar}
            disabled={processando || salvando || temPendente || temInvalido}
            title={temPendente || temInvalido ? 'Salve as alterações primeiro' : undefined}
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
