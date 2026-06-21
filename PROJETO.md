# Solução Compras — Contexto do Projeto

> Documentação de referência (contexto de negócio, estável). Para stack/convenções
> técnicas, **CLAUDE.md é a fonte da verdade** — leia-o primeiro. Para o estado
> atual de desenvolvimento, ver HANDOFF.md.
> Última atualização: 2026-06-20 (corrigido — este arquivo estava desatualizado
> desde maio, ainda descrevia a versão Electron/SQLite que foi removida).

---

## O que é

Sistema de gestão de compras de moda para substituir ~100 planilhas Excel desconectadas.

**Negócio:** Samuel Backes (gestor) coordena compras de fornecedores (marcas/confecções) e distribui para 8 empresas compradoras do grupo Backes/Streit, todas no RS.

**Compradores do grupo:**
1. Irmãos Backes — Três Coroas
2. Samuel Paulo Backes — Três Coroas
3. PSM Backes — Igrejinha
4. Alexandre Backes
5. Elisangela M. Backes — Santa Maria do Herval
6. Rafael J. Backes — Rolante
7. Streit Conf — Riozinho
8. FMV Streit Conf — Rolante

---

## Tecnologia

> Ver `CLAUDE.md` para a versão sempre-atual. Resumo:

| Camada | Stack |
|--------|-------|
| App | SPA web — React 18 + Vite (`vite.web.config.js`) |
| Banco | Supabase (Postgres), projeto `bhxpkysueyoblizkvomb` |
| Deploy | Cloudflare Pages (`bolt-compras.pages.dev`), via push |
| Estilos | CSS Modules + variáveis CSS |
| Testes | Vitest |

**NÃO é Electron, não tem versão desktop.** O app já foi Electron+SQLite no passado
(commit `3e1b464`, "remove Electron scripts", removeu de vez); o repo ainda contém
configs residuais do `electron-vite` (`electron.vite.config.mjs`, `dist-electron/`,
pasta `electron/`) — são lixo histórico, ignorar.

---

## Modelo de dados (Supabase Postgres)

Tabelas principais (ver `supabase/migrations/` para o schema exato e completo):

```
colecoes          id, nome, estacao, ano, status
segmentacoes      id, classificacao, tipo_produto, classe, tipo_grade
                  tipo_grade: PP|BB|INF|JUV|AD|EX|AD1|EX1|AD2|EX2|U
fornecedores      id, nome, contato, categoria
compradores       id, nome, cnpj, cidade, is_editor
sessoes           id, fornecedor_id, colecao_id, data_visita, vendedor,
                  cond_pag, frete(CIF|FOB), transportadora, obs, fechada_em
visitas           id, sessao_id, comprador_id  ← join table
pedidos           id, visita_id, comprador_id, segmentacao_id,
                  valor_unitario, desconto_pct, referencia, icms_pct, obs
                  UNIQUE(visita_id, referencia)
pedido_itens      id, pedido_id, tamanho, qtd
projecoes         id, segmentacao_id, colecao_id, tamanho,
                  qtd_projetada, qtd_ajustada, metodo
hist_empresa_grade comprador_id, colecao_id, tipo_grade, tamanho,
                  qtd_comprada, qtd_vendida, qtd_estoque
                  (alimentada por scripts/sync-controle.js — ver Frente 3 do HANDOFF;
                  usada hoje só pela tela Agregador, não pela projeção de compra)
app_config        flags de manutenção/config
```

---

## Serviços (`src/renderer/src/services/`)

CRUD e regras de negócio falam direto com o Supabase client (`@supabase/supabase-js`),
sem camada de IPC — é tudo chamada de browser. Arquivos: `colecoes.js`,
`segmentacoes.js`, `compradores.js`, `fornecedores.js`, `sessoes.js`, `pedidos.js`,
`pedidoMerge.js`, `projecoes.js`, `grades.js`, `dashboard.js`, `relatorios.js`,
`agregador.js`, `historico.js`, `appConfig.js`.

---

## Telas implementadas

| Tela | O que faz | Status |
|------|-----------|--------|
| Dashboard | Projeção vs comprado por segmentação, drill-down por tamanho | ✅ |
| Planejamento | Projeção N-2+N-1, ajuste manual + importar planilha Excel | ✅ |
| Compras | Sessão → pedidos por loja → PDF (3 fases) + histórico | ✅ |
| Relatórios › Por Fornecedor | Total comprado por fornecedor + detalhes | ✅ |
| Relatórios › Por Segmentação | Filtro cascata → detalhe por fornecedor | ✅ |
| Relatórios › Curva ABC | Desabilitado, sem handler | 🔧 |
| Relatórios › Quebra de Estoque | Desabilitado, sem handler | 🔧 |
| Configurações | Coleções, Segmentações, Compradores, Fornecedores, Backup | ✅ |
| Pendências | Painel do projeto via Supabase (dev tool) | ✅ |

---

## Tipos de grade

| Tipo | Tamanhos |
|------|----------|
| PP | RN / P / M / G / GG |
| BB | 1 / 2 / 3 / 4 |
| INF | 2 / 4 / 6 / 8 / 10 / 12 |
| JUV | 10 / 12 / 14 / 16 / 18 / 20 |
| AD | PP / P / M / G / GG / XG |
| EX | G1 / G2 / G3 / G4 / G5 / G6 / G7 / G8 / G9 / G10 |
| AD1 | 34 / 36 / 38 / 40 / 42 / 44 / 46 / 48 / 50 / 52 |
| EX1 | 46 / 48 / 50 / 52 / 54 / 56 / 58 / 60 / 62 / 64 |
| AD2 | 1 / 2 / 3 / 4 / 5 |
| EX2 | 6 / 7 / 8 / 9 / 10 |
| U | F / M / U (tamanho único) |
| CASAL / KING / QUEEN / SOLT / LAR / GERAL | U (cama/mesa — não aparecem na planilha Análise de Coleção) |

---

## Fluxo principal de uso

1. **Preparação:** criar coleção + importar planilha "Análise de Coleção" para popular projeções
2. **Compra:** para cada fornecedor → criar sessão com lojas participantes → registrar pedidos por segmentação → fechar e gerar PDFs
3. **Acompanhamento:** Dashboard mostra projeção vs comprado; Relatórios para visão detalhada

---

## Decisões técnicas relevantes

> Decisões de stack/processo vivas estão em `CLAUDE.md` (ex.: revisão de impacto
> obrigatória, deploy direto sem staging, convenção de nomenclatura). Aqui só
> decisões de negócio/domínio que sobrevivem a reescritas de stack:

- **Projeção usa N−2 e N−1** (duas coleções equivalentes anteriores): média simples (50/50) ou ponderada (40/60).
- **Origem da projeção é manual, não vem do ERP.** O Excel "Análise de Coleção" importado é produzido num processo manual de planilhas do próprio Samuel/equipe — não é uma exportação do Macle. Não confundir com `hist_empresa_grade` (essa sim vem do ERP via `sync-controle.js`, mas alimenta só a tela Agregador, não a projeção de compra).
- **`classificacao` é derivada de `GRADE_DEFINITIONS[tipo_grade]`** — nunca armazenada diretamente (ver `CLAUDE.md`).
