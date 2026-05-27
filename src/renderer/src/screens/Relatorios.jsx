import { useState } from 'react'
import PorFornecedor from './relatorios/PorFornecedor'
import PorSegmentacao from './relatorios/PorSegmentacao'
import PorLoja from './relatorios/PorLoja'
import styles from './Relatorios.module.css'

const REPORTS = [
  { id: 'por_fornecedor',  label: 'Por Fornecedor',     disabled: false },
  { id: 'por_segmentacao', label: 'Por Segmentação',    disabled: false },
  { id: 'por_loja',        label: 'Por Loja',           disabled: false },
  { id: 'curva_abc',       label: 'Curva ABC',          disabled: true  },
  { id: 'quebra_estoque',  label: 'Quebra de Estoque',  disabled: true  },
]

export default function Relatorios() {
  const [activeReport, setActiveReport] = useState('por_fornecedor')
  const [selectedForn, setSelectedForn] = useState(null)
  const [segFilter,    setSegFilter]    = useState(null)

  function handleSelectFornFromSeg(forn, seg) {
    setSelectedForn(forn)
    setSegFilter(seg)
    setActiveReport('por_fornecedor')
  }

  function handleClearSegFilter() {
    setSegFilter(null)
  }

  function handleClearForn() {
    setSelectedForn(null)
    setSegFilter(null)
  }

  function handleSwitchReport(id) {
    if (id === activeReport) return
    setActiveReport(id)
    setSelectedForn(null)
    setSegFilter(null)
  }

  return (
    <div className={styles.container}>
      <nav className={styles.tabs}>
        {REPORTS.map(r => (
          <button
            key={r.id}
            className={[
              styles.tab,
              activeReport === r.id ? styles.active : '',
              r.disabled ? styles.disabled : '',
            ].join(' ')}
            onClick={() => !r.disabled && handleSwitchReport(r.id)}
          >
            {r.label}
            {r.disabled && <span className={styles.soon}>Em breve</span>}
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {activeReport === 'por_fornecedor' && (
          <PorFornecedor
            selectedForn={selectedForn}
            segFilter={segFilter}
            onSelectForn={forn => setSelectedForn(forn)}
            onClearForn={handleClearForn}
            onClearSegFilter={handleClearSegFilter}
          />
        )}
        {activeReport === 'por_segmentacao' && (
          <PorSegmentacao onSelectForn={handleSelectFornFromSeg} />
        )}
        {activeReport === 'por_loja' && <PorLoja />}
        {activeReport === 'curva_abc' && (
          <p style={{ color: 'var(--text-secondary)' }}>Em breve.</p>
        )}
        {activeReport === 'quebra_estoque' && (
          <p style={{ color: 'var(--text-secondary)' }}>Em breve.</p>
        )}
      </div>
    </div>
  )
}
