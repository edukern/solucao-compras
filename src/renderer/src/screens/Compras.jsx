import { useState, useEffect, useRef } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { useAuth } from '../contexts/AuthContext'
import ConfirmModal from '../components/ConfirmModal'
import { MarkupSessao } from './MarkupSessao'
import { HistoricoSessoes } from './HistoricoSessoes'
import { VisualizarSessao } from './VisualizarSessao'
import { PreencherMinhaLoja } from './PreencherMinhaLoja'
import { FecharSessao } from './FecharSessao'
import { RegistrarPedidoSessao } from './RegistrarPedidoSessao'
import styles from './Compras.module.css'
import { sessoes as sessoesService } from '../services/sessoes'
import { pedidos as pedidosService } from '../services/pedidos'
import { segmentacoes as segmentacoesService } from '../services/segmentacoes'
import { fornecedores as fornecedoresService } from '../services/fornecedores'
import { compradores as compradoresService } from '../services/compradores'
import { appConfig as appConfigService } from '../services/appConfig'
import { fmtDate, today } from '../lib/format'

// ─── Tutorial overlay ─────────────────────────────────────────────────────

function TutorialOverlay({ onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); onClose() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.kbTutOverlay}>
      <div className={styles.kbTutCard}>
        <div className={styles.kbTutTitle}>⌨️ Preenchimento por teclado</div>
        <div className={styles.kbTutSub}>Este formulário é otimizado para velocidade.</div>
        <div className={styles.kbTutRows}>
          {[
            { keys: ['Enter'],  desc: 'Avança para o próximo campo' },
            { keys: ['Esc'],    desc: 'Volta ao campo anterior' },
            { keys: ['C', 'F'], desc: 'Frete CIF ou FOB (auto-avança)' },
            { keys: ['1–8'],    desc: 'Seleciona loja participante' },
          ].map(({ keys, desc }) => (
            <div key={desc} className={styles.kbTutRow}>
              <div className={styles.kbTutKeys}>
                {keys.map(k => <kbd key={k} className={styles.kbTutKbd}>{k}</kbd>)}
              </div>
              <div className={styles.kbTutDesc}>{desc}</div>
            </div>
          ))}
        </div>
        <div className={styles.kbTutFooter}>
          <span className={styles.kbTutSkip} onClick={onClose}>Não mostrar novamente</span>
          <button className={styles.kbTutDismiss} onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}


// ─── Phase 1: Start Session ───────────────────────────────────────────────

const FIELD_NAMES = {
  fornecedor:     'Fornecedor',
  corDetalhe:     'Cor e detalhe',
  data:           'Data da visita',
  dataEntrega:    'Data de entrega',
  vendedor:       'Vendedor',
  condPag:        'Cond. de pagamento',
  frete:          'Frete',
  transportadora: 'Transportadora',
  lojas:          'Lojas participantes',
}

function DoneLabel({ name }) {
  return (
    <div className={styles.kbFieldLabel}>
      <span className={styles.kbCheck}>✓</span> {FIELD_NAMES[name]}
    </div>
  )
}

function UpcomingLabel({ name }) {
  return <div className={styles.kbFieldLabel}>{FIELD_NAMES[name]}</div>
}

function IniciarSessao({ forns, compradores, colId, onStart }) {
  const [fornId,         setFornId]         = useState('')
  const [fornFilter,     setFornFilter]     = useState('')
  const [fornFocusIdx,   setFornFocusIdx]   = useState(0)
  const [data,           setData]           = useState(today())
  const [dataEntrega,    setDataEntrega]    = useState('')
  const [vendedor,       setVendedor]       = useState('')
  const [condPag,        setCondPag]        = useState('')
  const [frete,          setFrete]          = useState('')
  const [transportadora, setTransportadora] = useState('')
  const [obs,            setObs]            = useState('')
  const [lojas,          setLojas]          = useState([])
  const [temCorDetalhe,  setTemCorDetalhe]  = useState(false)
  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState(null)
  const [activeField,    setActiveField]    = useState('fornecedor')
  const [showTutorial,   setShowTutorial]   = useState(
    () => localStorage.getItem('sessionFormTutorialSeen') !== 'true'
  )
  const activeRef = useRef(null)

  const ORDER = [
    'fornecedor', 'corDetalhe', 'data', 'dataEntrega', 'vendedor', 'condPag', 'frete',
    ...(frete === 'FOB' ? ['transportadora'] : []),
    'lojas',
  ]
  const activeIdx   = ORDER.indexOf(activeField)
  const progressPct = Math.round((activeIdx / (ORDER.length - 1)) * 100)

  const fornFiltered = forns.filter(f =>
    f.nome.toLowerCase().includes(fornFilter.toLowerCase())
  )

  useEffect(() => { activeRef.current?.focus() }, [activeField])

  // Autofill session fields from fornecedor defaults when supplier is selected
  useEffect(() => {
    if (!fornId) return
    const forn = forns.find(f => String(f.id) === fornId)
    if (!forn) return
    if (forn.vendedor_padrao)        setVendedor(forn.vendedor_padrao)
    if (forn.cond_pag_padrao)        setCondPag(forn.cond_pag_padrao)
    if (forn.frete_padrao)           setFrete(forn.frete_padrao)
    if (forn.transportadora_padrao)  setTransportadora(forn.transportadora_padrao)
    if (forn.obs_padrao)             setObs(forn.obs_padrao)
  }, [fornId])

  function stateOf(name) {
    const i = ORDER.indexOf(name)
    if (i === activeIdx) return 'active'
    if (i < activeIdx)   return 'done'
    return 'upcoming'
  }

  function fieldCls(name) {
    const s = stateOf(name)
    return [
      styles.kbField,
      s === 'active'   ? styles.kbFieldActive   : '',
      s === 'done'     ? styles.kbFieldDone     : '',
      s === 'upcoming' ? styles.kbFieldUpcoming : '',
    ].filter(Boolean).join(' ')
  }

  function advance() {
    const next = ORDER[activeIdx + 1]
    if (next) setActiveField(next)
  }

  function goBack() {
    const prev = ORDER[activeIdx - 1]
    if (prev) setActiveField(prev)
  }

  function toggleLoja(id) {
    setLojas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleStart() {
    if (!fornId || lojas.length === 0) return
    setSaving(true)
    setError(null)
    try {
      const sessao = await sessoesService.create({
        fornecedor_id:  Number(fornId),
        colecao_id:     colId,
        data_visita:    data,
        data_entrega:   dataEntrega || null,
        vendedor,
        cond_pag:       condPag,
        frete,
        transportadora: frete === 'FOB' ? transportadora : '',
        obs,
        desconto_pct:   0,
      }, lojas)
      const lojasPresentes = compradores.filter(c => lojas.includes(c.id))
      const fornSelecionado = forns.find(f => String(f.id) === fornId)
      onStart({ ...sessao, fornecedor_nome: fornSelecionado?.nome ?? '' }, lojasPresentes, temCorDetalhe)
    } catch (e) {
      setError(`Erro ao iniciar sessão: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  function dismissTutorial() {
    localStorage.setItem('sessionFormTutorialSeen', 'true')
    setShowTutorial(false)
  }

  // ── Keyboard handlers ────────────────────────────────────────────────────

  function onFornKey(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFornFocusIdx(i => Math.min(i + 1, fornFiltered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFornFocusIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (fornFilter.length > 0) {
        const sel = fornFiltered[fornFocusIdx] ?? fornFiltered[0]
        if (sel) { setFornId(String(sel.id)); setFornFilter(sel.nome); advance() }
      }
    }
  }

  function onTextKey(e) {
    if (e.key === 'Enter')  { e.preventDefault(); advance() }
    if (e.key === 'Escape') { e.preventDefault(); goBack() }
  }

  function onFreteKey(e) {
    const k = e.key.toLowerCase()
    if (k === 'c')               { e.preventDefault(); setFrete('CIF'); setTransportadora(''); advance() }
    else if (k === 'f')          { e.preventDefault(); setFrete('FOB'); advance() }
    else if (e.key === 'Enter')  { e.preventDefault(); setFrete(''); advance() }
    else if (e.key === 'Escape') { e.preventDefault(); goBack() }
  }

  function onLojasKey(e) {
    const n = parseInt(e.key, 10)
    if (n >= 1 && n <= compradores.length) {
      toggleLoja(compradores[n - 1].id)
    } else if (e.key === 'Enter' && lojas.length > 0) {
      handleStart()
    } else if (e.key === 'Escape') {
      goBack()
    }
  }

  const freteDisplay = { CIF: 'CIF', FOB: 'FOB', '': 'Sem frete' }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={styles.kbForm}>

      {/* Header: title + progress bar + help button */}
      <div className={styles.kbHeader}>
        <span className={styles.kbHeaderTitle}>Iniciar Sessão de Compras</span>
        <div className={styles.kbProgressWrap}>
          <div className={styles.kbProgressBar} style={{ width: `${progressPct}%` }} />
        </div>
        <button
          className={styles.kbHelpBtn}
          onClick={() => setShowTutorial(true)}
          title="Ver atalhos de teclado"
        >?</button>
      </div>

      {/* Fields */}
      <div className={styles.kbFields}>

        {/* 1 — Fornecedor */}
        <div
          className={fieldCls('fornecedor')}
          onClick={stateOf('fornecedor') === 'done' ? () => setActiveField('fornecedor') : undefined}
        >
          {stateOf('fornecedor') === 'active' ? (
            <>
              <div className={styles.kbFieldLabel}>{FIELD_NAMES.fornecedor}</div>
              <input
                ref={activeRef}
                className={styles.kbFieldInput}
                value={fornFilter}
                onChange={e => { setFornFilter(e.target.value); setFornFocusIdx(0) }}
                onKeyDown={onFornKey}
                placeholder="Digite para buscar…"
                autoComplete="off"
              />
              {fornFilter.length > 0 && fornFiltered.length > 0 && (
                <div className={styles.kbDropdown}>
                  {fornFiltered.slice(0, 6).map((f, i) => (
                    <div
                      key={f.id}
                      className={`${styles.kbDropItem} ${i === fornFocusIdx ? styles.kbDropItemFocused : ''}`}
                      onMouseDown={() => { setFornId(String(f.id)); setFornFilter(f.nome); advance() }}
                    >
                      {f.nome}
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.kbHint}>↑↓ navega · <kbd>Enter</kbd> seleciona</div>
            </>
          ) : stateOf('fornecedor') === 'done' ? (
            <>
              <DoneLabel name="fornecedor" />
              <div className={styles.kbFieldValue}>
                {forns.find(f => String(f.id) === fornId)?.nome ?? '—'}
              </div>
            </>
          ) : (
            <UpcomingLabel name="fornecedor" />
          )}
        </div>

        {/* 2 — Cor e detalhe */}
        <div
          className={fieldCls('corDetalhe')}
          onClick={stateOf('corDetalhe') === 'done' ? () => setActiveField('corDetalhe') : undefined}
          ref={stateOf('corDetalhe') === 'active' ? activeRef : null}
          tabIndex={stateOf('corDetalhe') === 'active' ? 0 : undefined}
          onKeyDown={stateOf('corDetalhe') === 'active' ? (e => {
            if (e.key === 's' || e.key === 'S') { setTemCorDetalhe(true); advance() }
            else if (e.key === 'n' || e.key === 'N') { setTemCorDetalhe(false); advance() }
            else if (e.key === 'Escape') goBack()
          }) : undefined}
        >
          {stateOf('corDetalhe') === 'active' ? (
            <>
              <div className={styles.kbFieldLabel}>{FIELD_NAMES.corDetalhe}</div>
              <div className={styles.kbCorDetalheOpts}>
                <button
                  className={`${styles.kbCorDetalheBtn} ${temCorDetalhe === true ? styles.kbCorDetalheBtnOn : ''}`}
                  onMouseDown={() => { setTemCorDetalhe(true); advance() }}
                >S</button>
                <button
                  className={`${styles.kbCorDetalheBtn} ${temCorDetalhe === false ? styles.kbCorDetalheBtnOn : ''}`}
                  onMouseDown={() => { setTemCorDetalhe(false); advance() }}
                >N</button>
              </div>
              <div className={styles.kbHint}><kbd>S</kbd> sim · <kbd>N</kbd> não · <kbd>Esc</kbd> volta</div>
            </>
          ) : stateOf('corDetalhe') === 'done' ? (
            <>
              <DoneLabel name="corDetalhe" />
              <div className={styles.kbFieldValue}>{temCorDetalhe ? 'Sim' : 'Não'}</div>
            </>
          ) : (
            <UpcomingLabel name="corDetalhe" />
          )}
        </div>

        {/* 3 — Data */}
        <div
          className={fieldCls('data')}
          onClick={stateOf('data') === 'done' ? () => setActiveField('data') : undefined}
        >
          {stateOf('data') === 'active' ? (
            <>
              <div className={styles.kbFieldLabel}>{FIELD_NAMES.data}</div>
              <input
                ref={activeRef}
                type="date"
                className={styles.kbFieldInput}
                value={data}
                onChange={e => setData(e.target.value)}
                onKeyDown={onTextKey}
              />
              <div className={styles.kbHint}><kbd>Enter</kbd> confirma · padrão: hoje</div>
            </>
          ) : stateOf('data') === 'done' ? (
            <>
              <DoneLabel name="data" />
              <div className={styles.kbFieldValue}>{fmtDate(data)}</div>
            </>
          ) : (
            <UpcomingLabel name="data" />
          )}
        </div>

        {/* 3 — Data de entrega */}
        <div
          className={fieldCls('dataEntrega')}
          onClick={stateOf('dataEntrega') === 'done' ? () => setActiveField('dataEntrega') : undefined}
        >
          {stateOf('dataEntrega') === 'active' ? (
            <>
              <div className={styles.kbFieldLabel}>{FIELD_NAMES.dataEntrega}</div>
              <input
                ref={activeRef}
                type="date"
                className={styles.kbFieldInput}
                value={dataEntrega}
                onChange={e => setDataEntrega(e.target.value)}
                onKeyDown={onTextKey}
              />
              <div className={styles.kbHint}><kbd>Enter</kbd> confirma · opcional</div>
            </>
          ) : stateOf('dataEntrega') === 'done' ? (
            <>
              <DoneLabel name="dataEntrega" />
              <div className={styles.kbFieldValue}>{dataEntrega ? fmtDate(dataEntrega) : '—'}</div>
            </>
          ) : (
            <UpcomingLabel name="dataEntrega" />
          )}
        </div>

        {/* 4 — Vendedor */}
        <div
          className={fieldCls('vendedor')}
          onClick={stateOf('vendedor') === 'done' ? () => setActiveField('vendedor') : undefined}
        >
          {stateOf('vendedor') === 'active' ? (
            <>
              <div className={styles.kbFieldLabel}>{FIELD_NAMES.vendedor}</div>
              <input
                ref={activeRef}
                type="text"
                className={styles.kbFieldInput}
                value={vendedor}
                onChange={e => setVendedor(e.target.value)}
                onKeyDown={onTextKey}
                placeholder="Nome do vendedor"
              />
              <div className={styles.kbHint}><kbd>Enter</kbd> avança · <kbd>Esc</kbd> volta</div>
            </>
          ) : stateOf('vendedor') === 'done' ? (
            <>
              <DoneLabel name="vendedor" />
              <div className={styles.kbFieldValue}>{vendedor || '—'}</div>
            </>
          ) : (
            <UpcomingLabel name="vendedor" />
          )}
        </div>

        {/* 5 — Cond. Pagamento */}
        <div
          className={fieldCls('condPag')}
          onClick={stateOf('condPag') === 'done' ? () => setActiveField('condPag') : undefined}
        >
          {stateOf('condPag') === 'active' ? (
            <>
              <div className={styles.kbFieldLabel}>{FIELD_NAMES.condPag}</div>
              <input
                ref={activeRef}
                type="text"
                className={styles.kbFieldInput}
                value={condPag}
                onChange={e => setCondPag(e.target.value)}
                onKeyDown={onTextKey}
                placeholder="Ex: 30/60 dias"
              />
              <div className={styles.kbHint}><kbd>Enter</kbd> avança · <kbd>Esc</kbd> volta</div>
            </>
          ) : stateOf('condPag') === 'done' ? (
            <>
              <DoneLabel name="condPag" />
              <div className={styles.kbFieldValue}>{condPag || '—'}</div>
            </>
          ) : (
            <UpcomingLabel name="condPag" />
          )}
        </div>

        {/* 6 — Frete */}
        <div
          className={fieldCls('frete')}
          ref={stateOf('frete') === 'active' ? activeRef : null}
          tabIndex={stateOf('frete') === 'active' ? 0 : undefined}
          onKeyDown={stateOf('frete') === 'active' ? onFreteKey : undefined}
          onClick={stateOf('frete') === 'done' ? () => setActiveField('frete') : undefined}
        >
          {stateOf('frete') === 'active' ? (
            <>
              <div className={styles.kbFieldLabel}>{FIELD_NAMES.frete}</div>
              <div className={styles.kbFreteOpts}>
                {[['CIF', 'C'], ['FOB', 'F'], ['', '↵']].map(([val, key]) => (
                  <button
                    key={val || 'none'}
                    className={`${styles.kbFreteOpt} ${frete === val ? styles.kbFreteOptOn : ''}`}
                    onMouseDown={e => {
                      e.preventDefault()
                      setFrete(val)
                      if (val !== 'FOB') setTransportadora('')
                      advance()
                    }}
                  >
                    <span className={styles.kbKey}>{key}</span>
                    {val || 'Sem frete'}
                  </button>
                ))}
              </div>
              <div className={styles.kbHint}>
                <kbd>C</kbd> CIF · <kbd>F</kbd> FOB · <kbd>Enter</kbd> sem frete · <kbd>Esc</kbd> volta
              </div>
            </>
          ) : stateOf('frete') === 'done' ? (
            <>
              <DoneLabel name="frete" />
              <div className={styles.kbFieldValue}>{freteDisplay[frete] ?? '—'}</div>
            </>
          ) : (
            <UpcomingLabel name="frete" />
          )}
        </div>

        {/* 6b — Transportadora (only when FOB) */}
        {frete === 'FOB' && (
          <div
            className={fieldCls('transportadora')}
            onClick={stateOf('transportadora') === 'done' ? () => setActiveField('transportadora') : undefined}
          >
            {stateOf('transportadora') === 'active' ? (
              <>
                <div className={styles.kbFieldLabel}>{FIELD_NAMES.transportadora}</div>
                <input
                  ref={activeRef}
                  type="text"
                  className={styles.kbFieldInput}
                  value={transportadora}
                  onChange={e => setTransportadora(e.target.value)}
                  onKeyDown={onTextKey}
                  placeholder="Nome da transportadora"
                />
                <div className={styles.kbHint}><kbd>Enter</kbd> avança · <kbd>Esc</kbd> volta</div>
              </>
            ) : stateOf('transportadora') === 'done' ? (
              <>
                <DoneLabel name="transportadora" />
                <div className={styles.kbFieldValue}>{transportadora || '—'}</div>
              </>
            ) : (
              <UpcomingLabel name="transportadora" />
            )}
          </div>
        )}

        {/* 7 — Lojas */}
        <div
          className={fieldCls('lojas')}
          ref={stateOf('lojas') === 'active' ? activeRef : null}
          tabIndex={stateOf('lojas') === 'active' ? 0 : undefined}
          onKeyDown={stateOf('lojas') === 'active' ? onLojasKey : undefined}
        >
          {stateOf('lojas') === 'active' ? (
            <>
              <div className={styles.kbFieldLabel}>{FIELD_NAMES.lojas}</div>
              <div className={styles.kbLojaGrid}>
                {compradores.map((c, i) => (
                  <div
                    key={c.id}
                    className={`${styles.kbLojaChip} ${lojas.includes(c.id) ? styles.kbLojaChipOn : ''}`}
                    onMouseDown={() => toggleLoja(c.id)}
                  >
                    <div className={`${styles.kbLojaNum} ${lojas.includes(c.id) ? styles.kbLojaNumOn : ''}`}>
                      {i + 1}
                    </div>
                    <div>
                      <div className={styles.kbLojaName}>{c.nome}</div>
                      {c.cidade && <div className={styles.kbLojaCity}>{c.cidade}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.kbHint}>
                <kbd>1</kbd>–<kbd>{compradores.length}</kbd> seleciona loja participante · <kbd>Enter</kbd> iniciar · <kbd>Esc</kbd> volta
              </div>
            </>
          ) : stateOf('lojas') === 'done' ? (
            <>
              <DoneLabel name="lojas" />
              <div className={styles.kbFieldValue}>{lojas.length} loja(s) selecionada(s)</div>
            </>
          ) : (
            <UpcomingLabel name="lojas" />
          )}
        </div>

      </div>

      {/* Error + fallback submit button */}
      {error && <div className={styles.errorBanner}>{error}</div>}
      <div className={styles.phaseActions}>
        <button
          className={styles.btnPrimary}
          disabled={!fornId || lojas.length === 0 || saving}
          onClick={handleStart}
        >
          Iniciar Sessão →
        </button>
      </div>

      {/* Tutorial overlay */}
      {showTutorial && <TutorialOverlay onClose={dismissTutorial} />}

    </div>
  )
}


// ─── Orchestrator ─────────────────────────────────────────────────────────

export default function Compras() {
  const { active } = useCollection()
  const { comprador: currentComprador } = useAuth()
  const [segs,        setSegs]        = useState([])
  const [forns,       setForns]       = useState([])
  const [compradores, setCompradores] = useState([])
  // phases: 0=home, 1=nova sessão, 2=registrar, 3=fechar, 4=visualizar
  const [phase,           setPhase]           = useState(0)
  const [sessao,          setSessao]          = useState(null)
  const [visitas,         setVisitas]         = useState([])
  const [pedidosFechados, setPedidosFechados] = useState([])
  const [viewSessaoId,    setViewSessaoId]    = useState(null)
  const [preencherInfo,   setPreencherInfo]   = useState(null) // { sessaoId, visitaId, compradorNome }
  const [histRefreshKey,  setHistRefreshKey]  = useState(0)
  const [recoveryData,    setRecoveryData]    = useState([])
  const [recoveryInitial, setRecoveryInitial] = useState(null)
  const [retomarLoading,  setRetomarLoading]  = useState(null)
  const [sessaoCorDetalhe, setSessaoCorDetalhe] = useState(false)
  const [isOnline,        setIsOnline]        = useState(navigator.onLine)
  const [markupSessao,    setMarkupSessao]    = useState(null) // sessão aberta no modal de markup
  const [manutencao,      setManutencao]      = useState(null) // null | { manutencao, mensagem }

  // Polling leve da flag de manutenção (a cada 30s) — bloqueia gravação durante migração
  useEffect(() => {
    let alive = true
    const load = () => appConfigService.get().then(c => { if (alive) setManutencao(c) }).catch(() => {})
    load()
    const t = setInterval(load, 30000)
    return () => { alive = false; clearInterval(t) }
  }, [])

  useEffect(() => {
    const onOnline  = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      segmentacoesService.list(),
      fornecedoresService.listAtivos(),
      compradoresService.list(),
    ]).then(([s, f, c]) => { if (!cancelled) { setSegs(s); setForns(f); setCompradores(c) } })
    return () => { cancelled = true }
  }, [])

  // Verifica se há sessões interrompidas para recuperar (uma ou mais)
  useEffect(() => {
    if (!active?.id) return
    let cancelled = false
    // Migra chave legada SC_RECOVERY_<colId> para o novo formato por sessão
    const legacyKey = `SC_RECOVERY_${active.id}`
    const legacyRaw = localStorage.getItem(legacyKey)
    if (legacyRaw) {
      try {
        const legacyData = JSON.parse(legacyRaw)
        if (legacyData.sessao_id) {
          localStorage.setItem(`SC_RECOVERY_SESSAO_${legacyData.sessao_id}`, legacyRaw)
        }
      } catch {}
      localStorage.removeItem(legacyKey)
    }
    const keys = Object.keys(localStorage).filter(k => k.startsWith('SC_RECOVERY_SESSAO_'))
    if (!keys.length) { setRecoveryData([]); return }

    Promise.all(keys.map(async key => {
      try {
        const data = JSON.parse(localStorage.getItem(key))
        const sessaoDb = await sessoesService.byId(data.sessao_id)
        if (!sessaoDb) { localStorage.removeItem(key); return null }
        // Ignora sessões de outras coleções
        if (sessaoDb.colecao_id !== active.id) return null
        // Banco é a fonte da verdade. O buffer local só sobrevive se for estritamente mais
        // novo que o updated_at máximo do banco (crash antes do flush de 2s). Senão, descarta.
        const maxUpdated = await pedidosService.maxUpdatedAt(data.sessao_id)
        if (maxUpdated && (!data.savedAt || data.savedAt <= maxUpdated)) {
          localStorage.removeItem(key); return null
        }
        const visEnriquecidas = sessaoDb.visitas.map(v => ({
          id:                 v.visita_id,
          comprador_id:       v.comprador_id,
          comprador_nome:     v.comprador_nome,
          comprador_cnpj:     v.comprador_cnpj     ?? '',
          comprador_cidade:   v.comprador_cidade   ?? '',
          comprador_fantasia: v.comprador_fantasia ?? '',
          comprador_ie:       v.comprador_ie       ?? '',
          comprador_email:    v.comprador_email    ?? '',
          comprador_telefone: v.comprador_telefone ?? '',
          comprador_endereco: v.comprador_endereco ?? '',
        }))
        return { sessao: sessaoDb, visitas: visEnriquecidas, ...data }
      } catch {
        localStorage.removeItem(key)
        return null
      }
    })).then(results => {
      if (cancelled) return
      setRecoveryData(results.filter(Boolean))
    })
    return () => { cancelled = true }
  }, [active?.id])

  function handleStart(novaSessao, lojas, temCorDetalhe = false) {
    const visitasEnriquecidas = novaSessao.visitas.map(v => {
      const loja = lojas.find(l => l.id === v.comprador_id)
      return {
        id: v.visita_id,
        comprador_id:       v.comprador_id,
        comprador_nome:     loja?.nome     ?? `Loja #${v.comprador_id}`,
        comprador_cnpj:     loja?.cnpj     ?? '',
        comprador_cidade:   loja?.cidade   ?? '',
        comprador_fantasia: loja?.fantasia ?? '',
        comprador_ie:       loja?.ie       ?? '',
        comprador_email:    loja?.email    ?? '',
        comprador_telefone: loja?.telefone ?? '',
        comprador_endereco: loja?.endereco ?? '',
      }
    })
    // Ordenar visitas pela mesma ordem da tela de Configurações (compradores.ordem)
    const ordemIds = lojas.map(l => l.id)
    visitasEnriquecidas.sort((a, b) => ordemIds.indexOf(a.comprador_id) - ordemIds.indexOf(b.comprador_id))
    // Enrich with fornecedor name from the already-loaded forns list
    const forn = forns.find(f => f.id === novaSessao.fornecedor_id)
    const sessaoEnriquecida = { ...novaSessao, fornecedor_nome: forn?.nome || novaSessao.fornecedor_nome || '' }
    setSessao(sessaoEnriquecida)
    setVisitas(visitasEnriquecidas)
    setSessaoCorDetalhe(temCorDetalhe)
    setPhase(2)
  }

  function handleFechar(pedidos) {
    setPedidosFechados(pedidos)
    setPhase(3)
  }

  function handleRecover(entry) {
    const { sessao, visitas, items, qtds, activeId, lojaIdx } = entry
    setSessao(sessao)
    setVisitas(visitas)
    setRecoveryInitial({ items: items ?? [], qtds: qtds ?? {}, activeId: activeId ?? null, lojaIdx: lojaIdx ?? 0 })
    setRecoveryData([])
    setPhase(2)
  }

  function handleDismissRecovery(sessaoId) {
    localStorage.removeItem(`SC_RECOVERY_SESSAO_${sessaoId}`)
    setRecoveryData(prev => prev.filter(r => r.sessao.id !== sessaoId))
  }

  async function handleRetomarSessao(ses) {
    setRetomarLoading(ses.id)
    try {
      const [sessaoDb, visitasComPedidos] = await Promise.all([
        sessoesService.byId(ses.id),
        pedidosService.itensPorFornecedor(ses.id),
      ])

      const visitasEnriquecidas = sessaoDb.visitas.map(v => ({
        id:                 v.visita_id,
        comprador_id:       v.comprador_id,
        comprador_nome:     v.comprador_nome,
        comprador_cnpj:     v.comprador_cnpj     ?? '',
        comprador_cidade:   v.comprador_cidade   ?? '',
        comprador_fantasia: v.comprador_fantasia ?? '',
        comprador_ie:       v.comprador_ie       ?? '',
        comprador_email:    v.comprador_email    ?? '',
        comprador_telefone: v.comprador_telefone ?? '',
        comprador_endereco: v.comprador_endereco ?? '',
      }))
      const ordemIds = compradores.map(c => c.id)
      visitasEnriquecidas.sort((a, b) => ordemIds.indexOf(a.comprador_id) - ordemIds.indexOf(b.comprador_id))

      const toStr = n => (n != null && n !== '') ? String(n).replace('.', ',') : ''

      // Build items as union of all refs across all visitas (keyed by referencia+variante_key to deduplicate)
      // Sort by id (auto-increment) so references appear in the order they were originally added
      const allPedidos = visitasComPedidos.flatMap(v => v.pedidos ?? [])
      allPedidos.sort((a, b) => a.id - b.id)

      const itemMap = new Map()
      for (const ped of allPedidos) {
        const vk = ped.variante_key ?? ''
        const lId = `${ped.referencia}|${vk}`
        if (!itemMap.has(lId)) {
          itemMap.set(lId, {
            localId: lId,
            variante_key: vk,
            ref: ped.referencia,
            tipo_produto: ped.segmentacao?.tipo_produto ?? '',
            tipo_grade: ped.segmentacao?.tipo_grade ?? 'AD',
            classe: ped.segmentacao?.classe ?? 'FEM',
            icms_pct: toStr(ped.icms_pct),
            valor: toStr(ped.valor_unitario),
            markup_pct: toStr(ped.markup_pct),
            preco_venda: toStr(ped.preco_venda),
            cor: ped.cor ?? '',
            detalhe: ped.detalhe ?? '',
            obs: ped.obs ?? '',
          })
        }
      }
      const items = [...itemMap.values()]

      // Load ALL stores' qtds (Phase 5 fills + Phase 2 organizer fills)
      const qtds = {}
      for (const visita of visitasComPedidos) {
        for (const ped of visita.pedidos ?? []) {
          const lId = `${ped.referencia}|${ped.variante_key ?? ''}`
          if (!qtds[lId]) qtds[lId] = {}
          const visitaQtds = {}
          for (const it of ped.itens ?? []) {
            if (it.qtd > 0) visitaQtds[it.tamanho] = it.qtd
          }
          if (Object.keys(visitaQtds).length) {
            qtds[lId][visita.id] = visitaQtds
          }
        }
      }

      const forn = forns.find(f => f.id === ses.fornecedor_id)
      setSessao({ ...sessaoDb, fornecedor_nome: forn?.nome || sessaoDb.fornecedor?.nome || '', fechada_em: null })
      setVisitas(visitasEnriquecidas)
      setRecoveryInitial({ items, qtds, activeId: items[0]?.localId ?? null, lojaIdx: 0 })
      setPhase(2)
      // Reabrir a edição volta a sessão para "aberta" (limpa o carimbo). Não-bloqueante;
      // só grava se estava fechada, p/ não escrever à toa a cada Retomar.
      if (ses.fechada_em) {
        sessoesService.update(ses.id, { fechada_em: null })
          .catch(e => console.warn('Não consegui reabrir o status da sessão:', e.message))
      }
    } catch (e) {
      alert(`Erro ao retomar sessão: ${e.message}`)
    } finally {
      setRetomarLoading(null)
    }
  }

  function handleNovaSessao() {
    setSessao(null)
    setVisitas([])
    setPedidosFechados([])
    setRecoveryInitial(null)
    setHistRefreshKey(k => k + 1)
    setPhase(0)
  }

  async function handleVisualizar(sessaoId) {
    setRetomarLoading(sessaoId)
    try {
      const sessaoDb = await sessoesService.byId(sessaoId)
      const visitasEnriquecidas = sessaoDb.visitas.map(v => ({
        id:                 v.visita_id,
        comprador_id:       v.comprador_id,
        comprador_nome:     v.comprador_nome,
        comprador_cnpj:     v.comprador_cnpj     ?? '',
        comprador_cidade:   v.comprador_cidade   ?? '',
        comprador_fantasia: v.comprador_fantasia ?? '',
        comprador_ie:       v.comprador_ie       ?? '',
        comprador_email:    v.comprador_email    ?? '',
        comprador_telefone: v.comprador_telefone ?? '',
        comprador_endereco: v.comprador_endereco ?? '',
      }))
      const ordemIds = compradores.map(c => c.id)
      visitasEnriquecidas.sort((a, b) => ordemIds.indexOf(a.comprador_id) - ordemIds.indexOf(b.comprador_id))
      const forn = forns.find(f => f.id === sessaoDb.fornecedor_id)
      setSessao({ ...sessaoDb, fornecedor_nome: forn?.nome || sessaoDb.fornecedor?.nome || '' })
      setVisitas(visitasEnriquecidas)
      setPedidosFechados([])
      setPhase(3)
    } catch (e) {
      alert(`Erro ao carregar sessão: ${e.message}`)
    } finally {
      setRetomarLoading(null)
    }
  }

  function handleBackFromView() {
    setViewSessaoId(null)
    setPhase(0)
  }

  function handlePreencherLoja(sessaoId, visitaId, compradorNome) {
    setPreencherInfo({ sessaoId, visitaId, compradorNome })
    setPhase(5)
  }

  function handleBackFromPreencher() {
    setPreencherInfo(null)
    setPhase(0)
  }

  const sessaoDisplay = sessao ?? null
  const inSession = phase >= 2

  useEffect(() => {
    if (phase === 2 && currentComprador !== undefined && !currentComprador?.is_editor) {
      setPhase(0)
    }
  }, [phase, currentComprador])

  if (!active) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Compras</h1>
        <div className={styles.placeholder}>Selecione uma coleção ativa na barra lateral.</div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Compras — {active.nome}</h1>

      {manutencao?.manutencao && (
        <div style={{
          background: 'var(--red, #e05252)', color: '#fff', padding: '8px 16px',
          textAlign: 'center', fontWeight: 600, fontSize: 14, borderRadius: 6, marginBottom: 8
        }}>
          {manutencao.mensagem}
        </div>
      )}

      {!isOnline && (
        <div className={styles.offlineBanner}>
          Sem conexão com a internet — mudanças não serão salvas.
        </div>
      )}

      {/* Recovery banners — shown in Phase 0 (home) */}
      {phase === 0 && recoveryData.map(entry => (
        <div key={entry.sessao.id} className={styles.recoveryBanner}>
          <span>
            Rascunho local não enviado: <strong>{entry.sessao.fornecedor?.nome || entry.sessao.fornecedor_nome}</strong>
            {' '}em <strong>{fmtDate(entry.sessao.data_visita)}</strong>. Deseja continuar de onde parou?
            <small style={{ display: 'block', color: 'inherit', opacity: 0.7, fontSize: '0.78em', marginTop: '2px' }}>
              Ignorar apenas oculta este aviso — a sessão continua salva no banco.
            </small>
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button className={styles.btnPrimary} onClick={() => handleRecover(entry)}>Continuar</button>
            <button className={styles.btnSecondary} onClick={() => handleDismissRecovery(entry.sessao.id)}>Ignorar</button>
          </div>
        </div>
      ))}

      {/* Phase 0: Home — sessions list */}
      {phase === 0 && (
        <HistoricoSessoes
          colId={active.id}
          refreshKey={histRefreshKey}
          onNovaSessao={() => setPhase(1)}
          onVisualizar={handleVisualizar}
          onPreencherLoja={handlePreencherLoja}
          onRetomarSessao={handleRetomarSessao}
          retomarLoading={retomarLoading}
          onMarkup={ses => setMarkupSessao(ses)}
        />
      )}

      {/* Markup modal — global, can open from Histórico */}
      {markupSessao && (
        <MarkupSessao sessao={markupSessao} onClose={() => setMarkupSessao(null)} />
      )}

      {/* Phase 1: Nova sessão form */}
      {phase === 1 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <button className={styles.btnBack} onClick={() => setPhase(0)}>← Voltar</button>
          </div>
          <div className={styles.stepBar}>
            {['Iniciar sessão', 'Registrar pedidos', 'Gerar PDFs'].map((label, i) => (
              <div key={i} className={`${styles.step} ${phase === i + 1 ? styles.stepActive : ''} ${phase > i + 1 ? styles.stepDone : ''}`}>
                <span className={styles.stepNum}>{i + 1}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <IniciarSessao
            forns={forns}
            compradores={compradores}
            colId={active.id}
            onStart={handleStart}
          />
        </>
      )}

      {/* Phase 2: Registrar pedidos */}
      {phase === 2 && sessao && (
        <RegistrarPedidoSessao
          sessao={sessaoDisplay}
          visitas={visitas}
          colId={active.id}
          colEstacao={active.estacao}
          segs={segs}
          onFechar={handleFechar}
          onCancelarSessao={async () => {
            await sessoesService.cancelar(sessao.id)
            setSessao(null)
            setVisitas([])
            setRecoveryInitial(null)
            setPhase(0)
          }}
          onRemoveVisita={(visId) => setVisitas(prev => prev.filter(v => v.id !== visId))}
          initialItems={recoveryInitial?.items ?? []}
          initialQtds={recoveryInitial?.qtds ?? {}}
          initialActiveId={recoveryInitial?.activeId ?? null}
          initialLojaIdx={recoveryInitial?.lojaIdx ?? 0}
          initialCorDetalhe={sessaoCorDetalhe}
          manutencaoAtiva={!!manutencao?.manutencao}
        />
      )}

      {/* Phase 3: Fechar sessão */}
      {phase === 3 && sessao && (
        <FecharSessao
          sessao={sessaoDisplay}
          visitas={visitas}
          segs={segs}
          pedidos={pedidosFechados}
          onNovaSessao={handleNovaSessao}
        />
      )}

      {/* Phase 4: Visualizar sessão (somente leitura, auto-refresh) */}
      {phase === 4 && viewSessaoId && (
        <VisualizarSessao
          sessaoId={viewSessaoId}
          onBack={handleBackFromView}
        />
      )}

      {/* Phase 5: Preenchimento colaborativo — loja do usuário logado */}
      {phase === 5 && preencherInfo && (
        <PreencherMinhaLoja
          sessaoId={preencherInfo.sessaoId}
          visitaId={preencherInfo.visitaId}
          compradorNome={preencherInfo.compradorNome}
          colEstacao={active.estacao}
          onBack={handleBackFromPreencher}
        />
      )}
    </div>
  )
}
