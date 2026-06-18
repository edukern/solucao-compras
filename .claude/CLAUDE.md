# Solução Compras — Contexto do Projeto

Plataforma web de gestão de compras e RH para o Grupo Backes/Streit.
Repositório: (verificar no GitHub sob o usuário edukern)

## Stack atual

**A versão Electron foi descontinuada. O produto roda inteiramente na web.**

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite (JSX, sem TypeScript no renderer) |
| Deploy | Vercel (`npm run build` → `dist/web`) |
| API | Vercel Serverless Functions (`/api/*.js`, Node.js) |
| Banco | Supabase (Postgres) — projeto `bhxpkysueyoblizkvomb` |
| Proxy alternativo | Cloudflare Pages Functions (`functions/api/[[path]].js`) |

> O código Electron ainda existe em `electron/`, `src/main/`, e as dependências `better-sqlite3` / `electron-builder` ainda estão no `package.json`, mas são resquícios da versão desktop e **não são usados em produção**.

## Sub-produtos

### Bolt Compras
Gestão de pedidos, planejamento e histórico de compras por loja.
- Screens: `Dashboard`, `Compras`, `Planejamento`, `Historico`, `Relatorios`, `Configuracoes`
- Auth: Supabase Auth + tabela `compradores` (vínculo usuário ↔ loja)

### Bolt RH
Recrutamento e seleção. Módulo embutido no mesmo app.
- Screens: `RhApp`, `RhConsulta`, `screens/rh/`
- API própria: `/api/vagas.js`, `/api/candidatos.js`, `/api/candidaturas.js`, `/api/auth-rh.js`
- Schema separado: `/api/_schema-rh.sql`

### Portal Público de Candidatura (pontoevagas)
Formulário público para candidatos, sem autenticação.
- Screen: `CandidaturaApp`
- Endpoint: `/api/candidatura-publica.js`, `/api/vaga-publica.js`

## Estrutura de pastas

```
api/                  Vercel Functions (Node.js)
functions/api/        Cloudflare Pages proxy
src/renderer/src/
  screens/            Telas do app
  components/         Componentes compartilhados
  contexts/           AuthContext, CollectionContext
  services/           Chamadas ao Supabase
  design/             Tokens de design (tokens.js)
supabase/migrations/  Histórico de schema (016 migrações)
```

## Como publicar

1. `npm run build` — compila para `dist/web`
2. `vercel --prod` ou push para `main` (se CI configurado)
3. Para mudanças de schema: criar nova migração em `supabase/migrations/` e aplicar via `supabase db push`

## Convenções

- Idioma: português brasileiro em todas as interfaces
- Commits em inglês com prefixo `feat/fix/style/chore`
- Roteamento client-side via `useState` (sem react-router)
- CSS Modules para estilos de tela, variáveis CSS para tokens globais
- Todas as queries ao banco passam pelo Supabase JS client com RLS ativo
