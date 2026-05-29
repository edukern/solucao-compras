import { useState, useEffect } from 'react'
import { useCollection } from '../../contexts/CollectionContext'
import { useAuth } from '../../contexts/AuthContext'
import { relatorios } from '../../services/relatorios'
import { tamanhosDeTipoGrade } from '../../constants/grades'
import styles from './PorSegmentacao.module.css'

export default function PorSegmentacao() {
  const { active } = useCollection()
  const { comprador } = useAuth()
  const isEditor = comprador?.is_editor ?? false
  const [verGlobal, setVerGlobal] = useState(false)
  const compradorId = (isEditor && verGlobal) ? null : (comprador?.id ?? null)

  const [cards, setCards] = useState([])
  const [expanded, setExpanded] = useState(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!active) return
    setLoading(true)
    relatorios.totaisPorSegmentacao(active.id, compradorId)
      .then(setCards)
      .finally(() => setLoading(false))
  }, [active?.id, compradorId])

  function toggleCard(key) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  if (!active) return <p className={styles.hint}>Selecione uma coleção ativa.</p>

  return (
    <div>
      <div className={styles.toolbar}>
        {isEditor && (
          <button
            className={`${styles.globalToggle} ${verGlobal ? styles.globalToggleOn : ''}`}
            onClick={() => setVerGlobal(v => !v)}
          >
            {verGlobal ? 'Global' : 'Minha loja'}
          </button>
        )}
      </div>

      {loading && <p className={styles.hint}>Carregando…</p>}

      {!loading && cards.length === 0 && (
        <p className={styles.hint}>Nenhum pedido nesta coleção.</p>
      )}

      <div className={styles.grid}>
        {cards.map(card => {
          const open = expanded.has(card.key)
          return (
            <div key={card.key} className={styles.card}>
              <div className={styles.cardHeader} onClick={() => toggleCard(card.key)}>
                <div className={styles.cardTitle}>
                  <span className={styles.tipoProd}>{card.tipo_produto}</span>
                  <span className={styles.classif}>{card.classificacao}</span>
                </div>
                <div className={styles.cardTotals}>
                  <span><span className={styles.totLabel}>SKUs</span> {card.total_skus}</span>
                  <span><span className={styles.totLabel}>Peças</span> {card.total_pecas.toLocaleString('pt-BR')}</span>
                  <span><span className={styles.totLabel}>Valor</span> {card.total_valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</span>
                </div>
                <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>›</span>
              </div>

              {open && (
                <div className={styles.cardBody}>
                  {card.classes.map(cl => {
                    const tamanhos = tamanhosDeTipoGrade(cl.tipo_grade)
                    return (
                      <div key={cl.classe} className={styles.classeBlock}>
                        <div className={styles.classeHeader}>
                          <span className={styles.classeLabel}>{cl.classe}</span>
                          <span className={styles.classeSub}>{cl.pecas.toLocaleString('pt-BR')} pç · {cl.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className={styles.gradeRow}>
                          {tamanhos.map(tam => (
                            <div key={tam} className={styles.gradeCell}>
                              <span className={styles.gradeTam}>{tam}</span>
                              <span className={styles.gradeQtd}>{cl.grade[tam] ?? 0}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
