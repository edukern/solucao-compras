import { useState, useEffect, useRef, Fragment } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { useAuth } from '../contexts/AuthContext'
import { tamanhosDeTipoGrade, GRADE_DEFINITIONS } from '../constants/grades'
import { TIPOS_PRODUTO } from '../constants/tipoProduto'
import ConfirmModal from '../components/ConfirmModal'
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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const fmt = n => (n ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = iso => { if (!iso) return ''; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}` }
const PLUS_SIZE_DEFAULT = 4
const today = () => new Date().toISOString().slice(0, 10)
const esc = s => (s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

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

function RegistrarPedidoSessao({ sessao, visitas, colId, colEstacao, onFechar, onRemoveVisita, onAddVisita, onCancelarSessao, segs = [],
  compradores = [],
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
  const [showAddLoja,    setShowAddLoja]    = useState(false)
  const [addLojaId,      setAddLojaId]      = useState('')
  const [addLojaLoading, setAddLojaLoading] = useState(false)

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
    // Se o custo mudou, propaga para todos os pedidos desta referência na sessão
    const valorMudou = original && editForm.valor !== original.valor
    if (valorMudou && original?.ref && sessao?.id) {
      const novoValor = parseFloat((editForm.valor ?? '').replace(',', '.')) || 0
      pedidosService.atualizarValorItem(sessao.id, original.ref, novoValor).catch(() => {})
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

  async function handleAddLoja() {
    if (!addLojaId) return
    setAddLojaLoading(true)
    try {
      const raw = await sessoesService.addVisita(sessao.id, Number(addLojaId))
      const novaVisita = { ...raw, id: raw.visita_id }
      onAddVisita?.(novaVisita)
      setLojaIdx(visitas.length) // foca na nova loja
      setShowAddLoja(false)
      setAddLojaId('')
    } catch (e) {
      alert('Erro ao adicionar empresa: ' + e.message)
    } finally {
      setAddLojaLoading(false)
    }
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
            {(() => {
              const jaIncluidas = new Set(visitas.map(v => v.comprador_id))
              const disponiveis = compradores.filter(c => !jaIncluidas.has(c.id))
              if (disponiveis.length === 0) return null
              return showAddLoja ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.5rem' }}>
                  <select value={addLojaId} onChange={e => setAddLojaId(e.target.value)} style={{ fontSize: '0.82rem' }}>
                    <option value="">Selecionar empresa...</option>
                    {disponiveis.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  <button onClick={handleAddLoja} disabled={!addLojaId || addLojaLoading} className={styles.btnPrimary} style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
                    {addLojaLoading ? '…' : 'Adicionar'}
                  </button>
                  <button onClick={() => { setShowAddLoja(false); setAddLojaId('') }} className={styles.btnSecondary} style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  className={styles.btnSecondary}
                  style={{ fontSize: '0.8rem', padding: '0.2rem 0.7rem', alignSelf: 'center' }}
                  onClick={() => setShowAddLoja(true)}
                  title="Adicionar empresa à sessão"
                >+ Empresa</button>
              )
            })()}
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

      {/* ── Adicionar empresa (modo por referência) ── */}
      {fillMode === 'ref' && (() => {
        const jaIncluidas = new Set(visitas.map(v => v.comprador_id))
        const disponiveis = compradores.filter(c => !jaIncluidas.has(c.id))
        if (disponiveis.length === 0) return null
        return showAddLoja ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
            <select value={addLojaId} onChange={e => setAddLojaId(e.target.value)} style={{ fontSize: '0.82rem' }}>
              <option value="">Selecionar empresa...</option>
              {disponiveis.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <button onClick={handleAddLoja} disabled={!addLojaId || addLojaLoading} className={styles.btnPrimary} style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
              {addLojaLoading ? '…' : 'Adicionar'}
            </button>
            <button onClick={() => { setShowAddLoja(false); setAddLojaId('') }} className={styles.btnSecondary} style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
              Cancelar
            </button>
          </div>
        ) : (
          <button
            className={styles.btnSecondary}
            style={{ fontSize: '0.85rem', margin: '0.5rem 0' }}
            onClick={() => setShowAddLoja(true)}
          >+ Adicionar empresa à sessão</button>
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

// ─── PDF generation (shared between FecharSessao and Historico) ──────────

const PDF_STYLES = `
  body { font-family: Arial, sans-serif; font-size: 10px; color: #000; margin: 0; }
  .order { padding: 12px 14px; page-break-after: always; }
  .order:last-child { page-break-after: avoid; }

  /* Header */
  .ph { display:flex; gap:16px; border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:10px; }
  .ph-store { flex:1.5; min-width:0; }
  .ph-store-name { font-size:14px; font-weight:bold; line-height:1.3; margin-bottom:3px; }
  .ph-store-line { font-size:9px; margin-top:3px; }
  .ph-order { min-width:200px; max-width:240px; border-left:1.5px solid #ccc; padding-left:14px; font-size:9px; }
  .ph-sup { font-size:14px; font-weight:bold; letter-spacing:.05em; margin-bottom:6px; color:#222; }
  .ph-tbl { border-collapse:collapse; width:100%; }
  .ph-tbl td { padding:2px 4px; }
  .ph-tbl td:first-child { font-weight:bold; white-space:nowrap; padding-right:8px; }
  .ph-note { font-size:8px; color:#555; margin:5px 0 2px; font-style:italic; }
  .ph-credit { font-size:11px; font-weight:bold; margin-top:5px; }

  /* Products table */
  .pt { width:100%; border-collapse:collapse; font-size:9px; table-layout:fixed; margin-top:6px; }
  .pt th,.pt td { border:0.5px solid #bbb; padding:2px 3px; text-align:center; overflow:hidden; white-space:nowrap; }
  .pt th { background:#e0e0e0; font-weight:bold; font-size:8px; padding:3px; }
  .pt .cp { text-align:left; width:96px; font-size:9px; white-space:normal; }
  .pt .ct { width:22px; background:#f5f5f5; color:#555; font-size:8px; }
  .pt .cq { width:24px; }
  .pt .cq0 { color:#ccc; }
  .pt .cd { color:#ddd; font-size:8px; }
  .pt .cqt { width:32px; font-weight:bold; }
  .pt .cpr { width:46px; }
  .pt .ctot { width:66px; font-weight:bold; }
  .pt .cic { width:24px; font-size:8px; }
  .pt .crl { width:46px; }
  .pt .cvnd { width:46px; color:#1a7a3a; font-weight:bold; }
  .pt .cref { text-align:left; width:100px; font-size:9px; white-space:normal; overflow:visible; }
  .pt tbody tr { page-break-inside: avoid; break-inside: avoid; }
  .pt tfoot { page-break-inside: avoid; break-inside: avoid; }
  .pt tfoot td { font-weight:bold; background:#f0f0f0; border-top:1.5px solid #777; }
  .pt .tl { text-align:right; font-size:9px; }
  .pt .tv { text-align:right; font-size:10px; }
  .pt .tv-big { font-size:12px; font-weight:900; }

  @media print { @page { margin:10mm; size:A4 landscape; } }`

function wrapDoc(ordersHtml, titulo) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <style>${PDF_STYLES}
  </style>
</head>
<body>${ordersHtml}</body>
</html>`
}

const MESES_PT = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']
const fmtEntrega = iso => {
  if (!iso) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [, m, d] = iso.split('-')
    return `${parseInt(d, 10)} DE ${MESES_PT[parseInt(m, 10) - 1]}`
  }
  return iso.toUpperCase()
}
const fmtV = n => (n ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })


function gerarHTMLOrdem(sessao, vis, visPedidos, isLast = true) {
  if (!visPedidos.length) return ''

  // ── totals ───────────────────────────────────────────────────────────────
  const totalBruto = visPedidos.reduce((s, p) => {
    const itens = p.itens ?? []
    const q = itens.reduce((s2, i) => s2 + i.qtd, 0)
    return s + q * (p.valor_unitario ?? 0)
  }, 0)
  const totalLiquido = visPedidos.reduce((s, p) => {
    const itens = p.itens ?? []
    const q = itens.reduce((s2, i) => s2 + i.qtd, 0)
    return s + q * (p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100)
  }, 0)
  const totalPecas = visPedidos.reduce((s, p) => s + (p.itens ?? []).reduce((s2, i) => s2 + i.qtd, 0), 0)
  const temDesconto = visPedidos.some(p => (p.desconto_pct ?? 0) > 0)
  const temICMS = pedidosOrdenados.some(p => (p.icms_pct ?? 0) > 0) || (sessao.icms_credito_pct != null && sessao.icms_credito_pct !== '')
  const temVenda = pedidosOrdenados.some(p => (p.preco_venda ?? 0) > 0)

  const pedidosOrdenados = visPedidos

  // ── active sizes: union of sizes that have qty > 0 in any product ────────
  const sizeOrder = []
  const sizeSet   = new Set()
  const sizeHasQty = new Set()
  for (const p of pedidosOrdenados) {
    const tipo_grade = p.tipo_grade ?? p.segmentacao?.tipo_grade ?? 'AD'
    const gradeTams  = GRADE_DEFINITIONS[tipo_grade]?.tamanhos ?? []
    const qtdMap     = Object.fromEntries((p.itens ?? []).map(i => [i.tamanho, i.qtd]))
    for (const tam of gradeTams) {
      if (!sizeSet.has(tam)) { sizeSet.add(tam); sizeOrder.push(tam) }
      if ((qtdMap[tam] ?? 0) > 0) sizeHasQty.add(tam)
    }
  }
  const activeSizes = sizeOrder.filter(t => sizeHasQty.has(t))

  // ── product rows ─────────────────────────────────────────────────────────
  const prodRows = pedidosOrdenados.map(p => {
    const itens = p.itens ?? []
    const tipo_produto = p.tipo_produto ?? p.segmentacao?.tipo_produto ?? ''
    const qtdMap       = Object.fromEntries(itens.map(i => [i.tamanho, i.qtd]))

    const cells = activeSizes.map(tam => {
      const q = qtdMap[tam] ?? 0
      return `<td class="ct">${esc(tam)}</td><td class="${q === 0 ? 'cq cq0' : 'cq'}">${q || '—'}</td>`
    })

    const totalQ = itens.reduce((s, i) => s + i.qtd, 0)
    const totalV = totalQ * (p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100)

    const refLabel = [p.referencia, p.cor, p.detalhe].filter(Boolean).join(' ')
    const classeLabel = [tipo_produto, p.classe ?? p.segmentacao?.classe ?? ''].filter(Boolean).join(' ')
    return `<tr>
      <td class="cref">${esc(refLabel)}</td>
      <td class="cp">${esc(classeLabel)}</td>
      ${cells.join('')}
      <td class="cqt">${totalQ || '—'}</td>
      <td class="cpr">${fmtV(p.valor_unitario ?? 0)}</td>
      <td class="ctot">${totalV > 0 ? fmtV(totalV) : '—'}</td>
      <td class="crl">${fmtV((p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100))}</td>
      ${temVenda ? `<td class="cvnd">${(p.preco_venda ?? 0) > 0 ? fmtV(p.preco_venda) : '—'}</td>` : ''}
      ${temICMS ? `<td class="cic">${(p.icms_pct ?? 0) > 0 ? p.icms_pct + '%' : '—'}</td>` : ''}
    </tr>`
  }).join('')

  // ── table header (only active sizes) ─────────────────────────────────────
  const headerPairs = activeSizes.map(() => '<th>T</th><th>Q</th>').join('')

  // ── store info (left) ────────────────────────────────────────────────────
  const storeHtml = `
    <div class="ph-store">
      <div class="ph-store-name">${esc(vis.comprador_nome)}</div>
      ${vis.comprador_cnpj     ? `<div class="ph-store-line">CNPJ: ${esc(vis.comprador_cnpj)}</div>` : ''}
      ${vis.comprador_fantasia ? `<div class="ph-store-line">Fantasia: ${esc(vis.comprador_fantasia)}${vis.comprador_ie ? `&nbsp;&nbsp;&nbsp;I.E.: ${esc(vis.comprador_ie)}` : ''}</div>` : ''}
      ${vis.comprador_email    ? `<div class="ph-store-line">e-mail: ${esc(vis.comprador_email)}</div>` : ''}
      ${vis.comprador_telefone ? `<div class="ph-store-line">${esc(vis.comprador_telefone)}</div>` : ''}
      ${vis.comprador_endereco
        ? `<div class="ph-store-line">End.: ${esc(vis.comprador_endereco)}</div>`
        : vis.comprador_cidade ? `<div class="ph-store-line">${esc(vis.comprador_cidade)}</div>` : ''}
    </div>`

  // ── order info (right) ───────────────────────────────────────────────────
  const suppName = esc(sessao.fornecedor_nome ?? sessao.fornecedor?.nome ?? '')
  const orderHtml = `
    <div class="ph-order">
      ${suppName ? `<div class="ph-sup">${suppName}</div>` : ''}
      <table class="ph-tbl">
        <tr><td>Data:</td><td>${fmtDate(sessao.data_visita)}</td></tr>
        ${sessao.data_entrega    ? `<tr><td>Entrega:</td><td>${fmtEntrega(sessao.data_entrega)}</td></tr>` : ''}
        ${sessao.cond_pag        ? `<tr><td>Cond. Pagt.:</td><td>${esc(sessao.cond_pag)}</td></tr>` : ''}
        ${sessao.frete           ? `<tr><td>Frete:</td><td>${esc(sessao.frete)}</td></tr>` : ''}
      </table>
      ${sessao.icms_credito_pct != null && sessao.icms_credito_pct !== ''
        ? `<div class="ph-note">Empresa de lucro presumido, precisa do crédito de ICMS</div>` : ''}
      <table class="ph-tbl" style="margin-top:4px;">
        ${sessao.vendedor        ? `<tr><td>Vendedor:</td><td>${esc(sessao.vendedor)}</td></tr>` : ''}
        ${sessao.contato         ? `<tr><td>Fone:</td><td>${esc(sessao.contato)}</td></tr>` : ''}
        ${sessao.transportadora  ? `<tr><td>Transp.:</td><td>${esc(sessao.transportadora)}</td></tr>` : ''}
      </table>
      ${sessao.icms_credito_pct != null && sessao.icms_credito_pct !== ''
        ? `<div class="ph-credit">Crédito: ${sessao.icms_credito_pct}%</div>` : ''}
    </div>`

  // ── footer totals: colspan dinâmico baseado em colunas ativas ───────────
  // ref + produto + (T+Q)*activeSizes + quant + preco = total label cols, depois ctot, depois crl + cvnd? + cic?
  const totalDesconto = totalBruto - totalLiquido
  const descontoPct = totalBruto > 0 ? Math.round((totalDesconto / totalBruto) * 100) : 0
  const footerLabelCols = 2 + activeSizes.length * 2 + 2
  const footerRightCols = 1 + (temVenda ? 1 : 0) + (temICMS ? 1 : 0)

  const footerRows = `
    <tr>
      <td class="tl" colspan="${footerLabelCols}">Total Bruto</td>
      <td class="tv">${fmtV(totalBruto)}</td>
      <td colspan="${footerRightCols}"></td>
    </tr>
    ${temDesconto ? `<tr>
      <td class="tl" colspan="${footerLabelCols}">Desconto ${descontoPct}%</td>
      <td class="tv" style="color:#b00;">- ${fmtV(totalDesconto)}</td>
      <td colspan="${footerRightCols}"></td>
    </tr>` : ''}
    <tr>
      <td class="tl" colspan="${footerLabelCols}">Total Liquido</td>
      <td class="tv tv-big">${fmtV(totalLiquido)}</td>
      <td colspan="${footerRightCols}" style="font-size:8px; text-align:right; color:#555;">${totalPecas} peças</td>
    </tr>`

  return `
    <div class="order"${isLast ? ' style="page-break-after:avoid;"' : ''}>
      <div class="ph">
        ${storeHtml}
        ${orderHtml}
      </div>
      <table class="pt">
        <thead>
          <tr>
            <th class="cref">Referência</th>
            <th class="cp">Produto</th>
            ${headerPairs}
            <th class="cqt">Quant</th>
            <th class="cpr">R$ un.</th>
            <th class="ctot">Total</th>
            <th class="crl">R$ Liq</th>
            ${temVenda ? '<th class="cvnd">R$ Venda</th>' : ''}
            ${temICMS ? '<th class="cic">ICMS%</th>' : ''}
          </tr>
        </thead>
        <tbody>${prodRows}</tbody>
        <tfoot>${footerRows}</tfoot>
      </table>
      ${sessao.obs ? `<div style="margin-top:6px;font-size:9px;"><strong>Obs.:</strong> ${esc(sessao.obs)}</div>` : ''}
    </div>`
}

function gerarPDFSessao(sessao, visitas, pedidosPorVisita, lojaOverrides = {}) {
  const visitasComPedidos = visitas.filter(v => (pedidosPorVisita[v.id] ?? []).length > 0)
  if (!visitasComPedidos.length) { alert('Nenhum pedido para gerar PDF.'); return }

  const ordersHtml = visitasComPedidos.map((vis, idx) => {
    const ovr = lojaOverrides[vis.id]
    const sessaoVis = ovr ? { ...sessao, ...ovr } : sessao
    return gerarHTMLOrdem(sessaoVis, vis, pedidosPorVisita[vis.id] ?? [], idx === visitasComPedidos.length - 1)
  }).join('')
  const html = wrapDoc(ordersHtml, `Pedidos — ${esc(sessao.fornecedor_nome)} — ${fmtDate(sessao.data_visita)}`)

  const win = window.open('', '_blank')
  if (!win) { alert('Bloqueador de pop-ups ativo. Permita pop-ups para este site.'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}

const FICHA_STYLES = `
  body { font-family: Arial, sans-serif; font-size: 10px; color: #000; margin: 0; }
  .ficha { padding: 12px 14px; page-break-after: always; }
  .ficha:last-child { page-break-after: avoid; }
  .fh { display:flex; gap:16px; border-bottom:2px solid #000; padding-bottom:8px; margin-bottom:8px; justify-content:space-between; }
  .fh-store { flex:1; }
  .fh-store-name { font-size:14px; font-weight:bold; margin-bottom:3px; }
  .fh-store-line { font-size:9px; }
  .fh-info { text-align:right; }
  .fh-forn { font-size:12px; font-weight:bold; margin-bottom:3px; }
  .fh-date { font-size:9px; }
  .ft-table { width:100%; border-collapse:collapse; font-size:9px; table-layout:fixed; margin-top:6px; }
  .ft-table th, .ft-table td { border:0.5px solid #bbb; padding:2px 3px; text-align:center; overflow:hidden; white-space:nowrap; }
  .ft-table th { background:#e0e0e0; font-weight:bold; font-size:8px; padding:3px; }
  .ft-table tbody tr { page-break-inside: avoid; break-inside: avoid; }
  .ft-table tfoot td { font-weight:bold; background:#f0f0f0; border-top:1.5px solid #777; }
  .fref { text-align:left; width:100px; font-size:9px; white-space:normal; overflow:visible; }
  .fprod { text-align:left; width:90px; font-size:9px; white-space:normal; }
  .ft { width:22px; background:#f5f5f5; color:#555; font-size:8px; }
  .fq { width:24px; }
  .fq0 { color:#ccc; }
  .fqt { width:32px; font-weight:bold; }
  .tl { text-align:right; font-size:9px; }
  @media print { @page { margin:10mm; size:A4 portrait; } }`

function gerarHTMLFichaLoja(sessao, vis, visPedidos, isLast = true) {
  if (!visPedidos.length) return ''

  const sizeOrder = [], sizeSet = new Set(), sizeHasQty = new Set()
  for (const p of visPedidos) {
    const gradeTams = GRADE_DEFINITIONS[p.tipo_grade ?? 'AD']?.tamanhos ?? []
    const qtdMap = Object.fromEntries((p.itens ?? []).map(i => [i.tamanho, i.qtd]))
    for (const tam of gradeTams) {
      if (!sizeSet.has(tam)) { sizeSet.add(tam); sizeOrder.push(tam) }
      if ((qtdMap[tam] ?? 0) > 0) sizeHasQty.add(tam)
    }
  }
  const activeSizes = sizeOrder.filter(t => sizeHasQty.has(t))

  const fornNome = sessao.fornecedor_nome ?? sessao.fornecedor?.nome ?? ''
  const totalPecas = visPedidos.reduce((s, p) => s + (p.itens ?? []).reduce((s2, i) => s2 + i.qtd, 0), 0)

  const prodRows = visPedidos.map(p => {
    const qtdMap = Object.fromEntries((p.itens ?? []).map(i => [i.tamanho, i.qtd]))
    const totalQ = (p.itens ?? []).reduce((s, i) => s + i.qtd, 0)
    const refLabel = [p.referencia, p.cor, p.detalhe].filter(Boolean).join(' ')
    const prodLabel = [p.tipo_produto ?? '', p.classe ?? ''].filter(Boolean).join(' ')
    const cells = activeSizes.map(tam => {
      const q = qtdMap[tam] ?? 0
      return `<td class="ft">${esc(tam)}</td><td class="${q === 0 ? 'fq fq0' : 'fq'}">${q || '—'}</td>`
    })
    return `<tr>
      <td class="fref">${esc(refLabel)}</td>
      <td class="fprod">${esc(prodLabel)}</td>
      ${cells.join('')}
      <td class="fqt">${totalQ || '—'}</td>
    </tr>`
  }).join('')

  const headerPairs = activeSizes.map(() => '<th>T</th><th>Q</th>').join('')
  const footerCols = 2 + activeSizes.length * 2

  return `
    <div class="ficha"${isLast ? ' style="page-break-after:avoid;"' : ''}>
      <div class="fh">
        <div class="fh-store">
          <div class="fh-store-name">${esc(vis.comprador_nome)}</div>
          ${vis.comprador_cnpj ? `<div class="fh-store-line">CNPJ: ${esc(vis.comprador_cnpj)}</div>` : ''}
          ${vis.comprador_cidade ? `<div class="fh-store-line">${esc(vis.comprador_cidade)}</div>` : ''}
        </div>
        <div class="fh-info">
          <div class="fh-forn">${esc(fornNome)}</div>
          <div class="fh-date">Visita: ${fmtDate(sessao.data_visita)}</div>
          ${sessao.data_entrega ? `<div class="fh-date">Entrega: ${fmtEntrega(sessao.data_entrega)}</div>` : ''}
        </div>
      </div>
      <table class="ft-table">
        <thead>
          <tr>
            <th class="fref">Referência</th>
            <th class="fprod">Produto</th>
            ${headerPairs}
            <th class="fqt">Total</th>
          </tr>
        </thead>
        <tbody>${prodRows}</tbody>
        <tfoot>
          <tr>
            <td class="tl" colspan="${footerCols}">Total de peças</td>
            <td class="fqt">${totalPecas}</td>
          </tr>
        </tfoot>
      </table>
    </div>`
}

function gerarFichasLojas(sessao, visitas, pedidosPorVisita) {
  const visitasComPedidos = visitas.filter(v => (pedidosPorVisita[v.id] ?? []).length > 0)
  if (!visitasComPedidos.length) { alert('Nenhum pedido para gerar fichas.'); return }

  const fichasHtml = visitasComPedidos.map((vis, idx) =>
    gerarHTMLFichaLoja(sessao, vis, pedidosPorVisita[vis.id] ?? [], idx === visitasComPedidos.length - 1)
  ).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Fichas — ${esc(sessao.fornecedor_nome ?? '')} — ${fmtDate(sessao.data_visita)}</title><style>${FICHA_STYLES}</style></head><body>${fichasHtml}</body></html>`
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) { URL.revokeObjectURL(url); alert('Bloqueador de pop-ups ativo. Permita pop-ups para este site.'); return }
  win.addEventListener('load', () => { win.print(); URL.revokeObjectURL(url) })
}

// DD-MM-AA a partir de YYYY-MM-DD
const fmtDataPDF = iso => { const [y,m,d] = iso.split('-'); return `${d}-${m}-${y.slice(2)}` }

async function salvarPDFVisita(sessao, vis, visPedidos, sessaoOverride = {}) {
  if (!visPedidos.length) return { ok: false }
  const sessaoFinal = Object.keys(sessaoOverride).length ? { ...sessao, ...sessaoOverride } : sessao

  const fornNome = sessaoFinal.fornecedor_nome ?? sessaoFinal.fornecedor?.nome ?? ''
  const forn = fornNome.replace(/[^a-zA-Z0-9À-ú ]/g, '').trim()
  const loja = (vis.comprador_nome ?? '').replace(/[^a-zA-Z0-9À-ú ]/g, '').trim()
  const data = (sessaoFinal.data_visita ?? '').replace(/-/g, '')
  const filename = `${forn} - ${loja} - ${data}.pdf`

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    // A4 portrait: 210 x 297 mm, margins 8mm each side → usable 194mm width
    const ML = 8, MR = 8, MT = 8
    const PW = 210 - ML - MR  // 194mm usable width
    const temICMS = visPedidos.some(p => (p.icms_pct ?? 0) > 0) || (sessaoFinal.icms_credito_pct != null && sessaoFinal.icms_credito_pct !== '')
    const temVenda = visPedidos.some(p => (p.preco_venda ?? 0) > 0)

    // ── HEADER ────────────────────────────────────────────────────────────
    let y = MT
    const colLeft  = PW * 0.58  // loja ocupa 58% da largura
    const colRight = PW * 0.42  // fornecedor/pedido ocupa 42%
    const xLeft  = ML
    const xRight = ML + colLeft + 4

    // Loja — nome
    doc.setFontSize(13).setFont('helvetica', 'bold')
    doc.text(vis.comprador_nome ?? '', xLeft, y)
    y += 5

    // Loja — linhas de info
    doc.setFontSize(8).setFont('helvetica', 'normal')
    const storeLines = [
      vis.comprador_cnpj     ? `CNPJ: ${vis.comprador_cnpj}` : null,
      vis.comprador_fantasia ? `Fantasia: ${vis.comprador_fantasia}${vis.comprador_ie ? `   I.E.: ${vis.comprador_ie}` : ''}` : null,
      vis.comprador_email    ? `e-mail: ${vis.comprador_email}` : null,
      vis.comprador_telefone ? vis.comprador_telefone : null,
      vis.comprador_endereco ? `End.: ${vis.comprador_endereco}` : (vis.comprador_cidade || null),
    ].filter(Boolean)
    for (const line of storeLines) {
      doc.text(line, xLeft, y)
      y += 4
    }

    // Fornecedor + dados do pedido (coluna direita)
    let yR = MT
    doc.setFontSize(13).setFont('helvetica', 'bold')
    doc.text(fornNome, xRight, yR)
    yR += 5

    doc.setFontSize(8).setFont('helvetica', 'normal')
    const orderLines = [
      ['Data:', fmtDate(sessaoFinal.data_visita)],
      sessaoFinal.data_entrega   ? ['Entrega:', fmtEntrega(sessaoFinal.data_entrega)]   : null,
      sessaoFinal.cond_pag       ? ['Cond. Pagt.:', sessaoFinal.cond_pag]               : null,
      sessaoFinal.frete          ? ['Frete:', sessaoFinal.frete]                        : null,
      sessaoFinal.vendedor       ? ['Vendedor:', sessaoFinal.vendedor]                  : null,
      sessaoFinal.contato        ? ['Fone:', sessaoFinal.contato]                       : null,
      sessaoFinal.transportadora ? ['Transp.:', sessaoFinal.transportadora]             : null,
    ].filter(Boolean)
    for (const [label, value] of orderLines) {
      doc.setFont('helvetica', 'bold').text(label, xRight, yR)
      doc.setFont('helvetica', 'normal').text(value, xRight + 22, yR)
      yR += 4
    }
    if (temICMS) {
      doc.setFont('helvetica', 'bold').setFontSize(9)
      doc.text(`Crédito ICMS: ${sessaoFinal.icms_credito_pct}%`, xRight, yR)
      yR += 4
    }

    // Linha separadora do header
    const headerBottom = Math.max(y, yR) + 2
    doc.setDrawColor(0).setLineWidth(0.5)
    doc.line(ML, headerBottom, ML + PW, headerBottom)
    const tableStart = headerBottom + 3

    // ── TABLE — agrupado por tipo_grade, uma coluna por tamanho ──────────
    const W_REF  = 24, W_PROD = 22, W_SZ = 11
    const W_QTOT = 10, W_PREC = 16, W_TOT = 18, W_RLIQ = 16, W_VEND = 16, W_ICMS = 10
    const fixedCols = W_REF + W_PROD + W_QTOT + W_PREC + W_TOT + W_RLIQ + (temVenda ? W_VEND : 0) + (temICMS ? W_ICMS : 0)
    const availForSizes = PW - fixedCols

    // Agrupar pedidos por tipo_grade preservando a ordem de entrada
    const gradeOrder = []
    const gradeGroups = {}
    for (const p of visPedidos) {
      const tg = p.tipo_grade ?? p.segmentacao?.tipo_grade ?? 'AD'
      if (!gradeGroups[tg]) { gradeGroups[tg] = []; gradeOrder.push(tg) }
      gradeGroups[tg].push(p)
    }

    function renderGrupo(grupoPedidos, startY) {
      // Tamanhos ativos só deste grupo
      const sizeOrder = [], sizeSet = new Set(), sizeHasQty = new Set()
      for (const p of grupoPedidos) {
        const tg = p.tipo_grade ?? p.segmentacao?.tipo_grade ?? 'AD'
        for (const tam of GRADE_DEFINITIONS[tg]?.tamanhos ?? []) {
          if (!sizeSet.has(tam)) { sizeSet.add(tam); sizeOrder.push(tam) }
          const qtdMap = Object.fromEntries((p.itens ?? []).map(i => [i.tamanho, i.qtd]))
          if ((qtdMap[tam] ?? 0) > 0) sizeHasQty.add(tam)
        }
      }
      const activeSizes = sizeOrder.filter(t => sizeHasQty.has(t))
      // Uma coluna por tamanho; comprimir se não couber
      const idealSz = activeSizes.length * W_SZ
      const wSZ = idealSz > availForSizes ? availForSizes / activeSizes.length : W_SZ

      // Cabeçalho: tamanho como nome da coluna
      const head = [[
        'Referência', 'Produto',
        ...activeSizes,
        'Qtd', 'R$ un.', 'Total', 'R$ Liq',
        ...(temVenda ? ['R$ Venda'] : []),
        ...(temICMS ? ['ICMS%'] : []),
      ]]

      const body = grupoPedidos.map(p => {
        const itens  = p.itens ?? []
        const qtdMap = Object.fromEntries(itens.map(i => [i.tamanho, i.qtd]))
        const totalQ = itens.reduce((s, i) => s + i.qtd, 0)
        const totalV = totalQ * (p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100)
        const tipo_produto = p.tipo_produto ?? p.segmentacao?.tipo_produto ?? ''
        const classe       = p.classe ?? p.segmentacao?.classe ?? ''
        return [
          [p.referencia, p.cor, p.detalhe].filter(Boolean).join(' '),
          [tipo_produto, classe].filter(Boolean).join(' '),
          ...activeSizes.map(t => (qtdMap[t] ?? 0) || '—'),
          totalQ || '—',
          fmtV(p.valor_unitario ?? 0),
          totalV > 0 ? fmtV(totalV) : '—',
          fmtV((p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100)),
          ...(temVenda ? [(p.preco_venda ?? 0) > 0 ? fmtV(p.preco_venda) : '—'] : []),
          ...(temICMS ? [(p.icms_pct ?? 0) > 0 ? `${p.icms_pct}%` : '—'] : []),
        ]
      })

      const totalBruto   = grupoPedidos.reduce((s, p) => s + (p.itens ?? []).reduce((s2, i) => s2 + i.qtd, 0) * (p.valor_unitario ?? 0), 0)
      const totalLiquido = grupoPedidos.reduce((s, p) => s + (p.itens ?? []).reduce((s2, i) => s2 + i.qtd, 0) * (p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100), 0)
      const totalPecas   = grupoPedidos.reduce((s, p) => s + (p.itens ?? []).reduce((s2, i) => s2 + i.qtd, 0), 0)
      const iTotal = 2 + activeSizes.length

      autoTable(doc, {
        startY,
        margin: { left: ML, right: MR },
        head,
        body,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1.5, overflow: 'hidden', halign: 'center' },
        headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold', fontSize: 7.5 },
        columnStyles: {
          0: { halign: 'left', cellWidth: W_REF },
          1: { halign: 'left', cellWidth: W_PROD },
          ...Object.fromEntries(activeSizes.map((_, i) => [
            2 + i, { cellWidth: wSZ, fontStyle: 'bold', fontSize: 9 },
          ])),
          [iTotal]:     { cellWidth: W_QTOT, fontStyle: 'bold' },
          [iTotal + 1]: { cellWidth: W_PREC, halign: 'right' },
          [iTotal + 2]: { cellWidth: W_TOT,  halign: 'right', fontStyle: 'bold' },
          [iTotal + 3]: { cellWidth: W_RLIQ, halign: 'right' },
          ...(temVenda ? { [iTotal + 4]: { cellWidth: W_VEND, halign: 'right', textColor: [26, 122, 58] } } : {}),
          ...(temICMS ? { [iTotal + (temVenda ? 5 : 4)]: { cellWidth: W_ICMS } } : {}),
        },
      })
      return { totalBruto, totalLiquido, totalPecas }
    }

    const multiGrade = gradeOrder.length > 1
    let nextY = tableStart
    let totalBrutoGeral = 0, totalLiquidoGeral = 0, totalPecasGeral = 0
    for (const tg of gradeOrder) {
      if (multiGrade) {
        doc.setFontSize(7).setFont('helvetica', 'bold').setTextColor(80, 80, 80)
        doc.text(`Grade: ${tg}`, ML, nextY + 3)
        doc.setTextColor(0)
        nextY += 5
      }
      const totals = renderGrupo(gradeGroups[tg], nextY)
      totalBrutoGeral += totals.totalBruto
      totalLiquidoGeral += totals.totalLiquido
      totalPecasGeral += totals.totalPecas
      nextY = doc.lastAutoTable.finalY + (multiGrade ? 4 : 0)
    }

    // Rodapé consolidado com totais de todas as grades
    const temDescontoGeral = totalBrutoGeral - totalLiquidoGeral > 0.001
    const totalDescontoGeral = totalBrutoGeral - totalLiquidoGeral
    const descontoPctGeral = totalBrutoGeral > 0 ? Math.round((totalDescontoGeral / totalBrutoGeral) * 100) : 0
    const footerSummary = [
      ['Total Bruto', fmtV(totalBrutoGeral)],
      ...(temDescontoGeral ? [[`Desconto ${descontoPctGeral}%`, `- ${fmtV(totalDescontoGeral)}`]] : []),
      [`Total Líquido — ${totalPecasGeral} peças`, fmtV(totalLiquidoGeral)],
    ]
    autoTable(doc, {
      startY: nextY + 2,
      margin: { left: ML + PW - 90, right: MR },
      body: footerSummary,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 1.5 },
      columnStyles: {
        0: { cellWidth: 55, halign: 'right' },
        1: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
      },
      didParseCell(data) {
        if (temDescontoGeral && data.row.index === 1) {
          data.cell.styles.textColor = [176, 0, 0]
        }
        if (data.row.index === footerSummary.length - 1) {
          data.cell.styles.fontStyle = 'bold'
          if (data.column.index === 1) data.cell.styles.fontSize = 9
        }
      },
    })

    // Obs
    if (sessaoFinal.obs) {
      const finalY = doc.lastAutoTable.finalY + 3
      doc.setFontSize(8).setFont('helvetica', 'normal')
      doc.text(`Obs.: ${sessaoFinal.obs}`, ML, finalY)
    }

    doc.save(filename)
    return { ok: true }
  } catch (err) {
    console.error('jspdf error:', err)
    alert(`Erro ao gerar PDF de ${vis.comprador_nome}: ${err.message}`)
    return { ok: false }
  }
}

// ─── Markup Phase ────────────────────────────────────────────────────────────

function MarkupSessao({ sessao, onClose }) {
  const [index1,     setIndex1]     = useState(sessao.markup_index1 ? String(sessao.markup_index1) : '')
  const [index2,     setIndex2]     = useState(sessao.markup_index2 ? String(sessao.markup_index2) : '')
  const [items,      setItems]      = useState([])
  const [precos,     setPrecos]     = useState({})
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [editingRef, setEditingRef] = useState(null)

  useEffect(() => {
    pedidosService.itensPorFornecedor(sessao.id).then(visitasData => {
      const seen = new Map()
      for (const vis of visitasData ?? []) {
        for (const ped of vis.pedidos ?? []) {
          if (!seen.has(ped.referencia)) {
            seen.set(ped.referencia, {
              referencia:     ped.referencia,
              tipo_produto:   ped.tipo_produto ?? ped.segmentacao?.tipo_produto ?? '',
              classe:         ped.classe ?? ped.segmentacao?.classe ?? '',
              valor_unitario: ped.valor_unitario ?? 0,
              icms_pct:       ped.icms_pct ?? 0,
              desconto_pct:   ped.desconto_pct ?? 0,
              preco_venda:    ped.preco_venda ?? '',
              cor:            ped.cor ?? '',
              detalhe:        ped.detalhe ?? '',
            })
          }
        }
      }
      const list = [...seen.values()]
      setItems(list)
      setPrecos(Object.fromEntries(list.map(it => [it.referencia, it.preco_venda ? String(it.preco_venda) : ''])))
      setLoading(false)
    })
  }, [sessao.id])

  function calcBase(item) {
    const v = item.valor_unitario
    const d = parseFloat(String(item.desconto_pct ?? sessao.desconto_pct ?? 0).replace(',', '.')) || 0
    const icms = parseFloat(String(item.icms_pct ?? 0).replace(',', '.')) || 0
    const afterDesc = v * (1 - d / 100)
    return icms > 0 ? afterDesc * (1 - icms / 100) : afterDesc
  }

  function calcIdx(item, idxStr) {
    const m = parseFloat(String(idxStr ?? '').replace(',', '.'))
    if (!idxStr || isNaN(m) || m <= 0) return ''
    return (calcBase(item) * (1 + m)).toFixed(2)
  }

  function r99(val) {
    const n = parseFloat(val)
    if (!val || isNaN(n) || n <= 0) return val
    return (Math.floor(n) + 0.99).toFixed(2)
  }

  function applyIdxAll(idxStr) {
    setPrecos(prev => {
      const next = { ...prev }
      for (const it of items) {
        const c = calcIdx(it, idxStr)
        if (c) next[it.referencia] = r99(c)
      }
      return next
    })
  }

  async function handleSalvar() {
    setSaving(true)
    try {
      await pedidosService.atualizarMarkupSessao(sessao.id, precos, index1, index2)
      onClose()
    } catch (e) {
      alert(`Erro ao salvar: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  const hasIdx2 = index2.trim() !== ''
  const temIcms = items.some(it => (it.icms_pct ?? 0) > 0)

  return (
    <div className={styles.markupOverlay}>
      <div className={styles.markupModal}>
        <div className={styles.markupModalHeader}>
          <div>
            <strong>{sessao.fornecedor?.nome || '—'}</strong>
            {sessao.data_visita && <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: '0.9em' }}>{fmtDate(sessao.data_visita)}</span>}
          </div>
          <button className={styles.btnBack} onClick={onClose}>✕ Fechar</button>
        </div>

        <div className={styles.markupIndices}>
          <div className={styles.field}>
            <span className={styles.label}>Índice 1</span>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input type="text" className={styles.addItemMarkup} placeholder="ex: 1.5" value={index1} onChange={e => setIndex1(e.target.value)} />
              <button className={styles.btnSecondary} onClick={() => applyIdxAll(index1)} disabled={!index1.trim()}>Aplicar em todos</button>
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Índice 2 <span style={{ fontWeight: 'normal', textTransform: 'none' }}>(opcional)</span></span>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input type="text" className={styles.addItemMarkup} placeholder="ex: 1.8" value={index2} onChange={e => setIndex2(e.target.value)} />
              {hasIdx2 && <button className={styles.btnSecondary} onClick={() => applyIdxAll(index2)} disabled={!index2.trim()}>Aplicar em todos</button>}
            </div>
          </div>
        </div>

        {loading && <p className={styles.muted}>Carregando itens…</p>}
        {!loading && items.length === 0 && <p className={styles.muted}>Nenhum item encontrado nesta sessão.</p>}
        {!loading && items.length > 0 && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Produto</th>
                    <th>Valor unit.</th>
                    {temIcms && <th>ICMS</th>}
                    <th>Base c/ desc{temIcms ? '/icms' : ''}</th>
                    <th>× Idx1{index1 ? ` (${index1})` : ''}</th>
                    {hasIdx2 && <th>× Idx2 ({index2})</th>}
                    <th>Preço sugerido</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(it => {
                    const base   = calcBase(it)
                    const c1     = calcIdx(it, index1)
                    const c2     = hasIdx2 ? calcIdx(it, index2) : ''
                    const isEdit = editingRef === it.referencia
                    const label  = [it.referencia, it.cor, it.detalhe].filter(Boolean).join(' · ')
                    return (
                      <tr key={it.referencia}>
                        <td>{label}</td>
                        <td>{[it.tipo_produto, it.classe].filter(Boolean).join(' · ')}</td>
                        <td>R$ {fmtV(it.valor_unitario)}</td>
                        {temIcms && <td>{it.icms_pct > 0 ? `${it.icms_pct}%` : '—'}</td>}
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>R$ {base.toFixed(2)}</td>
                        <td>
                          {c1 ? (
                            <button className={styles.btnMarkupCalc} onClick={() => setPrecos(p => ({ ...p, [it.referencia]: r99(c1) }))} title={`→ R$ ${r99(c1)}`}>
                              R$ {c1}
                            </button>
                          ) : '—'}
                        </td>
                        {hasIdx2 && (
                          <td>
                            {c2 ? (
                              <button className={styles.btnMarkupCalc} onClick={() => setPrecos(p => ({ ...p, [it.referencia]: r99(c2) }))} title={`→ R$ ${r99(c2)}`}>
                                R$ {c2}
                              </button>
                            ) : '—'}
                          </td>
                        )}
                        <td onClick={e => { e.stopPropagation(); setEditingRef(it.referencia) }} style={{ cursor: 'pointer', minWidth: 90 }}>
                          {isEdit ? (
                            <input
                              autoFocus
                              value={precos[it.referencia] ?? ''}
                              style={{ width: 80 }}
                              onChange={e => setPrecos(p => ({ ...p, [it.referencia]: e.target.value }))}
                              onBlur={() => setEditingRef(null)}
                              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingRef(null) }}
                              onClick={e => e.stopPropagation()}
                            />
                          ) : (
                            precos[it.referencia]
                              ? <strong>R$ {precos[it.referencia]}</strong>
                              : <span className={styles.itemDot}>— clicar para editar</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className={styles.markupModalFooter}>
              <button className={styles.btnPrimary} onClick={handleSalvar} disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar preços sugeridos'}
              </button>
              <button className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Phase 3: Close Session + PDFs ───────────────────────────────────────

function FecharSessao({ sessao, visitas, segs, pedidos: pedidosProp, onNovaSessao }) {
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

// ─── Historico ────────────────────────────────────────────────────────────

function Historico({ colId, onNovaSessao, onVisualizar, onPreencherLoja, onRetomarSessao = null, retomarLoading = null, refreshKey = 0, onMarkup = null }) {
  const { comprador } = useAuth()
  const [sessoesList,      setSessoesList]      = useState([])
  const [loading,          setLoading]          = useState(true)
  const [reimprimindo,     setReimprimindo]     = useState(null)
  const [editSessaoId,        setEditSessaoId]        = useState(null)
  const [editSessaoForm,      setEditSessaoForm]      = useState({})
  const [savingEditSessao,    setSavingEditSessao]    = useState(false)
  const [confirmDeleteSessao, setConfirmDeleteSessao] = useState(null)
  const [statsMap,            setStatsMap]            = useState({}) // { [sessao_id]: { pcs, valor, lojas } }
  const [openGearId,          setOpenGearId]          = useState(null)

  useEffect(() => {
    let cancelled = false
    sessoesService.list(colId).then(list => {
      if (cancelled) return
      setSessoesList(list)
      setLoading(false)
      // Load aggregate stats for all sessions in one background query
      const ids = list.map(s => s.id)
      if (!ids.length) return
      sessoesService.statsPorSessoes(ids).then(rows => {
        if (cancelled) return
        const map = {}
        for (const row of rows) {
          const sid = row.sessao_id
          if (!map[sid]) map[sid] = { pcs: 0, valor: 0, lojasSet: new Set() }
          let visitaHasData = false
          for (const ped of row.pedidos ?? []) {
            const qtd = (ped.pedido_itens ?? []).reduce((s, i) => s + (i.qtd || 0), 0)
            map[sid].pcs += qtd
            map[sid].valor += qtd * (ped.valor_unitario || 0)
            if (qtd > 0) visitaHasData = true
          }
          if (visitaHasData) map[sid].lojasSet.add(row.id)
        }
        const final = {}
        for (const [sid, stat] of Object.entries(map)) {
          final[sid] = { pcs: stat.pcs, valor: stat.valor, lojas: stat.lojasSet.size }
        }
        setStatsMap(final)
      })
    })
    return () => { cancelled = true }
  }, [colId, refreshKey])

  function handleStartEditSessao(ses) {
    setEditSessaoId(ses.id)
    setEditSessaoForm({
      data_visita:    ses.data_visita,
      data_entrega:   ses.data_entrega   ?? '',
      vendedor:       ses.vendedor       ?? '',
      cond_pag:       ses.cond_pag       ?? '',
      frete:          ses.frete          ?? '',
      transportadora: ses.transportadora ?? '',
      obs:            ses.obs            ?? '',
    })
  }

  async function handleSaveEditSessao(id) {
    setSavingEditSessao(true)
    try {
      const payload = {
        ...editSessaoForm,
        data_entrega: editSessaoForm.data_entrega || null,
        data_visita:  editSessaoForm.data_visita  || null,
      }
      const updated = await sessoesService.update(id, payload)
      setSessoesList(prev => prev.map(s => s.id === id ? { ...updated, visitas: s.visitas } : s))
      setEditSessaoId(null)
    } catch (e) {
      alert(`Erro ao salvar sessão: ${e.message}`)
    } finally {
      setSavingEditSessao(false)
    }
  }

  async function executarDeleteSessao() {
    const id = confirmDeleteSessao
    setConfirmDeleteSessao(null)
    await sessoesService.cancelar(id)
    setSessoesList(prev => prev.filter(s => s.id !== id))
  }

  async function handleReimprimir(ses, escopo = 'all') {
    setReimprimindo(ses.id)
    try {
      // Carrega pedidos de TODAS as visitas via itensPorFornecedor (inclui pedido_itens)
      const visitasComPedidos = await pedidosService.itensPorFornecedor(ses.id)
      const allPeds = Object.fromEntries(
        visitasComPedidos.map(v => [v.id, v.pedidos ?? []])
      )
      // 'mine' = só a loja do usuário logado; 'all' = todas as lojas do fornecedor
      const visitasBase = escopo === 'mine' && comprador
        ? (ses.visitas ?? []).filter(v => v.comprador_id === comprador.id)
        : (ses.visitas ?? [])
      const visitasForPDF = visitasBase.map(v => ({
        id:                 v.visita_id,
        comprador_nome:     v.comprador_nome,
        comprador_cnpj:     v.comprador_cnpj     ?? '',
        comprador_cidade:   v.comprador_cidade   ?? '',
        comprador_fantasia: v.comprador_fantasia ?? '',
        comprador_ie:       v.comprador_ie       ?? '',
        comprador_email:    v.comprador_email    ?? '',
        comprador_telefone: v.comprador_telefone ?? '',
        comprador_endereco: v.comprador_endereco ?? '',
      }))
      for (const vis of visitasForPDF) {
        const visPedidos = allPeds[vis.id] ?? []
        if (!visPedidos.length) continue
        await salvarPDFVisita(ses, vis, visPedidos)
      }
    } finally {
      setReimprimindo(null)
    }
  }

  return (
    <div className={styles.historico}>
      {(onNovaSessao || true) && (
        <div className={styles.sessoesHomeHeader}>
          <h2 className={styles.sessoesHomeTitle}>Sessões de compra</h2>
          {onNovaSessao && comprador?.is_editor && (
            <button className={styles.btnNovaSessao} onClick={onNovaSessao}>
              + Nova sessão
            </button>
          )}
        </div>
      )}

      {confirmDeleteSessao && (
        <ConfirmModal
          message="Excluir esta sessão inteira? Todos os pedidos serão removidos. Essa ação não pode ser desfeita."
          confirmLabel="Excluir sessão"
          danger
          onConfirm={executarDeleteSessao}
          onCancel={() => setConfirmDeleteSessao(null)}
        />
      )}

      {loading && <p className={styles.muted}>Carregando histórico…</p>}
      {sessoesList.length === 0 && !loading && (
        <p className={styles.muted}>Nenhuma sessão registrada nesta coleção.</p>
      )}

      {sessoesList.map(ses => {
        const fornNome = ses.fornecedor?.nome || ses.fornecedor_nome || '—'
        const stats = statsMap[ses.id]
        return (
        <div key={ses.id} className={styles.histSessao}>
          <div className={styles.histSessaoHeader}>
            <button
              className={styles.histSessaoToggle}
              onClick={() => setOpenGearId(openGearId === ses.id ? null : ses.id)}
            >
              <span className={styles.histSessaoMain}>
                <strong className={styles.histFornNome}>{fornNome}</strong>
                <span className={styles.histSessaoMeta}>
                  <span>{fmtDate(ses.data_visita)}</span>
                  {ses.fechada_em && <span className={styles.badgeFechada}>Fechada</span>}
                  {ses.vendedor && <><span className={styles.dot}>·</span><span>{ses.vendedor}</span></>}
                  {ses.cond_pag && <><span className={styles.dot}>·</span><span>{ses.cond_pag}</span></>}
                </span>
              </span>
              {stats && stats.pcs > 0 && (
                <span className={styles.histSessaoStats}>
                  <span>{stats.lojas} loja{stats.lojas !== 1 ? 's' : ''}</span>
                  <span className={styles.dot}>·</span>
                  <span>{stats.pcs} pç</span>
                  <span className={styles.dot}>·</span>
                  <strong>R$ {stats.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </span>
              )}
            </button>

            <div className={styles.histSessaoActions}>
              <button
                className={`${styles.histGearBtn} ${openGearId === ses.id ? 'open' : ''}`}
                onClick={() => setOpenGearId(openGearId === ses.id ? null : ses.id)}
                title="Ações desta sessão"
              ><span aria-hidden="true">⚙</span> Opções</button>
            </div>
          </div>

          {openGearId === ses.id && (() => {
            const minhaVisita = comprador
              ? (ses.visitas ?? []).find(v => v.comprador_id === comprador.id)
              : null
            return (
              <div className={styles.histGearPanel}>
                {minhaVisita && onPreencherLoja && (
                  <button
                    className={`${styles.btnHistAction} ${styles.btnHistPreencher}`}
                    onClick={() => { onPreencherLoja(ses.id, minhaVisita.visita_id, comprador.nome); setOpenGearId(null) }}
                  >Preencher</button>
                )}
                {onVisualizar && (
                  <button
                    className={styles.btnHistAction}
                    onClick={() => { onVisualizar(ses.id); setOpenGearId(null) }}
                  >Visualizar</button>
                )}
                {comprador?.is_editor && (
                  <button
                    className={`${styles.btnHistAction} ${styles.btnHistEdit}`}
                    onClick={() => { onRetomarSessao ? onRetomarSessao(ses) : handleStartEditSessao(ses); setOpenGearId(null) }}
                    disabled={onRetomarSessao ? retomarLoading === ses.id : editSessaoId !== null}
                  >{onRetomarSessao && retomarLoading === ses.id ? '…' : 'Retomar'}</button>
                )}
                {comprador?.is_editor && onMarkup && (
                  <button
                    className={`${styles.btnHistAction} ${styles.btnHistMarkup}`}
                    onClick={() => { onMarkup(ses); setOpenGearId(null) }}
                  >Markup</button>
                )}
                {minhaVisita && (
                  <button
                    className={styles.btnHistAction}
                    onClick={() => handleReimprimir(ses, 'mine')}
                    disabled={reimprimindo === ses.id}
                  >{reimprimindo === ses.id ? '…' : '🖨 Reimprimir minha loja'}</button>
                )}
                <button
                  className={styles.btnHistAction}
                  onClick={() => handleReimprimir(ses, 'all')}
                  disabled={reimprimindo === ses.id}
                >{reimprimindo === ses.id ? '…' : '🖨 Reimprimir todas as lojas'}</button>
                {comprador?.is_editor && (
                  <button
                    className={styles.histGearPanelDanger}
                    onClick={() => { setConfirmDeleteSessao(ses.id); setOpenGearId(null) }}
                  >Excluir sessão</button>
                )}
              </div>
            )
          })()}

          {editSessaoId === ses.id && (
            <div className={styles.histEditForm}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <span className={styles.label}>Data</span>
                  <input type="date" value={editSessaoForm.data_visita}
                    onChange={e => setEditSessaoForm(p => ({ ...p, data_visita: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Entrega</span>
                  <input type="date" value={editSessaoForm.data_entrega}
                    onChange={e => setEditSessaoForm(p => ({ ...p, data_entrega: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Vendedor</span>
                  <input type="text" value={editSessaoForm.vendedor}
                    onChange={e => setEditSessaoForm(p => ({ ...p, vendedor: e.target.value }))}
                    placeholder="Nome do vendedor" />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Cond. pagamento</span>
                  <input type="text" value={editSessaoForm.cond_pag}
                    onChange={e => setEditSessaoForm(p => ({ ...p, cond_pag: e.target.value }))}
                    placeholder="Ex: 30/60 dias" />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Frete</span>
                  <select value={editSessaoForm.frete}
                    onChange={e => setEditSessaoForm(p => ({ ...p, frete: e.target.value, transportadora: e.target.value !== 'FOB' ? '' : p.transportadora }))}>
                    <option value="">—</option>
                    <option value="CIF">CIF</option>
                    <option value="FOB">FOB</option>
                  </select>
                </div>
                {editSessaoForm.frete === 'FOB' && (
                  <div className={styles.field}>
                    <span className={styles.label}>Transportadora</span>
                    <input type="text" value={editSessaoForm.transportadora}
                      onChange={e => setEditSessaoForm(p => ({ ...p, transportadora: e.target.value }))}
                      placeholder="Nome da transportadora" />
                  </div>
                )}
                <div className={styles.field} style={{ minWidth: 200 }}>
                  <span className={styles.label}>Obs</span>
                  <input type="text" value={editSessaoForm.obs}
                    onChange={e => setEditSessaoForm(p => ({ ...p, obs: e.target.value }))}
                    placeholder="Observações" />
                </div>
              </div>
              <div className={styles.phaseActions} style={{ marginTop: '0.5rem' }}>
                <button className={styles.btnSecondary} onClick={() => setEditSessaoId(null)} disabled={savingEditSessao}>
                  Cancelar
                </button>
                <button className={styles.btnPrimary} onClick={() => handleSaveEditSessao(ses.id)} disabled={savingEditSessao}>
                  {savingEditSessao ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </div>
          )}

        </div>
        )
      })}
    </div>
  )
}

// ─── Phase 5: Collaborative store fill ────────────────────────────────────

function PreencherMinhaLoja({ sessaoId, visitaId, compradorNome, colEstacao, onBack }) {
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
        .map(ped => {
          const tipoGrade = ped.segmentacao?.tipo_grade || ped.tipo_grade || ''
          const tams = tamanhosDeTipoGrade(tipoGrade)
          return {
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
            itens: tams
              .map(t => ({ tamanho: t, qtd: parseInt(qtds[ped.id]?.[t]) || 0 }))
              .filter(i => i.qtd > 0),
          }
        })
      await pedidosService.salvarPedidosVisita(visitaId, updates)
      setSaved(true)
    } catch (e) {
      setError(`Erro ao salvar: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  const totalPcs   = pedidos.reduce((s, ped) => {
    const tams = tamanhosDeTipoGrade(ped.segmentacao?.tipo_grade || '')
    return s + tams.reduce((a, t) => a + (parseInt(qtds[ped.id]?.[t]) || 0), 0)
  }, 0)
  const totalValor = pedidos.reduce((s, ped) => {
    const tams = tamanhosDeTipoGrade(ped.segmentacao?.tipo_grade || '')
    const pcs  = tams.reduce((a, t) => a + (parseInt(qtds[ped.id]?.[t]) || 0), 0)
    return s + pcs * (ped.valor_unitario || 0)
  }, 0)

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
        const total = tams.reduce((s, t) => s + (parseInt(qtds[ped.id]?.[t]) || 0), 0)
        const valor = parseFloat(ped.valor_unitario) || 0
        const maxIdx5 = tams.length > PLUS_SIZE_DEFAULT ? (visibleUpTo[ped.id] ?? PLUS_SIZE_DEFAULT - 1) : tams.length - 1
        const visibleTams5 = tams.slice(0, maxIdx5 + 1)
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


// ─── Phase 4: View-only ────────────────────────────────────────────────────

function VisualizarSessao({ sessaoId, onBack }) {
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
        <Historico
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
          onAddVisita={(novaVisita) => setVisitas(prev => [...prev, novaVisita])}
          compradores={compradores}
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
