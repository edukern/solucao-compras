import { useState, useEffect } from 'react'
import { useCollection } from '../../contexts/CollectionContext'
import { supabase } from '../../lib/supabase'
import styles from './PorLoja.module.css'

async function totaisPorComprador(colecaoId) {
  // 1. IDs das sessões dessa coleção
  const { data: sessoes, error: se } = await supabase
    .from('sessoes')
    .select('id')
    .eq('colecao_id', colecaoId)
  if (se) throw se

  const sessaoIds = (sessoes ?? []).map(s => s.id)
  if (!sessaoIds.length) return []

  // 2. Visitas com pedidos e itens
  const { data, error } = await supabase
    .from('visitas')
    .select(`
      comprador_id,
      comprador:compradores(id, nome, ordem),
      pedidos(valor_unitario, desconto_pct, pedido_itens(qtd))
    `)
    .in('sessao_id', sessaoIds)
  if (error) throw error

  // 3. Agregar por comprador
  const mapa = new Map()
  for (const v of data ?? []) {
    const comp = v.comprador
    if (!comp) continue
    for (const p of v.pedidos ?? []) {
      const qtdTotal = (p.pedido_itens ?? []).reduce((s, i) => s + (Number(i.qtd) || 0), 0)
      const bruto    = qtdTotal * (p.valor_unitario ?? 0)
      const desconto = p.desconto_pct ? bruto * p.desconto_pct / 100 : 0
      const cur = mapa.get(comp.id) ?? { id: comp.id, nome: comp.nome, ordem: comp.ordem, pecas: 0, valor: 0 }
      cur.pecas += qtdTotal
      cur.valor += bruto - desconto
      mapa.set(comp.id, cur)
    }
  }
  return [...mapa.values()].sort((a, b) => a.ordem - b.ordem)
}

export default function PorLoja() {
  const { active } = useCollection()
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(false)
  const [erro,    setErro]    = useState(null)

  useEffect(() => {
    if (!active?.id) { setRows([]); return }
    setLoading(true)
    setErro(null)
    totaisPorComprador(active.id)
      .then(setRows)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [active?.id])

  const totalPecas = rows.reduce((s, r) => s + r.pecas, 0)
  const totalValor = rows.reduce((s, r) => s + r.valor, 0)

  const fmt = v => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (!active) return <p className={styles.hint}>Selecione uma coleção para ver os totais por loja.</p>

  return (
    <div className={styles.wrap}>
      {loading && <p className={styles.hint}>Carregando…</p>}
      {erro    && <p className={styles.erro}>{erro}</p>}

      {!loading && rows.length === 0 && !erro && (
        <p className={styles.hint}>Nenhum dado registrado para esta coleção.</p>
      )}

      {!loading && rows.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Loja</th>
              <th className={styles.numCol}>Peças</th>
              <th className={styles.numCol}>Valor total</th>
              <th className={styles.numCol}>% valor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.nome}</td>
                <td className={styles.numCol}>{r.pecas.toLocaleString('pt-BR')}</td>
                <td className={styles.numCol}>R$ {fmt(r.valor)}</td>
                <td className={styles.numCol}>
                  {totalValor > 0 ? ((r.valor / totalValor) * 100).toFixed(1) + '%' : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td className={styles.numCol}><strong>{totalPecas.toLocaleString('pt-BR')}</strong></td>
              <td className={styles.numCol}><strong>R$ {fmt(totalValor)}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  )
}
