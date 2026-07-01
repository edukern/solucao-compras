import { useState, useEffect, useRef, Fragment } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { useAuth } from '../contexts/AuthContext'
import { tamanhosDeTipoGrade, GRADE_DEFINITIONS } from '../constants/grades'
import { TIPOS_PRODUTO } from '../constants/tipoProduto'
import ConfirmModal from '../components/ConfirmModal'
import { MarkupSessao } from './MarkupSessao'
import { HistoricoSessoes } from './HistoricoSessoes'
import { VisualizarSessao } from './VisualizarSessao'
import { PreencherMinhaLoja } from './PreencherMinhaLoja'
import { FecharSessao } from './FecharSessao'
import styles from './Compras.module.css'
import { supabase } from '../lib/supabase'
import { sessoes as sessoesService } from '../services/sessoes'
import { pedidos as pedidosService } from '../services/pedidos'
import { segmentacoes as segmentacoesService } from '../services/segmentacoes'
import { fornecedores as fornecedoresService } from '../services/fornecedores'
import { compradores as compradoresService } from '../services/compradores'
import { projecoes as projecoesService } from '../services/projecoes'
import { appConfig as appConfigService } from '../services/appConfig'
import { computeItensDelta, computeDeltaPorVisita } from '../services/pedidoMerge'
import SaveStatus from '../components/SaveStatus'
import { useBeforeUnload } from '../hooks/useBeforeUnload'
import { fmtDate, PLUS_SIZE_DEFAULT, today, esc } from '../lib/format'

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

// ─── Phase 2: Tabela de itens ─────────────────────────────────────────────

function RegistrarPedidoSessao({ sessao, visitas, colId, colEstacao, onFechar, onRemoveVisita, onCancelarSessao, segs = [],
  initialItems = [], initialQtds = {}, initialActiveId = null, initialLojaIdx = 0, initialCorDetalhe = false,
  manutencaoAtiva = false }) {
  console.log('PHASE2 MOUNT', { visitas, items: initialItems })
  const { comprador: myComprador } = useAuth()
  const [items,         setItems]         = useState(initialItems)
  const [activeId,      setActiveId]      = useState(initialActiveId)
  const [lojaIdx,       setLojaIdx]       = useState(initialLojaIdx)
  const [qtds,          setQtds]          = useState(initialQtds)
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState(null)
  const [form,          setForm]          = useState({ ref: '', tipo_produto: '', tipo_grade: 'AD', classe: 'FEM', icms_pct: '', valor: '', cor: '', detalhe: '' })
  const [showIcms,      setShowIcms]      = useState(false)
  const [sessaoDesconto, setSessaoDesconto] = useState(
    () => String(sessao.desconto_pct ?? '0')
  )
  const [sessaoIcms, setSessaoIcms] = useState(
    () => String(sessao.icms_pct ?? '0')
  )
  const [projCache,     setProjCache]     = useState({})
  const [distribTargets,setDistribTargets]= useState({})
  const RECOVERY_KEY = `SC_RECOVERY_SESSAO_${sessao.id}`
  const firstInputRef   = useRef(null)
  const autoSaveRef     = useRef(null)
  const autoSaveInitRef = useRef(false)
  // Snapshot {localId:{visitaId:{tam:qty}}} já confirmado no banco, p/ cálculo de delta
  const lastSavedQtdsRef = useRef(JSON.parse(JSON.stringify(initialQtds ?? {})))
  const qtdSaveTimerRef  = useRef(null)
  const qtdsRef          = useRef(initialQtds)   // espelho sempre-fresco de qtds (evita closure stale)
  const qtdFlushInFlight = useRef(false)         // trava p/ não sobrepor flushes
  const [saveState, setSaveState] = useState('idle')  // idle | saving | saved | error
  const [showAddForm,    setShowAddForm]    = useState(true)
  const [showCorDetalhe,    setShowCorDetalhe]    = useState(initialCorDetalhe)
  const [editingCorId,      setEditingCorId]      = useState(null)
  const [dupeHighlight,     setDupeHighlight]     = useState(null)
  const [confirmCancelar,   setConfirmCancelar]   = useState(false)
  const [cancelando,        setCancelando]        = useState(false)
  const [editandoSessao,    setEditandoSessao]    = useState(false)
  const [editSessaoForm,    setEditSessaoForm]    = useState(null)
  const [salvandoSessaoInfo, setSalvandoSessaoInfo] = useState(false)
  const [fillMode, setFillMode] = useState('ref') // 'ref' | 'loja'
  const [workMode, setWorkMode] = useState(initialItems.length > 0 ? 'fill' : 'add') // 'add' | 'fill'
  const [showOverflowMenu, setShowOverflowMenu] = useState(false)
  function toggleCorDetalhe() { setShowCorDetalhe(prev => !prev) }
  const addFormFirstRef = useRef(null)
  const [editingId,      setEditingId]      = useState(null)
  const [editForm,       setEditForm]       = useState(null)
  const [gradeExtremes,     setGradeExtremes]     = useState({})
  const [gradeGroupExpand,  setGradeGroupExpand]  = useState({})
  const [showItemFields, setShowItemFields] = useState({})
  const [otherDevices,   setOtherDevices]   = useState(0)
  const [liberando,      setLiberando]      = useState(false)
  const [liberadoInfo,   setLiberadoInfo]   = useState(null) // { count } after liberar
  const [salvandoSessao, setSalvandoSessao] = useState(false)
  const [salvoOk,        setSalvoOk]        = useState(false)

  const activeItem = items.find(it => it.localId === activeId) ?? null
  const displayItems = workMode === 'add' ? [...items].reverse() : items
  qtdsRef.current = qtds   // mantém o espelho fresco para o flush assíncrono

  // ── Supabase Realtime Presence: detecta outros dispositivos na mesma sessão ──
  useEffect(() => {
    if (!sessao?.id) return
    let deviceId = localStorage.getItem('SC_DEVICE_ID')
    if (!deviceId) {
      deviceId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
      localStorage.setItem('SC_DEVICE_ID', deviceId)
    }
    let channel
    try {
      channel = supabase.channel(`session-presence-${sessao.id}`, {
        config: { presence: { key: deviceId } }
      })
      channel.on('presence', { event: 'sync' }, () => {
        try {
          const count = Object.keys(channel.presenceState()).length
          setOtherDevices(Math.max(0, count - 1))
        } catch (_) {}
      })
      channel.subscribe(async status => {
        try {
          if (status === 'SUBSCRIBED') await channel.track({ at: new Date().toISOString() })
        } catch (_) {}
      })
    } catch (e) {
      // WebSocket não disponível — funcionalidade de presença desativada silenciosamente
      console.warn('Realtime presence indisponível:', e?.message)
    }
    return () => {
      if (channel) {
        try { supabase.removeChannel(channel) } catch (_) {}
      }
    }
  }, [sessao?.id])

  // Auto-save local (crash recovery)
  useEffect(() => {
    if (!sessao?.id) return
    localStorage.setItem(RECOVERY_KEY, JSON.stringify({ sessao_id: sessao.id, items, qtds, activeId, lojaIdx, savedAt: Date.now() }))
  }, [items, qtds, activeId, lojaIdx])

  // Auto-save no banco com debounce de 2s quando items muda
  useEffect(() => {
    if (!autoSaveInitRef.current) { autoSaveInitRef.current = true; return }
    if (!sessao?.id || !items.length) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(handleSalvarSessao, 2000)
    return () => clearTimeout(autoSaveRef.current)
  }, [items])

  // Monta o payload de uma ref para uma visita (formato da RPC salvar_pedidos_visita).
  // qtdsSrc permite usar o estado fresco (qtdsRef) em vez do closure no flush assíncrono.
  function buildUpdateParaVisita(item, visitaId, qtdsSrc = qtds) {
    const lojaTams = qtdsSrc[item.localId]?.[visitaId] ?? {}
    const itens = tamanhosDeTipoGrade(item.tipo_grade)
      .map(tam => ({ tamanho: tam, qtd: parseInt(lojaTams[tam]) || 0 }))
      .filter(i => i.qtd > 0)
    const num = s => parseFloat((s ?? '').replace(',', '.')) || 0
    return {
      referencia: item.ref, variante_key: item.variante_key ?? '',
      segmentacao_id: item._segId,
      valor_unitario: num(item.valor), desconto_pct: num(sessaoDesconto),
      icms_pct: num(item.icms_pct), markup_pct: num(item.markup_pct),
      preco_venda: num(item.preco_venda),
      cor: item.cor || '', detalhe: item.detalhe || '', obs: item.obs || '',
      itens,
    }
  }

  // Resolve segmentacao_id (cacheado em item._segId) para os itens dados
  async function resolverSegIds(itemList) {
    for (const item of itemList) {
      if (item._segId) continue
      const classDef = GRADE_DEFINITIONS[item.tipo_grade]
      if (!classDef) continue
      const seg = await segmentacoesService.findOrCreate({
        classificacao: classDef.classificacao, tipo_produto: item.tipo_produto,
        classe: item.classe, tipo_grade: item.tipo_grade, estacao: colEstacao ?? 'inverno',
      })
      item._segId = seg.id
    }
  }

  // Grava apenas os pares (visita, ref) alterados, via RPC atômica. Granularidade
  // por visita garante que gravar uma loja nunca regrava/apaga outra.
  // deltaPorVisita: { [visitaId]: [localId, ...] };  qtdsSrc: fonte fresca de qtds.
  async function flushQtdsDelta(deltaPorVisita, qtdsSrc) {
    const itemById = Object.fromEntries(items.map(i => [i.localId, i]))
    const afetados = [...new Set(Object.values(deltaPorVisita).flat())]
      .map(id => itemById[id]).filter(Boolean)
    await resolverSegIds(afetados)
    for (const [visitaId, localIds] of Object.entries(deltaPorVisita)) {
      const updates = localIds
        .map(id => itemById[id])
        .filter(it => it && it._segId)
        .map(it => buildUpdateParaVisita(it, visitaId, qtdsSrc))
      if (updates.length) await pedidosService.salvarQuantidadesDelta(Number(visitaId), updates)
    }
  }

  // Drena todo o delta pendente contra o estado fresco (qtdsRef), sem sobrepor flushes.
  // O loop captura edições feitas durante o await; a trava evita corridas/baseline velho.
  async function drenarQtdsDelta() {
    if (qtdFlushInFlight.current) return
    if (manutencaoAtiva) { setSaveState('idle'); return }
    qtdFlushInFlight.current = true
    try {
      while (true) {
        const current = qtdsRef.current
        const deltaPorVisita = computeDeltaPorVisita(lastSavedQtdsRef.current, current)
        if (!Object.keys(deltaPorVisita).length) break
        setSaveState('saving')
        const snapshot = JSON.parse(JSON.stringify(current))
        await flushQtdsDelta(deltaPorVisita, current)
        lastSavedQtdsRef.current = snapshot
      }
      setSaveState('saved')
    } catch (e) {
      setSaveState('error')
      setError(`Falha ao salvar quantidades: ${e.message}`)
    } finally {
      qtdFlushInFlight.current = false
    }
  }

  // Retry após falha de salvamento: força recomputar tudo como delta e dispara o effect
  function retrySalvarQtds() {
    lastSavedQtdsRef.current = {}
    setQtds(q => ({ ...q }))
  }

  // Auto-save de QUANTIDADES por delta (debounce 2s) — banco como fonte da verdade
  useEffect(() => {
    if (!sessao?.id || !items.length) return
    if (qtdSaveTimerRef.current) clearTimeout(qtdSaveTimerRef.current)
    qtdSaveTimerRef.current = setTimeout(drenarQtdsDelta, 2000)
    return () => clearTimeout(qtdSaveTimerRef.current)
  }, [qtds])

  // Aviso ao fechar a aba com quantidades ainda não confirmadas no banco
  const temDeltaPendente = saveState === 'saving' ||
    computeItensDelta(lastSavedQtdsRef.current, qtds).length > 0
  useBeforeUnload(temDeltaPendente)

  // Focus first input when active item / loja changes
  useEffect(() => {
    firstInputRef.current?.focus()
  }, [activeId, lojaIdx])

  // Focus first add-form input when form is reopened
  useEffect(() => {
    if (showAddForm && items.length > 0) {
      addFormFirstRef.current?.focus()
    }
  }, [showAddForm])

  function getQtd(localId, visitaId, tam) {
    return qtds[localId]?.[visitaId]?.[tam] ?? ''
  }

  function setQtd(localId, visitaId, tam, raw) {
    const val = raw === '' ? '' : Math.max(0, parseInt(raw, 10) || 0)
    setQtds(prev => ({
      ...prev,
      [localId]: { ...prev[localId], [visitaId]: { ...prev[localId]?.[visitaId], [tam]: val } }
    }))
  }

  function totalQtdLoja(localId, visitaId) {
    const loja = qtds[localId]?.[visitaId] ?? {}
    return Object.values(loja).reduce((s, q) => s + (parseInt(q) || 0), 0)
  }

  function totalQtdItem(localId) {
    return (visitas ?? []).reduce((s, v) => s + totalQtdLoja(localId, v.id), 0)
  }

  function totalQtdVisita(visitaId) {
    return (items ?? []).reduce((s, it) => s + totalQtdLoja(it.localId, visitaId), 0)
  }

  function totalValorVisita(visitaId) {
    return (items ?? []).reduce((s, it) => {
      const unit = parseFloat((it.valor ?? '').replace(',', '.')) || 0
      return s + totalQtdLoja(it.localId, visitaId) * unit
    }, 0)
  }

  function hasExtremeData(localId, tam) {
    return visitas.some(v => (parseInt(qtds[localId]?.[v.id]?.[tam]) || 0) > 0)
  }

  function getVisibleTams(localId, allTams, tipoGrade) {
    const oM = GRADE_DEFINITIONS[tipoGrade]?.ocultoMenores ?? 0
    const oG = GRADE_DEFINITIONS[tipoGrade]?.ocultoMaiores ?? 0
    if (oM > 0 || oG > 0) {
      const showMenores = gradeGroupExpand[tipoGrade]?.showMenores
        || allTams.slice(0, oM).some(t => hasExtremeData(localId, t))
      const showMaiores = gradeGroupExpand[tipoGrade]?.showMaiores
        || (oG > 0 && allTams.slice(allTams.length - oG).some(t => hasExtremeData(localId, t)))
      return allTams.filter((_, i) => {
        if (i < oM) return showMenores
        if (oG > 0 && i >= allTams.length - oG) return showMaiores
        return true
      })
    }
    if (allTams.length < 5) return allTams
    const showFirst  = gradeExtremes[localId]?.first || hasExtremeData(localId, allTams[0])
    const showLast   = gradeExtremes[localId]?.last  || hasExtremeData(localId, allTams[allTams.length - 1])
    const maxVisible = gradeExtremes[localId]?.maxVisible ?? PLUS_SIZE_DEFAULT - 1
    return allTams.filter((_, i) => {
      if (i === 0) return showFirst
      if (i === allTams.length - 1) return showLast
      return i <= maxVisible || hasExtremeData(localId, allTams[i])
    })
  }

  const TABELA_PRECOS = [4.99, 9.99, 14.99, 19.99, 24.99, 29.99, 34.99, 39.99,
    49.99, 59.99, 69.99, 79.99, 89.99, 99.99, 119.99, 129.99, 149.99, 169.99,
    199.99, 219.99, 229.99, 249.99, 299.99]

  function roundTo99(x) {
    if (!x || x <= 0) return ''
    const preco = TABELA_PRECOS.find(p => p >= x)
    return preco != null ? preco.toFixed(2) : x.toFixed(2)
  }

  function calcLiquido(valorStr) {
    const v = parseFloat((valorStr ?? '').replace(',', '.'))
    const d = parseFloat((sessaoDesconto ?? '').replace(',', '.')) || 0
    if (!v || isNaN(v)) return ''
    return (v * (1 - d / 100)).toFixed(2)
  }


  function addItem() {
    const { ref, tipo_produto, tipo_grade, classe, icms_pct, valor, cor, detalhe } = form
    if (!ref.trim() || !tipo_produto.trim() || !tipo_grade || !valor.trim()) return
    const localId = `item_${Date.now()}_${Math.random()}`
    const novoItem = {
      localId,
      variante_key: '',
      ref: ref.trim(),
      tipo_produto: tipo_produto.trim().toUpperCase(),
      tipo_grade,
      classe,
      icms_pct: icms_pct || sessaoIcms || '0',
      valor: valor || '',
      markup_pct: '0',
      preco_venda: '',
      cor: cor || '',
      detalhe: detalhe || '',
      obs: '',
    }
    setItems(prev => [...prev, novoItem])
    setForm(prev => ({ ...prev, ref: '', valor: '', cor: '', detalhe: '' }))
    requestAnimationFrame(() => addFormFirstRef.current?.focus())
  }

  function removeItem(localId, e) {
    e.stopPropagation()
    setItems(prev => prev.filter(it => it.localId !== localId))
    setQtds(prev => { const n = { ...prev }; delete n[localId]; return n })
    if (activeId === localId) setActiveId(null)
  }

  function duplicateItem(item, e) {
    e.stopPropagation()
    const newId = `item_${Date.now()}_${Math.random()}`
    const newVarianteKey = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
    // Zera cor/detalhe e não copia a grade; atribui chave única para persistência no banco
    const copy = { ...item, localId: newId, variante_key: newVarianteKey, cor: '', detalhe: '' }
    setItems(prev => {
      const idx = prev.findIndex(it => it.localId === item.localId)
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next
    })
    setQtds(prev => ({ ...prev, [newId]: {} })) // grade zerada
    setActiveId(newId)
    setEditingId(newId)
    // Destaca o item duplicado para alertar sobre cor/detalhe
    setDupeHighlight(newId)
    setTimeout(() => setDupeHighlight(null), 3000)
    // Se cor/detalhe estiver ativo, abre edição inline automaticamente
    if (showCorDetalhe) setEditingCorId(newId)
    setEditForm({
      ref:          item.ref,
      tipo_produto: item.tipo_produto,
      tipo_grade:   item.tipo_grade,
      classe:       item.classe,
      icms_pct:     item.icms_pct,
      valor:        item.valor,
      markup_pct:   item.markup_pct ?? '0',
      preco_venda:  item.preco_venda ?? '',
      cor:          item.cor ?? '',
      detalhe:      item.detalhe ?? '',
      obs:          item.obs ?? '',
    })
  }

  function startEdit(item) {
    setEditingId(item.localId)
    setEditForm({
      ref:          item.ref,
      tipo_produto: item.tipo_produto,
      tipo_grade:   item.tipo_grade,
      classe:       item.classe,
      icms_pct:     item.icms_pct,
      valor:        item.valor,
      markup_pct:   item.markup_pct ?? '0',
      preco_venda:  item.preco_venda ?? '',
      cor:          item.cor ?? '',
      detalhe:      item.detalhe ?? '',
      obs:          item.obs ?? '',
    })
    setActiveId(null)
  }

  function confirmEdit() {
    const original = items.find(it => it.localId === editingId)
    const gradeChanged = original && editForm.tipo_grade !== original.tipo_grade
    setItems(prev => prev.map(it =>
      it.localId === editingId ? { ...it, ...editForm } : it
    ))
    if (gradeChanged) {
      setQtds(prev => { const n = { ...prev }; delete n[editingId]; return n })
    }
    setEditingId(null)
    setEditForm(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(null)
  }

  function handleEnterOnInput(e, vTamIdx, visIdx, totalVisTams) {
    if (e.key !== 'Enter' && !(e.key === 'Tab' && !e.shiftKey)) return
    e.preventDefault()
    if (vTamIdx < totalVisTams - 1) {
      const row = e.target.closest('[data-grade-row]')
      const inputs = Array.from(row?.querySelectorAll('input[type=number]') || [])
      const curIdx = inputs.indexOf(e.target)
      if (curIdx >= 0 && curIdx < inputs.length - 1) { inputs[curIdx + 1].focus(); return }
    }
    if (visIdx < visitas.length - 1) {
      setLojaIdx(visIdx + 1)
    } else {
      const idx = items.findIndex(it => it.localId === activeId)
      if (idx < items.length - 1) {
        setActiveId(items[idx + 1].localId)
        setLojaIdx(0)
      }
    }
  }

  function handleEnterOnInputPorLoja(e) {
    if (e.key !== 'Enter' && !(e.key === 'Tab' && !e.shiftKey)) return
    e.preventDefault()
    const allInputs = Array.from(document.querySelectorAll('[data-por-loja-input]'))
    const curIdx = allInputs.indexOf(e.target)
    if (curIdx >= 0 && curIdx < allInputs.length - 1) {
      allInputs[curIdx + 1].focus()
    }
  }

  async function removeVisita(visId, visNome) {
    const hasData = items.some(it => totalQtdLoja(it.localId, visId) > 0)
    if (hasData) {
      const confirmed = window.confirm(
        `A loja "${visNome}" tem peças lançadas nesta sessão.\n\nDeseja mesmo removê-la? Os dados lançados para ela serão perdidos.`
      )
      if (!confirmed) return
    }
    // Clear local qtds for this visita
    setQtds(prev => {
      const next = {}
      for (const [lid, lojas] of Object.entries(prev)) {
        const { [visId]: _removed, ...rest } = lojas
        next[lid] = rest
      }
      return next
    })
    // Adjust lojaIdx so it stays in range
    const newLen = visitas.length - 1
    if (lojaIdx >= newLen) setLojaIdx(Math.max(0, newLen - 1))
    // Delete from Supabase (best-effort)
    try { await pedidosService.deleteVisita(visId) } catch {}
    // Notify parent to trim its state
    onRemoveVisita?.(visId)
  }

  function findSegId(item) {
    const classDef = GRADE_DEFINITIONS[item.tipo_grade]
    if (!classDef) return null
    const seg = segs.find(s =>
      s.classificacao === classDef.classificacao &&
      s.tipo_produto  === item.tipo_produto.trim().toUpperCase() &&
      s.classe        === item.classe &&
      s.tipo_grade    === item.tipo_grade &&
      s.estacao       === (colEstacao ?? 'inverno')
    )
    return seg?.id ?? null
  }

  async function getProjecao(segId) {
    if (projCache[segId]) return projCache[segId]
    const rows = await projecoesService.get(segId, colId)
    setProjCache(prev => ({ ...prev, [segId]: rows }))
    return rows
  }

  function distribuirProporcionalmente(total, projRows) {
    const totalProj = projRows.reduce((s, r) => s + (r.qtd_ajustada || 0), 0)
    if (totalProj === 0 || total <= 0) return null
    const exatos = projRows.map(r => {
      const exato = total * (r.qtd_ajustada || 0) / totalProj
      return { tamanho: r.tamanho, piso: Math.floor(exato), fracao: exato % 1 }
    })
    const resto = total - exatos.reduce((s, r) => s + r.piso, 0)
    const sorted = [...exatos].sort((a, b) => b.fracao - a.fracao)
    const resultado = {}
    exatos.forEach(r => { resultado[r.tamanho] = r.piso })
    sorted.slice(0, resto).forEach(r => { resultado[r.tamanho]++ })
    return resultado
  }

  async function handleDistribuirTotal(localId, visitaId, rawTotal) {
    const total = parseInt(rawTotal, 10)
    if (isNaN(total) || total <= 0) return
    const item = items.find(it => it.localId === localId)
    if (!item) return
    const segId = findSegId(item)
    if (!segId) { setError('Sem projeção: segmentação não encontrada para esta coleção.'); return }
    const projRows = await getProjecao(segId)
    if (!projRows?.length) { setError('Sem projeção salva para esta segmentação. Calcule a projeção em Planejamento primeiro.'); return }
    const tams = tamanhosDeTipoGrade(item.tipo_grade)
    const projFiltered = projRows.filter(r => tams.includes(r.tamanho))
    const distribuicao = distribuirProporcionalmente(total, projFiltered)
    if (!distribuicao) return
    setQtds(prev => ({
      ...prev,
      [localId]: {
        ...prev[localId],
        [visitaId]: Object.fromEntries(tams.map(tam => [tam, distribuicao[tam] ?? 0]))
      }
    }))
    setError(null)
  }

  async function handleLiberar() {
    if (!items.length) { setError('Adicione pelo menos uma referência antes de liberar.'); return }
    setLiberando(true)
    setError(null)
    setLiberadoInfo(null)
    try {
      const pedidoRows = []
      for (const item of items) {
        const { variante_key, ref, tipo_produto, tipo_grade, classe, icms_pct, valor, desconto_pct, markup_pct, preco_venda, cor, detalhe, obs } = item
        const valorNum      = parseFloat((valor ?? '').replace(',', '.')) || 0
        const icmsNum       = parseFloat((icms_pct ?? '').replace(',', '.')) || 0
        const markupNum     = parseFloat((markup_pct ?? '').replace(',', '.')) || 0
        const precoVendaNum = parseFloat((preco_venda ?? '').replace(',', '.')) || 0
        const classDef = GRADE_DEFINITIONS[tipo_grade]
        if (!classDef) continue
        const classificacao = classDef.classificacao
        const seg = await segmentacoesService.findOrCreate({
          classificacao, tipo_produto, classe, tipo_grade, estacao: colEstacao ?? 'inverno',
        })
        for (const v of visitas) {
          pedidoRows.push({
            visita_id: v.id,
            comprador_id: v.comprador_id,
            segmentacao_id: seg.id,
            valor_unitario: valorNum, desconto_pct: parseFloat((sessaoDesconto ?? "0").replace(",", ".")) || 0,
            referencia: ref, variante_key: variante_key ?? '', icms_pct: icmsNum,
            markup_pct: markupNum, preco_venda: precoVendaNum,
            cor: cor || '', detalhe: detalhe || '', obs: obs || '',
          })
        }
      }
      await pedidosService.inicializarColaboracao(pedidoRows)
      setLiberadoInfo({ lojas: visitas.length, itens: items.length })
    } catch (e) {
      setError(`Erro ao liberar: ${e.message}`)
    } finally {
      setLiberando(false)
    }
  }

  async function handleSalvarSessao() {
    if (!items.length) return
    setSalvandoSessao(true)
    setSalvoOk(false)
    setError(null)
    try {
      const orgVisita = visitas.find(v => v.comprador_id === myComprador?.id) ?? visitas[0]
      if (!orgVisita) throw new Error('Visita do organizador não encontrada.')
      const pedidoRows = []
      for (const item of items) {
        const { variante_key, ref, tipo_produto, tipo_grade, classe, icms_pct, valor, desconto_pct, markup_pct, preco_venda, cor, detalhe, obs } = item
        const valorNum      = parseFloat((valor ?? '').replace(',', '.')) || 0
        const icmsNum       = parseFloat((icms_pct ?? '').replace(',', '.')) || 0
        const markupNum     = parseFloat((markup_pct ?? '').replace(',', '.')) || 0
        const precoVendaNum = parseFloat((preco_venda ?? '').replace(',', '.')) || 0
        const classDef = GRADE_DEFINITIONS[tipo_grade]
        if (!classDef) continue
        const classificacao = classDef.classificacao
        const seg = await segmentacoesService.findOrCreate({
          classificacao, tipo_produto, classe, tipo_grade, estacao: colEstacao ?? 'inverno',
        })
        pedidoRows.push({
          comprador_id: orgVisita.comprador_id,
          segmentacao_id: seg.id,
          valor_unitario: valorNum, desconto_pct: parseFloat((sessaoDesconto ?? "0").replace(",", ".")) || 0,
          referencia: ref, variante_key: variante_key ?? '', icms_pct: icmsNum,
          markup_pct: markupNum, preco_venda: precoVendaNum,
          cor: cor || '', detalhe: detalhe || '', obs: obs || '',
        })
      }
      await pedidosService.salvarRascunho(orgVisita.id, pedidoRows)
      setSalvoOk(true)
      setTimeout(() => setSalvoOk(false), 4000)
    } catch (e) {
      setError(`Erro ao salvar sessão: ${e.message}`)
    } finally {
      setSalvandoSessao(false)
    }
  }

  async function handleFechar() {
    setSaving(true)
    setError(null)
    try {
      // 1. Garante que todo delta pendente foi gravado: cancela o timer, espera um flush
      //    em andamento terminar e drena o que restou contra o estado fresco.
      if (qtdSaveTimerRef.current) clearTimeout(qtdSaveTimerRef.current)
      while (qtdFlushInFlight.current) await new Promise(r => setTimeout(r, 50))
      await drenarQtdsDelta()
      // 2. Ler o estado fresco do banco — inclui o que as lojas preencheram em paralelo.
      //    Nunca regravamos a partir do estado local: o organizador não sobrescreve as lojas.
      const visitasComPedidos = await pedidosService.itensPorFornecedor(sessao.id)
      const pedidosFresh = visitasComPedidos.flatMap(v =>
        (v.pedidos ?? []).map(p => ({ ...p, visita_id: v.id }))
      )
      localStorage.removeItem(RECOVERY_KEY)
      // Carimba a sessão como fechada (status VISUAL p/ o badge no Histórico).
      // Não-bloqueante: o trabalho crítico (drenar deltas, ler fresco) já foi feito;
      // um carimbo cosmético não deve derrubar o fechamento se falhar.
      try {
        await sessoesService.update(sessao.id, { fechada_em: new Date().toISOString() })
      } catch (e) {
        console.warn('Sessão fechada, mas não consegui salvar o status visual:', e.message)
      }
      onFechar(pedidosFresh)
    } catch (e) {
      setError(`Erro ao fechar sessão: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.phase}>
      {otherDevices > 0 && (
        <div className={styles.multiDeviceWarn}>
          ⚠️ Esta sessão está aberta em {otherDevices} outro{otherDevices > 1 ? 's' : ''} dispositivo{otherDevices > 1 ? 's' : ''}.
          Há risco de sobrescrita — evite preencher simultaneamente.
        </div>
      )}

      <div className={styles.visitaBanner}>
        <strong>{sessao.fornecedor?.nome || sessao.fornecedor_nome}</strong>
        <span className={styles.dot}>·</span>
        <span>{fmtDate(sessao.data_visita)}</span>
        {sessao.vendedor && <><span className={styles.dot}>·</span><span>Vendedor: {sessao.vendedor}</span></>}
        {sessao.cond_pag && <><span className={styles.dot}>·</span><span>{sessao.cond_pag}</span></>}
        {sessao.frete    && <><span className={styles.dot}>·</span><span>Frete: {sessao.frete}</span></>}
        {sessao.frete === 'FOB' && sessao.transportadora && <><span className={styles.dot}>·</span><span>Transp.: {sessao.transportadora}</span></>}
        {sessao.data_entrega && <><span className={styles.dot}>·</span><span>Entrega: {fmtDate(sessao.data_entrega)}</span></>}
        <span className={styles.dot}>·</span>
        <span>{visitas.length} loja(s)</span>
        {parseFloat(sessaoDesconto) > 0 && (
          <><span className={styles.dot}>·</span><span>Desc: {sessaoDesconto}%</span></>
        )}
        {parseFloat(sessaoIcms) > 0 && (
          <><span className={styles.dot}>·</span><span>ICMS: {sessaoIcms}%</span></>
        )}
        <button
          className={styles.btnEditarSessaoInfo}
          onClick={() => {
            setEditSessaoForm({
              data_visita:    sessao.data_visita    || '',
              data_entrega:   sessao.data_entrega   || '',
              vendedor:       sessao.vendedor       || '',
              cond_pag:       sessao.cond_pag       || '',
              frete:          sessao.frete          || '',
              transportadora: sessao.transportadora || '',
              obs:            sessao.obs            || '',
              desconto_pct:   sessaoDesconto        || '0',
              icms_pct:       sessaoIcms            || '0',
            })
            setEditandoSessao(true)
          }}
          title="Editar informações da sessão"
        >✎</button>
      </div>

      {/* Modal edição das informações da sessão */}
      {editandoSessao && editSessaoForm && (
        <div className={styles.cancelOverlay}>
          <div className={styles.editSessaoModal}>
            <div className={styles.cancelTitle}>Editar informações da sessão</div>
            <div className={styles.editSessaoGrid}>
              <label className={styles.editSessaoLabel}>
                Data da visita
                <input type="date" className={styles.editSessaoInput}
                  value={editSessaoForm.data_visita}
                  onChange={e => setEditSessaoForm(p => ({ ...p, data_visita: e.target.value }))} />
              </label>
              <label className={styles.editSessaoLabel}>
                Data de entrega
                <input type="date" className={styles.editSessaoInput}
                  value={editSessaoForm.data_entrega}
                  onChange={e => setEditSessaoForm(p => ({ ...p, data_entrega: e.target.value }))} />
              </label>
              <label className={styles.editSessaoLabel}>
                Vendedor
                <input type="text" className={styles.editSessaoInput}
                  value={editSessaoForm.vendedor}
                  onChange={e => setEditSessaoForm(p => ({ ...p, vendedor: e.target.value }))} />
              </label>
              <label className={styles.editSessaoLabel}>
                Cond. de pagamento
                <input type="text" className={styles.editSessaoInput}
                  value={editSessaoForm.cond_pag}
                  onChange={e => setEditSessaoForm(p => ({ ...p, cond_pag: e.target.value }))} />
              </label>
              <label className={styles.editSessaoLabel}>
                Frete
                <select className={styles.editSessaoInput}
                  value={editSessaoForm.frete}
                  onChange={e => setEditSessaoForm(p => ({ ...p, frete: e.target.value }))}>
                  <option value="">—</option>
                  <option value="CIF">CIF</option>
                  <option value="FOB">FOB</option>
                  <option value="Sem frete">Sem frete</option>
                </select>
              </label>
              {editSessaoForm.frete === 'FOB' && (
                <label className={styles.editSessaoLabel}>
                  Transportadora
                  <input type="text" className={styles.editSessaoInput}
                    value={editSessaoForm.transportadora}
                    onChange={e => setEditSessaoForm(p => ({ ...p, transportadora: e.target.value }))} />
                </label>
              )}
              <label className={styles.editSessaoLabel}>
                Desconto %
                <input type="text" className={styles.editSessaoInput}
                  placeholder="0"
                  value={editSessaoForm.desconto_pct}
                  onChange={e => setEditSessaoForm(p => ({ ...p, desconto_pct: e.target.value }))} />
              </label>
              <label className={styles.editSessaoLabel}>
                ICMS %
                <input type="text" className={styles.editSessaoInput}
                  placeholder="0"
                  value={editSessaoForm.icms_pct}
                  onChange={e => setEditSessaoForm(p => ({ ...p, icms_pct: e.target.value }))} />
              </label>
              <label className={`${styles.editSessaoLabel} ${styles.editSessaoLabelFull}`}>
                Obs
                <input type="text" className={styles.editSessaoInput}
                  value={editSessaoForm.obs}
                  onChange={e => setEditSessaoForm(p => ({ ...p, obs: e.target.value }))} />
              </label>
            </div>
            <div className={styles.cancelActions}>
              <button className={styles.cancelBtnVoltar}
                onClick={() => setEditandoSessao(false)}
                disabled={salvandoSessaoInfo}>Cancelar</button>
              <button className={styles.cancelBtnConfirm}
                style={{ background: 'var(--text-primary)' }}
                disabled={salvandoSessaoInfo}
                onClick={async () => {
                  setSalvandoSessaoInfo(true)
                  try {
                    const novoDesconto = editSessaoForm.desconto_pct || '0'
                    const novoIcms = editSessaoForm.icms_pct || '0'
                    const novoDescontoPct = parseFloat(novoDesconto.replace(',', '.')) || 0
                    await sessoesService.update(sessao.id, {
                      data_visita:    editSessaoForm.data_visita || null,
                      data_entrega:   editSessaoForm.data_entrega || null,
                      vendedor:       editSessaoForm.vendedor || null,
                      cond_pag:       editSessaoForm.cond_pag || null,
                      frete:          editSessaoForm.frete || null,
                      transportadora: editSessaoForm.frete === 'FOB' ? editSessaoForm.transportadora : null,
                      obs:            editSessaoForm.obs || null,
                      desconto_pct:   novoDescontoPct,
                      icms_pct:       parseFloat(novoIcms.replace(',', '.')) || 0,
                    })
                    await pedidosService.atualizarDescontoSessao(sessao.id, novoDescontoPct)
                    Object.assign(sessao, editSessaoForm)
                    setSessaoDesconto(novoDesconto)
                    setSessaoIcms(novoIcms)
                    setEditandoSessao(false)
                  } catch (e) {
                    alert('Erro ao salvar: ' + e.message)
                  } finally {
                    setSalvandoSessaoInfo(false)
                  }
                }}
              >{salvandoSessaoInfo ? 'Salvando…' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.phase2TopBar}>
        <span className={styles.phase2TopBarTitle}>Registrar pedidos</span>
        <div className={styles.workModeToggle}>
          <button
            className={`${styles.workModeBtn} ${workMode === 'add' ? styles.workModeBtnActive : ''}`}
            onClick={() => setWorkMode('add')}
          >Adicionar refs</button>
          <button
            className={`${styles.workModeBtn} ${workMode === 'fill' ? styles.workModeBtnActive : ''}`}
            onClick={() => { setWorkMode('fill'); setActiveId(null) }}
          >Preencher grades</button>
        </div>
        <SaveStatus state={saveState} onRetry={saveState === 'error' ? retrySalvarQtds : undefined} />
        <div style={{ position: 'relative' }}>
          <button
            className={styles.btnOverflowMenu}
            onClick={() => setShowOverflowMenu(v => !v)}
            title="Mais opções"
          >⋯</button>
          {showOverflowMenu && (
            <div className={styles.overflowMenuPanel}>
              <button
                className={styles.overflowMenuItem}
                onClick={() => { handleSalvarSessao(); setShowOverflowMenu(false) }}
                disabled={salvandoSessao || !items.length}
              >
                {salvandoSessao ? 'Salvando…' : salvoOk ? '✓ Salvo' : '💾 Salvar sessão'}
              </button>
              <div className={styles.overflowMenuSep} />
              <button
                className={`${styles.overflowMenuItem} ${styles.overflowMenuItemDanger}`}
                onClick={() => { setConfirmCancelar(true); setShowOverflowMenu(false) }}
              >
                Cancelar sessão
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.phase2ChipsRow}>
        <button
          className={`${styles.chipToggle} ${fillMode === 'ref' ? styles.chipToggleActive : ''}`}
          onClick={() => setFillMode('ref')}
          title="Preencher por referência (todas as lojas de um produto)"
        >Por referência</button>
        <button
          className={`${styles.chipToggle} ${fillMode === 'loja' ? styles.chipToggleActive : ''}`}
          onClick={() => setFillMode('loja')}
          title="Preencher por loja (todos os produtos de uma loja)"
        >Por loja</button>
        {fillMode === 'ref' && (
          <button
            className={`${styles.chipToggle} ${showCorDetalhe ? styles.chipToggleActive : ''}`}
            onClick={toggleCorDetalhe}
          >{showCorDetalhe ? '✓ Cor/Detalhe' : '+ Cor/Detalhe'}</button>
        )}
        <button
          className={`${styles.chipToggle} ${showIcms ? styles.chipToggleActive : ''}`}
          onClick={() => setShowIcms(v => {
            const next = !v
            if (next && !form.icms_pct && parseFloat(sessaoIcms) > 0) setForm(p => ({ ...p, icms_pct: sessaoIcms }))
            return next
          })}
        >{showIcms ? '✓ ICMS' : '+ ICMS'}</button>
      </div>

      {/* Modal de confirmação de cancelamento */}
      {confirmCancelar && (
        <div className={styles.cancelOverlay}>
          <div className={styles.cancelModal}>
            <div className={styles.cancelTitle}>Cancelar sessão?</div>
            <p className={styles.cancelMsg}>
              Esta ação vai <strong>apagar permanentemente</strong> a sessão
              {sessao.fornecedor_nome ? ` com ${sessao.fornecedor_nome}` : ''} e todos
              os pedidos registrados. <strong>Não será possível retomar.</strong>
            </p>
            <div className={styles.cancelActions}>
              <button
                className={styles.cancelBtnVoltar}
                onClick={() => setConfirmCancelar(false)}
                disabled={cancelando}
              >
                Voltar
              </button>
              <button
                className={styles.cancelBtnConfirm}
                disabled={cancelando}
                onClick={async () => {
                  setCancelando(true)
                  try { await onCancelarSessao() }
                  finally { setCancelando(false) }
                }}
              >
                {cancelando ? 'Apagando…' : 'Sim, apagar sessão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {liberadoInfo && (
        <div className={styles.liberadoBanner}>
          ✓ Sessão liberada — {liberadoInfo.lojas} loja{liberadoInfo.lojas > 1 ? 's' : ''} pode{liberadoInfo.lojas > 1 ? 'm' : ''} agora preencher {liberadoInfo.itens} referência{liberadoInfo.itens > 1 ? 's' : ''} em seus próprios computadores.
        </div>
      )}

      {/* ── Add item form ── */}
      <datalist id="tipos-produto-list">
        {TIPOS_PRODUTO.map(t => <option key={t} value={t} />)}
      </datalist>

      {(workMode === 'add' || items.length === 0) && (
      <div className={styles.addItemForm}>
        <div className={styles.field}>
          <span className={styles.label}>Ref *</span>
          <input
            ref={addFormFirstRef}
            type="text"
            className={styles.addItemRef}
            placeholder="Cód. forn."
            value={form.ref}
            onChange={e => setForm(p => ({ ...p, ref: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') addItem() }}
          />
        </div>
        {showCorDetalhe && (
          <div className={styles.field}>
            <span className={styles.label}>Cor/Detalhe</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <input
                type="text"
                className={styles.addItemCor}
                placeholder="cor"
                value={form.cor}
                onChange={e => setForm(p => ({ ...p, cor: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') addItem() }}
              />
              <input
                type="text"
                className={styles.addItemCor}
                placeholder="detalhe"
                value={form.detalhe}
                onChange={e => setForm(p => ({ ...p, detalhe: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') addItem() }}
              />
            </div>
          </div>
        )}
        <div className={styles.field}>
          <span className={styles.label}>Produto</span>
          <input
            type="text"
            list="tipos-produto-list"
            className={styles.addItemProd}
            placeholder="Ex: CAMISETA"
            value={form.tipo_produto}
            onChange={e => setForm(p => ({ ...p, tipo_produto: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') addItem() }}
          />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Grade</span>
          <select
            value={form.tipo_grade}
            onChange={e => setForm(p => ({ ...p, tipo_grade: e.target.value }))}
          >
            {Object.keys(GRADE_DEFINITIONS).map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Classe</span>
          <select
            value={form.classe}
            onChange={e => setForm(p => ({ ...p, classe: e.target.value }))}
          >
            <option value="FEM">FEM</option>
            <option value="MASC">MASC</option>
            <option value="UNI">UNI</option>
          </select>
        </div>
        {showIcms && (
          <div className={styles.field}>
            <span className={styles.label}>ICMS %</span>
            <input
              type="text"
              className={styles.addItemIcms}
              placeholder="0"
              value={form.icms_pct}
              onChange={e => setForm(p => ({ ...p, icms_pct: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') addItem() }}
            />
          </div>
        )}
        <div className={styles.field}>
          <span className={styles.label}>Valor unit. *</span>
          <input
            type="text"
            className={styles.addItemValor}
            placeholder="0,00"
            value={form.valor}
            onChange={e => {
              const valor = e.target.value
              setForm(p => ({ ...p, valor }))
            }}
            onKeyDown={e => { if (e.key === 'Enter') addItem() }}
          />
        </div>
        <button
          className={styles.btnAdd}
          disabled={!form.ref.trim() || !form.tipo_produto.trim() || !form.tipo_grade || !form.valor.trim()}
          onClick={addItem}
        >
          + Adicionar
        </button>
      </div>
      )}

      {items.length === 0 && (
        <div className={styles.placeholder}>Adicione o primeiro produto acima para começar.</div>
      )}

      {/* ── Por loja mode ── */}
      {fillMode === 'loja' && items.length > 0 && (
        <div className={styles.porLojaWrap}>
          <div className={styles.porLojaTabs}>
            {visitas.map((v, i) => {
              const isActive = i === lojaIdx
              const pcs = isActive ? totalQtdVisita(v.id) : 0
              const val = isActive ? totalValorVisita(v.id) : 0
              return (
                <button
                  key={v.id}
                  className={`${styles.porLojaTab} ${isActive ? styles.porLojaTabActive : ''}`}
                  onClick={() => setLojaIdx(i)}
                >
                  {isActive ? (
                    <span className={styles.porLojaTabActiveContent}>
                      <span className={styles.porLojaTabActiveName}>{v.comprador_nome}</span>
                      {pcs > 0 && (
                        <span className={styles.porLojaTabActiveStats}>
                          {pcs} pç · R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </span>
                  ) : (
                    v.comprador_nome
                  )}
                  {visitas.length > 1 && (
                    <span
                      className={styles.porLojaTabRemove}
                      onClick={e => { e.stopPropagation(); removeVisita(v.id, v.comprador_nome) }}
                      title={`Remover ${v.comprador_nome} da sessão`}
                    >×</span>
                  )}
                </button>
              )
            })}
          </div>
          <div className={styles.porLojaItemsList}>
            {(() => {
              const seenGrades = new Set()
              return items.map(it => {
                const v = visitas[lojaIdx]
                if (!v) return null
                const isCalcado = it.tipo_grade?.startsWith('C-')
                const showGradeHeader = isCalcado && !seenGrades.has(it.tipo_grade)
                if (isCalcado) seenGrades.add(it.tipo_grade)
                const oM2 = GRADE_DEFINITIONS[it.tipo_grade]?.ocultoMenores ?? 0
                const oG2 = GRADE_DEFINITIONS[it.tipo_grade]?.ocultoMaiores ?? 0
                const showM2 = gradeGroupExpand[it.tipo_grade]?.showMenores
                const showG2 = gradeGroupExpand[it.tipo_grade]?.showMaiores
                const tams = tamanhosDeTipoGrade(it.tipo_grade)
                const vTams = getVisibleTams(it.localId, tams, it.tipo_grade)
                const hideFirst = vTams[0] !== tams[0]
                const hideLast  = vTams[vTams.length - 1] !== tams[tams.length - 1]
                const maxVisible2 = gradeExtremes[it.localId]?.maxVisible ?? PLUS_SIZE_DEFAULT - 1
                const nextExpIdx2 = maxVisible2 + 1
                const hideMiddle2 = !isCalcado && tams.length > PLUS_SIZE_DEFAULT && nextExpIdx2 <= tams.length - 2
                const total = totalQtdLoja(it.localId, v.id)
                return (
                  <Fragment key={it.localId}>
                    {showGradeHeader && (
                      <div className={styles.gradeGroupHeader}>
                        <span className={styles.gradeGroupLabel}>{it.tipo_grade}</span>
                        {oM2 > 0 && (
                          <button
                            className={`${styles.btnShowExtreme} ${showM2 ? styles.btnShowExtremeActive : ''}`}
                            onClick={() => setGradeGroupExpand(prev => ({ ...prev, [it.tipo_grade]: { ...prev[it.tipo_grade], showMenores: !showM2 } }))}
                            title={`${showM2 ? 'Ocultar' : 'Mostrar'} tamanhos menores (${tams[0]}–${tams[oM2 - 1]})`}
                          >{showM2 ? '−' : '+'}{tams[0]}–{tams[oM2 - 1]}</button>
                        )}
                        {oG2 > 0 && (
                          <button
                            className={`${styles.btnShowExtreme} ${showG2 ? styles.btnShowExtremeActive : ''}`}
                            onClick={() => setGradeGroupExpand(prev => ({ ...prev, [it.tipo_grade]: { ...prev[it.tipo_grade], showMaiores: !showG2 } }))}
                            title={`${showG2 ? 'Ocultar' : 'Mostrar'} tamanhos maiores (${tams[tams.length - oG2]}–${tams[tams.length - 1]})`}
                          >{showG2 ? '−' : '+'}{tams[tams.length - oG2]}–{tams[tams.length - 1]}</button>
                        )}
                      </div>
                    )}
                    <div className={`${styles.porLojaItemBlock} ${total > 0 ? styles.porLojaItemBlockFilled : ''}`}>
                      <div className={styles.porLojaItemHeader}>
                        <span className={styles.porLojaItemRef}>
                          {it.ref}
                          {(it.cor || it.detalhe) && (
                            <span className={styles.itemRefDetail}>{[it.cor, it.detalhe].filter(Boolean).join(' · ')}</span>
                          )}
                        </span>
                        <span className={styles.porLojaItemMeta}>{it.tipo_produto} · {it.tipo_grade} · {it.classe}</span>
                        {it.valor && <span className={styles.porLojaItemValor}>R$ {it.valor}</span>}
                        <span className={styles.porLojaItemTotalBadge}>{total > 0 ? `${total} pç` : '—'}</span>
                        {total > 0 && (
                          <button
                            className={styles.btnRemoveItemLoja}
                            title={`Remover ${it.ref} do pedido de ${v.comprador_nome}`}
                            onClick={() => setQtds(prev => {
                              const next = { ...prev }
                              if (next[it.localId]) {
                                next[it.localId] = { ...next[it.localId] }
                                delete next[it.localId][v.id]
                              }
                              return next
                            })}
                          >✕</button>
                        )}
                      </div>
                      <div className={styles.porLojaGradeRow} data-grade-row="true">
                        {!isCalcado && (hideFirst ? (
                          <button
                            className={styles.btnShowExtreme}
                            onClick={() => setGradeExtremes(prev => ({ ...prev, [it.localId]: { ...prev[it.localId], first: true } }))}
                            title={`Mostrar ${tams[0]}`}
                          >+{tams[0]}</button>
                        ) : tams.length >= 5 ? (
                          <button
                            className={`${styles.btnShowExtreme} ${styles.btnShowExtremeActive}`}
                            onClick={() => setGradeExtremes(prev => ({ ...prev, [it.localId]: { ...prev[it.localId], first: false } }))}
                            title={`Ocultar ${tams[0]}`}
                          >−{tams[0]}</button>
                        ) : null)}
                        {vTams.map(tam => (
                          <div key={tam} className={styles.porLojaGradeTam}>
                            <div className={styles.porLojaGradeTamLabel}>{tam}</div>
                            <input
                              type="number"
                              min="0"
                              className={styles.porLojaGradeInput}
                              value={getQtd(it.localId, v.id, tam)}
                              onChange={e => setQtd(it.localId, v.id, tam, e.target.value)}
                              onKeyDown={handleEnterOnInputPorLoja}
                              placeholder="0"
                              data-por-loja-input="1"
                            />
                          </div>
                        ))}
                        {hideMiddle2 && (
                          <button
                            className={styles.btnExpandSize}
                            onClick={() => setGradeExtremes(prev => ({ ...prev, [it.localId]: { ...prev[it.localId], maxVisible: nextExpIdx2 } }))}
                            title={`Mostrar ${tams[nextExpIdx2]}`}
                          >+{tams[nextExpIdx2]}</button>
                        )}
                        {!isCalcado && (hideLast ? (
                          <button
                            className={styles.btnShowExtreme}
                            onClick={() => setGradeExtremes(prev => ({ ...prev, [it.localId]: { ...prev[it.localId], last: true } }))}
                            title={`Mostrar ${tams[tams.length - 1]}`}
                          >+{tams[tams.length - 1]}</button>
                        ) : tams.length >= 5 ? (
                          <button
                            className={`${styles.btnShowExtreme} ${styles.btnShowExtremeActive}`}
                            onClick={() => setGradeExtremes(prev => ({ ...prev, [it.localId]: { ...prev[it.localId], last: false } }))}
                            title={`Ocultar ${tams[tams.length - 1]}`}
                          >−{tams[tams.length - 1]}</button>
                        ) : null)}
                      </div>
                    </div>
                  </Fragment>
                )
              })
            })()}
          </div>

          {/* ── Bottom summary dashboard ── */}
          {visitas.some(v => totalQtdVisita(v.id) > 0) && (() => {
            const dashVisitas = myComprador?.is_editor ? visitas : visitas.slice(lojaIdx, lojaIdx + 1)
            return (
              <div className={styles.resumoSessao}>
                <div className={styles.resumoSessaoTitle}>Resumo da sessão</div>
                <div className={styles.resumoSessaoGrid}>
                  <div className={`${styles.resumoRow} ${styles.resumoHeader}`}>
                    <div className={styles.resumoLojaCell}>Loja</div>
                    <div className={styles.resumoNumCell}>Peças</div>
                    <div className={styles.resumoNumCell}>Valor total</div>
                  </div>
                  {dashVisitas.map(v => {
                    const pcs = totalQtdVisita(v.id)
                    const val = totalValorVisita(v.id)
                    return (
                      <div
                        key={v.id}
                        className={`${styles.resumoRow} ${pcs === 0 ? styles.resumoRowEmpty : ''}`}
                        onClick={() => myComprador?.is_editor && setLojaIdx(visitas.indexOf(v))}
                        style={{ cursor: myComprador?.is_editor ? 'pointer' : 'default' }}
                      >
                        <div className={styles.resumoLojaCell}>{v.comprador_nome}</div>
                        <div className={styles.resumoNumCell}>
                          {pcs > 0 ? <strong>{pcs}</strong> : <span className={styles.itemDot}>—</span>}
                        </div>
                        <div className={styles.resumoNumCell}>
                          {val > 0
                            ? <strong>R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                            : <span className={styles.itemDot}>—</span>}
                        </div>
                      </div>
                    )
                  })}
                  {myComprador?.is_editor && visitas.length > 1 && (() => {
                    const totalPcs = visitas.reduce((s, v) => s + totalQtdVisita(v.id), 0)
                    const totalVal = visitas.reduce((s, v) => s + totalValorVisita(v.id), 0)
                    return (
                      <div className={`${styles.resumoRow} ${styles.resumoTotalRow}`}>
                        <div className={styles.resumoLojaCell}>Total geral</div>
                        <div className={styles.resumoNumCell}>{totalPcs}</div>
                        <div className={styles.resumoNumCell}>
                          R$ {totalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* ── Por referência mode: Items table with inline grade expansion ── */}
      {fillMode === 'ref' && items.length > 0 && (() => {
        return (
          <>
            <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>Ref</th>
              {showCorDetalhe && <th>Cor/Detalhe</th>}
              <th>Produto · Grade · Classe</th>
              <th>ICMS</th>
              <th>Valor unit.</th>
              <th>Peças</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const seenGrades = new Set()
              return displayItems.map(it => {
              const isActive = it.localId === activeId
              const isCalcado = it.tipo_grade?.startsWith('C-')
              const showGradeHeader = isCalcado && !seenGrades.has(it.tipo_grade)
              if (isCalcado) seenGrades.add(it.tipo_grade)
              const oMR = GRADE_DEFINITIONS[it.tipo_grade]?.ocultoMenores ?? 0
              const oGR = GRADE_DEFINITIONS[it.tipo_grade]?.ocultoMaiores ?? 0
              const showMR = gradeGroupExpand[it.tipo_grade]?.showMenores
              const showGR = gradeGroupExpand[it.tipo_grade]?.showMaiores
              const tams = tamanhosDeTipoGrade(it.tipo_grade)
              const vTams = getVisibleTams(it.localId, tams, it.tipo_grade)
              const hideFirst = vTams[0] !== tams[0]
              const hideLast  = vTams[vTams.length - 1] !== tams[tams.length - 1]
              const maxVisibleRef = gradeExtremes[it.localId]?.maxVisible ?? PLUS_SIZE_DEFAULT - 1
              const nextExpIdxRef = maxVisibleRef + 1
              const hideMiddleRef = !isCalcado && tams.length > PLUS_SIZE_DEFAULT && nextExpIdxRef <= tams.length - 2
              const total = totalQtdItem(it.localId)
              return (
                <Fragment key={it.localId}>
                  {showGradeHeader && (
                    <tr className={styles.gradeGroupHeaderRow}>
                      <td colSpan={showCorDetalhe ? 8 : 7} className={styles.gradeGroupHeaderCell}>
                        <span className={styles.gradeGroupLabel}>{it.tipo_grade}</span>
                        {oMR > 0 && (
                          <button
                            className={`${styles.btnShowExtreme} ${showMR ? styles.btnShowExtremeActive : ''}`}
                            onClick={() => setGradeGroupExpand(prev => ({ ...prev, [it.tipo_grade]: { ...prev[it.tipo_grade], showMenores: !showMR } }))}
                            title={`${showMR ? 'Ocultar' : 'Mostrar'} tamanhos menores (${tams[0]}–${tams[oMR - 1]})`}
                          >{showMR ? '−' : '+'}{tams[0]}–{tams[oMR - 1]}</button>
                        )}
                        {oGR > 0 && (
                          <button
                            className={`${styles.btnShowExtreme} ${showGR ? styles.btnShowExtremeActive : ''}`}
                            onClick={() => setGradeGroupExpand(prev => ({ ...prev, [it.tipo_grade]: { ...prev[it.tipo_grade], showMaiores: !showGR } }))}
                            title={`${showGR ? 'Ocultar' : 'Mostrar'} tamanhos maiores (${tams[tams.length - oGR]}–${tams[tams.length - 1]})`}
                          >{showGR ? '−' : '+'}{tams[tams.length - oGR]}–{tams[tams.length - 1]}</button>
                        )}
                      </td>
                    </tr>
                  )}
                  {editingId === it.localId ? (
                    /* ── Edit mode row ── */
                    <tr
                      className={styles.editItemRow}
                      onKeyDown={e => {
                        if (e.key === 'Enter') confirmEdit()
                        if (e.key === 'Escape') cancelEdit()
                      }}
                    >
                      <td>
                        <input
                          value={editForm.ref}
                          placeholder="Cód. forn."
                          onChange={e => setEditForm(p => ({ ...p, ref: e.target.value }))}
                          style={{ width: 70 }}
                        />
                      </td>
                      {showCorDetalhe && (
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <input
                              value={editForm.cor ?? ''}
                              placeholder="cor"
                              onChange={e => setEditForm(p => ({ ...p, cor: e.target.value }))}
                              style={{ width: 55 }}
                            />
                            <input
                              value={editForm.detalhe ?? ''}
                              placeholder="detalhe"
                              onChange={e => setEditForm(p => ({ ...p, detalhe: e.target.value }))}
                              style={{ width: 65 }}
                            />
                          </div>
                        </td>
                      )}
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            value={editForm.tipo_produto}
                            placeholder="Produto"
                            list="tipos-produto-list"
                            onChange={e => setEditForm(p => ({ ...p, tipo_produto: e.target.value }))}
                            style={{ width: 110 }}
                          />
                          <select
                            value={editForm.tipo_grade}
                            onChange={e => setEditForm(p => ({ ...p, tipo_grade: e.target.value }))}
                          >
                            {Object.keys(GRADE_DEFINITIONS).map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                          <select
                            value={editForm.classe}
                            onChange={e => setEditForm(p => ({ ...p, classe: e.target.value }))}
                          >
                            <option value="FEM">FEM</option>
                            <option value="MASC">MASC</option>
                            <option value="UNI">UNI</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <input
                          value={editForm.icms_pct}
                          placeholder="0"
                          onChange={e => setEditForm(p => ({ ...p, icms_pct: e.target.value }))}
                          style={{ width: 45 }}
                        />
                      </td>
                      <td>
                        <input
                          value={editForm.valor}
                          placeholder="0,00"
                          onChange={e => {
                            const valor = e.target.value
                            setEditForm(p => ({ ...p, valor }))
                          }}
                          style={{ width: 70 }}
                        />
                      </td>
                      <td></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                          <button
                            className={styles.btnAdd}
                            style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                            onClick={e => { e.stopPropagation(); confirmEdit() }}
                            title="Salvar (Enter)"
                          >✓</button>
                          <button
                            className={styles.btnRemoveItem}
                            onClick={e => { e.stopPropagation(); cancelEdit() }}
                            title="Cancelar (Esc)"
                          >✕</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    /* ── Normal row ── */
                    <tr
                      className={`${styles.itemRow} ${isActive ? styles.itemRowActive : ''} ${dupeHighlight === it.localId ? styles.itemRowDupeHighlight : ''}`}
                      onClick={() => { setEditingId(null); setEditForm(null); setActiveId(isActive ? null : it.localId); setLojaIdx(0) }}
                    >
                      <td>
                        {it.ref || <span className={styles.itemDot}>—</span>}
                        {!showCorDetalhe && (it.cor || it.detalhe) && (
                          <span className={styles.itemRefDetail}>
                            {[it.cor, it.detalhe].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </td>
                      {showCorDetalhe && (
                        <td onClick={e => e.stopPropagation()}>
                          {editingCorId === it.localId ? (
                            <span className={styles.inlineCorEdit}>
                              <input
                                className={styles.inlineCorInput}
                                placeholder="cor"
                                value={it.cor || ''}
                                autoFocus
                                onChange={e => setItems(prev => prev.map(x => x.localId === it.localId ? { ...x, cor: e.target.value } : x))}
                                onBlur={() => setEditingCorId(null)}
                              />
                              <input
                                className={styles.inlineCorInput}
                                placeholder="detalhe"
                                value={it.detalhe || ''}
                                onChange={e => setItems(prev => prev.map(x => x.localId === it.localId ? { ...x, detalhe: e.target.value } : x))}
                                onBlur={() => setEditingCorId(null)}
                              />
                            </span>
                          ) : (
                            <span
                              className={`${styles.inlineCorDisplay} ${dupeHighlight === it.localId ? styles.inlineCorDisplayAlert : ''}`}
                              onClick={() => setEditingCorId(it.localId)}
                              title="Clique para editar cor e detalhe"
                            >
                              {it.cor || it.detalhe
                                ? [it.cor, it.detalhe].filter(Boolean).join(' · ')
                                : '— cor / detalhe'}
                            </span>
                          )}
                        </td>
                      )}
                      <td>{it.tipo_produto} · {it.tipo_grade} · {it.classe}</td>
                      <td>{it.icms_pct || '0'}%</td>
                      <td>{it.valor ? `R$ ${it.valor}` : <span className={styles.itemDot}>—</span>}</td>
                      <td><strong>{total > 0 ? total : <span className={styles.itemDot}>—</span>}</strong></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.1rem', alignItems: 'center' }}>
                          <button
                            className={styles.btnEditItem}
                            onClick={e => { e.stopPropagation(); startEdit(it) }}
                            title="Editar item"
                          >✎</button>
                          <button
                            className={styles.btnDuplicateItem}
                            onClick={e => duplicateItem(it, e)}
                            title="Duplicar item (mantém quantidades)"
                          >⧉</button>
                          <button
                            className={styles.btnRemoveItem}
                            onClick={e => removeItem(it.localId, e)}
                            title="Remover item"
                          >✕</button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {showCorDetalhe && editingId !== it.localId && (
                    <tr className={styles.corDetalheSubRow}>
                      <td colSpan={8} className={styles.corDetalheSubCell}>
                        <input
                          type="text"
                          className={styles.corDetalheSubInput}
                          placeholder="Cor"
                          value={it.cor || ''}
                          onChange={e => setItems(prev => prev.map(x => x.localId === it.localId ? { ...x, cor: e.target.value } : x))}
                          onClick={e => e.stopPropagation()}
                        />
                        <input
                          type="text"
                          className={`${styles.corDetalheSubInput} ${styles.corDetalheSubInputWide}`}
                          placeholder="Detalhe / estampa"
                          value={it.detalhe || ''}
                          onChange={e => setItems(prev => prev.map(x => x.localId === it.localId ? { ...x, detalhe: e.target.value } : x))}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                    </tr>
                  )}
                  {isActive && editingId !== it.localId && (
                    <tr className={styles.gradeExpansionRow}>
                      <td colSpan={8} className={styles.gradeExpansionCell}>
                        <div className={styles.gradeInlineWrap}>
                          {showItemFields[it.localId] ? (
                            <div className={styles.itemFieldsPanel}>
                              <label className={styles.itemFieldLabel}>
                                Cor
                                <input
                                  type="text"
                                  className={styles.itemFieldInput}
                                  placeholder="Ex: azul índigo"
                                  value={it.cor || ''}
                                  onChange={e => setItems(prev => prev.map(x => x.localId === it.localId ? { ...x, cor: e.target.value } : x))}
                                />
                              </label>
                              <label className={styles.itemFieldLabel}>
                                Detalhe
                                <input
                                  type="text"
                                  className={styles.itemFieldInput}
                                  style={{ width: 200 }}
                                  placeholder="Ex: listra lateral, bordado"
                                  value={it.detalhe || ''}
                                  onChange={e => setItems(prev => prev.map(x => x.localId === it.localId ? { ...x, detalhe: e.target.value } : x))}
                                />
                              </label>
                              <label className={styles.itemFieldLabel}>
                                OBS
                                <input
                                  type="text"
                                  className={styles.itemFieldInput}
                                  style={{ width: 200 }}
                                  placeholder="Observação do item"
                                  value={it.obs || ''}
                                  onChange={e => setItems(prev => prev.map(x => x.localId === it.localId ? { ...x, obs: e.target.value } : x))}
                                />
                              </label>
                              <button
                                className={styles.btnHideFields}
                                onClick={() => setShowItemFields(prev => ({ ...prev, [it.localId]: false }))}
                              >ocultar</button>
                            </div>
                          ) : (
                            <button
                              className={styles.btnShowFields}
                              onClick={() => setShowItemFields(prev => ({ ...prev, [it.localId]: true }))}
                            >
                              {it.cor || it.detalhe || it.obs ? `✎ ${[it.cor, it.detalhe, it.obs].filter(Boolean).join(' · ')}` : '+ cor / detalhe / obs'}
                            </button>
                          )}
                          <div className={styles.gradeInlineHeader}>
                            <div className={styles.gradeInlineLoja}>Loja</div>
                            <div
                              className={styles.gradeInlineDist}
                              title="Auto Distribuir pela projeção: clique na célula, digite o total e pressione Enter"
                            >Dist.</div>
                            {!isCalcado && (hideFirst ? (
                              <button
                                className={styles.btnShowExtreme}
                                onClick={() => setGradeExtremes(prev => ({ ...prev, [it.localId]: { ...prev[it.localId], first: true } }))}
                                title={`Mostrar ${tams[0]}`}
                              >+{tams[0]}</button>
                            ) : tams.length >= 5 ? (
                              <button
                                className={`${styles.btnShowExtreme} ${styles.btnShowExtremeActive}`}
                                onClick={() => setGradeExtremes(prev => ({ ...prev, [it.localId]: { ...prev[it.localId], first: false } }))}
                                title={`Ocultar ${tams[0]}`}
                              >−{tams[0]}</button>
                            ) : null)}
                            {vTams.map(t => (
                              <div key={t} className={styles.gradeInlineSize}>{t}</div>
                            ))}
                            {hideMiddleRef && (
                              <button
                                className={styles.btnExpandSize}
                                onClick={() => setGradeExtremes(prev => ({ ...prev, [it.localId]: { ...prev[it.localId], maxVisible: nextExpIdxRef } }))}
                                title={`Mostrar ${tams[nextExpIdxRef]}`}
                              >+{tams[nextExpIdxRef]}</button>
                            )}
                            {!isCalcado && (hideLast ? (
                              <button
                                className={styles.btnShowExtreme}
                                onClick={() => setGradeExtremes(prev => ({ ...prev, [it.localId]: { ...prev[it.localId], last: true } }))}
                                title={`Mostrar ${tams[tams.length - 1]}`}
                              >+{tams[tams.length - 1]}</button>
                            ) : tams.length >= 5 ? (
                              <button
                                className={`${styles.btnShowExtreme} ${styles.btnShowExtremeActive}`}
                                onClick={() => setGradeExtremes(prev => ({ ...prev, [it.localId]: { ...prev[it.localId], last: false } }))}
                                title={`Ocultar ${tams[tams.length - 1]}`}
                              >−{tams[tams.length - 1]}</button>
                            ) : null)}
                            <div className={styles.gradeInlineTotalReadonly}>Total</div>
                          </div>
                          {visitas.map((v, i) => {
                            const targetKey = `${it.localId}__${v.id}`
                            const targetEditing = distribTargets[targetKey]
                            const computedTotal = totalQtdLoja(it.localId, v.id)
                            return (
                              <div
                                key={v.id}
                                data-grade-row="true"
                                className={`${styles.gradeInlineRow} ${i === lojaIdx ? styles.gradeInlineRowActive : ''}`}
                                onClick={() => setLojaIdx(i)}
                              >
                                <div className={styles.gradeInlineLoja}>
                                  {v.comprador_nome}
                                  {visitas.length > 1 && (
                                    <button
                                      className={styles.btnRemoveVisita}
                                      onClick={e => { e.stopPropagation(); removeVisita(v.id, v.comprador_nome) }}
                                      title={`Remover ${v.comprador_nome} da sessão`}
                                    >×</button>
                                  )}
                                </div>
                                <div className={styles.gradeInlineTotalCell}>
                                  <input
                                    type="number"
                                    min="1"
                                    tabIndex={-1}
                                    className={styles.totalDistribInput}
                                    value={targetEditing !== undefined ? targetEditing : (computedTotal || '')}
                                    placeholder={computedTotal || '—'}
                                    title="Digite o total e pressione Enter para distribuir pela projeção de compras"
                                    onChange={e => setDistribTargets(prev => ({ ...prev, [targetKey]: e.target.value }))}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        handleDistribuirTotal(it.localId, v.id, e.target.value)
                                        setDistribTargets(prev => { const n = { ...prev }; delete n[targetKey]; return n })
                                        e.preventDefault()
                                      } else if (e.key === 'Escape') {
                                        setDistribTargets(prev => { const n = { ...prev }; delete n[targetKey]; return n })
                                      }
                                    }}
                                    onBlur={() => setDistribTargets(prev => { const n = { ...prev }; delete n[targetKey]; return n })}
                                    onClick={e => e.stopPropagation()}
                                  />
                                </div>
                                {hideFirst && <div className={styles.gradeInlineSizeSpacer} />}
                                {vTams.map((tam, vTamIdx) => (
                                  <div key={tam} className={styles.gradeInlineSize}>
                                    <input
                                      ref={vTamIdx === 0 && i === lojaIdx ? firstInputRef : null}
                                      type="number"
                                      min="0"
                                      className={styles.qtyInput}
                                      value={getQtd(it.localId, v.id, tam)}
                                      onChange={e => setQtd(it.localId, v.id, tam, e.target.value)}
                                      onFocus={() => setLojaIdx(i)}
                                      onKeyDown={e => handleEnterOnInput(e, vTamIdx, i, vTams.length)}
                                      placeholder="0"
                                    />
                                  </div>
                                ))}
                                {hideMiddleRef && <div className={styles.gradeInlineSizeSpacer} />}
                                {hideLast && <div className={styles.gradeInlineSizeSpacer} />}
                                <div className={styles.gradeInlineTotalReadonly}>{computedTotal || '—'}</div>
                              </div>
                            )
                          })}
                          {visitas.length > 1 && (
                            <div className={`${styles.gradeInlineRow} ${styles.gradeInlineTotalsRow}`}>
                              <div className={styles.gradeInlineLoja}>Total lojas</div>
                              <div className={styles.gradeInlineDist}></div>
                              {hideFirst && <div className={styles.gradeInlineSizeSpacer} />}
                              {vTams.map(tam => {
                                const tot = visitas.reduce((s, v2) => s + (parseInt(qtds[it.localId]?.[v2.id]?.[tam]) || 0), 0)
                                return <div key={tam} className={styles.gradeInlineSize}>{tot || ''}</div>
                              })}
                              {hideMiddleRef && <div className={styles.gradeInlineSizeSpacer} />}
                              {hideLast && <div className={styles.gradeInlineSizeSpacer} />}
                              <div className={styles.gradeInlineTotalReadonly}>{totalQtdItem(it.localId) || ''}</div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })
            })()}
          </tbody>
        </table>
          </>
        )
      })()}

      {/* ── Resumo por loja (modo por referência) ── */}
      {fillMode === 'ref' && items.length > 0 && visitas.some(v => totalQtdVisita(v.id) > 0) && (
        <div className={styles.resumoSessao}>
          <div className={styles.resumoSessaoTitle}>Resumo da sessão</div>
          <div className={styles.resumoSessaoGrid}>
            <div className={`${styles.resumoRow} ${styles.resumoHeader}`}>
              <div className={styles.resumoLojaCell}>Loja</div>
              <div className={styles.resumoNumCell}>Peças</div>
              <div className={styles.resumoNumCell}>Valor total</div>
            </div>
            {visitas.map(v => {
              const pcs = totalQtdVisita(v.id)
              const val = totalValorVisita(v.id)
              return (
                <div key={v.id} className={`${styles.resumoRow} ${pcs === 0 ? styles.resumoRowEmpty : ''}`}>
                  <div className={styles.resumoLojaCell}>{v.comprador_nome}</div>
                  <div className={styles.resumoNumCell}>
                    {pcs > 0 ? <strong>{pcs}</strong> : <span className={styles.itemDot}>—</span>}
                  </div>
                  <div className={styles.resumoNumCell}>
                    {val > 0
                      ? <strong>R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      : <span className={styles.itemDot}>—</span>}
                  </div>
                </div>
              )
            })}
            {visitas.length > 1 && (() => {
              const totalPcs = visitas.reduce((s, v) => s + totalQtdVisita(v.id), 0)
              const totalVal = visitas.reduce((s, v) => s + totalValorVisita(v.id), 0)
              return (
                <div className={`${styles.resumoRow} ${styles.resumoTotalRow}`}>
                  <div className={styles.resumoLojaCell}>Total geral</div>
                  <div className={styles.resumoNumCell}>{totalPcs}</div>
                  <div className={styles.resumoNumCell}>
                    R$ {totalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.phase2Footer}>
        {workMode === 'add' ? (
          items.length > 0 && (
            <button
              className={styles.btnGoToFill}
              onClick={() => { setWorkMode('fill'); setActiveId(null) }}
            >
              Pronto — ir para preenchimento →
            </button>
          )
        ) : (
          <>
            <span className={styles.phase2FooterMeta}>
              {items.filter(it => totalQtdItem(it.localId) > 0).length} de {items.length} {items.length === 1 ? 'item preenchido' : 'itens preenchidos'}
            </span>
            <div className={styles.phase2FooterActions}>
              <button
                className={styles.btnLiberar}
                onClick={handleLiberar}
                disabled={liberando || !items.length}
              >
                {liberando ? 'Liberando…' : '⇢ Liberar para as lojas'}
              </button>
              <button
                className={styles.btnFecharSessao}
                onClick={handleFechar}
                disabled={saving || !items.length}
                title="Fecha a sessão e vai para a tela de PDFs (Fase 3)"
              >{saving ? 'Salvando…' : 'Fechar sessão'}</button>
            </div>
          </>
        )}
      </div>
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
