import { Link } from 'react-router-dom'
import styles from './Landing.module.css'

const steps = [
  {
    num: '01',
    title: 'Criar coleção',
    desc: 'Define a temporada: Inverno 2026, Verão 2027…',
  },
  {
    num: '02',
    title: 'Planejar projeções',
    desc: 'O sistema calcula baseado no histórico das 2 coleções equivalentes anteriores + produtos permanentes.',
  },
  {
    num: '03',
    title: 'Registrar pedidos',
    desc: 'A cada negociação fechada: fornecedor + segmentação + grade de tamanhos.',
  },
  {
    num: '04',
    title: 'Acompanhar relatórios',
    desc: 'Visão em tempo real: projeção vs comprado, por fornecedor e por segmentação.',
  },
]

const ready = [
  'Dashboard com progresso geral',
  'Planejamento com cálculo de projeção',
  'Registro de pedidos',
  'Relatórios: Por Fornecedor e Por Segmentação',
]

const building = [
  'Interface para criar coleções',
  'Importação automática do histórico (planilhas Excel)',
  'Cadastro dos ~150 fornecedores do ERP',
  'Refinamento visual',
]

export default function Landing() {
  return (
    <div className={styles.page}>
      <div className={styles.mobileBanner}>
        Esta demonstração foi otimizada para desktop. Para melhor experiência, acesse de um computador.
      </div>

      {/* Seção 1 — Problema */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Gestão de compras de moda<br />sem planilhas.</h1>
          <p className={styles.heroSub}>
            Hoje: 100 arquivos Excel, sem visão consolidada.<br />
            Depois: um sistema, uma tela.
          </p>
          <Link to="/app" className={styles.ctaBtn}>Explorar o app →</Link>
        </div>
      </section>

      {/* Seção 2 — Fluxo */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Como funciona</h2>
        <div className={styles.timeline}>
          {steps.map(s => (
            <div key={s.num} className={styles.step}>
              <div className={styles.stepNum}>{s.num}</div>
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seção 3 — Status */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Status do projeto</h2>
        <div className={styles.statusGrid}>
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <span className={styles.statusIcon}>✅</span>
              <span>Funcionando hoje</span>
            </div>
            <ul className={styles.statusList}>
              {ready.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <span className={styles.statusIcon}>🔧</span>
              <span>Em construção</span>
            </div>
            <ul className={styles.statusList}>
              {building.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
        <div className={styles.ctaRow}>
          <Link to="/app" className={styles.ctaBtn}>Explorar o app →</Link>
        </div>
      </section>
    </div>
  )
}
