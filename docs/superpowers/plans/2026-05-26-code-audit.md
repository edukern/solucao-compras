# Full Code Audit — Solução Compras

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auditoria completa da solução: bugs, qualidade de código, segurança (RLS/env vars), performance (bundle, queries) e dead code.

**Architecture:** Read-only na fase de análise; cada área de problema identificada se transforma em uma lista de fixes priorizados por impacto.

**Tech Stack:** React 18, Vite, Supabase JS v2, Node.js, CSS Modules.

---

## Escopo

| Área | O que verificar |
|------|-----------------|
| **Bugs** | Race conditions em async/await, states não limpos entre sessões, cálculos incorretos |
| **Segurança** | RLS policies completas, env vars não expostas, validação de input |
| **Performance** | Bundle size, queries N+1, re-renders desnecessários |
| **Padrões** | Consistência de estilo, dead code, duplicação |
| **Acessibilidade** | Labels em inputs, contraste de cores, foco de teclado |

---

## Task 1: Auditoria de segurança — RLS e env vars

**Files:**
- Read: `supabase/migrations/001_schema_inicial.sql`
- Read: `src/renderer/src/lib/supabase.js`
- Read: `.env.local` (verificar o que está exposto)

- [ ] **Step 1: Verificar RLS em todas as tabelas**

Executar via `mcp__1982d284__execute_sql`:
```sql
SELECT tablename,
       (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) AS num_policies,
       relrowsecurity
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
ORDER BY tablename;
```

Confirmar que TODAS as tabelas têm RLS habilitado e pelo menos 1 policy.
Tabelas críticas que precisam de policy de escrita restritiva: `pedidos`, `itens`, `sessoes`, `visitas`.

- [ ] **Step 2: Verificar policies de escrita**

```sql
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

Identificar tabelas com INSERT/UPDATE/DELETE sem restrição de `auth.uid()`.

- [ ] **Step 3: Verificar env vars expostas**

Em `src/renderer/src/lib/supabase.js`: confirmar que `VITE_SUPABASE_ANON_KEY` é a **anon key** (pública), não a service role key.

Checar se há secrets hardcoded em qualquer arquivo não-.gitignored.

```bash
# Verificar por service role / PAT tokens no código
grep -r "sbp_" src/ --include="*.js" --include="*.jsx"
grep -r "service_role" src/ --include="*.js" --include="*.jsx"
```

- [ ] **Step 4: Registrar achados**

Criar `docs/audit-security.md` com achados e prioridade (CRÍTICO / ALTO / MÉDIO / BAIXO).

---

## Task 2: Auditoria de bugs — async e state

**Files:**
- Read: `src/renderer/src/screens/Compras.jsx` (arquivo maior, ~1.200 linhas)
- Read: `src/renderer/src/contexts/AuthContext.jsx`

- [ ] **Step 1: Verificar cleanup de useEffect**

Todos os `useEffect` que fazem fetch devem ter cleanup function que seta um flag `let cancelled = true`. Verificar se há casos onde o componente pode desmontar enquanto fetch está em andamento, causando `setState` em componente morto.

Padrão seguro:
```js
useEffect(() => {
  let cancelled = false
  async function load() {
    const data = await service.load()
    if (!cancelled) setState(data)
  }
  load()
  return () => { cancelled = true }
}, [dep])
```

- [ ] **Step 2: Verificar reset de state ao mudar coleção/fornecedor**

Em `Compras.jsx`: quando o usuário muda de coleção ou abre uma nova sessão, states como `items`, `qtds`, `activeId`, `editingId` devem ser resetados. Verificar se há state "vazando" entre sessões.

- [ ] **Step 3: Verificar markup formula e conversão de tipos**

Confirmar que `parseFloat(str.replace(',', '.'))` é consistente em todo o código. Verificar se há casos onde vírgula e ponto convivem no mesmo cálculo.

- [ ] **Step 4: Verificar o campo `itens` (JSONB) — parsing defensivo**

Em `pedidos.js` service: o campo `itens` é JSONB. Verificar se há parsing defensivo quando `itens` é null ou malformado.

- [ ] **Step 5: Registrar achados**

Criar `docs/audit-bugs.md` com cada bug encontrado, arquivo:linha, e correção sugerida.

---

## Task 3: Auditoria de performance

**Files:**
- Read: `src/renderer/src/services/*.js`
- Run: `npm run build` (verificar bundle output)

- [ ] **Step 1: Medir bundle size**

```bash
cd "C:\Users\eduke\Solução Compras"
npm run build 2>&1
```

Verificar tamanho total dos chunks. Benchmarks aceitáveis:
- `index.html`: < 2 KB
- JS total: < 500 KB (gzip)
- CSS total: < 100 KB

- [ ] **Step 2: Verificar queries N+1**

Nos services que fazem join, verificar se estão usando `.select()` com joins inline do Supabase (preferível) ou fazendo múltiplas queries em loop (problema de N+1).

Exemplo problemático:
```js
// RUIM — N+1
for (const sessao of sessoes) {
  const pedidos = await supabase.from('pedidos').select('*').eq('visita_id', sessao.id)
}

// BOM — join único
const { data } = await supabase.from('sessoes').select('*, visitas(*, pedidos(*))')
```

- [ ] **Step 3: Verificar re-renders no Compras.jsx**

Identificar funções e objetos criados inline em JSX que causam re-renders desnecessários. Candidatos: handlers `onChange` definidos inline, arrays derivados de state recalculados a cada render.

- [ ] **Step 4: Verificar uso de `window.api.*` restante**

```bash
grep -r "window\.api" src/renderer/src --include="*.jsx" --include="*.js"
```

Qualquer chamada a `window.api.*` vai falhar silenciosamente no browser. Listar e planejar migração.

- [ ] **Step 5: Registrar achados**

Criar `docs/audit-performance.md`.

---

## Task 4: Auditoria de qualidade de código e dead code

**Files:**
- Read: todos os `.jsx` e `.js` em `src/renderer/src/`

- [ ] **Step 1: Identificar dead code**

```bash
# Verificar imports não usados (TypeScript/ESLint ajudaria, mas checar manualmente)
grep -r "import " src/renderer/src --include="*.jsx" | head -50
```

Verificar especificamente:
- Funções definidas mas nunca chamadas
- Estados que são setados mas nunca lidos
- Props passadas mas não usadas nos componentes filhos

- [ ] **Step 2: Verificar consistência de padrões**

Verificar se todos os services seguem o mesmo padrão:
```js
export const nomeService = {
  async metodo() {
    const { data, error } = await supabase.from('...').select('...')
    if (error) throw error
    return data ?? []
  }
}
```

Identificar divergências (alguns retornam `data`, outros retornam `data ?? []`, etc.).

- [ ] **Step 3: Verificar duplicação de lógica**

Verificar se `roundTo99()` e `calcPrecoVenda()` são definidos em múltiplos lugares. Candidatos para extração para um `src/renderer/src/lib/calc.js`.

- [ ] **Step 4: CSS — verificar classes não usadas**

Verificar `.module.css` por classes definidas mas não referenciadas em seus respectivos `.jsx`.

- [ ] **Step 5: Gerar relatório final consolidado**

Criar `docs/audit-final.md` com:
- Resumo executivo (1 parágrafo)
- Top 5 issues por prioridade com arquivo:linha e correção
- Estimativa de esforço total
- Recomendações de arquitetura para versão futura

---

## Entregável esperado

Ao final deste plano: 3 arquivos de audit em `docs/` com achados concretos e arquivo:linha para cada issue. Os fixes prioritários (CRÍTICO/ALTO) devem ser implementados na mesma sessão ou no plano de follow-up imediato.
