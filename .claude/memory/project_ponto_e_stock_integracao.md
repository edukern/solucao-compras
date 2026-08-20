---
name: project-ponto-e-stock-integracao
description: Relação entre solucao-compras e ponto-e-stock — mesmo ERP, mesmo grupo (Backes). Corrigido 20/06/2026, estava desatualizado desde a criação.
metadata:
  type: project
---

## O que é o ponto-e-stock (estado real, verificado 20/06/2026)

Projeto separado em `D:\projetos\ponto-e-stock` (Next.js + TypeScript + Prisma).
Implementa o protótipo aprovado `distribuicao-alpha.vercel.app` — **7 telas já
mergeadas em `main`**, não é mais um esqueleto. Cobre cadastro de regras de
distribuição (por produto e por segmento) e 3 telas de Reposição (Início,
Segmento, Promoção) que calculam necessidade real por loja a partir de regras
salvas no banco + estoque/trânsito do ERP.

Dois bancos:
- `ponto_e_stock` — PostgreSQL **local** (Prisma), tabelas `DistributionRule`/`SegmentRule` (regras de negócio, não mock).
- `controle` — Macle ERP, read-only via WireGuard (mesmo túnel do solucao-compras).

## O que já funciona (NÃO é mais mock)

- O motor de reposição lê estoque/trânsito **direto do `controle`** via um provider próprio (`LocalSnapshotStockProvider`), não de mocks. `mockStockThresholdRules.ts` foi substituído por regras reais salvas no Postgres local.
- Coleção ativa usada: **`codcolecao = 20000015`** (2026/2) — não 20000014 (isso já foi um bug real lá, corrigido).
- Regras de necessidade são por segmento (nivel2/nivel3/nivel4 do `item`) × tamanho × loja, fino — bem mais granular que `hist_empresa_grade` (que é só `tipo_grade` × tamanho, sem segmento de produto).

## Ponto de integração com solucao-compras — reavaliado

A ideia antiga registrada aqui ("ponto-e-stock vai consumir `hist_empresa_grade` do
Supabase para substituir os mocks") **não é mais válida** — não havia mocks a
substituir quando isso foi escrito, e agora definitivamente não há. O
ponto-e-stock resolveu seu próprio acesso ao ERP de forma independente, com
granularidade fina que `hist_empresa_grade` (agregado por `tipo_grade`, sem
segmento) não conseguiria suprir.

**O problema real, identificado em 20/06/2026:** os dois projetos leem o
**mesmo banco `controle`** de forma independente:
- `solucao-compras/scripts/sync-controle.js` → agregado grosso (tipo_grade × tamanho), alimenta só a tela Agregador.
- `ponto-e-stock` → fino (segmento × tamanho × loja), alimenta o motor de reposição.

Risco: duas queries paralelas pro mesmo dado, podendo divergir. Caminho mais
provável (a avaliar, não decidido): extrair a camada de leitura do `controle`
para um serviço/projeto compartilhado (ver "Próxima fase" abaixo), cada app
consumindo com a granularidade que precisa — em vez de "um app alimenta o
outro" via Supabase.

**Why:** os dois projetos compartilham o mesmo grupo (Backes), mesmos códigos
de empresa (1, 11, 12, 13, 99) e mesmo banco `controle`. Isso por si só não
significa que devem compartilhar pipeline — a granularidade que cada um
precisa é diferente.

## Projeto de automações Macle — CRIADO 21/06/2026

Saiu do papel: `D:\projetos\macle-integrations` (repo privado
`github.com/edukern/macle-integrations`). Camada compartilhada de leitura do
`controle` → tabela compartilhada no Supabase deste projeto. Fase 1: tabela
`hist_segmento_loja` (loja × segmento bruto nivel2/3/4 × tamanho, com qtd e
valor). Spec/plano em `macle-integrations/docs/superpowers/`. A intenção é que
o `sync-controle.js` daqui seja migrado pra lá; por ora ele continua rodando.

## Achados do ERP `controle` (confirmados ao vivo 21/06/2026)

- **Colunas de valor:** NÃO existe `valortotal`. Valor bruto = venda `(qtd − qtddevolv) × precoun`, compra `qtd × vlrunit`. `estoque` não tem coluna de valor. Relevante se o `sync-controle.js` daqui (hoje só qtd) for estendido para valor.
- **Coleção ativa = `codcolecao 20000015`** (2026/2). ATENÇÃO: o `sync-config.example.json` daqui usa `20000014` (coleção antiga) — conferir se o `sync-config.json` real do servidor já está em 20000015, senão o sync puxa coleção errada.
- Filtro de empresa: `codempresa IN (1, 11, 12, 13, 99)`.

## Config do ponto-e-stock (credenciais reais ficam só no `.env`, não aqui)

- `SOURCE_DATABASE_URL` → Macle ERP em `10.0.0.1:5432/controle` (via WireGuard)
- `DATABASE_URL` → Postgres local `ponto_e_stock`
- Coleção ativa: `codcolecao = 20000015` (não 20000014 — bug antigo)
