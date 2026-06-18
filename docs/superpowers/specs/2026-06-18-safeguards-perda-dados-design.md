# Salvaguardas contra perda de dados — Bolt Compras

**Data:** 2026-06-18
**Contexto:** Sistema em produção com uso real. Série de incidentes de perda de dados
(quantidades sumindo após F5, etc.). Objetivo: eliminar de raiz as classes de erro
que causam perda de dado, não só remendar sintomas.

---

## Princípio central

Hoje o sistema trata a **memória do navegador como fonte da verdade** e o banco como
destino eventual. PDFs e fechamento de sessão gravam a partir do estado local. Essa
inversão é a origem da maioria dos riscos.

O desenho inverte isso:

> **O banco é a fonte da verdade. Toda gravação é atômica. Toda falha é visível.**

---

## Mapa de risco (estado atual)

| # | Risco | Gravidade | Local |
|---|-------|-----------|-------|
| 1 | Organizador ao "Gerar PDFs" regrava todas as lojas a partir do estado local dele, sobrescrevendo o que as lojas preencheram | 🔴 Crítico | `Compras.jsx` `handleFechar` (~l1089), `salvarBatch` |
| 2 | `DELETE` itens → `INSERT` itens em chamadas separadas, sem transação: falha entre as duas = itens perdidos sem rollback | 🔴 Crítico | `pedidos.js` `salvarBatch` (l47), `salvarPedidosVisita` (l153) |
| 3 | Quantidades vivem só no `localStorage` até "Gerar PDFs"; auto-save só grava referências | 🟠 Alto | `Compras.jsx` auto-save (~l687-700) |
| 4 | Migração de schema durante uso real pode quebrar gravações em andamento | 🟠 Alto | processo (`supabase db push`) |
| 5 | Sem aviso ao fechar aba / navegar com dados não salvos | 🟡 Médio | `Compras.jsx` |
| 6 | Recovery heurístico e frágil ("sessão concluída?" por inferência) | 🟡 Médio | `Compras.jsx` recovery effect (~l4256-4291) |

**Fluxo real confirmado:** organizador (Phase 2) e lojas (Phase 5) preenchem
quantidades **simultaneamente** na mesma sessão. Exige a proteção de concorrência
mais forte.

---

## Arquitetura da solução

### A. Gravação atômica via RPC no Postgres — resolve #2

Mover o padrão `delete + insert` de itens para funções SQL únicas executadas em
**uma transação**. Rollback automático se qualquer parte falhar.

- `salvar_pedidos_visita(p_visita_id, p_payload jsonb)` — substitui o
  `salvarPedidosVisita` JS. Faz upsert de pedidos + replace de itens atomicamente.
- `salvar_batch_sessao(p_sessao_id, p_payload jsonb)` — substitui o `salvarBatch` JS.

Os serviços JS passam a chamar `supabase.rpc(...)` em vez de orquestrar múltiplas
queries. Nunca mais existe estado intermediário "apagado mas não reinserido".

### B. Saves por delta + concorrência otimística — resolve #1 e concorrência simultânea

Causa do #1: o save reescreve o **estado inteiro** de uma visita a partir de um
snapshot que pode estar velho. Dois problemas combinados — escrita destrutiva total
+ snapshot estável.

Estratégia:

1. **Save por delta, granularidade (visita, referencia).** Cada gravação envia
   apenas os pedidos efetivamente tocados pelo usuário, não a sessão inteira. Edições
   concorrentes a lojas/refs diferentes nunca colidem.
2. **Concorrência otimística por linha.** Coluna `updated_at` (e/ou `version`) em
   `pedidos`. Ao salvar, se a linha foi alterada por outro desde que o cliente a
   carregou, a RPC não sobrescreve cegamente: retorna conflito.
3. **Reconciliação em vez de clobber.** No conflito, o cliente recarrega o estado
   fresco do banco e **reaplica apenas as edições locais do usuário** por cima,
   depois regrava. Resultado: o único conflito verdadeiro possível é duas pessoas
   setando exatamente a mesma célula (mesmo tamanho, mesma ref, mesma loja) no mesmo
   instante — onde last-write-wins é aceitável e não catastrófico.

> Alternativa considerada e descartada: last-write-wins no nível da visita inteira.
> Mais simples, mas com "os dois ao mesmo tempo" perde o trabalho de um editor inteiro.
> Rejeitada por não ser segura o suficiente para o fluxo real.

### C. Quantidades persistidas continuamente no banco — resolve #3 e #6

- Estender o auto-save (debounce 2s) para persistir **quantidades**, não só refs,
  usando os saves por delta de (B).
- `localStorage` passa a ser apenas um buffer de crash de poucos segundos, não a
  fonte da verdade.
- Recovery (#6) simplifica drasticamente: ao carregar, sempre reconciliar
  `localStorage` vs banco por timestamp — **banco vence**, exceto se o `localStorage`
  for estritamente mais novo (crash antes do flush). Some a heurística frágil de
  "sessão concluída?".

### D. Fechar sessão = ler do banco + gerar PDF, sem regravar — resolve #1 (parte 2)

Com (C), as quantidades já estão sempre no banco. O "Gerar PDFs" deixa de fazer a
regravação destrutiva: passa a **buscar o estado fresco do banco** e renderizar.
O organizador nunca mais sobrescreve o preenchimento das lojas, porque não escreve
ao fechar — apenas lê. Decopla "salvar" de "gerar PDF".

### E. Protocolo de migração segura — resolve #4

1. **Migrações sempre aditivas / compatíveis** (expand-contract): adiciona coluna
   nova, nunca renomeia/remove coluna em uso na mesma migração. Documento curto de
   regras em `docs/MIGRACOES.md`.
2. **Modo manutenção:** tabela `app_config` (linha única) com flag `manutencao`. O
   app consulta no carregamento e periodicamente; quando ligada, mostra faixa
   "sistema em manutenção — salve seu trabalho" e bloqueia gravações novas. Ligar
   antes de aplicar migração pesada, desligar depois.

### F. Aviso ao fechar aba com dados não salvos — resolve #5

Listener `beforeunload` ativo enquanto houver estado "sujo" (dirty) ainda não
confirmado no banco. Defesa em profundidade, mesmo com a janela reduzida a <2s.

### G. Falhas de gravação visíveis (não silenciosas)

Indicador de status de salvamento sempre visível na Phase 2 e Phase 5:
`Salvando… / ✓ Salvo HH:MM / ⚠ Falha ao salvar — tentar de novo`. Substitui as
strings de erro discretas que passam despercebidas. Em falha, oferecer retry e
**não** limpar o `localStorage` (preserva o buffer até confirmar gravação).

### H. Backup automático — rede de segurança final (recomendação)

Recomendação (resposta "me recomende o mais seguro"):

- **Baseline:** habilitar PITR (Point-in-Time Recovery) do Supabase se o plano
  permitir — restauração a qualquer segundo, zero código no app. *Decisão pendente:
  confirmar o plano do projeto `bhxpkysueyoblizkvomb`.*
- **Se PITR indisponível (plano free):** job noturno de export (`pg_dump` agendado
  ou Edge Function cron) de `pedidos` + `pedido_itens` para storage.
- **Independente do plano:** como o item (A) elimina os deletes destrutivos não
  atômicos, o principal vetor de perda já some. O backup é a apólice de seguro.

---

## Ordem de implementação (deploy incremental)

Mesmo "resolvendo tudo", a ordem de deploy importa para não introduzir regressão:

1. **A — RPCs atômicas** (backend, retrocompatível: JS pode chamar RPC mantendo
   fallback). Elimina #2.
2. **B + C — delta saves + concorrência + persistência de quantidades.** Elimina #1
   (parte 1), #3, #6.
3. **D — fechar lê do banco.** Elimina #1 (parte 2).
4. **G — status de save visível.** Torna o resto observável.
5. **F — beforeunload.** Defesa rápida.
6. **E — protocolo + modo manutenção.** Processo + flag.
7. **H — backup.** Configuração de infra.

Cada passo é deployável e verificável isoladamente.

---

## Critérios de sucesso

- Nenhuma sequência de F5 / troca de máquina / queda de rede resulta em perda de
  quantidades já digitadas.
- Organizador fechando sessão nunca apaga preenchimento feito por uma loja.
- Falha de gravação é sempre visível ao usuário, com opção de retry.
- Migração pode ser aplicada com o app no ar sem corromper dados (via modo
  manutenção + migração aditiva).
- Existe ponto de restauração para qualquer dado dos últimos N dias.

---

## Decisões pendentes (para o plano)

1. Plano do Supabase → define PITR vs export noturno (item H).
2. `version` (inteiro) vs `updated_at` (timestamp) para concorrência otimística (B).
3. Mecânica exata de "reaplicar edições locais" na reconciliação (B.3) — definir no
   plano de implementação.
