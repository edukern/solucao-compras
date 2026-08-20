# HANDOFF — Solução Compras
Atualizado: 2026-08-20

> Frentes anteriores (acesso da Scheila, migração de coleção 27/1→26/2, sync Macle) foram
> confirmadas como resolvidas e removidas deste handoff. Detalhes históricos continuam em
> `.claude/memory/` se precisar consultar depois.

---

## ✅ FRENTE — Rascunho de pedido de reposição (ponto-e-stock → solucao-compras) — CONCLUÍDA

Migração `030_pedidos_reposicao.sql` aplicada em produção (testada via HTTP com a chave anon:
idempotência, soma de itens duplicados, recusa de carga inválida). PR [#11](https://github.com/edukern/solucao-compras/pull/11)
(migração) e [#12](https://github.com/edukern/solucao-compras/pull/12) (tela `RevisaoReposicao`)
mergeados e no ar em `bolt-compras.pages.dev`. Tela confirmada funcionando (menu lateral,
3 abas, estado vazio correto).

**Pendente — mas do lado de FORA deste repo:** no projeto `ponto-e-stock`, colar
`SUPABASE_URL`/`SUPABASE_ANON_KEY` no `.env` de lá e ajustar o código que lê o retorno da
função (agora devolve 4 valores: `id, criado, status, itens_gravados` — antes eram 2). Ação do
Eduardo na sessão de Claude que roda naquele projeto, não algo que dá pra fazer daqui.

## ✅ FRENTE — Fix tamanho fora da grade + campo Obs + PDF — CONCLUÍDA

PR [#14](https://github.com/edukern/solucao-compras/pull/14): parava de descartar
silenciosamente quantidade digitada num tamanho fora da grade cadastrada ao salvar (achado
pelo `revisor-impacto`); campo Obs. movido pro formulário principal de "Adicionar refs"; PDF
ganha coluna própria pra Cor/Detalhe e Obs quando sobra espaço (evita quebra de linha na
referência). Mergeado e deployado.

**Risco aceito, registrado no commit:** `Agregador.jsx` e `relatorios/PorSegmentacao.jsx`
ainda constroem a lista de tamanhos só a partir da grade canônica (não pegam tamanho extra) —
são telas de relatório interno, não documento que sai pro fornecedor. P2, não corrigido agora.

## ✅ FRENTE — Revogação de permissões da role anon — CONCLUÍDA

PR [#13](https://github.com/edukern/solucao-compras/pull/13): revoga `TRUNCATE`/`REFERENCES`/
`TRIGGER` que a role `anon` do Supabase tinha por padrão em todas as tabelas do schema
`public`. Mergeado e deployado.

---

## 🟡 FRENTE (PENDENTE, sem dono definido) — Importação 26/2

Handoff dedicado: `HANDOFF-IMPORTACAO-26-2.md` (raiz, se ainda existir) e
`.claude/memory/project_importacao_26_2.md`. Resumo: FEMMINART já gravado (sessão 40, 10654
peças). Achado crítico ainda não resolvido: fornecedores DUPLICADOS no cadastro (Aconchego do
Bebê, Rakels — já existem no Bolt sob nome com grafia variante) fazem o relatório de cobertura
mostrar "gap" falso. **Antes do próximo `--apply`**, o guard de `docs/importar-26-2/apply.js`
precisa (a) casar nome sem acento/pontuação e (b) abortar se qualquer linha-irmã do fornecedor
já tiver dado na coleção — sem isso um apply às cegas duplicaria pedidos.

## 🟡 FRENTE (PENDENTE, sem dono definido) — Sync Macle → Supabase / macle-integrations

`.claude/memory/project_ponto_e_stock_integracao.md` tem o estado completo. Resumo: projeto
`macle-integrations` criado (21/06) pra virar a camada compartilhada de leitura do ERP
`controle`, hoje lida em paralelo por `solucao-compras/scripts/sync-controle.js` (agregado
grosso) e pelo `ponto-e-stock` (fino, por segmento). Migração do `sync-controle.js` pra lá
ainda não aconteceu — ele segue rodando aqui por ora. Sem prazo definido.

---

## 📁 Onde olhar primeiro numa sessão nova

- `.claude/memory/MEMORY.md` — índice de memória do projeto, git-tracked.
- Skill `onde-parei` (instalada globalmente em `~/.claude/skills/onde-parei/`) — resume
  qualquer transcript `.jsonl` de sessão anterior sem precisar ler o arquivo bruto.
