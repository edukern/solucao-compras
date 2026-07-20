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
2. **Push para `main`** → GitHub Actions (`deploy-web.yml`) builda e publica no Cloudflare Pages (~2 min). Não usa Vercel.
3. Para mudanças de schema: criar nova migração em `supabase/migrations/` e aplicar via `supabase db push`

## Convenções

- Idioma: português brasileiro em todas as interfaces
- Commits em inglês com prefixo `feat/fix/style/chore`
- Roteamento client-side via `useState` (sem react-router)
- CSS Modules para estilos de tela, variáveis CSS para tokens globais
- Todas as queries ao banco passam pelo Supabase JS client com RLS ativo

## Checklist antes de abrir ou atualizar um Pull Request

Vale para qualquer Claude trabalhando neste repo (inclusive em clones de colaboradores). Um PR (#7) já causou retrabalho por pular estes pontos — servem pra evitar o mesmo ping-pong de revisão:

1. **Sincronizar com a `main` antes de abrir/atualizar o PR.** Este repo reorganiza arquivos com frequência (ex.: `Compras.jsx` foi quebrado em vários arquivos em `screens/`). Uma branch parada por dias pode editar um arquivo que na `main` já mudou de lugar ou de forma — nesse caso, resolver o conflito "aceitando o seu lado" não basta; é preciso reaplicar a mudança no arquivo atual. Antes de pedir revisão, rodar `git fetch origin main` + `git rebase origin/main` (ou merge) e resolver qualquer conflito manualmente, entendendo o código novo — não só aceitar um dos lados.
2. **Validar o build localmente antes de pedir revisão.** Rodar `npm run build` (o mesmo comando do `.github/workflows/pr-check.yml`) e só pedir revisão com ele passando. Se o PR estiver marcado como `CONFLICTING` no GitHub, o check de CI pode nem chegar a rodar — resolva o conflito primeiro.
3. **Declarar decisões de negócio ambíguas na descrição do PR**, numa seção "Decisões que assumi". Sempre que a mudança tocar algo que pode variar por loja, por variante/cor-detalhe, ou que exponha dado interno pra fora (ex.: um campo de observação indo parar num PDF que o fornecedor vê), não decidir silenciosamente — escrever a suposição feita e pedir confirmação explícita do Eduardo na revisão. Isso evita reverter/re-perguntar depois do PR pronto.
4. **Nunca engolir erro silenciosamente em código que grava dado.** Nada de `.catch(() => {})` sem avisar o usuário — se uma escrita no banco falhar, a pessoa precisa saber (a tela tem que mostrar erro), senão ela acha que salvou e não salvou.
5. **Cuidado com inserts que podem duplicar.** Se uma ação (ex.: um botão) faz um INSERT sem constraint de unicidade no banco, um duplo-clique ou uma corrida de estado pode duplicar a linha. Trave o botão durante a operação e, se fizer sentido, adicione a constraint no banco.
