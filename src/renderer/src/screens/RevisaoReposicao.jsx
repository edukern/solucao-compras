import { useState, useEffect, useCallback, useMemo, useRef, Fragment } from 'react'
import { ArrowLeft, Check, X, ChevronRight, Save, FileText, RotateCcw, ChevronsUpDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { reposicao as reposicaoService } from '../services/reposicao'
import { compradores as compradoresService } from '../services/compradores'
import { gerarPDFReposicao } from '../lib/pdfHelpers'
import { tamanhosDeTipoGrade } from '../constants/grades'
import {
  agruparPorReferencia, editState, custoState, parseValorBR, fmtValorBR,
  colunasDaGrade, gradesDoSeletor, METRICAS_LEITURA,
} from './reposicaoGrade'
import styles from './RevisaoReposicao.module.css'

// Linha de `compradores` usada como remetente/faturamento no PDF que vai pra
// marca. Confirmado com o Eduardo: Backes Art. Vestuário (Três Coroas).
const CD_COMPRADOR_ID = 1

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

function ListaRascunhos({ aba, setAba, refreshSignal, onAbrir }) {
  const { comprador, user } = useAuth()
  const [lista,        setLista]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [erro,         setErro]         = useState(null)
  const [ocupadoId,    setOcupadoId]    = useState(null)   // card em transição de status
  const [acaoErro,     setAcaoErro]     = useState(null)

  const carregar = useCallback(() => {
    setLoading(true)
    setErro(null)
    reposicaoService.list(aba)
      .then(setLista)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [aba])

  useEffect(() => { carregar() }, [carregar, refreshSignal])

  const quemSou = () => comprador?.nome ?? user?.email ?? 'desconhecido'

  async function handleDescartar(e, id, marca) {
    e.stopPropagation()
    if (!window.confirm(`Descartar a reposição de ${marca}? Ela sai da lista de rascunhos. Dá pra reabrir depois na aba "Descartado".`)) return
    setAcaoErro(null)
    setOcupadoId(id)
    try {
      await reposicaoService.marcarStatus(id, 'descartado', quemSou())
      carregar()
    } catch (err) {
      setAcaoErro(`Não deu para descartar: ${err.message}`)
    } finally {
      setOcupadoId(null)
    }
  }

  async function handleReabrir(e, id, statusAtual, marca) {
    e.stopPropagation()
    if (!window.confirm(`Reabrir a reposição de ${marca}? Ela volta para a aba "Rascunho" para ser editada de novo.`)) return
    setAcaoErro(null)
    setOcupadoId(id)
    try {
      await reposicaoService.reabrir(id, statusAtual)
      setAba('rascunho')
    } catch (err) {
      setAcaoErro(`Não deu para reabrir: ${err.message}`)
      carregar()
    } finally {
      setOcupadoId(null)
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
            className={`${styles.aba} ${aba === s ? styles.abaAtiva : ''}`}
            onClick={() => setAba(s)}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {acaoErro && <div className={styles.erro}>{acaoErro}</div>}
      {erro && <div className={styles.erro}>Erro ao carregar: {erro}</div>}
      {loading && <div className={styles.vazio}>Carregando…</div>}

      {!loading && !erro && lista.length === 0 && (
        <div className={styles.vazio}>Nenhum pedido com status "{STATUS_LABEL[aba]}".</div>
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
                <span>Base: vendas dos últimos {r.janela_dias} dias</span>
                <span>{r.qtd_referencias ?? 0} ref. · {r.qtd_total ?? 0} peças</span>
                <span>Gerado por: {r.gerado_por || '—'}</span>
                <span>{fmtDateTime(r.gerado_em)}</span>
              </div>
              {r.status !== 'rascunho' && (
                <div className={styles.cardListaRevisao}>
                  {STATUS_LABEL[r.status]} por {r.revisado_por || '—'} em {fmtDateTime(r.revisado_em)}
                </div>
              )}
              <div className={styles.cardListaRodape}>
                {r.status === 'rascunho' ? (
                  <button
                    type="button"
                    className={styles.btnDescartarLista}
                    disabled={ocupadoId === r.id}
                    onClick={e => handleDescartar(e, r.id, r.marca)}
                  >
                    <X size={12} strokeWidth={1.8} /> Descartar
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.btnDescartarLista}
                    disabled={ocupadoId === r.id}
                    onClick={e => handleReabrir(e, r.id, r.status, r.marca)}
                  >
                    <RotateCcw size={12} strokeWidth={1.8} /> Reabrir
                  </button>
                )}
              </div>
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
  const [erroStatus,  setErroStatus]  = useState(null)   // falha ao revisar/descartar
  const [sucesso,     setSucesso]     = useState(null)   // 'revisado' → banner de fim de fluxo
  const [expandida,   setExpandida]   = useState(null)    // referencia aberta
  const [expandirTudo, setExpandirTudo] = useState(false) // abre todas as grades de uma vez
  const [verReguaCheia, setVerReguaCheia] = useState({}) // { [ref]: true } mostra a régua canônica inteira
  const [edits,       setEdits]       = useState({})      // { [ref]: { [tam]: rawString } }  qtd
  const [custoEdits,  setCustoEdits]  = useState({})      // { [ref]: rawString }  valor unit.
  const [gradeSel,    setGradeSel]    = useState({})      // { [ref]: gradeCode escolhido }

  const [cd, setCd] = useState(null)     // linha de compradores do CD (remetente do PDF fornecedor)

  const firstQtdRef     = useRef(null)   // 1º input da linha Qtd da ref aberta
  const focusOnExpand   = useRef(false)  // pedir foco no 1º input ao expandir (nav por teclado)

  const limparEdits = () => { setEdits({}); setCustoEdits({}); setGradeSel({}) }

  useEffect(() => {
    compradoresService.list()
      .then(list => setCd(list.find(c => c.id === CD_COMPRADOR_ID) ?? null))
      .catch(() => {})
  }, [])

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

  // Totais do pedido inteiro (ao vivo, refletindo as edições da tela).
  const totalGeralPecas = grupos.reduce((s, g) => s + totalEfetivoRef(g), 0)
  const totalGeralValor = grupos.reduce((s, g) => s + (valorTotalRef(g) ?? 0), 0)
  const refsComPeca     = grupos.filter(g => totalEfetivoRef(g) > 0).length

  // "Voltar" com rede de proteção: não perde edição não salva sem avisar.
  function handleVoltar() {
    if (temPendente &&
        !window.confirm('Você tem alterações não salvas nesta tela. Sair mesmo assim? As alterações serão perdidas.')) return
    onVoltar()
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
        // Mantém o que a pessoa digitou; só atualiza a base de comparação. Os
        // campos que ainda diferem do servidor continuam destacados como pendentes.
        setPedido(atual)
        setErroSalvar('Outra pessoa alterou este rascunho no servidor enquanto você editava. Atualizei os números originais — os seus ajustes continuam nos campos. Confira o que ficou destacado e salve de novo.')
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
    if (status === 'descartado' &&
        !window.confirm(`Descartar a reposição de ${pedido.marca}? Ela sai da lista de rascunhos. Dá pra reabrir depois na aba "Descartado".`)) return
    if (status === 'revisado' && totalGeralPecas === 0 &&
        !window.confirm('Este pedido ficou sem nenhuma peça (todos os tamanhos zerados). Marcar como revisado assim mesmo?')) return

    const revisadoPor = comprador?.nome ?? user?.email ?? 'desconhecido'
    setErroStatus(null)
    setProcessando(true)
    try {
      await reposicaoService.marcarStatus(id, status, revisadoPor)
      onStatusChange(status)
      if (status === 'revisado') {
        await carregar()          // recarrega → tela vira somente-leitura, com os PDFs à mão
        setSucesso('revisado')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        onVoltar()
      }
    } catch (e) {
      setErroStatus(`Não foi possível atualizar o status: ${e.message}`)
    } finally {
      setProcessando(false)
    }
  }

  // Snapshot das referências pro PDF: grade escolhida + qtds já salvas (os botões
  // de PDF ficam travados enquanto houver alteração pendente, então o que está na
  // tela == o que está no banco).
  function montarGruposPDF() {
    return grupos.map(g => {
      const grade = gradeDaRef(g)
      const colunas = colunasDaGrade(grade, g.tamanhosPresentes)
      const porTamanho = {}
      for (const t of colunas) {
        const it = g.porTamanho[t]
        porTamanho[t] = {
          qtd:             it?.qtd ?? 0,
          vendido_periodo: it?.vendido_periodo ?? 0,
          estoque_cd:      it?.estoque_cd ?? 0,
          ja_pedido:       it?.ja_pedido ?? 0,
        }
      }
      return {
        referencia: g.referencia, reffornecedor: g.reffornecedor, codigo_ponto_e: g.codigo_ponto_e,
        nome: g.nome, tipo: g.tipo, classe: g.classe,
        grade, colunas, porTamanho,
        custoRef: g.custoRef, totalQtd: g.totalAtual,
      }
    }).filter(g => g.totalQtd > 0)
  }

  function handleGerarPDF(paraFornecedor) {
    if (temPendente || temInvalido) return
    const gs = montarGruposPDF()
    if (!gs.length) { alert('Nenhuma referência com quantidade para gerar o PDF.'); return }
    if (paraFornecedor) {
      const semRef = gs.filter(g => !g.reffornecedor).length
      const semCusto = gs.filter(g => g.custoRef == null).length
      if (semRef || semCusto) {
        const linhas = [
          semRef && `• ${semRef} referência(s) sem código do fornecedor — sairão com a coluna em branco`,
          semCusto && `• ${semCusto} referência(s) sem custo — sairão com "—"`,
        ].filter(Boolean).join('\n')
        if (!window.confirm(`Antes de gerar o pedido pra ${pedido.marca}:\n\n${linhas}\n\nGerar mesmo assim?`)) return
      }
      if (!cd) { alert('Não consegui carregar os dados do CD (faturamento). Tente de novo em instantes.'); return }
    }
    gerarPDFReposicao(
      { id: pedido.id, marca: pedido.marca, janela_dias: pedido.janela_dias, gerado_por: pedido.gerado_por, gerado_em: pedido.gerado_em },
      gs,
      { paraFornecedor, cd: paraFornecedor ? cd : null },
    )
  }

  if (loading && !pedido) return <div className={`${styles.page} ${styles.pageWide}`}><div className={styles.vazio}>Carregando…</div></div>
  if (erro) return <div className={`${styles.page} ${styles.pageWide}`}><div className={styles.erro}>Erro ao carregar: {erro}</div></div>
  if (!pedido) return null

  return (
    <div className={`${styles.page} ${styles.pageWide}`}>
      <button className={styles.voltar} onClick={handleVoltar}>
        <ArrowLeft size={14} strokeWidth={1.8} /> Voltar
      </button>

      <div className={styles.header}>
        <div className={styles.detalheTopo}>
          <h1 className={styles.title}>{pedido.marca}</h1>
          <span className={`${styles.badge} ${styles['badge_' + pedido.status]}`}>{STATUS_LABEL[pedido.status]}</span>
        </div>
        <p className={styles.subtitle}>
          Base: vendas dos últimos {pedido.janela_dias} dias · gerado por {pedido.gerado_por || '—'} em {fmtDateTime(pedido.gerado_em)}
          {pedido.status !== 'rascunho' && (
            <> · {STATUS_LABEL[pedido.status].toLowerCase()} por {pedido.revisado_por || '—'} em {fmtDateTime(pedido.revisado_em)}</>
          )}
        </p>
        {editavel && (
          <p className={styles.subtitleHint}>
            Clique numa referência para abrir a grade. A quantidade sugerida já vem preenchida; ajuste o que quiser (Enter/Tab anda pelos campos, o valor fica selecionado ao entrar). Coloque <strong>0</strong> num tamanho que não quer repor. Depois clique em <strong>Salvar alterações</strong> e então marque como revisado.
          </p>
        )}
      </div>

      {sucesso === 'revisado' && (
        <div className={styles.sucessoBanner}>
          <Check size={16} strokeWidth={2} />
          <span>
            Pedido de <strong>{pedido.marca}</strong> marcado como revisado. Agora gere o <strong>PDF fornecedor</strong> abaixo para enviar à marca.
          </span>
          <button type="button" className={styles.sucessoVoltar} onClick={onVoltar}>Voltar à lista</button>
        </div>
      )}

      {grupos.length > 1 && (
        <div className={styles.tabelaTopo}>
          <button
            type="button"
            className={styles.btnToggleGrades}
            onClick={() => setExpandirTudo(v => !v)}
          >
            <ChevronsUpDown size={13} strokeWidth={1.8} />
            {expandirTudo ? 'Recolher todas as grades' : 'Expandir todas as grades'}
          </button>
        </div>
      )}

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
            const aberta  = expandirTudo || expandida === g.referencia
            const editada = refsComEdicao.has(g.referencia)
            const grade   = gradeDaRef(g)
            // Colunas de tamanho da grade aberta. Enquanto o revisor não escolher a
            // grade no seletor (nem pedir "ver régua inteira"), mostra só os tamanhos
            // que vieram com dado (ou que ele já editou) — grade adivinhada errada
            // (ex.: produto UNI que caiu em "BB") não polui a tabela com colunas
            // vazias que fazem o Total parecer errado.
            const gradeEscolhida = gradeSel[g.referencia] !== undefined
            const mostrarRegua = gradeEscolhida || verReguaCheia[g.referencia]
            const colunasFull = colunasDaGrade(grade, g.tamanhosPresentes)
            const colunasVis  = mostrarRegua
              ? colunasFull
              : colunasFull.filter(t => g.porTamanho[t] || edits[g.referencia]?.[t] !== undefined)
            const colunas = colunasVis.length ? colunasVis : colunasFull
            // Total é somado sobre a régua completa; colunas ocultas nunca têm qtd
            // nem edição, então o número bate com o que aparece na tela.
            const pecas   = totalEfetivoRef(g)
            const custoSt = custoStateDe(g.referencia)
            const gradeForaDosDados = editavel && !mostrarRegua &&
              tamanhosDeTipoGrade(grade).length > 0 &&
              tamanhosDeTipoGrade(grade).every(t => !g.porTamanho[t])
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
                          onFocus={e => e.target.select()}
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
                              {editavel && !g.tipoGradeSalva && grade === g.gradePalpite && !gradeForaDosDados && (
                                <span className={styles.gradeHint}> (palpite — confira)</span>
                              )}
                            </label>
                            {gradeForaDosDados && (
                              <div className={styles.gradeAviso}>
                                Os tamanhos que vieram ({g.tamanhosPresentes.join(', ')}) não são desta grade. Confira a grade no seletor{' '}
                                — ou{' '}
                                <button
                                  type="button"
                                  className={styles.gradeAvisoLink}
                                  onClick={() => setVerReguaCheia(p => ({ ...p, [g.referencia]: true }))}
                                >mostre a régua inteira</button>.
                              </div>
                            )}
                            {editavel && !gradeForaDosDados && (colunasFull.length > colunas.length || verReguaCheia[g.referencia]) && (
                              <div>
                                <button
                                  type="button"
                                  className={styles.gradeAvisoLink}
                                  onClick={() => setVerReguaCheia(p => ({ ...p, [g.referencia]: !verReguaCheia[g.referencia] }))}
                                >
                                  {verReguaCheia[g.referencia]
                                    ? 'esconder tamanhos vazios'
                                    : `+ mostrar todos os ${colunasFull.length} tamanhos da grade`}
                                </button>
                              </div>
                            )}
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
                            const sug = it?.qtd_sugerida
                            const mostraSug = editavel && sug != null && sug !== valorEfetivo(g.referencia, t)
                            return (
                              <div key={t} className={styles.gradeInlineSize}>
                                {editavel ? (
                                  <>
                                    <input
                                      ref={ci === 0 ? firstQtdRef : null}
                                      type="number"
                                      min="0"
                                      className={`${styles.qtyInput} ${st === 'invalid' ? styles.qtyInputInvalido : ''} ${st === 'dirty' ? styles.qtyInputDirty : ''} ${!it ? styles.qtyInputNovo : ''}`}
                                      value={raw}
                                      placeholder={it ? '0' : '·'}
                                      onChange={e => setQtd(g.referencia, t, e.target.value)}
                                      onFocus={e => e.target.select()}
                                      onKeyDown={handleKeyNavQtd}
                                      aria-label={`Quantidade ${g.referencia} tamanho ${t}`}
                                    />
                                    <span className={styles.sugFantasma}>{mostraSug ? `sug. ${sug}` : ' '}</span>
                                  </>
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

      <div className={styles.resumoBar}>
        <span><strong>{refsComPeca}</strong> referência{refsComPeca === 1 ? '' : 's'} com peça</span>
        <span aria-hidden>·</span>
        <span><strong>{totalGeralPecas}</strong> peça{totalGeralPecas === 1 ? '' : 's'} no total</span>
        {totalGeralValor > 0 && <><span aria-hidden>·</span><span><strong>R$ {fmtValorBR(totalGeralValor)}</strong></span></>}
      </div>

      {erroStatus && <div className={styles.erro}>{erroStatus}</div>}
      {erroSalvar && <div className={styles.erro}>{erroSalvar}</div>}
      {temInvalido && !erroSalvar && (
        <div className={styles.avisoInvalido}>Há valor inválido — a quantidade tem que ser um número inteiro de 0 a 9999 (use <strong>0</strong> para não repor um tamanho; não deixe o campo em branco) e o custo tem que ser um número (ex.: 16,90).</div>
      )}
      {editavel && temPendente && !temInvalido && !erroSalvar && (
        <div className={styles.pendenteAviso}>
          Você tem alterações não salvas — clique em <strong>Salvar alterações</strong> antes de gerar PDF ou marcar como revisado.
        </div>
      )}

      <div className={styles.pdfRow}>
        <button
          className={styles.btnPdf}
          disabled={temPendente || temInvalido}
          title={temPendente || temInvalido ? 'Salve as alterações primeiro' : 'PDF com tudo (uso interno)'}
          onClick={() => handleGerarPDF(false)}
        >
          <FileText size={13} strokeWidth={1.8} /> PDF interno
        </button>
        <button
          className={styles.btnPdf}
          disabled={temPendente || temInvalido}
          title={temPendente || temInvalido ? 'Salve as alterações primeiro' : `Pedido pra enviar à ${pedido.marca}`}
          onClick={() => handleGerarPDF(true)}
        >
          <FileText size={13} strokeWidth={1.8} /> PDF fornecedor
        </button>
      </div>

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
            className={styles.btnDescartarSutil}
            disabled={processando || salvando || temPendente || temInvalido}
            onClick={() => handleMarcar('descartado')}
          >
            <X size={13} strokeWidth={1.8} /> Descartar pedido
          </button>
          <button
            className={styles.btnRevisar}
            disabled={processando || salvando || temPendente || temInvalido}
            onClick={() => handleMarcar('revisado')}
          >
            <Check size={14} strokeWidth={1.8} /> {processando ? 'Um instante…' : 'Marcar como revisado'}
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
  const [aba, setAba] = useState('rascunho')
  const [refreshSignal, setRefreshSignal] = useState(0)

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
        onStatusChange={novoStatus => {
          setRefreshSignal(s => s + 1)
          if (novoStatus) setAba(novoStatus)   // ao revisar/descartar, a lista já abre na aba certa
        }}
      />
    )
  }

  return (
    <ListaRascunhos
      aba={aba}
      setAba={setAba}
      refreshSignal={refreshSignal}
      onAbrir={setAbertoId}
    />
  )
}
