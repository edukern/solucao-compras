const FEATURES = [
  {
    icon: '💬',
    titulo: 'WhatsApp automático',
    status: 'desenvolvimento',
    desc: 'Candidatos recebem mensagem no WhatsApp quando avançam de etapa — confirmação de horário, endereço da entrevista e contato da loja, disparados automaticamente ao mover o candidato no kanban.',
    ref: 'Paradox · Gupy',
  },
  {
    icon: '🏪',
    titulo: 'Filtro por unidade',
    status: 'desenvolvimento',
    desc: 'Filtre candidatos e vagas por loja — Nova Hartz, Três Coroas, Igrejinha, Osório. O RH central vê todas as unidades; o gestor de cada loja acessa só os candidatos da sua.',
    ref: 'Padrão ATS para redes varejistas',
  },
  {
    icon: '📊',
    titulo: 'Funil de contratação',
    status: 'desenvolvimento',
    desc: 'Quantas candidaturas chegaram? Quantas avançaram para entrevista? Quanto tempo levou cada etapa? Dados do processo seletivo por vaga, por período e por loja.',
    ref: 'Greenhouse · Gupy Analytics',
  },
  {
    icon: '🎥',
    titulo: 'Vídeo de apresentação',
    status: 'breve',
    desc: 'Em lugar do texto de motivação, o candidato grava 60 segundos pelo celular. Para vagas de atendimento e vendas, a forma como a pessoa se apresenta revela o que o formulário não captura.',
    ref: 'HireVue · Spark Hire',
  },
  {
    icon: '📝',
    titulo: 'Mini-teste comportamental',
    status: 'breve',
    desc: '5 situações reais do varejo respondidas em 3 minutos no celular. Como o candidato reage a um cliente insatisfeito? Sabe calcular troco? Score automático aparece no kanban antes da entrevista.',
    ref: 'TestGorilla · Sólides',
  },
  {
    icon: '🗂',
    titulo: 'Banco de talentos',
    status: 'breve',
    desc: 'Candidatos qualificados que não couberam na vaga atual ficam salvos com tags. Quando abrir nova seleção, o sistema sugere quem já passou pelo processo da Ponto E.',
    ref: 'Lever · Greenhouse',
  },
  {
    icon: '👥',
    titulo: 'Indicação de funcionários',
    status: 'breve',
    desc: 'Funcionários da Ponto E indicam pessoas por um link próprio. A indicação aparece no perfil do candidato com o nome de quem indicou — rastreável e possível de incentivar.',
    ref: 'Prática consolidada em varejo, franquias e hotéis',
  },
  {
    icon: '📄',
    titulo: 'Oferta digital',
    status: 'breve',
    desc: 'Envie a proposta de emprego pelo WhatsApp com cargo, salário e data de início. O candidato confirma com um clique — sem papel, sem impressora, sem precisar ir até a loja antes do primeiro dia.',
    ref: 'BambooHR · Kenoby',
  },
  {
    icon: '✅',
    titulo: 'Onboarding e período de experiência',
    status: 'breve',
    desc: 'Após a contratação, o sistema gera a lista de documentos a receber (RG, CTPS, foto 3×4) e alerta automaticamente quando se aproximam os 45 e 90 dias do período de experiência.',
    ref: 'Exigência CLT · Rotina de DP no varejo',
  },
]

const STATUS_CONFIG = {
  desenvolvimento: { label: 'Em desenvolvimento', bg: '#eff6ff', color: '#1d4ed8' },
  breve:           { label: 'Em breve',           bg: '#f3f4f6', color: '#6b7280' },
}

export default function Roadmap() {
  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.heading}>Próximas funcionalidades</h1>
          <p style={s.sub}>O que está sendo construído para as próximas versões do Bolt RH</p>
        </div>
      </div>

      <div style={s.grid}>
        {FEATURES.map(f => {
          const st = STATUS_CONFIG[f.status]
          return (
            <div key={f.titulo} style={s.card}>
              <div style={s.cardTop}>
                <span style={s.icon}>{f.icon}</span>
                <span style={{ ...s.statusBadge, background: st.bg, color: st.color }}>{st.label}</span>
              </div>
              <div style={s.titulo}>{f.titulo}</div>
              <div style={s.desc}>{f.desc}</div>
              <div style={s.ref}>Referência: {f.ref}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  header:      { marginBottom: 32 },
  heading:     { margin: '0 0 6px', fontSize: 24, fontWeight: 700, color: '#111' },
  sub:         { margin: 0, fontSize: 14, color: '#888' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card:        { background: '#fff', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 10 },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  icon:        { fontSize: 30, lineHeight: 1 },
  statusBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  titulo:      { fontSize: 15, fontWeight: 700, color: '#111' },
  desc:        { fontSize: 13, color: '#555', lineHeight: 1.6, flex: 1 },
  ref:         { fontSize: 11, color: '#bbb', borderTop: '1px solid #f3f4f6', paddingTop: 10, marginTop: 2 },
}
