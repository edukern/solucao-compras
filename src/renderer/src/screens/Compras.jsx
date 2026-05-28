import { useState, useEffect, useRef, Fragment } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { tamanhosDeTipoGrade, GRADE_DEFINITIONS } from '../constants/grades'
import { TIPOS_PRODUTO } from '../constants/tipoProduto'
import ConfirmModal from '../components/ConfirmModal'
import styles from './Compras.module.css'
import { sessoes as sessoesService } from '../services/sessoes'
import { pedidos as pedidosService } from '../services/pedidos'
import { segmentacoes as segmentacoesService } from '../services/segmentacoes'
import { fornecedores as fornecedoresService } from '../services/fornecedores'
import { compradores as compradoresService } from '../services/compradores'
import { projecoes as projecoesService } from '../services/projecoes'

const fmt = n => (n ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = iso => { if (!iso) return ''; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}` }
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
  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState(null)
  const [activeField,    setActiveField]    = useState('fornecedor')
  const [showTutorial,   setShowTutorial]   = useState(
    () => localStorage.getItem('sessionFormTutorialSeen') !== 'true'
  )
  const activeRef = useRef(null)

  const ORDER = [
    'fornecedor', 'data', 'dataEntrega', 'vendedor', 'condPag', 'frete',
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
      }, lojas)
      const lojasPresentes = compradores.filter(c => lojas.includes(c.id))
      onStart(sessao, lojasPresentes)
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

        {/* 2 — Data */}
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

function RegistrarPedidoSessao({ sessao, visitas, colId, colEstacao, onFechar, onRemoveVisita, segs = [],
  initialItems = [], initialQtds = {}, initialActiveId = null, initialLojaIdx = 0 }) {
  const [items,         setItems]         = useState(initialItems)
  const [activeId,      setActiveId]      = useState(initialActiveId)
  const [lojaIdx,       setLojaIdx]       = useState(initialLojaIdx)
  const [qtds,          setQtds]          = useState(initialQtds)
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState(null)
  const [form,          setForm]          = useState({ ref: '', tipo_produto: '', tipo_grade: 'AD', classe: 'FEM', icms_pct: '', valor: '', markup_pct: '', preco_venda: '' })
  const [projCache,     setProjCache]     = useState({})
  const [distribTargets,setDistribTargets]= useState({})
  const RECOVERY_KEY = `SC_RECOVERY_${colId}`
  const firstInputRef = useRef(null)
  const [showAddForm,    setShowAddForm]    = useState(true)
  const [showCorDetalhe, setShowCorDetalhe] = useState(
    () => localStorage.getItem('SC_SHOW_COR_DETALHE') === 'true'
  )
  const [fillMode, setFillMode] = useState('ref') // 'ref' | 'loja'
  function toggleCorDetalhe() {
    setShowCorDetalhe(prev => {
      localStorage.setItem('SC_SHOW_COR_DETALHE', String(!prev))
      return !prev
    })
  }
  const addFormFirstRef = useRef(null)
  const [editingId,      setEditingId]      = useState(null)
  const [editForm,       setEditForm]       = useState(null)
  const [gradeExtremes,  setGradeExtremes]  = useState({})
  const [showItemFields, setShowItemFields] = useState({})

  const activeItem = items.find(it => it.localId === activeId) ?? null

  // Auto-save para recuperação em caso de crash
  useEffect(() => {
    if (!sessao?.id) return
    localStorage.setItem(RECOVERY_KEY, JSON.stringify({ sessao_id: sessao.id, items, qtds, activeId, lojaIdx }))
  }, [items, qtds, activeId, lojaIdx])

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
    return visitas.reduce((s, v) => s + totalQtdLoja(localId, v.id), 0)
  }

  function totalQtdVisita(visitaId) {
    return items.reduce((s, it) => s + totalQtdLoja(it.localId, visitaId), 0)
  }

  function totalValorVisita(visitaId) {
    return items.reduce((s, it) => {
      const unit = parseFloat((it.valor ?? '').replace(',', '.')) || 0
      return s + totalQtdLoja(it.localId, visitaId) * unit
    }, 0)
  }

  function hasExtremeData(localId, tam) {
    return visitas.some(v => (parseInt(qtds[localId]?.[v.id]?.[tam]) || 0) > 0)
  }

  function getVisibleTams(localId, allTams) {
    if (allTams.length < 5) return allTams
    const showFirst = gradeExtremes[localId]?.first || hasExtremeData(localId, allTams[0])
    const showLast  = gradeExtremes[localId]?.last  || hasExtremeData(localId, allTams[allTams.length - 1])
    return allTams.filter((_, i) => {
      if (i === 0) return showFirst
      if (i === allTams.length - 1) return showLast
      return true
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

  function calcPrecoVenda(valorStr, markupStr) {
    const v = parseFloat((valorStr ?? '').replace(',', '.'))
    const m = parseFloat((markupStr ?? '').replace(',', '.'))
    if (!v || isNaN(v) || !m || isNaN(m)) return ''
    return roundTo99(v * (1 + m))
  }

  function addItem() {
    const { ref, tipo_produto, tipo_grade, classe, icms_pct, valor, markup_pct, preco_venda } = form
    if (!ref.trim() || !tipo_produto.trim() || !tipo_grade || !valor.trim()) return
    const localId = `item_${Date.now()}_${Math.random()}`
    const novoItem = {
      localId,
      ref: ref.trim(),
      tipo_produto: tipo_produto.trim().toUpperCase(),
      tipo_grade,
      classe,
      icms_pct: icms_pct || '0',
      valor: valor || '',
      markup_pct: markup_pct || '0',
      preco_venda: preco_venda || '',
      cor: '',
      detalhe: '',
      obs: '',
    }
    setItems(prev => [...prev, novoItem])
    setActiveId(localId)
    setLojaIdx(0)
    setForm(prev => ({ ...prev, ref: '', valor: '', preco_venda: '' }))
    setShowAddForm(false)
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
    const copy = { ...item, localId: newId }
    setItems(prev => {
      const idx = prev.findIndex(it => it.localId === item.localId)
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next
    })
    setQtds(prev => ({ ...prev, [newId]: JSON.parse(JSON.stringify(prev[item.localId] ?? {})) }))
    setActiveId(newId)
    setEditingId(newId)
    setEditForm({
      ref:          item.ref,
      tipo_produto: item.tipo_produto,
      tipo_grade:   item.tipo_grade,
      classe:       item.classe,
      icms_pct:     item.icms_pct,
      valor:        item.valor,
      markup_pct:   item.markup_pct ?? '0',
      preco_venda:  item.preco_venda ?? '',
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

  async function handleFechar() {
    setSaving(true)
    setError(null)
    try {
      const batch = []
      const meta  = []
      for (const item of items) {
        const { localId, ref, tipo_produto, tipo_grade, classe, icms_pct, valor,
                markup_pct, preco_venda, cor, detalhe, obs } = item
        const valorNum      = parseFloat((valor ?? '').replace(',', '.')) || 0
        const icmsNum       = parseFloat((icms_pct ?? '').replace(',', '.')) || 0
        const markupNum     = parseFloat((markup_pct ?? '').replace(',', '.')) || 0
        const precoVendaNum = parseFloat((preco_venda ?? '').replace(',', '.')) || 0
        const classDef = GRADE_DEFINITIONS[tipo_grade]
        if (!classDef) continue
        const classificacao = classDef.classificacao

        const seg = await segmentacoesService.findOrCreate({
          classificacao, tipo_produto, classe, tipo_grade,
          estacao: colEstacao ?? 'inverno',
        })
        const segId = seg.id

        for (const v of visitas) {
          const lojaTams = qtds[localId]?.[v.id] ?? {}
          const itens = tamanhosDeTipoGrade(tipo_grade)
            .map(tam => ({ tamanho: tam, qtd: parseInt(lojaTams[tam]) || 0 }))
            .filter(i => i.qtd > 0)
          if (!itens.length) continue
          batch.push({
            visita_id: v.id, comprador_id: v.comprador_id, segmentacao_id: segId,
            valor_unitario: valorNum, desconto_pct: 0,
            referencia: ref, icms_pct: icmsNum,
            markup_pct: markupNum, preco_venda: precoVendaNum,
            cor: cor || '', detalhe: detalhe || '',
            obs: obs || '', itens,
          })
          meta.push({
            comprador_nome: v.comprador_nome, comprador_cnpj: v.comprador_cnpj ?? '',
            comprador_cidade: v.comprador_cidade ?? '',
            classificacao, tipo_produto, classe, tipo_grade,
          })
        }
      }
      const salvos = await pedidosService.salvarBatch(batch, sessao.id)
      localStorage.removeItem(RECOVERY_KEY)
      onFechar(salvos.map((p, i) => ({ ...p, ...meta[i] })))
    } catch (e) {
      setError(`Erro ao salvar pedidos: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.phase}>
      <div className={styles.visitaBanner}>
        <strong>{sessao.fornecedor_nome}</strong>
        <span className={styles.dot}>·</span>
        <span>{fmtDate(sessao.data_visita)}</span>
        {sessao.vendedor && <><span className={styles.dot}>·</span><span>Vendedor: {sessao.vendedor}</span></>}
        {sessao.cond_pag && <><span className={styles.dot}>·</span><span>{sessao.cond_pag}</span></>}
        {sessao.frete    && <><span className={styles.dot}>·</span><span>Frete: {sessao.frete}</span></>}
        {sessao.frete === 'FOB' && sessao.transportadora && <><span className={styles.dot}>·</span><span>Transp.: {sessao.transportadora}</span></>}
        <span className={styles.dot}>·</span>
        <span>{visitas.length} loja(s)</span>
      </div>

      <div className={styles.phaseTitleRow}>
        <h2 className={styles.phaseTitle}>Fase 2 — Registrar Pedidos</h2>
        <div className={styles.fillModeToggle}>
          <button
            className={`${styles.fillModeBtn} ${fillMode === 'ref' ? styles.fillModeBtnActive : ''}`}
            onClick={() => setFillMode('ref')}
            title="Preencher por referência (todas as lojas de um produto)"
          >Por referência</button>
          <button
            className={`${styles.fillModeBtn} ${fillMode === 'loja' ? styles.fillModeBtnActive : ''}`}
            onClick={() => setFillMode('loja')}
            title="Preencher por loja (todos os produtos de uma loja)"
          >Por loja</button>
        </div>
        {fillMode === 'ref' && (
          <button
            className={`${styles.btnToggleCor} ${showCorDetalhe ? styles.btnToggleCorOn : ''}`}
            onClick={toggleCorDetalhe}
            title="Editar cor e detalhe diretamente em cada item (sem expandir)"
          >
            {showCorDetalhe ? '✓ Cor/Detalhe' : '+ Cor/Detalhe'}
          </button>
        )}
      </div>

      {/* ── Add item form ── */}
      <datalist id="tipos-produto-list">
        {TIPOS_PRODUTO.map(t => <option key={t} value={t} />)}
      </datalist>

      {(showAddForm || items.length === 0) && (
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
        <div className={styles.field}>
          <span className={styles.label}>Valor unit. *</span>
          <input
            type="text"
            className={styles.addItemValor}
            placeholder="0,00"
            value={form.valor}
            onChange={e => {
              const valor = e.target.value
              setForm(p => ({
                ...p, valor,
                preco_venda: calcPrecoVenda(valor, p.markup_pct),
              }))
            }}
            onKeyDown={e => { if (e.key === 'Enter') addItem() }}
          />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Markup ×</span>
          <input
            type="text"
            className={styles.addItemMarkup}
            placeholder="0"
            value={form.markup_pct}
            onChange={e => {
              const markup_pct = e.target.value
              setForm(p => ({
                ...p, markup_pct,
                preco_venda: calcPrecoVenda(p.valor, markup_pct),
              }))
            }}
            onKeyDown={e => { if (e.key === 'Enter') addItem() }}
          />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Preço venda</span>
          <input
            type="text"
            className={styles.addItemValor}
            placeholder="0,00"
            value={form.preco_venda}
            onChange={e => setForm(p => ({ ...p, preco_venda: e.target.value }))}
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
              const total = totalQtdVisita(v.id)
              return (
                <button
                  key={v.id}
                  className={`${styles.porLojaTab} ${i === lojaIdx ? styles.porLojaTabActive : ''}`}
                  onClick={() => setLojaIdx(i)}
                >
                  {v.comprador_nome}
                  {total > 0 && <span className={styles.porLojaTabTotal}>{total}</span>}
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
          {/* ── Active store summary bar ── */}
          {(() => {
            const v = visitas[lojaIdx]
            if (!v) return null
            const pcs = totalQtdVisita(v.id)
            const val = totalValorVisita(v.id)
            if (pcs === 0) return null
            return (
              <div className={styles.porLojaActiveBar}>
                <span className={styles.porLojaActiveBarName}>{v.comprador_nome}</span>
                <span className={styles.porLojaActiveBarSep}>·</span>
                <span className={styles.porLojaActiveBarStat}><strong>{pcs}</strong> peças</span>
                <span className={styles.porLojaActiveBarSep}>·</span>
                <span className={styles.porLojaActiveBarStat}>
                  <strong>R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </span>
              </div>
            )
          })()}
          <div className={styles.porLojaItemsList}>
            {items.map(it => {
              const v = visitas[lojaIdx]
              if (!v) return null
              const tams = tamanhosDeTipoGrade(it.tipo_grade)
              const vTams = getVisibleTams(it.localId, tams)
              const hideFirst = vTams[0] !== tams[0]
              const hideLast  = vTams[vTams.length - 1] !== tams[tams.length - 1]
              const total = totalQtdLoja(it.localId, v.id)
              return (
                <div key={it.localId} className={`${styles.porLojaItemBlock} ${total > 0 ? styles.porLojaItemBlockFilled : ''}`}>
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
                    {hideFirst ? (
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
                    ) : null}
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
                    {hideLast ? (
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
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Por referência mode: Items table with inline grade expansion ── */}
      {fillMode === 'ref' && items.length > 0 && (
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>Ref</th>
              <th>Produto · Grade · Classe</th>
              <th>ICMS</th>
              <th>Valor unit.</th>
              <th>Mkp</th>
              <th>Preço venda</th>
              <th>Peças</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => {
              const isActive = it.localId === activeId
              const tams = tamanhosDeTipoGrade(it.tipo_grade)
              const vTams = getVisibleTams(it.localId, tams)
              const hideFirst = vTams[0] !== tams[0]
              const hideLast  = vTams[vTams.length - 1] !== tams[tams.length - 1]
              const total = totalQtdItem(it.localId)
              return (
                <Fragment key={it.localId}>
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
                            setEditForm(p => ({
                              ...p, valor,
                              preco_venda: calcPrecoVenda(valor, p.markup_pct),
                            }))
                          }}
                          style={{ width: 70 }}
                        />
                      </td>
                      <td>
                        <input
                          value={editForm.markup_pct ?? ''}
                          placeholder="0"
                          onChange={e => {
                            const markup_pct = e.target.value
                            setEditForm(p => ({
                              ...p, markup_pct,
                              preco_venda: calcPrecoVenda(p.valor, markup_pct),
                            }))
                          }}
                          style={{ width: 55 }}
                        />
                      </td>
                      <td>
                        <input
                          value={editForm.preco_venda ?? ''}
                          placeholder="0,00"
                          onChange={e => setEditForm(p => ({ ...p, preco_venda: e.target.value }))}
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
                      className={`${styles.itemRow} ${isActive ? styles.itemRowActive : ''}`}
                      onClick={() => { setEditingId(null); setEditForm(null); setActiveId(isActive ? null : it.localId); setLojaIdx(0) }}
                    >
                      <td>
                        {it.ref || <span className={styles.itemDot}>—</span>}
                        {(it.cor || it.detalhe) && (
                          <span className={styles.itemRefDetail}>
                            {[it.cor, it.detalhe].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </td>
                      <td>{it.tipo_produto} · {it.tipo_grade} · {it.classe}</td>
                      <td>{it.icms_pct || '0'}%</td>
                      <td>{it.valor ? `R$ ${it.valor}` : <span className={styles.itemDot}>—</span>}</td>
                      <td className={styles.itemMarkupCell}>{it.markup_pct && it.markup_pct !== '0' ? `+${it.markup_pct}` : <span className={styles.itemDot}>—</span>}</td>
                      <td className={styles.itemPrecoVendaCell}>{it.preco_venda ? `R$ ${it.preco_venda}` : <span className={styles.itemDot}>—</span>}</td>
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
                            {hideFirst ? (
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
                            ) : null}
                            {vTams.map(t => (
                              <div key={t} className={styles.gradeInlineSize}>{t}</div>
                            ))}
                            {hideLast ? (
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
                            ) : null}
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
            })}
          </tbody>
        </table>
      )}

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

      <div className={styles.phaseActions}>
        {!showAddForm && (
          <button
            className={styles.btnSecondary}
            onClick={() => setShowAddForm(true)}
          >
            + Novo item
          </button>
        )}
        <button
          className={styles.btnSecondary}
          disabled={saving || items.every(it => totalQtdItem(it.localId) === 0)}
          onClick={handleFechar}
        >
          {saving ? 'Salvando…' : 'Fechar sessão e gerar PDFs →'}
        </button>
      </div>
    </div>
  )
}

// ─── PDF generation (shared between FecharSessao and Historico) ──────────

const PDF_STYLES = `
    body { font-family: Arial, sans-serif; font-size: 12px; color: #000; margin: 0; }
    .order { padding: 24px; page-break-after: always; }
    .order:last-child { page-break-after: avoid; }
    h1 { font-size: 16px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 4px; }
    .section { margin: 12px 0; }
    .section-title { font-weight:bold; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:#555; margin-bottom:6px; }
    .row { display: flex; gap: 24px; margin-bottom: 4px; }
    .lbl { font-weight: bold; min-width: 120px; }
    .seg-block { margin: 16px 0; border-top: 1px solid #ddd; padding-top: 10px; }
    .seg-title { font-weight: bold; font-size: 11px; color: #333; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: right; }
    th:first-child, td:first-child { text-align: left; }
    th { background: #f0f0f0; font-weight: bold; }
    .totals { margin-top: 10px; text-align: right; line-height: 1.7; }
    .total-geral { display:flex; justify-content:space-between; align-items:center; margin-top:20px; padding:10px 12px; background:#f5f5f5; border:2px solid #333; border-radius:4px; font-size:13px; }
    .footer { margin-top: 24px; font-size: 10px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 8px; }
    @media print { @page { margin: 15mm; } }`

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

function gerarHTMLOrdem(sessao, vis, visPedidos, isLast = true) {
  const dateStr = new Date().toLocaleDateString('pt-BR')
  const totalGeralComprador = visPedidos.reduce((s, p) => {
    const q = p.itens.reduce((s2, i) => s2 + i.qtd, 0)
    return s + q * p.valor_unitario * (1 - p.desconto_pct / 100)
  }, 0)
  const totalPecasComprador = visPedidos.reduce((s, p) => s + p.itens.reduce((s2, i) => s2 + i.qtd, 0), 0)

  const pedidosHtml = visPedidos.map(p => {
    const segLabel = p.referencia
      ? `${esc(p.referencia)} — ${esc(p.tipo_produto ?? '')} — ${esc(p.classe ?? '')} (Grade ${esc(p.tipo_grade ?? '')})`
      : p.classificacao
        ? `${esc(p.classificacao)} — ${esc(p.tipo_produto)} — ${esc(p.classe)} (Grade ${esc(p.tipo_grade)})`
        : `Segmentação #${p.segmentacao_id}`
    const totalQ = p.itens.reduce((s, i) => s + i.qtd, 0)
    const totalV = totalQ * p.valor_unitario * (1 - p.desconto_pct / 100)
    const rowsHtml = p.itens.filter(i => i.qtd > 0).map(i =>
      `<tr><td style="text-align:left; padding:5px 10px;">${i.tamanho}</td><td style="text-align:right; padding:5px 10px;">${i.qtd}</td></tr>`
    ).join('')
    return `
      <div class="seg-block">
        <div class="seg-title">${segLabel}</div>
        <table>
          <thead><tr><th style="text-align:left;">Tamanho</th><th>Quantidade</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
          <tfoot><tr>
            <td style="text-align:left; font-weight:bold; border-top:2px solid #aaa; padding:5px 10px;">Total</td>
            <td style="font-weight:bold; border-top:2px solid #aaa; padding:5px 10px; text-align:right;">${totalQ}</td>
          </tr></tfoot>
        </table>
        <div class="totals">
          <div>Valor unitário: <strong>R$ ${p.valor_unitario.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
          ${p.desconto_pct > 0 ? `<div>Desconto: <strong>${p.desconto_pct}%</strong></div>` : ''}
          <div style="font-size:14px; margin-top:4px;">Valor líquido: <strong>R$ ${totalV.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
        </div>
      </div>`
  }).join('')

  return `
    <div class="order"${isLast ? ' style="page-break-after:avoid;"' : ''}>
      <h1>PEDIDO DE COMPRA</h1>
      <p style="font-size:10px; color:#888; margin-bottom:12px;">Gerado em: ${dateStr}</p>
      <div class="section">
        <div class="section-title">Fornecedor</div>
        <div class="row"><span class="lbl">Fornecedor:</span><span>${esc(sessao.fornecedor_nome)}</span></div>
        ${sessao.vendedor ? `<div class="row"><span class="lbl">Vendedor:</span><span>${esc(sessao.vendedor)}</span></div>` : ''}
        <div class="row"><span class="lbl">Data pedido:</span><span>${fmtDate(sessao.data_visita)}</span></div>
        ${sessao.data_entrega ? `<div class="row"><span class="lbl">Entrega:</span><span>${fmtDate(sessao.data_entrega)}</span></div>` : ''}
        ${sessao.cond_pag ? `<div class="row"><span class="lbl">Cond. pag.:</span><span>${esc(sessao.cond_pag)}</span></div>` : ''}
        ${sessao.frete    ? `<div class="row"><span class="lbl">Frete:</span><span>${esc(sessao.frete)}</span></div>` : ''}
        ${sessao.frete === 'FOB' && sessao.transportadora ? `<div class="row"><span class="lbl">Transportadora:</span><span>${esc(sessao.transportadora)}</span></div>` : ''}
        ${sessao.obs      ? `<div class="row"><span class="lbl">Obs.:</span><span>${esc(sessao.obs)}</span></div>` : ''}
      </div>
      <div class="section" style="border-top:1px solid #ddd; padding-top:10px;">
        <div class="section-title">Comprador</div>
        <div class="row"><span class="lbl">Nome:</span><span><strong>${esc(vis.comprador_nome)}</strong></span></div>
        ${vis.comprador_cnpj   ? `<div class="row"><span class="lbl">CNPJ:</span><span>${esc(vis.comprador_cnpj)}</span></div>`   : ''}
        ${vis.comprador_cidade ? `<div class="row"><span class="lbl">Cidade:</span><span>${esc(vis.comprador_cidade)}</span></div>` : ''}
      </div>
      ${pedidosHtml}
      <div class="total-geral">
        <span>${totalPecasComprador} peça(s)</span>
        <span>Total do pedido: <strong>R$ ${totalGeralComprador.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></span>
      </div>
      <div class="footer">Gerado por Solução Compras — ${dateStr}</div>
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

// DD-MM-AA a partir de YYYY-MM-DD
const fmtDataPDF = iso => { const [y,m,d] = iso.split('-'); return `${d}-${m}-${y.slice(2)}` }

function salvarPDFVisita(sessao, vis, visPedidos, sessaoOverride = {}) {
  const sessaoFinal = Object.keys(sessaoOverride).length ? { ...sessao, ...sessaoOverride } : sessao
  const baseHtml = wrapDoc(
    gerarHTMLOrdem(sessaoFinal, vis, visPedidos, true),
    `Pedido — ${esc(sessaoFinal.fornecedor_nome)} — ${esc(vis.comprador_nome)}`
  )
  // inject auto-print before </body> so the tab opens and prints immediately
  const html = baseHtml.replace(
    '</body>',
    '<script>window.addEventListener("load",function(){window.focus();window.print()})<\/script></body>'
  )
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) {
    URL.revokeObjectURL(url)
    alert('Bloqueador de pop-ups ativo. Permita pop-ups para este site.')
    return { ok: false }
  }
  setTimeout(() => URL.revokeObjectURL(url), 120_000)
  return { ok: true }
}

// ─── Phase 3: Close Session + PDFs ───────────────────────────────────────

function FecharSessao({ sessao, visitas, segs, pedidos, onNovaSessao }) {
  const [salvandoPDF,   setSalvandoPDF]   = useState(null) // vis.id em andamento
  const [salvos,        setSalvos]        = useState(new Set())
  const [erroPDF,       setErroPDF]       = useState(null)
  const [showPDFModal,  setShowPDFModal]  = useState(false)
  const [fornFull,      setFornFull]      = useState(null)
  const [modalFields,   setModalFields]   = useState({})
  const [lojaOverrides, setLojaOverrides] = useState({}) // { [vis.id]: { cond_pag?, frete?, transportadora? } }
  const [showLojaConfig,setShowLojaConfig]= useState(false)

  // Returns only non-empty override fields for a given visita
  function buildVisitaOverride(visId) {
    const ovr = lojaOverrides[visId] ?? {}
    const out = {}
    if (ovr.cond_pag)        out.cond_pag       = ovr.cond_pag
    if (ovr.frete)           out.frete          = ovr.frete
    if (ovr.transportadora)  out.transportadora = ovr.transportadora
    return out
  }

  function setLojaField(visId, field, value) {
    setLojaOverrides(prev => ({
      ...prev,
      [visId]: { ...prev[visId], [field]: value }
    }))
  }

  const podeSalvarPDF = true
  const visitasComPedidos = visitas.filter(v => pedidos.some(p => p.visita_id === v.id))
  const totalGeral = pedidos.reduce((s, p) => {
    const q = p.itens.reduce((s2, i) => s2 + i.qtd, 0)
    return s + q * p.valor_unitario * (1 - p.desconto_pct / 100)
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
    const finalOverrides = {}
    for (const vis of visitasComPedidos) {
      const ovr = buildVisitaOverride(vis.id)
      if (Object.keys(ovr).length) finalOverrides[vis.id] = ovr
    }
    gerarPDFSessao(sessaoComModal, visitas, pedMap, finalOverrides)
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
    for (const vis of visitasComPedidos) {
      if (salvos.has(vis.id)) continue
      setSalvandoPDF(vis.id)
      try {
        const visPedidos = pedidos.filter(p => p.visita_id === vis.id)
        const ovr = buildVisitaOverride(vis.id)
        const result = await salvarPDFVisita(sessao, vis, visPedidos, ovr)
        if (result?.ok) {
          if (Object.keys(ovr).length) pedidosService.updateVisita(vis.id, ovr).catch(() => {})
          setSalvos(prev => new Set([...prev, vis.id]))
        }
      } catch {
        setErroPDF(`Erro ao salvar PDF de ${vis.comprador_nome}.`)
        setSalvandoPDF(null)
        return
      }
    }
    setSalvandoPDF(null)
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
        <strong>{sessao.fornecedor_nome}</strong>
        <span className={styles.dot}>·</span>
        <span>{fmtDate(sessao.data_visita)}</span>
        <span className={styles.dot}>·</span>
        <span>{pedidos.length} pedido(s) · {visitasComPedidos.length} loja(s)</span>
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
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className={styles.resumoGrid}>
        {visitasComPedidos.map(vis => {
          const visPedidos = pedidos.filter(p => p.visita_id === vis.id)
          const totalComp = visPedidos.reduce((s, p) => {
            const q = p.itens.reduce((s2, i) => s2 + i.qtd, 0)
            return s + q * p.valor_unitario * (1 - p.desconto_pct / 100)
          }, 0)
          const foiSalvo = salvos.has(vis.id)
          return (
            <div key={vis.id} className={styles.resumoCard}>
              <div className={styles.resumoCardHeader}>{vis.comprador_nome}</div>
              {visPedidos.map((p, i) => {
                const totalQ = p.itens.reduce((s, i) => s + i.qtd, 0)
                return (
                  <div key={i} className={styles.resumoItem}>
                    <span>
                      {p.referencia ? `[${p.referencia}] ` : ''}
                      {p.tipo_produto ? `${p.tipo_produto} ${p.classe}` : `Seg #${p.segmentacao_id}`}
                    </span>
                    <span>{totalQ} pç</span>
                  </div>
                )
              })}
              <div className={styles.resumoTotal}>R$ {fmt(totalComp)}</div>
              {podeSalvarPDF && (
                <button
                  className={foiSalvo ? styles.btnSecondary : styles.btnPdf}
                  style={{ marginTop: '0.5rem', width: '100%', padding: '0.35rem', fontSize: '0.78rem' }}
                  onClick={() => handleSalvarPDF(vis)}
                  disabled={salvandoPDF !== null}
                >
                  {salvandoPDF === vis.id ? 'Salvando…' : foiSalvo ? '✓ PDF salvo' : '↓ Salvar PDF'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.resumoGeralTotal}>
        Total geral: <strong>R$ {fmt(totalGeral)}</strong>
      </div>

      <div className={styles.phaseActions}>
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
                : `↓ Salvar todos os PDFs (${visitasComPedidos.length - salvos.size})`}
          </button>
        )}
        <button className={styles.btnPrimary} onClick={handleGerarPDFs}>
          Imprimir todos ({visitasComPedidos.length})
        </button>
      </div>
    </div>
  )
}

// ─── Historico ────────────────────────────────────────────────────────────

function Historico({ colId }) {
  const [sessoesList,      setSessoesList]      = useState([])
  const [loading,          setLoading]          = useState(true)
  const [expandedSessao,   setExpandedSessao]   = useState(null)
  const [expandedVisita,   setExpandedVisita]   = useState(null)
  const [pedidosPorVisita, setPedidosPorVisita] = useState({})
  const [reimprimindo,     setReimprimindo]     = useState(null) // sessao.id em andamento
  const [confirmCancelar,     setConfirmCancelar]     = useState(null) // { pedidoId, visitaId }
  const [editSessaoId,        setEditSessaoId]        = useState(null)
  const [editSessaoForm,      setEditSessaoForm]      = useState({})
  const [savingEditSessao,    setSavingEditSessao]    = useState(false)
  const [confirmDeleteSessao, setConfirmDeleteSessao] = useState(null) // sessaoId

  useEffect(() => {
    let cancelled = false
    sessoesService.list(colId).then(list => {
      if (!cancelled) { setSessoesList(list); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [colId])

  async function handleExpandVisita(visitaId) {
    if (expandedVisita === visitaId) { setExpandedVisita(null); return }
    setExpandedVisita(visitaId)
    if (!pedidosPorVisita[visitaId]) {
      const peds = await pedidosService.byVisita(visitaId)
      setPedidosPorVisita(prev => ({ ...prev, [visitaId]: peds }))
    }
  }

  async function executarCancelar() {
    if (!confirmCancelar) return
    const { pedidoId, visitaId } = confirmCancelar
    setConfirmCancelar(null)
    await pedidosService.cancelar(pedidoId)
    setPedidosPorVisita(prev => ({
      ...prev,
      [visitaId]: (prev[visitaId] ?? []).filter(p => p.id !== pedidoId)
    }))
  }

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
      const updated = await sessoesService.update(id, editSessaoForm)
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

  async function handleReimprimir(ses) {
    setReimprimindo(ses.id)
    try {
      // Carrega pedidos de todas as visitas que ainda não foram abertas
      const toLoad = ses.visitas.filter(v => !pedidosPorVisita[v.visita_id])
      let allPeds = pedidosPorVisita
      if (toLoad.length > 0) {
        const loaded = await Promise.all(
          toLoad.map(v => pedidosService.byVisita(v.visita_id).then(peds => [v.visita_id, peds]))
        )
        allPeds = { ...pedidosPorVisita, ...Object.fromEntries(loaded) }
        setPedidosPorVisita(allPeds)
      }
      const visitasForPDF = ses.visitas.map(v => ({
        id: v.visita_id,
        comprador_nome:   v.comprador_nome,
        comprador_cnpj:   v.comprador_cnpj   ?? '',
        comprador_cidade: v.comprador_cidade  ?? '',
      }))
      gerarPDFSessao(ses, visitasForPDF, allPeds)
    } finally {
      setReimprimindo(null)
    }
  }

  if (loading) return <p className={styles.muted}>Carregando histórico…</p>
  if (sessoesList.length === 0) return <p className={styles.muted}>Nenhuma sessão registrada nesta coleção.</p>

  return (
    <div className={styles.historico}>
      {confirmCancelar && (
        <ConfirmModal
          message="Cancelar este pedido? Essa ação não pode ser desfeita."
          confirmLabel="Cancelar pedido"
          danger
          onConfirm={executarCancelar}
          onCancel={() => setConfirmCancelar(null)}
        />
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
      {sessoesList.map(ses => (
        <div key={ses.id} className={styles.histSessao}>
          <div className={styles.histSessaoHeader}>
            <button
              className={styles.histSessaoToggle}
              onClick={() => setExpandedSessao(expandedSessao === ses.id ? null : ses.id)}
            >
              <strong>{ses.fornecedor_nome}</strong>
              <span className={styles.dot}>·</span>
              <span>{fmtDate(ses.data_visita)}</span>
              {ses.vendedor && <><span className={styles.dot}>·</span><span>{ses.vendedor}</span></>}
              <span className={styles.histChevron}>{expandedSessao === ses.id ? '▲' : '▼'}</span>
            </button>
            <button
              className={styles.btnReimprimir}
              onClick={() => handleReimprimir(ses)}
              disabled={reimprimindo === ses.id}
              title="Reimprimir PDFs desta sessão"
            >
              {reimprimindo === ses.id ? '…' : '🖨'}
            </button>
            <button
              className={styles.btnReimprimir}
              onClick={() => handleStartEditSessao(ses)}
              disabled={editSessaoId !== null}
              title="Editar dados da sessão"
            >
              ✎
            </button>
            <button
              className={styles.btnReimprimir}
              style={{ color: 'var(--red)' }}
              onClick={() => setConfirmDeleteSessao(ses.id)}
              disabled={editSessaoId !== null}
              title="Excluir sessão"
            >
              🗑
            </button>
          </div>

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

          {expandedSessao === ses.id && (
            <div className={styles.histSessaoBody}>
              {(ses.visitas ?? []).length === 0 ? (
                <p className={styles.muted}>Nenhuma loja nesta sessão.</p>
              ) : (ses.visitas ?? []).map(vis => (
                <div key={vis.visita_id} className={styles.histVisita}>
                  <button
                    className={styles.histVisitaHeader}
                    onClick={() => handleExpandVisita(vis.visita_id)}
                  >
                    <span>{vis.comprador_nome}</span>
                    <span className={styles.histChevron}>{expandedVisita === vis.visita_id ? '▲' : '▼'}</span>
                  </button>

                  {expandedVisita === vis.visita_id && (
                    <div className={styles.histPedidos}>
                      {!(pedidosPorVisita[vis.visita_id]) ? (
                        <p className={styles.muted}>Carregando…</p>
                      ) : pedidosPorVisita[vis.visita_id].length === 0 ? (
                        <p className={styles.muted}>Nenhum pedido.</p>
                      ) : (
                        <table className={styles.histTable}>
                          <thead>
                            <tr>
                              <th>Segmentação</th>
                              <th>Peças</th>
                              <th>Valor unit.</th>
                              <th>Total</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {pedidosPorVisita[vis.visita_id].map(p => {
                              const pecas = p.itens.reduce((s, i) => s + i.qtd, 0)
                              const total = pecas * p.valor_unitario * (1 - p.desconto_pct / 100)
                              return (
                                <tr key={p.id}>
                                  <td>{p.classificacao} · {p.tipo_produto} · {p.classe}</td>
                                  <td>{pecas}</td>
                                  <td>R$ {fmt(p.valor_unitario)}</td>
                                  <td>R$ {fmt(total)}</td>
                                  <td>
                                    <button
                                      className={styles.btnCancelar}
                                      onClick={() => setConfirmCancelar({ pedidoId: p.id, visitaId: vis.visita_id })}
                                    >
                                      Cancelar
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Orchestrator ─────────────────────────────────────────────────────────

export default function Compras() {
  const { active } = useCollection()
  const [segs,        setSegs]        = useState([])
  const [forns,       setForns]       = useState([])
  const [compradores, setCompradores] = useState([])
  const [phase,       setPhase]       = useState(1)
  const [sessao,      setSessao]      = useState(null)
  const [visitas,     setVisitas]     = useState([])
  const [pedidosFechados, setPedidosFechados] = useState([])
  const [view,            setView]            = useState('nova') // 'nova' | 'historico'
  const [recoveryData,    setRecoveryData]    = useState(null)
  const [recoveryInitial, setRecoveryInitial] = useState(null)
  const [isOnline,        setIsOnline]        = useState(navigator.onLine)

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

  // Verifica se há sessão interrompida para recuperar
  useEffect(() => {
    if (!active?.id) return
    let cancelled = false
    const key = `SC_RECOVERY_${active.id}`
    const saved = localStorage.getItem(key)
    if (!saved) { setRecoveryData(null); return }
    try {
      const data = JSON.parse(saved)
      sessoesService.byId(data.sessao_id).then(sessaoDb => {
        if (cancelled) return
        if (!sessaoDb) { localStorage.removeItem(key); setRecoveryData(null); return }
        const visEnriquecidas = sessaoDb.visitas.map(v => ({
          id: v.visita_id,
          comprador_id:     v.comprador_id,
          comprador_nome:   v.comprador_nome,
          comprador_cnpj:   v.comprador_cnpj   ?? '',
          comprador_cidade: v.comprador_cidade  ?? '',
        }))
        setRecoveryData({ sessao: sessaoDb, visitas: visEnriquecidas, ...data })
      })
    } catch {
      localStorage.removeItem(key)
      setRecoveryData(null)
    }
    return () => { cancelled = true }
  }, [active?.id])

  function handleStart(novaSessao, lojas) {
    const visitasEnriquecidas = novaSessao.visitas.map(v => {
      const loja = lojas.find(l => l.id === v.comprador_id)
      return {
        id: v.visita_id,
        comprador_id: v.comprador_id,
        comprador_nome:   loja?.nome   ?? `Loja #${v.comprador_id}`,
        comprador_cnpj:   loja?.cnpj   ?? '',
        comprador_cidade: loja?.cidade  ?? '',
      }
    })
    // Ordenar visitas pela mesma ordem da tela de Configurações (compradores.ordem)
    const ordemIds = lojas.map(l => l.id)
    visitasEnriquecidas.sort((a, b) => ordemIds.indexOf(a.comprador_id) - ordemIds.indexOf(b.comprador_id))
    setSessao(novaSessao)
    setVisitas(visitasEnriquecidas)
    setPhase(2)
  }

  function handleFechar(pedidos) {
    setPedidosFechados(pedidos)
    setPhase(3)
  }

  function handleRecover() {
    const { sessao, visitas, items, qtds, activeId, lojaIdx } = recoveryData
    setSessao(sessao)
    setVisitas(visitas)
    setRecoveryInitial({ items: items ?? [], qtds: qtds ?? {}, activeId: activeId ?? null, lojaIdx: lojaIdx ?? 0 })
    setRecoveryData(null)
    setPhase(2)
  }

  function handleDismissRecovery() {
    localStorage.removeItem(`SC_RECOVERY_${active.id}`)
    setRecoveryData(null)
  }

  function handleNovaSessao() {
    setSessao(null)
    setVisitas([])
    setPedidosFechados([])
    setRecoveryInitial(null)
    setPhase(1)
  }

  const sessaoDisplay = sessao ?? null
  const inSession = phase > 1

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

      {!isOnline && (
        <div className={styles.offlineBanner}>
          Sem conexão com a internet — mudanças não serão salvas.
        </div>
      )}

      {view === 'nova' && phase === 1 && recoveryData && (
        <div className={styles.recoveryBanner}>
          <span>
            Sessão interrompida: <strong>{recoveryData.sessao.fornecedor_nome}</strong>
            {' '}em <strong>{fmtDate(recoveryData.sessao.data_visita)}</strong>. Deseja continuar de onde parou?
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button className={styles.btnPrimary} onClick={handleRecover}>Continuar</button>
            <button className={styles.btnSecondary} onClick={handleDismissRecovery}>Descartar</button>
          </div>
        </div>
      )}

      {!inSession && (
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${view === 'nova' ? styles.toggleActive : ''}`}
            onClick={() => setView('nova')}
          >
            Nova sessão
          </button>
          <button
            className={`${styles.toggleBtn} ${view === 'historico' ? styles.toggleActive : ''}`}
            onClick={() => setView('historico')}
          >
            Histórico
          </button>
        </div>
      )}

      {(inSession || view === 'nova') && phase === 1 && (
        <div className={styles.stepBar}>
          {['Iniciar sessão', 'Registrar pedidos', 'Gerar PDFs'].map((label, i) => (
            <div key={i} className={`${styles.step} ${phase === i + 1 ? styles.stepActive : ''} ${phase > i + 1 ? styles.stepDone : ''}`}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}

      {view === 'nova' && phase === 1 && (
        <IniciarSessao
          forns={forns}
          compradores={compradores}
          colId={active.id}
          onStart={handleStart}
        />
      )}
      {phase === 2 && sessao && (
        <RegistrarPedidoSessao
          sessao={sessaoDisplay}
          visitas={visitas}
          colId={active.id}
          colEstacao={active.estacao}
          segs={segs}
          onFechar={handleFechar}
          onRemoveVisita={(visId) => setVisitas(prev => prev.filter(v => v.id !== visId))}
          initialItems={recoveryInitial?.items ?? []}
          initialQtds={recoveryInitial?.qtds ?? {}}
          initialActiveId={recoveryInitial?.activeId ?? null}
          initialLojaIdx={recoveryInitial?.lojaIdx ?? 0}
        />
      )}
      {phase === 3 && sessao && (
        <FecharSessao
          sessao={sessaoDisplay}
          visitas={visitas}
          segs={segs}
          pedidos={pedidosFechados}
          onNovaSessao={handleNovaSessao}
        />
      )}

      {view === 'historico' && !inSession && (
        <Historico colId={active.id} />
      )}
    </div>
  )
}
