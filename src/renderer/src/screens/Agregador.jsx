import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ModuleRegistry, themeBalham } from 'ag-grid-community'
import { Upload, ChevronDown, ChevronRight } from 'lucide-react'
import { useCollection } from '../contexts/CollectionContext'
import { agregador as service } from '../services/agregador'
import { GRADE_DEFINITIONS } from '../constants/grades'
import styles from './Agregador.module.css'

ModuleRegistry.registerModules([AllCommunityModule])

// ─── Grade groups ────────────────────────────────────────────────────────────

const GRUPO_ORDER = ['PP', 'BB', 'INF', 'JUV', 'AD', 'EX', 'OUTROS']

const GRUPO_LABEL = {
  PP: 'PP / BB', BB: 'PP / BB',
  INF: 'INF – JUV', JUV: 'INF – JUV',
  AD: 'AD',
  EX: 'EX',
  OUTROS: 'OUTROS',
}

function grupoKey(tipoGrade) {
  if (['PP', 'BB'].includes(tipoGrade))                return 'PP'
  if (['INF', 'INF1', 'JUV', 'JUV1'].includes(tipoGrade)) return 'INF'
  if (['AD', 'AD1', 'AD2'].includes(tipoGrade))        return 'AD'
  if (['EX', 'EX1', 'EX2'].includes(tipoGrade))        return 'EX'
  return 'OUTROS'
}

// ─── Build AG Grid row data ───────────────────────────────────────────────────

function buildRowData(bySeg, historico) {
  const rows = []

  for (const [segId, { seg, itens: pedidoItens }] of bySeg) {
    if (!seg) continue
    const tipoGrade = seg.tipo_grade
    const tamanhos = GRADE_DEFINITIONS[tipoGrade]?.tamanhos ?? []
    const histItens = historico.get(tipoGrade) ?? new Map()
    const produto = `${seg.tipo_produto}${seg.classe ? ' ' + seg.classe : ''}`

    const makeRow = (metrica, isFirst) => {
      const row = {
        _segId:     segId,
        _produto:   isFirst ? produto : '',
        _label:     produto,
        _metrica:   metrica,
        _tipoGrade: tipoGrade,
        _isFirst:   isFirst,
        _isEstoque: metrica === 'Estoque',
        total:      0,
      }

      for (const tam of tamanhos) {
        const field = `${tipoGrade}__${tam}`
        let val = 0
        if (metrica === 'Pedido')   val = pedidoItens.get(tam) ?? 0
        else if (metrica === 'Compra')  val = histItens.get(tam)?.comprada ?? 0
        else if (metrica === 'Venda')   val = histItens.get(tam)?.vendida  ?? 0
        else if (metrica === 'Estoque') val = histItens.get(tam)?.estoque  ?? 0
        row[field] = val
        row.total += val
      }
      return row
    }

    rows.push(makeRow('Compra',  true))
    rows.push(makeRow('Venda',   false))
    rows.push(makeRow('Estoque', false))
    rows.push(makeRow('Pedido',  false))
  }

  return rows
}

// ─── Build AG Grid column defs ────────────────────────────────────────────────

function buildColDefs(tipoGradeSet) {
  const grupos = new Map()
  for (const tg of tipoGradeSet) {
    const gk = grupoKey(tg)
    if (!grupos.has(gk)) grupos.set(gk, [])
    if (!grupos.get(gk).find(x => x.tg === tg)) {
      grupos.get(gk).push({ tg, tamanhos: GRADE_DEFINITIONS[tg]?.tamanhos ?? [] })
    }
  }

  const pinLeft = {
    pinned: 'left',
    suppressMovable: true,
    resizable: false,
    sortable: false,
  }

  const colDefs = [
    {
      ...pinLeft,
      field: '_produto',
      headerName: 'Produto',
      width: 120,
      cellClass: params =>
        [styles.cellProduto, params.data._isFirst ? styles.cellProdutoFirst : ''].join(' '),
    },
    {
      ...pinLeft,
      field: '_metrica',
      headerName: '',
      width: 68,
      cellClass: params =>
        [styles.cellLabel, params.data._isEstoque ? styles.cellLabelEstoque : ''].join(' '),
    },
  ]

  const orderedGrupos = GRUPO_ORDER.filter(gk => grupos.has(gk))

  for (const gk of orderedGrupos) {
    const entries = grupos.get(gk)
    const children = []

    for (const { tg, tamanhos } of entries) {
      for (const tam of tamanhos) {
        children.push({
          field: `${tg}__${tam}`,
          headerName: tam,
          width: 38,
          sortable: false,
          resizable: true,
          cellClass: params =>
            [styles.cellNum, params.data._isEstoque ? styles.cellNumEstoque : ''].join(' '),
          valueFormatter: p => (p.value > 0 ? p.value : '—'),
        })
      }
    }

    colDefs.push({
      headerName: GRUPO_LABEL[gk] ?? gk,
      headerClass: styles.groupHeader,
      children,
    })
  }

  colDefs.push({
    field: 'total',
    headerName: 'TOT',
    width: 46,
    pinned: 'right',
    suppressMovable: true,
    sortable: false,
    cellClass: params =>
      [styles.cellTotal, params.data._isEstoque ? styles.cellTotalEstoque : ''].join(' '),
    valueFormatter: p => (p.value > 0 ? p.value : '—'),
  })

  return colDefs
}

// ─── AG Grid theme ────────────────────────────────────────────────────────────

const gridTheme = themeBalham.withParams({
  fontSize:          10,
  rowHeight:         22,
  headerHeight:      22,
  groupHeaderHeight: 20,
  borderColor:       '#f0f0f0',
  headerBackgroundColor: '#f7f7f7',
  backgroundColor:   '#fff',
  foregroundColor:   '#333',
  fontFamily:        'Inter, system-ui, sans-serif',
  cellHorizontalPaddingScale: 0.5,
})

// ─── Summary bar ─────────────────────────────────────────────────────────────

function computeSummary(bySeg, historico) {
  let pedidas = 0, compra = 0, venda = 0, estoque = 0, valor = 0

  for (const [segId, { itens, valor: v }] of bySeg) {
    for (const qtd of itens.values()) pedidas += qtd
    valor += v ?? 0
  }

  for (const tamMap of historico.values()) {
    for (const { comprada, vendida, estoque: est } of tamMap.values()) {
      compra  += comprada ?? 0
      venda   += vendida  ?? 0
      estoque += est      ?? 0
    }
  }

  return { pedidas, compra, venda, estoque, valor }
}

// ─── View B: Por fornecedor ───────────────────────────────────────────────────

function FornecedorCard({ nome, bySeg, historico }) {
  const [open, setOpen] = useState(false)

  const total = useMemo(() => {
    let t = 0
    for (const { itens } of bySeg.values()) for (const q of itens.values()) t += q
    return t
  }, [bySeg])

  return (
    <div className={styles.fornCard}>
      <button className={styles.fornHeader} onClick={() => setOpen(o => !o)}>
        <div>
          <span className={styles.fornNome}>{nome}</span>
          <span className={styles.fornMeta}>
            {bySeg.size} seg. · {total} peças pedidas
          </span>
        </div>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {open && (
        <div className={styles.fornBody}>
          {[...bySeg.entries()].map(([segId, { seg, itens }]) => {
            if (!seg) return null
            const tipoGrade = seg.tipo_grade
            const tamanhos = GRADE_DEFINITIONS[tipoGrade]?.tamanhos ?? []
            const histItens = historico.get(tipoGrade) ?? new Map()
            const produto = `${seg.tipo_produto}${seg.classe ? ' ' + seg.classe : ''}`

            const metricas = [
              { label: 'Compra',  vals: tamanhos.map(t => histItens.get(t)?.comprada ?? 0) },
              { label: 'Venda',   vals: tamanhos.map(t => histItens.get(t)?.vendida  ?? 0) },
              { label: 'Estoque', vals: tamanhos.map(t => histItens.get(t)?.estoque  ?? 0), bold: true },
              { label: 'Pedido',  vals: tamanhos.map(t => itens.get(t) ?? 0) },
            ]

            return (
              <div key={segId} className={styles.fornSeg}>
                <div className={styles.fornSegLabel}>{produto}</div>
                <div className={styles.tableWrap}>
                  <table className={styles.denseTable}>
                    <thead>
                      <tr>
                        <th className={styles.thEmpty} />
                        {tamanhos.map(t => (
                          <th key={t} className={styles.thSize}>{t}</th>
                        ))}
                        <th className={styles.thTot}>TOT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metricas.map(({ label, vals, bold }) => (
                        <tr key={label} className={bold ? styles.rowEstoque : undefined}>
                          <td className={[styles.cellLabel, bold ? styles.cellLabelEstoque : ''].join(' ')}>
                            {label}
                          </td>
                          {vals.map((v, i) => (
                            <td
                              key={i}
                              className={[styles.cellNum, bold ? styles.cellNumEstoque : ''].join(' ')}
                            >
                              {v > 0 ? v : '—'}
                            </td>
                          ))}
                          <td className={[styles.cellTotal, bold ? styles.cellTotalEstoque : ''].join(' ')}>
                            {vals.reduce((a, b) => a + b, 0) || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Import modal ─────────────────────────────────────────────────────────────

function ImportModal({ compradorId, colecaoId, onClose, onDone }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const inputRef = useRef()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setMsg('')
    try {
      const n = await service.importarHistorico(file, compradorId, colecaoId)
      setMsg(`${n} linhas importadas com sucesso.`)
      onDone()
    } catch (err) {
      setMsg(`Erro: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>Importar histórico</h3>
        <p className={styles.modalHint}>
          Planilha com colunas: <code>segmentacao_id, tamanho, qtd_comprada, qtd_vendida, qtd_estoque</code>
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        <button
          className={styles.btnImport}
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          <Upload size={13} />
          {loading ? 'Importando…' : 'Selecionar arquivo'}
        </button>
        {msg && <p className={styles.modalMsg}>{msg}</p>}
        <button className={styles.btnClose} onClick={onClose}>Fechar</button>
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function Agregador() {
  const { active } = useCollection()

  const [compradores, setCompradores] = useState([])
  const [selectedId, setSelectedId]   = useState(null)
  const [tab, setTab]                 = useState('tabela')
  const [bySeg, setBySeg]             = useState(new Map())
  const [byForn, setByForn]           = useState(new Map())
  const [historico, setHistorico]     = useState(new Map())
  const [loading, setLoading]         = useState(false)
  const [showImport, setShowImport]   = useState(false)

  useEffect(() => {
    service.compradores().then(list => {
      setCompradores(list)
      if (list.length > 0 && !selectedId) setSelectedId(list[0].id)
    })
  }, [])

  const loadData = useCallback(async () => {
    if (!selectedId || !active) return
    setLoading(true)
    try {
      const [pedidos, hist] = await Promise.all([
        service.pedidosPorComprador(selectedId, active.id),
        service.historicoPorComprador(selectedId, active.id),
      ])
      setBySeg(pedidos.bySeg)
      setByForn(pedidos.byForn)
      setHistorico(hist)
    } finally {
      setLoading(false)
    }
  }, [selectedId, active?.id])

  useEffect(() => { loadData() }, [loadData])

  const tipoGradeSet = useMemo(() => {
    const s = new Set()
    for (const { seg } of bySeg.values()) if (seg?.tipo_grade) s.add(seg.tipo_grade)
    return s
  }, [bySeg])

  const rowData  = useMemo(() => buildRowData(bySeg, historico), [bySeg, historico])
  const colDefs  = useMemo(() => buildColDefs(tipoGradeSet), [tipoGradeSet])
  const summary  = useMemo(() => computeSummary(bySeg, historico), [bySeg, historico])

  const selectedNome = compradores.find(c => c.id === selectedId)?.nome ?? ''

  const rowClassRules = useMemo(() => ({
    'agr-row-first':   p => p.data._isFirst,
    'agr-row-estoque': p => p.data._isEstoque,
  }), [])

  if (!active) {
    return <div className={styles.empty}>Selecione uma coleção para continuar.</div>
  }

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <select
            className={styles.empresaSelect}
            value={selectedId ?? ''}
            onChange={e => setSelectedId(Number(e.target.value))}
          >
            {compradores.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <span className={styles.colecaoLabel}>{active.nome}</span>
        </div>
        <button
          className={styles.btnImportTrigger}
          onClick={() => setShowImport(true)}
          title="Importar histórico via Excel"
        >
          <Upload size={13} />
          Importar histórico
        </button>
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <div><div className={styles.statVal}>{summary.pedidas}</div><div className={styles.statLbl}>PEÇAS PEDIDAS</div></div>
        <div className={styles.divider} />
        <div><div className={styles.statVal}>{summary.compra}</div><div className={styles.statLbl}>COMPRA ANT.</div></div>
        <div className={styles.divider} />
        <div><div className={styles.statVal}>{summary.venda}</div><div className={styles.statLbl}>VENDA ANT.</div></div>
        <div className={styles.divider} />
        <div><div className={styles.statVal}>{summary.estoque}</div><div className={styles.statLbl}>ESTOQUE</div></div>
        <div className={styles.divider} />
        <div>
          <div className={styles.statVal}>
            {summary.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          </div>
          <div className={styles.statLbl}>VALOR PEDIDOS</div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={[styles.tab, tab === 'tabela' ? styles.tabActive : ''].join(' ')}
          onClick={() => setTab('tabela')}
        >
          Tabela completa
        </button>
        <button
          className={[styles.tab, tab === 'fornecedor' ? styles.tabActive : ''].join(' ')}
          onClick={() => setTab('fornecedor')}
        >
          Por fornecedor
        </button>
      </div>

      {loading && <div className={styles.loadingBar} />}

      {/* View A: AG Grid */}
      {tab === 'tabela' && (
        <div className={styles.gridWrap}>
          {rowData.length === 0 && !loading ? (
            <div className={styles.empty}>
              Nenhum pedido encontrado para {selectedNome} nesta coleção.
            </div>
          ) : (
            <AgGridReact
              theme={gridTheme}
              rowData={rowData}
              columnDefs={colDefs}
              rowClassRules={rowClassRules}
              suppressRowHoverHighlight
              suppressCellFocus
              defaultColDef={{ sortable: false, resizable: true }}
              domLayout="autoHeight"
            />
          )}
        </div>
      )}

      {/* View B: Por fornecedor */}
      {tab === 'fornecedor' && (
        <div className={styles.fornList}>
          {byForn.size === 0 && !loading ? (
            <div className={styles.empty}>
              Nenhum pedido encontrado para {selectedNome} nesta coleção.
            </div>
          ) : (
            [...byForn.entries()].map(([fornId, { nome, bySeg: fBySeg }]) => (
              <FornecedorCard
                key={fornId}
                nome={nome}
                bySeg={fBySeg}
                historico={historico}
              />
            ))
          )}
        </div>
      )}

      {showImport && (
        <ImportModal
          compradorId={selectedId}
          colecaoId={active.id}
          onClose={() => setShowImport(false)}
          onDone={() => { setShowImport(false); loadData() }}
        />
      )}
    </div>
  )
}
