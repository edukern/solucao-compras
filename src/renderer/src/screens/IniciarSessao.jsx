import { useState, useEffect, useRef } from 'react'
import styles from './Compras.module.css'
import { sessoes as sessoesService } from '../services/sessoes'
import { fmtDate, today } from '../lib/format'

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

export function IniciarSessao({ forns, compradores, colId, onStart }) {
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
