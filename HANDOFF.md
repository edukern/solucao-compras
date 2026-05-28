# HANDOFF — Bolt Compras

## Objetivo principal
App React + Supabase para gestão de pedidos de compra da rede Irmãos Backes.
Repo: https://github.com/edukern/solucao-compras
App web: https://bolt-compras.pages.dev (Cloudflare Pages, auto-deploy no push)

---

## 🔴 BUG ABERTO — PRIORIDADE 1: Erro ao retomar sessão (Phase 2)

**Sintoma:** Clicar "Editar" em qualquer sessão existente no Histórico → Error Boundary exibe:
> `Cannot read properties of undefined (reading 'reduce')`

**Onde:** `RegistrarPedidoSessao` (Phase 2), durante o primeiro render após `handleRetomarSessao`.

**O que `handleRetomarSessao` faz (linhas ~3399–3473 do Compras.jsx):**
1. Chama `sessoesService.byId(ses.id)` e `pedidosService.itensPorFornecedor(ses.id)` em paralelo
2. Constrói `visitasEnriquecidas` (array com `id`, `comprador_id`, `comprador_nome`, etc.)
3. Constrói `items` como union de todas as referências de todas as visitas (Map por referencia)
4. Constrói `qtds` como `{ [referencia]: { [visitaId]: { [tamanho]: qty } } }`
5. Chama `setSessao`, `setVisitas(visitasEnriquecidas)`, `setRecoveryInitial({items, qtds, ...})`, `setPhase(2)` — tudo em uma batch

**O que o Phase 2 faz:**
- `RegistrarPedidoSessao` recebe `visitas={visitas}` (prop do parent) e `initialItems={recoveryInitial?.items ?? []}`
- Internamente: `const [items, setItems] = useState(initialItems)` e `const [qtds, setQtds] = useState(initialQtds)`
- O erro ocorre porque algo que `.reduce()` é chamado está `undefined`

**Candidatos (todas as chamadas `.reduce()` em Phase 2, ~linhas 660–1840):**
- `visitas.reduce(...)` — linhas 664, 1412, 1413, 1792, 1839, 1840 — `visitas` é a prop (deveria ser array)
- `items.reduce(...)` — linhas 668, 672 — `items` é state (deveria ser array)
- `Object.values(loja).reduce(...)` — linha 660 — sempre seguro

**Fix já aplicado (não resolveu):** A função `handleRetomarSessao` foi reescrita para construir `items` como union de TODOS as refs de TODAS as visitas (antes só pegava da primeira visita com dados). Mesmo após essa correção o erro persiste.

**Hipóteses não descartadas:**
- `visitas` ou `items` está chegando como `undefined` para o componente no primeiro render (issue de batching assíncrono?)
- Algum item com `tipo_grade` ausente causando cascade de undefined em alguma função helper
- O auto-save `useEffect` (linha 620–623) rodando antes do componente estar estabilizado

**Próximo passo recomendado:**
Adicionar defensive guards nos 4 helpers de reduce (linhas 660–672) e também nos inline calls das linhas 1412, 1413, 1792, 1839, 1840:
```js
// Linha 664
function totalQtdItem(localId) {
  return (visitas ?? []).reduce((s, v) => s + totalQtdLoja(localId, v.id), 0)
}
// Linha 668
function totalQtdVisita(visitaId) {
  return (items ?? []).reduce((s, it) => s + totalQtdLoja(it.localId, visitaId), 0)
}
// Linha 672
function totalValorVisita(visitaId) {
  return (items ?? []).reduce((s, it) => {
    const unit = parseFloat((it.valor ?? '').replace(',', '.')) || 0
    return s + totalQtdLoja(it.localId, visitaId) * unit
  }, 0)
}
```
E adicionar `console.log('PHASE2 MOUNT', { visitas, items: initialItems })` no topo de `RegistrarPedidoSessao` para ver no DevTools o que chega.

---

## O que foi concluído na sessão 13 (2026-05-28): Reescrita do PDF (código aplicado, não commitado)

### Feature: Reescrita completa da geração de PDF de pedidos

1. **`PDF_STYLES` reescrito** — layout compacto A4 landscape com fonte 7.5px, `table-layout: fixed`, 27 colunas.
2. **`gerarHTMLOrdem` reescrita** — uma tabela horizontal por loja com todos os produtos; cabeçalho 2 colunas (info da loja à esquerda, fornecedor/pedido à direita); pares T/Q para até 10 tamanhos; rodapé com Total Bruto, Desc.%, Total Líquido.
3. **Helpers adicionados:** `MESES_PT`, `fmtEntrega` (converte ISO para "30 DE AGOSTO"), `fmtV` (formato pt-BR), `N_TPAIRS`.
4. **Migration `016_compradores_pdf_info.sql`** — adiciona colunas `fantasia`, `ie`, `email`, `telefone`, `endereco` à tabela `compradores`.
5. **`sessoes.js` atualizado** — `normalizeVisitas` e todas as 3 queries agora incluem os 5 novos campos.
6. **5 locais de vis-building em `Compras.jsx`** atualizados para propagar os novos campos.
7. **Compatibilidade defensive:** `p.itens ?? []` e `p.tipo_produto ?? p.segmentacao?.tipo_produto` para funcionar com pedidos do Phase 3 (sem `itens`) e do banco (com `segmentacao` nested).

> ⚠️ **Migration pendente de aplicar no Supabase:**
> Rodar via Supabase SQL Editor (projeto `bhxpkysueyoblizkvomb`):
> ```sql
> ALTER TABLE compradores
>   ADD COLUMN IF NOT EXISTS fantasia  TEXT,
>   ADD COLUMN IF NOT EXISTS ie        TEXT,
>   ADD COLUMN IF NOT EXISTS email     TEXT,
>   ADD COLUMN IF NOT EXISTS telefone  TEXT,
>   ADD COLUMN IF NOT EXISTS endereco  TEXT;
> ```
> Depois preencher esses campos para cada loja. Sem isso, o cabeçalho do PDF mostra apenas nome/CNPJ/cidade (sem erro — graceful fallback).

---

## O que foi concluído na sessão 12 (2026-05-28)

### Feature: Home de sessões + aviso multi-device + modo visualização (commit `a77d840`)

1. **Phase 0 — Home integrada ao Compras:** Lista histórica de sessões com totais (peças + valor) diretamente na tela inicial. Removido o sistema de abas `'nova'|'historico'` — a home É o histórico.
2. **Aviso multi-device via Supabase Presence:** Canal `session-presence-{id}` detecta quantos dispositivos têm a mesma sessão aberta e exibe banner amarelo de risco de sobrescrita.
3. **Phase 4 — Modo visualização (somente leitura):** Fetch completo dos dados sem edição; auto-refresh a cada 30s; botão de refresh manual com timestamp.
4. **Botões de ação no Histórico:** "Visualizar" (Phase 4) e "Editar" (Phase 2) por sessão.

### Feature: Preenchimento colaborativo por loja (Phase 5) — **não commitado ainda**

5. **`handleLiberar`** no Phase 2: cria pedidos-template para todas as lojas simultaneamente usando `inicializarColaboracao` (`ON CONFLICT DO NOTHING` — não sobrescreve preenchimentos existentes).
6. **`PreencherMinhaLoja`** (Phase 5): cada comprador logado vê apenas sua própria loja; preenche quantidades por grade; salva via `salvarPedidosVisita(visitaId, updates)`.
7. **Botão "Preencher"** no Histórico: visível somente para o comprador que tem visita naquela sessão.
8. **Novos serviços:** `pedidos.inicializarColaboracao` e `pedidos.salvarPedidosVisita`.
9. **CSS Phase 5:** `.btnLiberar`, `.liberadoBanner`, `.preencherWaiting`, `.preencherLojaName`, `.savedBadge`, `.btnHistPreencher` etc.

> ⚠️ **Commit pendente** — todos os trabalhos das sessões 13+14 estão não-commitados (hook bloqueou). Rodar no terminal:
> ```bash
> cd "C:\Users\eduke\Solução Compras"
> git add src/renderer/src/screens/Compras.jsx src/renderer/src/services/sessoes.js supabase/migrations/016_compradores_pdf_info.sql HANDOFF.md
> git commit -m "feat: PDF tabular horizontal + corrige retomar sessão (Phase 2)"
> git push
> ```
> **Nota:** `Compras.module.css` e `pedidos.js` do Phase 5 foram commitados em `4d8fbe7`. Apenas os 4 arquivos acima estão pendentes agora.

---

## Próximos passos (específicos e acionáveis)

### 0. Criar CLAUDE.md no projeto (reduzir tokens por sessão) ⭐ FAZER PRIMEIRO

**Por quê:** `Compras.jsx` tem 3.600+ linhas. A cada sessão Claude precisa ler o arquivo inteiro para recuperar contexto. Um `CLAUDE.md` na raiz do projeto serve como mapa permanente — Claude lê ~100 linhas de contexto em vez de 3.600 de código.

**O que incluir no CLAUDE.md:**

```markdown
# Solução Compras — Mapa do projeto

## Stack
React 18 + Vite + Supabase. SPA (sem Electron). Deploy: Cloudflare Pages (bolt-compras.pages.dev).
Hook git: prevent-destructive-commands.py bloqueia `git add`/`git commit` — usuário roda git manualmente.

## Compras.jsx — estrutura (~3600 linhas)

### Componentes internos (ordem no arquivo)
- `AddItemForm` (~l100) — formulário de nova referência
- `RegistrarPedidoSessao` (~l558) — Phase 2: editor de itens + grades
  - estado: items, qtds, visitas (prop), activeId, lojaIdx, fillMode
  - qtds shape: { [referencia]: { [visitaId]: { [tamanho]: qty } } }
  - funções helper: totalQtdLoja (l658), totalQtdItem (l663), totalQtdVisita (l667), totalValorVisita (l671)
- PDF helpers (~l1878): gerarHTMLOrdem, wrapDoc, gerarPDFSessao
- `FecharSessao` (~l2100) — Phase 3
- `VisualizarSessao` (~l2400) — Phase 4
- `Historico` (~l2490) — Phase 0 / histórico de sessões
- `PreencherMinhaLoja` (~l2877) — Phase 5
- `Compras` (export default, ~l3280) — orchestrator: phases 0–5, state global

### Orchestrator (Compras, ~l3280)
- Phases: 0=home, 1=nova sessão, 2=registrar, 3=fechar, 4=visualizar, 5=preencher loja
- handleRetomarSessao (~l3399): carrega sessão existente → Phase 2
- handleStart (~l3353): nova sessão → Phase 2
- visitas shape: { id (=visita_id), comprador_id, comprador_nome, comprador_cnpj, ... }

## Serviços
- sessoes.js: byId, list, create, normalizeVisitas (id→visita_id)
- pedidos.js: salvarBatch, itensPorFornecedor, salvarPedidosVisita, inicializarColaboracao
- compradores/fornecedores/segmentacoes: simples CRUD

## Banco (Supabase bhxpkysueyoblizkvomb)
sessoes → visitas → pedidos → pedido_itens
compradores(is_editor boolean), fornecedores, segmentacoes, colecoes, projecoes
constraint: pedidos(visita_id, referencia) UNIQUE

## Convenções
- `referencia` = código do produto (string), não `ref` (palavra reservada JS)
- `classificacao` é derivada de GRADE_DEFINITIONS[tipo_grade].classificacao — nunca armazenada diretamente
- `localId` em items do Phase 2 = ped.referencia quando carregado via Retomar
```

**Como criar:** abrir nova sessão e pedir: *"crie um CLAUDE.md em 'C:\Users\eduke\Solução Compras' com o mapa do projeto baseado no HANDOFF.md e nas instruções abaixo"* — passar o template acima como base.

---

### A. Controle de acesso: modo edição global vs. preencher por loja ⭐ PRIORITÁRIO

**Contexto:** Hoje qualquer usuário logado no Phase 2 pode adicionar/editar referências. A ideia é separar dois perfis:

| Perfil | Pode fazer |
|---|---|
| **Editor global** (organizador da sessão) | Phase 2 completo: adicionar refs, valores, liberar, fechar, gerar PDF |
| **Comprador/loja** | Phase 5 apenas: ver itens liberados e preencher quantidades da sua loja |

**Implementação sugerida:**

1. **Determinar perfil pelo `AuthContext`:**
   - O `comprador` logado tem um `comprador.id`. A sessão foi criada por um usuário específico (`sessao.criado_por_user_id` — novo campo ou inferir pelo primeiro `visita`).
   - Alternativa mais simples: campo booleano `is_editor` em `compradores` (ou `user_compradores`) — `true` para quem pode editar globalmente.
   - Adicionar coluna: `ALTER TABLE compradores ADD COLUMN is_editor boolean DEFAULT false;`

2. **No Historico (`Compras.jsx`):**
   - Botão "Editar" → só exibir se `comprador.is_editor === true`
   - Botão "Preencher" → exibir se `minhaVisita` existe (já funciona assim)

3. **No Phase 2 (`RegistrarPedidoSessao`):**
   - Se `!comprador.is_editor` → redirecionar para Phase 5 automaticamente
   - O botão "Liberar para preenchimento" já faz a ponte correta

4. **Migration:**
```sql
-- supabase/migrations/009_compradores_editor.sql
ALTER TABLE compradores ADD COLUMN IF NOT EXISTS is_editor boolean DEFAULT false;
```

> ⚠️ **ORDEM OBRIGATÓRIA — não pular etapas:**
> 1. Escrever o código (guards no Phase 2 e Historico)
> 2. Aplicar a migration (cria a coluna com `DEFAULT false` — todos ficam sem acesso)
> 3. **Antes de fazer deploy**, rodar no Supabase SQL Editor:
>    ```sql
>    UPDATE compradores SET is_editor = true WHERE id IN (<ids dos organizadores>);
>    ```
>    Para descobrir os IDs: `SELECT id, nome FROM compradores ORDER BY nome;`
> 4. Só então fazer o deploy/push
>
> Se o deploy for feito antes do UPDATE, os organizadores perdem acesso ao Phase 2 imediatamente.

**Arquivos a tocar:** `AuthContext.jsx` (expor `comprador.is_editor`), `Compras.jsx` (Phase 0 Historico + Phase 2 guard), migration nova.

---

### B. Grade Plus Size: mostrar G1–G4 com expansão por tamanho ⭐ PRIORITÁRIO

**Contexto:** Grade EX/Plus Size tem até 10 tamanhos (G1–G10). Exibir todos de uma vez polui a tela (ver foto). A maioria dos pedidos usa apenas G1–G4.

**Comportamento desejado:**
- Por padrão: mostrar G1, G2, G3, G4 + botão `+G5` ao final
- Clicar `+G5` → G5 aparece + botão `+G6` ao final
- Clicar `+G6` → G6 aparece + botão `+G7` etc.
- Cada tamanho revelado fica visível permanentemente (não colapsa)
- Também há botão `−G1` no início para revelar G1 menor (já existe, manter)

**Implementação:**

O estado de "tamanhos visíveis" fica por pedido. Pode ser um `Set` ou índice máximo visível:

```js
// Estado por pedido (usar índice máximo visível, não Set)
const [visibleUpTo, setVisibleUpTo] = useState({}) 
// { [pedidoId]: maxIndex }  — default: índice de G4 (3 para array 0-based)

const DEFAULT_VISIBLE = 4 // G1 a G4 = índices 0..3

function handleExpandSize(pedidoId, newIdx) {
  setVisibleUpTo(prev => ({ ...prev, [pedidoId]: newIdx }))
}
```

**No render da grade (componente `PreencherMinhaLoja` e `RegistrarPedidoSessao`):**
```jsx
{tamanhos.map((tam, idx) => {
  const maxVisible = visibleUpTo[pedId] ?? DEFAULT_VISIBLE - 1
  if (idx > maxVisible) return null
  return <input key={tam} ... />
})}
{/* Botão para revelar próximo tamanho */}
{(() => {
  const maxVisible = visibleUpTo[pedId] ?? DEFAULT_VISIBLE - 1
  const nextIdx = maxVisible + 1
  if (nextIdx >= tamanhos.length) return null
  return (
    <button
      className={styles.btnExpandSize}
      onClick={() => handleExpandSize(pedId, nextIdx)}
    >
      +{tamanhos[nextIdx]}
    </button>
  )
})()}
```

**Afeta:** `PreencherMinhaLoja` (Phase 5) e provavelmente a grade em `RegistrarPedidoSessao` (Phase 2). Buscar uso de `tamanhosDeTipoGrade` em `Compras.jsx` para localizar os pontos exatos.

**CSS novo:** `.btnExpandSize` — estilo discreto, similar ao `+PP`/`+XG` já existentes.

---

### C. Migrations pendentes de sessões anteriores (aplicar via Supabase MCP se ainda não feito)

- `supabase/migrations/004_data_entrega_sessoes.sql` — ADD COLUMN data_entrega em sessoes
- `supabase/migrations/008_fornecedores_padrao.sql` — ADD COLUMN vendedor_padrao, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct em fornecedores

---

### D. Corrigir formato de coleção no Histórico (cosmético, fácil)

`hist_grade` usa `colecao_id` como `'2026-1'`. Aparece cru em vez de `'26/1'`.

```js
// src/renderer/src/lib/utils.js
export function fmtColecao(id) {
  const [yr, s] = (id ?? '').split('-')
  return yr ? `${parseInt(yr) % 100}/${s}` : id
}
```

Arquivos: `GradeHistorica.jsx` ~l82, `TendenciasLoja.jsx` ~l87, `CurvaABC.jsx` ~l66.

---

### E. Fornecedor nome no PDF (bug pré-existente, médio)

`sessao.fornecedor_nome` fica undefined após `sessoesService.create()`. Corrigir em `IniciarSessao`:
```js
const forn = forns.find(f => String(f.id) === fornId)
onStart({ ...sessao, fornecedor_nome: forn?.nome ?? '' }, lojasPresentes)
```

---

### F. Ordenar tamanhos por grade no Histórico (polimento, médio)

`GradeHistorica.jsx` extrai tamanhos sem ordenar pela grade. Usar `GRADE_DEFINITIONS[selectedSeg?.tipo_grade]?.tamanhos` para ordenar corretamente.

---

## Arquivos-chave do projeto

| Arquivo | Responsabilidade |
|---|---|
| `src/renderer/src/screens/Compras.jsx` | Tela principal — 5 phases + todos os sub-componentes |
| `src/renderer/src/screens/Compras.module.css` | CSS de Compras (>2400 linhas) |
| `src/renderer/src/services/pedidos.js` | CRUD pedidos, itens, visitas |
| `src/renderer/src/services/sessoes.js` | CRUD sessões + stats |
| `src/renderer/src/contexts/AuthContext.jsx` | user, comprador, signIn/signOut |
| `src/renderer/src/lib/grades.js` | GRADE_DEFINITIONS, tamanhosDeTipoGrade |

---

## Decisões técnicas importantes

- **Phases de navegação:** 0=home/histórico, 1=nova sessão, 2=registrar pedidos, 3=fechar sessão, 4=visualizar (readonly), 5=preencher minha loja
- **Collaborative fill:** `inicializarColaboracao` usa `ignoreDuplicates: true` → nunca sobrescreve preenchimentos de compradores. `salvarPedidosVisita` salva apenas a visita do comprador logado (sem tocar outras lojas).
- **Supabase Presence:** Custo ~0 para poucos usuários (free tier cobre). Canal destruído no unmount via `supabase.removeChannel()`.
- **`referencia` (não `ref`):** coluna da tabela `pedidos` para o código de referência do item.
- **`classificacao` é derivada**, não armazenada — calculada via `GRADE_DEFINITIONS[tipo_grade].classificacao`.
- **Stack:** React (Vite) + Supabase (backend único). Electron removido. Projeto Supabase: `bhxpkysueyoblizkvomb`.
