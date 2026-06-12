export const color = {
  // Texto
  text:       '#111',     // títulos, conteúdo principal
  textMid:    '#444',     // labels, texto secundário
  textSoft:   '#666',     // descrições, placeholders
  textMuted:  '#888',     // subtítulos, metadados
  textFaint:  '#94a3b8',  // sidebar itens inativos

  // Superfícies
  bg:         '#f5f5f5',  // fundo de página
  surface:    '#fff',     // cards, painéis
  surfaceAlt: '#f8fafc',  // fundo de item dentro de card (ex: kanban card)

  // Bordas
  border:     '#ddd',     // inputs, separadores
  borderMid:  '#e5e7eb',  // botões secundários, divisores leves

  // Ações
  primary:    '#111',     // botões primários, botão Entrar
  danger:     '#e74c3c',  // erros inline
  dangerBg:   '#fef2f2',  // fundo de mensagem de erro
  success:    '#16a34a',  // valores monetários, status aberto

  // Sidebar (Bolt Compras / Bolt RH)
  sidebar:        '#1e293b',
  sidebarBorder:  '#334155',
  sidebarItem:    '#94a3b8',
  sidebarActive:  '#334155',

  // Branding
  bolt:       '#f59e0b',  // ⚡ amarelo do "Bolt"
}

export const radius = {
  sm:   6,
  md:   8,
  lg:   12,
  full: 9999,
}

export const shadow = {
  card: '0 4px 24px rgba(0,0,0,.08)',  // cards principais, modal
  list: '0 1px 4px rgba(0,0,0,.06)',   // cards de lista, kanban
}

export const font = {
  family: 'system-ui, -apple-system, sans-serif',
  size: {
    xs:   11,
    sm:   12,
    base: 13,
    md:   14,
    lg:   15,
    xl:   16,
    '2xl': 22,
    '3xl': 24,
  },
  weight: {
    normal:  400,
    medium:  500,
    semibold: 600,
    bold:    700,
  },
}

export const space = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
}
