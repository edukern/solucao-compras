import { useState, useEffect } from 'react'

const STEPS = [
  {
    page: 'dashboard',
    icon: '⚡',
    titulo: 'Bolt RH — Seleção simplificada',
    desc: 'Plataforma completa para gerenciar o processo seletivo da Ponto E — do formulário público ao kanban de acompanhamento, tudo em um sistema integrado.',
  },
  {
    page: 'vagas',
    icon: '📋',
    titulo: 'Gestão de vagas',
    desc: 'Crie uma vaga com título, descrição e unidade. O sistema gera um link exclusivo — você cola no WhatsApp ou na bio do Instagram e os candidatos preenchem pelo celular, sem baixar nenhum app.',
  },
  {
    page: 'vagas',
    icon: '📱',
    titulo: 'Portal do candidato',
    desc: 'O candidato acessa o link no celular e preenche o formulário em 4 etapas: dados de contato, perfil pessoal, formação e motivação. Ao final, pode fazer upload do currículo.',
  },
  {
    page: 'vagas',
    icon: '🗂',
    titulo: 'Kanban de seleção',
    desc: 'Cada vaga tem um kanban com etapas pré-definidas: Triagem → Background Check → Entrevista RH → Entrevista Gestor → Aprovado. Mova candidatos entre etapas com um clique.',
  },
  {
    page: 'candidatos',
    icon: '👤',
    titulo: 'Perfil completo do candidato',
    desc: 'Todas as respostas do formulário, notas da entrevista presencial e histórico de background check reunidos em um perfil. Busque qualquer candidato por nome ou CPF.',
  },
  {
    page: 'check',
    icon: '🔍',
    titulo: 'Background Check',
    desc: 'Consulta simultânea na Boa Vista SCPC e SPC Brasil. Score de crédito, restrições e protestos em segundos — resultado salvo automaticamente no perfil do candidato.',
  },
  {
    page: 'roadmap',
    icon: '🚀',
    titulo: 'O que vem por aí',
    desc: 'O Bolt RH está em desenvolvimento ativo. A seguir, as funcionalidades sendo preparadas para as próximas versões.',
  },
]

export default function Tour({ navigate, onClose }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    navigate(STEPS[step].page)
  }, [step])

  const current = STEPS[step]
  const isFirst = step === 0
  const isLast  = step === STEPS.length - 1

  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        <div style={styles.dots}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{ ...styles.dot, background: i === step ? '#111' : '#ddd', transform: i === step ? 'scale(1.25)' : 'scale(1)' }}
            />
          ))}
        </div>

        <div style={styles.icon}>{current.icon}</div>
        <div style={styles.titulo}>{current.titulo}</div>
        <div style={styles.desc}>{current.desc}</div>

        <div style={styles.counter}>{step + 1} / {STEPS.length}</div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.btnClose}>Fechar</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isFirst && (
              <button onClick={() => setStep(prev => prev - 1)} style={styles.btnNav}>← Anterior</button>
            )}
            {isLast ? (
              <button onClick={onClose} style={styles.btnPrimary}>Concluir</button>
            ) : (
              <button onClick={() => setStep(prev => prev + 1)} style={styles.btnPrimary}>Próximo →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  backdrop:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 48px' },
  card:       { background: '#fff', borderRadius: 18, padding: '32px 36px', width: 540, boxShadow: '0 24px 64px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', gap: 14 },
  dots:       { display: 'flex', gap: 8, justifyContent: 'center' },
  dot:        { width: 8, height: 8, borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s' },
  icon:       { fontSize: 40, lineHeight: 1, textAlign: 'center', marginTop: 4 },
  titulo:     { fontSize: 20, fontWeight: 700, color: '#111', textAlign: 'center' },
  desc:       { fontSize: 14, color: '#555', lineHeight: 1.7, textAlign: 'center' },
  counter:    { fontSize: 12, color: '#ccc', textAlign: 'center' },
  footer:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  btnClose:   { background: 'none', border: 'none', fontSize: 13, color: '#bbb', cursor: 'pointer', padding: '4px 0' },
  btnNav:     { padding: '9px 18px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, cursor: 'pointer', color: '#444' },
  btnPrimary: { padding: '9px 22px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
}
