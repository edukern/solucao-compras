# Solução Compras — Contexto do Projeto

Plataforma web de gestão de compras e RH para o Grupo Backes/Streit.
Repositório: (verificar no GitHub sob o usuário edukern)

## Stack atual

**A versão Electron foi descontinuada. O produto roda inteiramente na web.**

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite (JSX, sem TypeScript no renderer) |
| Deploy | **Cloudflare Pages** (`bolt-compras.pages.dev`), auto-deploy no push via GitHub Actions (`deploy-web.yml`). `npm run build` → `dist/web`. |
| API | Cloudflare Pages Functions (`functions/api/[[path]].js`) |
| Banco | Supabase (Postgres) — projeto `bhxpkysueyoblizkvomb` |
| Vercel | Resquício (`vercel.json` no repo) — **não é a produção**; era do mock/início. |

> O código Electron ainda existe em `electron/`, `src/main/`, e as dependências `better-sqlite3` / `electron-builder` ainda estão no `package.json`, mas são resquícios da versão desktop e **não são usados em produção**.

## Sub-produtos

### Bolt Compras
Gestão de pedidos, planejamento e histórico de compras por loja.
- Screens: `Dashboard`, `Compras`, `Planejamento`, `Historico`, `Relatorios`, `Configuracoes`
- Auth: Supabase Auth + tabela `compradores` (vínculo usuário ↔ loja)

> **Bolt RH foi migrado** para o projeto separado `rh-pontoe` (Next.js, `github.com/lojaspontoe/ponto-e-hr-solution`), já em produção lá. O módulo embutido (`RhApp`, `RhConsulta`, endpoints `/api/vagas.js`, `/api/candidatos.js`, `/api/candidaturas.js`, `/api/auth-rh.js`, `/api/rh-apagar-candidato.js`, `/api/rh-setup.js`, `/api/consultar-rh.js`, `/api/consultar-rh-batch.js`) foi removido deste repo.

### Portal Público de Candidatura (pontoevagas)
Formulário público para candidatos, sem autenticação. Continua neste repo (não migrado).
- Endpoint: `/api/candidatura-publica.js`, `/api/vaga-publica.js`
- Dependem de `/api/_rh-lib.js`, `/api/_rh-crypto.js`, `/api/_rh-bureaus.js` (mantidos por causa desses dois endpoints)

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
2. **Push para `main`** → GitHub Actions (`deploy-web.yml`) builda e publica no Cloudflare Pages (~2 min). Não usa Vercel.
3. Para mudanças de schema: criar nova migração em `supabase/migrations/` e aplicar via `supabase db push`

## Convenções

- Idioma: português brasileiro em todas as interfaces
- Commits em inglês com prefixo `feat/fix/style/chore`
- Roteamento client-side via `useState` (sem react-router)
- CSS Modules para estilos de tela, variáveis CSS para tokens globais
- Todas as queries ao banco passam pelo Supabase JS client com RLS ativo
