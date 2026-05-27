import { useState, useEffect, useMemo } from 'react'
import { useCollection } from '../../contexts/CollectionContext'
import { segmentacoes as segmentacoesService } from '../../services/segmentacoes'
import { relatorios } from '../../services/relatorios'
import styles from './PorSegmentacao.module.css'

export default function PorSegmentacao({ onSelectForn }) {
  const { active } = useCollection()

  const [segs,     setSegs]     = useState([])
  const [selClass, setSelClass] = useState('')
  const [selTipo,  setSelTipo]  = useState('')
  const [selClasse, setSelClasse] = useState('')
  const [results,  setResults]  = useState([])

  useEffect(() => {
    segmentacoesService.list().then(setSegs)
  }, [])

  const classificacoes = useMemo(() => [...new Set(segs.map(s => s.classificacao))].sort(), [segs])
  const tipos  = useMemo(() =>
    [...new Set(segs.filter(s => s.classificacao === selClass).map(s => s.tipo_produto))].sort(),
    [segs, selClass]
  )
  const classes = useMemo(() =>
    [...new Set(segs.filter(s => s.classificacao === selClass && s.tipo_produto === selTipo).map(s => s.classe))].sort(),
    [segs, selClass, selTipo]
  )

  const selectedSeg = useMemo(() =>
    segs.find(s => s.classificacao === selClass && s.tipo_produto === selTipo && s.classe === selClasse) ?? null,
    [segs, selClass, selTipo, selClasse]
  )

  useEffect(() => {
    if (!active || !selectedSeg) { setResults([]); return }
    relatorios.totaisPorFornecedor(active.id, selectedSeg.id).then(setResults)
  }, [active?.id, selectedSeg?.id])

  function handleClass(v)  { setSelClass(v); setSelTipo(''); setSelClasse('') }
  function handleTipo(v)   { setSelTipo(v);  setSelClasse('') }

  const hasFilter = selClass !== ''

  return (
    <div>
      <div className={styles.filters}>
        <select value={selClass} onChange={e => handleClass(e.target.value)}>
          <option value="">Classificação</option>
          {classificacoes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selTipo} onChange={e => handleTipo(e.target.value)} disabled={!selClass}>
          <option value="">Tipo de produto</option>
          {tipos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={selClasse} onChange={e => setSelClasse(e.target.value)} disabled={!selTipo}>
          <option value="">Classe</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {!hasFilter && (
        <p className={styles.hint}>Selecione uma segmentação para ver os fornecedores.</p>
      )}

      {hasFilter && results.length === 0 && selectedSeg && (
        <p className={styles.hint}>Nenhum fornecedor com pedidos para essa segmentação.</p>
      )}

      {results.length > 0 && selectedSeg && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th className={styles.numCol}>SKUs</th>
              <th className={styles.numCol}>Peças</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr
                key={r.fornecedor_id}
                onClick={() => onSelectForn(
                  { id: r.fornecedor_id, nome: r.fornecedor_nome },
                  { segId: selectedSeg.id, classificacao: selectedSeg.classificacao,
                    tipo_produto: selectedSeg.tipo_produto, classe: selectedSeg.classe }
                )}
              >
                <td>{r.fornecedor_nome}</td>
                <td className={styles.numCol}>{r.num_skus}</td>
                <td className={styles.numCol}>{r.total_pecas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
