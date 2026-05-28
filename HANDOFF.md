# HANDOFF — Bolt Compras

## Objetivo principal
App desktop (Electron + React + Supabase) para gestão de compras de coleções de moda.
Repo: https://github.com/edukern/solucao-compras
App web (Pendencias): https://bolt-compras.pages.dev (Cloudflare Pages, auto-deploy no push)

---

## O que foi concluído nesta sessão

1. **Seed histórico importado** — 738 segmentações, 737 fornecedores, 1861 hist_fornecedor, 4573 hist_comprador_fornecedor, 7538 hist_comprador_produto, 11381 hist_grade (2019–2026). RLS reabilitado depois (migration 009).
2. **grade_historica populada** — migration 010 converteu hist_grade (colecao_id texto `'2026-1'`) para grade_historica (FK inteiro para colecoes), inseriu 15 coleções históricas, 11381 linhas. Planejamento 27/1 passou a funcionar com base N-1 (26/1) e N-2 (25/1).
3. **historico.js corrigido** — dois bugs de paginação: `colecoes()` e `segmentacoesComHistorico()` faziam query com limit implícito de 1000 e retornavam dados parciais. Ambos reescritos com loop `.range()`.
4. **dashboard.js corrigido** — retornava objeto `{projecoes, sessoes}` em vez de array plano. Reescrito para produzir flat rows que o `Dashboard.jsx` espera.
5. **Planejamento.jsx corrigido** — `importResult.errors.length` → `importResult.errors?.length` (TypeError em import bem-sucedido).
6. **Curva ABC implementada** — `services/relatorios.curvaABC()`, `screens/relatorios/CurvaABC.jsx`, `CurvaABC.module.css`. Ativada na aba Relatórios. Regra 80/15/5. Filtra por coleção histórica e toggle segmentação/fornecedor.
7. **pendencias_respostas criada** — migration 011. A tela Pendencias falhava silenciosamente sem a tabela.
8. **Pendencias.jsx atualizada** — lista de itens prontos e a-fazer reflete estado atual.
9. **Planejamento individualizado por comprador (migration 013)** — cada usuário agora salva e visualiza sua própria projeção:
   - `supabase/migrations/013_projecoes_por_comprador.sql`: adiciona `comprador_id` + `user_id` à tabela `projecoes`, recria unique constraint para `(comprador_id, segmentacao_id, colecao_id, tamanho)`, e atualiza política RLS `own_write FOR ALL` usando `auth.uid() = user_id`.
   - `src/renderer/src/services/grades.js`: `get()` aceita `comprador_id` opcional. Se comprador tem histórico em `hist_comprador_produto`, escala as quantidades por tamanho proporcionalmente ao share histórico do comprador.
   - `src/renderer/src/services/projecoes.js`: `get()` filtra por `comprador_id` se fornecido; `calcular()` aplica o mesmo escalonamento proporcional por coleção base; `salvar()` inclui `comprador_id` e `user_id` no upsert com o novo `onConflict`.
   - `src/renderer/src/screens/Planejamento.jsx`: importa `useAuth`, extrai `comprador` e `user`, passa `comprador?.id` para todos os service calls e `user?.id` para `salvar()`. Effect reage a mudança de `comprador?.id`.

---

## Próximos passos (específicos e acionáveis)

### 1. Corrigir formato de exibição de coleção nos históricos (cosmético, fácil)
**Problema:** `hist_grade` usa `colecao_id` como texto `'2026-1'`. Nas telas de Histórico e Curva ABC, o ID aparece cru (`2026-1` ou `2026/1`) em vez do formato do app (`26/1`).

**Função a criar** (pode ser inline ou em `src/renderer/src/lib/utils.js`):
```js
export function fmtColecao(id) {
  const [yr, s] = id.split('-')
  return `${parseInt(yr) % 100}/${s}`
}
// '2026-1' → '26/1', '2025-2' → '25/2'
```

**Arquivos a corrigir:**
- `src/renderer/src/screens/historico/GradeHistorica.jsx` linha 82: `<td>{col}</td>` → `<td>{fmtColecao(col)}</td>`
- `src/renderer/src/screens/historico/TendenciasLoja.jsx` linha 87: `{c}` → `{fmtColecao(c)}`
- `src/renderer/src/screens/relatorios/CurvaABC.jsx` linha 66: `c.replace('-', '/')` → `fmtColecao(c)`

### 2. Ordenar tamanhos por grade no Histórico (polimento, médio)
**Problema:** `GradeHistorica.jsx` e `Projecoes.jsx` extraem tamanhos com `[...new Set(rows.map(r => r.tamanho))]` sem ordenar. Podem aparecer fora de ordem.

**Solução:** Usar `GRADE_DEFINITIONS` de `src/renderer/src/constants/grades.js`. A segmentação selecionada tem `tipo_grade` (ex: `'AD'`, `'BB'`, `'AD1'`). `GRADE_DEFINITIONS[tipo_grade]?.tamanhos` dá a ordem correta.

```js
import { GRADE_DEFINITIONS } from '../../constants/grades'
// dentro do componente, após ter o segmentacao selecionado:
const gradeOrder = GRADE_DEFINITIONS[selectedSeg?.tipo_grade]?.tamanhos ?? []
const tamanhos = [...new Set(rows.map(r => r.tamanho))]
  .sort((a, b) => {
    const ia = gradeOrder.indexOf(a)
    const ib = gradeOrder.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
```

`selectedSeg` é o objeto da segmentação ativa: `segmentacoes.find(s => String(s.id) === segId)`.

### 3. Atualizar Pendencias.jsx — fornecedores está PRONTO
`AbaFornecedores` em `Configuracoes.jsx` tem create/edit/delete/import completo. Mover item do `STATUS_AFAZER` para `STATUS_PRONTO`:
```js
// Remover de STATUS_AFAZER:
'Verificar e finalizar tela de gestão de fornecedores (criar/editar)',

// Adicionar em STATUS_PRONTO:
'Gestão de fornecedores com criar, editar, remover e importar do ERP (CSV/Excel)',
```

### 4. Testar o planejamento individualizado
Com o app rodando localmente (`npm run dev`), logar como um comprador com histórico (apenas 3 de 8 compradores têm dados em `hist_comprador_produto`). Abrir Planejamento, selecionar coleção 27/1, selecionar uma segmentação com dados históricos, verificar que:
- As colunas N-1 e N-2 mostram quantidades escalonadas pelo share do comprador (não o agregado)
- Salvar projeção funciona sem erro de RLS
- Logar como outro comprador e ver que os valores são diferentes (projeção isolada)

### 5. Verificar app no ar
Depois de commitar e fazer push, verificar https://bolt-compras.pages.dev: Dashboard, Planejamento, Histórico (738 segmentações, 15 coleções), Relatórios > Curva ABC, Configurações > Fornecedores (737).

---

## Arquivos modificados nesta sessão

| Arquivo | Por quê |
|---|---|
| `supabase/migrations/009_reenable_rls_after_import.sql` | Reabilita RLS após seed |
| `supabase/migrations/010_populate_grade_historica.sql` | Converte hist_grade → grade_historica |
| `supabase/migrations/011_pendencias_respostas.sql` | Cria tabela que faltava |
| `src/renderer/src/services/historico.js` | Corrige paginação nas duas queries |
| `src/renderer/src/services/relatorios.js` | Adiciona `curvaABC()` |
| `src/renderer/src/services/dashboard.js` | Retorna flat rows em vez de objeto |
| `src/renderer/src/screens/relatorios/CurvaABC.jsx` | Nova tela |
| `src/renderer/src/screens/relatorios/CurvaABC.module.css` | CSS da Curva ABC |
| `src/renderer/src/screens/Relatorios.jsx` | Ativa aba Curva ABC |
| `src/renderer/src/screens/Planejamento.jsx` | Corrige TypeError no import + planejamento individualizado |
| `src/renderer/src/screens/Pendencias.jsx` | Atualiza lista de status |
| `supabase/migrations/013_projecoes_por_comprador.sql` | Adiciona comprador_id/user_id à projecoes, RLS own_write |
| `src/renderer/src/services/grades.js` | get() aceita comprador_id, escala qtd por share histórico |
| `src/renderer/src/services/projecoes.js` | get/calcular/salvar com comprador_id e user_id |

---

## Decisões técnicas importantes

- **hist_grade vs grade_historica:** São dois modelos separados. `hist_grade` usa `colecao_id` como texto (`'2026-1'`). `grade_historica` usa FK inteiro para a tabela `colecoes`. O Planejamento usa `grade_historica`; a tela Histórico usa `hist_grade`. A migration 010 sincroniza os dados.
- **Curva ABC usa hist_comprador_produto + hist_fornecedor** (tabelas já agregadas por coleção) em vez de calcular a partir dos pedidos individuais.
- **Supabase default limit é 1000 linhas** — qualquer query que possa retornar mais precisa de `.range()` em loop ou `.limit(n)` explícito maior.
- **Projeto Supabase:** ID `bhxpkysueyoblizkvomb`
- **Stack:** Electron + React (Vite) + Supabase (backend único — não há SQLite local; todas as telas consultam Supabase diretamente)
- **hist_comprador_produto:** Apenas 3 de 8 compradores têm dados históricos (Backes Filial 1, Backes Filial 2, Rafael Backes Filial). Os compradores "Prog" e "Filial" não compram separadamente. Rafael J. Backes não tem histórico. Para compradores sem histórico, `grades.get()` e `projecoes.calcular()` retornam o agregado sem escalonamento.
- **NULL comprador_id em projecoes:** Em PostgreSQL, NULL é distinto de NULL em unique constraints, então upsert não funciona corretamente quando `comprador_id = null`. Usuários sem comprador vinculado criarão duplicatas na tabela (edge case aceitável — todos os compradores ativos têm vínculo).
