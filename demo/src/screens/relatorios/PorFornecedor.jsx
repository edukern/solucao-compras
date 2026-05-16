import { Fragment, useState, useEffect, useMemo, useCallback } from 'react'
import { useCollection } from '../../contexts/CollectionContext'
import styles from './PorFornecedor.module.css'

export default function PorFornecedor({ selectedForn, segFilter, onSelectForn, onClearForn, onClearSegFilter }) {
  const { active } = useCollection()

  const [list,   setList]   = useState([])
  const [search, setSearch] = useState('')

  const [items,      setItems]      = useState([])
  const [projecoes,  setProjecoes]  = useState({})
  const [activePills, setActivePills] = useState({ class: new Set(), tipo: new Set() })

  useEffect(() => {
    if (!active) return
    window.api.pedidos.totaisPorFornecedor(active.id).then(setList)
  }, [active?.id])

  const loadDetail = useCallback(async (fornId, colId, filter) => {
    const rows = await window.api.pedidos.itensPorFornecedor(fornId, colId)
    setItems(rows)
    const projMap = {}
    await Promise.all(rows.map(async r => {
      const proj = await window.api.projecoes.get(r.segmentacao_id, colId)
      projMap[r.segmentacao_id] = proj.reduce((s, p) => s + p.qtd_ajustada, 0)
    }))
    setProjecoes(projMap)
    if (filter) {
      setActivePills({
        class: new Set([filter.classificacao]),
        tipo:  new Set([filter.tipo_produto]),
      })
    } else {
      setActivePills({
        class: new Set(rows.map(r => r.classificacao)),
        tipo:  new Set(rows.map(r => r.tipo_produto)),
      })
    }
  }, [])

  useEffect(() => {
    if (!selectedForn || !active) return
    loadDetail(selectedForn.id, active.id, segFilter)
  }, [selectedForn?.id, active?.id, loadDetail])

  const filteredList = useMemo(() => {
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(r => r.fornecedor_nome.toLowerCase().includes(q))
  }, [list, search])

  const allClasses = useMemo(() => [...new Set(items.map(r => r.classificacao))].sort(), [items])
  const allTipos   = useMemo(() => [...new Set(items.map(r => r.tipo_produto))].sort(), [items])

  const filteredItems = useMemo(() => {
    return items.filter(r => activePills.class.has(r.classificacao) && activePills.tipo.has(r.tipo_produto))
  }, [items, activePills])

  function togglePill(set, value) {
    setActivePills(prev => {
      const next = new Set(prev[set])
      next.has(value) ? next.delete(value) : next.add(value)
      return { ...prev, [set]: next }
    })
  }

  const totalProj    = filteredItems.reduce((s, r) => s + (projecoes[r.segmentacao_id] ?? 0), 0)
  const totalComprado = filteredItems.reduce((s, r) => s + r.total_comprado, 0)
  const totalSaldo   = Math.max(0, totalProj - totalComprado)

  const grouped = useMemo(() => {
    const map = new Map()
    for (const r of filteredItems) {
      const key = `${r.classificacao}|${r.tipo_produto}`
      if (!map.has(key)) map.set(key, { classificacao: r.classificacao, tipo_produto: r.tipo_produto, rows: [] })
      map.get(key).rows.push(r)
    }
    return [...map.values()].sort((a, b) =>
      a.classificacao.localeCompare(b.classificacao) || a.tipo_produto.localeCompare(b.tipo_produto)
    )
  }, [filteredItems])

  if (!active) return <p className={styles.empty}>Selecione uma coleção ativa.</p>

  if (selectedForn) {
    return (
      <div>
        <div className={styles.detailHeader}>
          <button className={styles.backBtn} onClick={onClearForn}>← Voltar</button>
          <span className={styles.detailTitle}>{selectedForn.nome}</span>
          <span className={styles.detailTotals}>
            {filteredItems.length} SKUs · {totalComprado} pç
          </span>
          {segFilter && (
            <button className={styles.clearSegBtn} onClick={onClearSegFilter}>
              Ver todas as segmentações
            </button>
          )}
        </div>

        <div className={styles.pills}>
          {allClasses.map(c => (
            <button
              key={c}
              className={`${styles.pill} ${activePills.class.has(c) ? styles.active : ''}`}
              onClick={() => togglePill('class', c)}
            >
              {c}
            </button>
          ))}
          {allTipos.map(t => (
            <button
              key={t}
              className={`${styles.pill} ${activePills.tipo.has(t) ? styles.active : ''}`}
              onClick={() => togglePill('tipo', t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardLabel}>Projeção</div>
            <div className={`${styles.cardValue} ${styles.proj}`}>{totalProj}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardLabel}>Comprado</div>
            <div className={`${styles.cardValue} ${styles.bought}`}>{totalComprado}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardLabel}>Saldo</div>
            <div className={`${styles.cardValue} ${styles.saldo}`}>{totalSaldo}</div>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Segmentação</th>
              <th className={styles.numCol}>Projeção</th>
              <th className={styles.numCol}>Comprado</th>
              <th className={styles.numCol}>Saldo</th>
              <th className={styles.numCol}>%</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(g => {
              return (
                <Fragment key={`group-${g.classificacao}-${g.tipo_produto}`}>
                  <tr>
                    <td colSpan={5} className={styles.groupSep}>
                      {g.classificacao} — {g.tipo_produto}
                    </td>
                  </tr>
                  {g.rows.map(r => {
                    const proj    = projecoes[r.segmentacao_id] ?? 0
                    const saldo   = Math.max(0, proj - r.total_comprado)
                    const pct     = proj > 0 ? Math.min(100, Math.round(r.total_comprado / proj * 100)) : 0
                    return (
                      <tr key={r.segmentacao_id}>
                        <td>{r.classe}</td>
                        <td className={styles.numCol}>{proj}</td>
                        <td className={styles.numCol}>{r.total_comprado}</td>
                        <td className={styles.numCol}>{saldo}</td>
                        <td className={`${styles.numCol} ${pct >= 80 ? styles.pctGood : styles.pctWarn}`}>{pct}%</td>
                      </tr>
                    )
                  })}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div>
      <input
        type="search"
        className={styles.searchBar}
        placeholder="Buscar fornecedor…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {filteredList.length === 0 ? (
        <p className={styles.empty}>Nenhum fornecedor com pedidos nesta coleção.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th className={styles.numCol}>SKUs</th>
              <th className={styles.numCol}>Peças</th>
              <th className={styles.numCol}>Valor total</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map(r => (
              <tr key={r.fornecedor_id} onClick={() => onSelectForn({ id: r.fornecedor_id, nome: r.fornecedor_nome })}>
                <td>{r.fornecedor_nome}</td>
                <td className={styles.numCol}>{r.num_skus}</td>
                <td className={styles.numCol}>{r.total_pecas}</td>
                <td className={styles.numCol}>
                  {r.total_valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
