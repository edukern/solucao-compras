import { useState } from 'react'
import GradeHistorica from './historico/GradeHistorica'
import TendenciasLoja from './historico/TendenciasLoja'
import Projecoes      from './historico/Projecoes'
import styles         from './Relatorios.module.css'   // reutiliza o padrão de tabs

const ABAS = [
  { id: 'grade',      label: 'Grade por coleção' },
  { id: 'tendencias', label: 'Tendências por loja' },
  { id: 'projecoes',  label: 'Projeções' },
]

export default function Historico() {
  const [aba, setAba] = useState('grade')

  return (
    <div className={styles.container}>
      <nav className={styles.tabs}>
        {ABAS.map(a => (
          <button
            key={a.id}
            className={`${styles.tab} ${aba === a.id ? styles.active : ''}`}
            onClick={() => setAba(a.id)}
          >
            {a.label}
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {aba === 'grade'      && <GradeHistorica />}
        {aba === 'tendencias' && <TendenciasLoja />}
        {aba === 'projecoes'  && <Projecoes />}
      </div>
    </div>
  )
}
