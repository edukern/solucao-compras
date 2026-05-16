# Tela de Relatórios — Design Spec

**Data:** 2026-05-16  
**Escopo:** Fase 3 — nova tela Relatórios com dois relatórios funcionais e dois placeholders

---

## Objetivo

Adicionar uma quarta tela "Relatórios" ao app com dois pontos de entrada que convergem na mesma vista de detalhe por fornecedor: (1) via lista de fornecedores, (2) via filtro de segmentação. Dois relatórios adicionais (Curva ABC, Quebra de Estoque) ficam como placeholder para fases futuras.

---

## Arquitetura

A tela segue o padrão existente: `useCollection()` para coleção ativa, `window.api` para todos os dados, CSS Modules para estilos. Nenhuma nova tabela ou canal IPC é necessário — os dados vêm de `pedidos`, `pedido_itens`, `segmentacoes` e `fornecedores` já existentes.

Nova rota no menu: `relatorios` adicionado ao `NAV_ITEMS` do Sidebar e ao `SCREENS` do App.jsx.

---

## Layout da tela

Sidebar interna à esquerda (≈180px) com os quatro tipos de relatório. Conteúdo à direita ocupa o restante. O tipo ativo é destacado igual ao nav principal.

```
┌─────────────────────────────────────────────┐
│ Sidebar interna  │  Conteúdo do relatório   │
│                  │                          │
│ • Por Fornecedor │  [varia por relatório]   │
│ • Por Segmentação│                          │
│   Curva ABC      │                          │
│   Quebra Estoque │                          │
└─────────────────────────────────────────────┘
```

Curva ABC e Quebra de Estoque aparecem com estilo desabilitado (opacidade reduzida, sem clique) e label "Em breve".

---

## Relatório 1 — Por Fornecedor

### Vista de lista

- Busca todos os fornecedores com pedidos na coleção ativa via query que agrega `pedidos` + `pedido_itens`
- Search bar no topo: filtra por nome do fornecedor (client-side, sem nova query)
- Cada linha: nome do fornecedor · nº de SKUs únicos · total de peças · valor total (R$)
- Um SKU = uma segmentação com pelo menos 1 item pedido (independente de tamanho)
- Clique na linha → abre vista de detalhe sem filtro pré-aplicado

### Vista de detalhe

Acessível de dois pontos de entrada:
1. **Via lista de fornecedores** — sem filtro pré-aplicado, mostra todas as segmentações
2. **Via relatório Por Segmentação** — filtro pré-aplicado na segmentação selecionada, botão "Ver todas as segmentações" remove o filtro

**Cabeçalho:** botão ← voltar + nome do fornecedor + totais (SKUs · peças · R$)

**Filtros:** pills clicáveis para classificação (AD, EX, INF…) e tipo de produto (CALCA, BLUSINHA…). Selecionar/deselecionar um pill remove/adiciona o grupo da tabela abaixo. Por padrão todos estão ativos.

Quando acessado via Por Segmentação: pills chegam pré-filtrados conforme a segmentação de origem + botão "Ver todas as segmentações" no cabeçalho.

**Cards de resumo** (filtrados pelos pills ativos):
- Projeção total (roxo)
- Comprado (verde)
- Saldo (amarelo)

**Tabela agrupada** (filtrada pelos pills ativos):

| Cabeçalho de grupo | — | — | — | — |
|---|---|---|---|---|
| `CLASSIFICAÇÃO — TIPO` (linha de separador, cor accent) | | | | |
| Segmentação (classe) | Projeção | Comprado | Saldo | % |

- Separador por classificação + tipo
- Uma linha por SKU (= por classe dentro do tipo)
- Colunas: Segmentação · Projeção · Comprado · Saldo · %
- Projeção = `qtd_ajustada` da projeção salva para essa segmentação + coleção ativa
- Comprado = soma de `qtd_pedida` de todos os pedidos desse fornecedor para essa segmentação + coleção ativa
- Saldo = max(0, projeção − comprado)
- % = min(100, round(comprado / projeção × 100))

---

## Relatório 2 — Por Segmentação

Ponto de entrada alternativo que converge no detalhe do fornecedor.

**Filtros em cascata** (reutiliza lógica do `SegmentacaoSelect` existente):
- Classificação → Tipo → Classe (cada nível filtra o próximo)

**Resultado:** lista de fornecedores que têm pedidos para a segmentação filtrada na coleção ativa.

Cada linha: nome do fornecedor · nº de SKUs · total de peças

Clique na linha → abre vista de detalhe do fornecedor **com filtro pré-aplicado** na segmentação selecionada + botão "Ver todas as segmentações".

Se nenhum filtro selecionado: mostra mensagem "Selecione uma segmentação para ver os fornecedores."

---

## Placeholders

Curva ABC e Quebra de Estoque aparecem no menu interno com estado desabilitado. Ao clicar (se habilitado futuramente) mostrariam conteúdo próprio. Por ora: área de conteúdo com mensagem "Em breve".

---

## Arquivos

```
src/renderer/src/
├── screens/
│   ├── Relatorios.jsx              # Shell: sidebar interna + roteamento interno
│   ├── Relatorios.module.css
│   └── relatorios/
│       ├── PorFornecedor.jsx       # Lista + detalhe (estado interno controla qual mostrar)
│       ├── PorFornecedor.module.css
│       ├── PorSegmentacao.jsx      # Filtro + lista resumida → navega para detalhe
│       └── PorSegmentacao.module.css
```

`Relatorios.jsx` gerencia qual sub-relatório está ativo + passa contexto de navegação (fornecedor selecionado, filtro de segmentação) entre `PorSegmentacao` e `PorFornecedor` via props/estado elevado.

---

## Dados necessários (IPC existente)

Todos os canais já existem:

| Dado | Canal IPC |
|---|---|
| Lista de fornecedores com pedidos | `pedidos.totaisPorFornecedor` *(novo método no DB)* |
| Pedidos por fornecedor + segmentação | `pedidos.itensPorFornecedor` *(novo método no DB)* |
| Projeções salvas | `projecoes.get(segId, colId)` |
| Lista de segmentações | `segmentacoes.list()` |
| Lista de fornecedores | `fornecedores.list()` |

Os dois métodos marcados como novos precisam ser adicionados em `electron/main/db/pedidos.js` e expostos via IPC + preload.

---

## Fora de escopo

- Exportação para PDF/Excel (fase futura)
- Curva ABC (fase futura)
- Quebra de Estoque (fase futura)
- Walkthrough/apresentação para gestor (entregável separado, não faz parte desta fase)
