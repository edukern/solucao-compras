# Solução de Compras — Design Spec
**Data:** 2026-05-15  
**Projeto:** App desktop de planejamento e acompanhamento de compras para varejo de moda  
**ERP utilizado:** MACLE Controle (Sollus)

---

## Contexto

Empresário de varejo de moda com ~130 fornecedores e segmentação de produtos extensa. Hoje opera com ~100 planilhas manuais (um "frankenstein") sem visibilidade clara do que já foi comprado vs. o que ainda precisa comprar para a próxima coleção. O objetivo é substituir esse processo por um app desktop estruturado que calcule projeções a partir do histórico e acompanhe as compras em tempo real.

---

## Stack técnica

**Electron + React + SQLite**

- App desktop Windows, roda 100% local
- Banco SQLite: arquivo `.db` único, backup simples (copiar o arquivo)
- Backup em nuvem: jogar o `.db` no Google Drive/OneDrive existente
- Custo de infraestrutura: zero (sem servidor, sem assinatura)
- Distribuição: instalador `.exe` compartilhado diretamente

---

## Domínio e regras de negócio

### Coleções e estações

- Há 2 coleções por ano: **Verão** e **Inverno**
- Produtos **Ano Todo** (permanentes) aparecem em ambas as estações e não devem ser excluídos ao filtrar por estação — eles são incluídos junto com os produtos da estação relevante
- O histórico de projeção usa as **2 últimas coleções equivalentes** (ex: Verão 2024 + Verão 2025 para projetar Verão 2026)
- Como há produtos permanentes, o relatório do ERP abrange **4 coleções** no período de filtro, mas a lógica de agrupamento por estação garante que cada projeção use apenas os dados da estação correta

### Hierarquia de segmentação

```
Estação (Verão / Inverno / Ano Todo)
  └─ Classificação (AD = Adulto, EX = Plus Size, INF = Infantil, ...)
       └─ Tipo de Produto (BERMUDA, BLUSA, CAMISETA, ...)
            └─ Classe (FEM, MASC, UNI)
```

Cada combinação Classificação + Tipo + Classe forma uma **segmentação**. Cada segmentação tem sua própria grade de tamanhos e sua própria projeção. Classificações diferentes (AD vs EX) **nunca se misturam**, pois usam sistemas de tamanho distintos.

### Sistemas de tamanho

Os tamanhos são dinâmicos — variam por classificação e tipo de produto:

| Classificação | Sistema típico |
|---|---|
| AD FEM / MASC | P, M, G, GG, XG |
| AD MASC (calças/jeans) | 38, 40, 42, 44, 46, 48 |
| EX FEM / MASC | G1, G2, G3, G4, G5 (até G8) |
| INF | 2, 4, 6, 8, 10, 12, ... |

O sistema de tamanhos não é fixo — deve ser armazenado dinamicamente como pares chave-valor por segmentação.

### Dado de entrada do ERP (TOTAL GRADE)

O MACLE Controle (Sollus) gera dois tipos de relatório relevantes:

1. **Relatório resumo** (`AnaliseVenda`): lista todos os tipos de produto com totais por Classe. Colunas: Descrição, Estoque, Qtd Compra, Qtd Venda. Sem breakdown de tamanhos.

2. **Relatório de grade por tipo** (`consGradeMovtosAV`): detalha todos os SKUs de um tipo com grade por tamanho. No final da página há o **TOTAL GRADE** — soma de todos os SKUs da segmentação por tamanho. **Este é o dado utilizado para planejamento.**

Estrutura do TOTAL GRADE (última linha do relatório de grade):
```
TOTAL GRADE
[tamanhos...] TOT
Compras  [qtd por tamanho]  [total]
Vendas   [qtd por tamanho]  [total]
Estoque  [qtd por tamanho]  [total]
```

A classificação (AD, EX, INF) está embutida no nome de cada SKU no relatório e também é controlada pelo filtro aplicado antes de gerar o relatório.

---

## Modelo de dados

### Coleção
```
id, nome (ex: "Verão 2025"), estacao (verao/inverno), ano, status (planejamento/em_compra/finalizada)
```

### Segmentação
```
id, classificacao (AD/EX/INF/...), tipo_produto (BERMUDA/BLUSA/...), classe (FEM/MASC/UNI)
```
Chave única: `(classificacao, tipo_produto, classe)`.

### Grade Histórica
```
id, segmentacao_id, colecao_id, tamanho (P/M/G/G1/38/...), qtd_comprada, qtd_vendida, qtd_estoque
```
Uma linha por tamanho. Origem: TOTAL GRADE extraído do relatório do ERP.

### Projeção
```
id, segmentacao_id, colecao_id (coleção alvo), tamanho, qtd_projetada (calculada), qtd_ajustada (manual), metodo (media_simples/media_ponderada/manual)
```
`qtd_ajustada` é inicializada com `qtd_projetada` e pode ser sobrescrita manualmente por tamanho.

### Fornecedor
```
id, nome, contato
```

### Pedido de Compra
```
id, fornecedor_id, colecao_id, segmentacao_id, tamanho, qtd_pedida, valor_unitario, valor_total (calculado), data_pedido
```
Múltiplas linhas por pedido (uma por tamanho). Um mesmo fornecedor pode ter múltiplos pedidos na mesma data (um por segmentação diferente) — na UI, pedidos do mesmo fornecedor e data são exibidos agrupados como uma única "visita".

### A equação central
```
projeção ajustada − total já pedido = saldo a comprar
```
Calculado por tamanho, por segmentação, e agregado no dashboard da coleção.

---

## Módulos do sistema

### 1. Dashboard
Tela principal de uma coleção ativa. Exibe:
- 4 totalizadores: Projeção total (peças), Já comprado, Saldo a comprar, Investimento (R$)
- Barra de progresso geral da coleção
- Tabela por segmentação: Projeção | Comprado | Saldo | Progresso (barra)
- Segmentações 100% atendidas marcadas com ✓ em verde
- Segmentações sem nenhuma compra destacadas em vermelho

### 2. Importação
Fluxo de importação do histórico do ERP.

**Fase 1 (atual):** planilha gerada por Claude in Chrome
- Claude in Chrome navega o MACLE Controle (`177.136.214.107:8081`), abre cada segmentação, captura os TOTAL GRADEs de todas as tabelas e despeja em uma planilha estruturada (CSV ou Excel)
- Usuário faz upload da planilha no app
- App importa os dados estruturados — parsing trivial comparado ao PDF
- Usuário confirma antes de salvar
- Cada importação é vinculada a uma coleção específica

> **Formato da planilha:** a ser definido com base nos modelos de planilha existentes do empresário (pendente envio). A estrutura mais provável é uma linha por segmentação+tamanho com colunas: coleção, classificação, tipo, classe, tamanho, qtd_compra, qtd_venda, estoque.

**Fase 2 (futuro):** conexão direta ao banco do ERP (read-only) — quando disponível, o app consulta os dados automaticamente sem necessidade de exportar nada.

**Regra de agrupamento por estação:** o usuário aplica o filtro correto no MACLE antes de rodar o Claude in Chrome (incluindo produtos da estação + Ano Todo, excluindo a estação oposta). O app não precisa re-aplicar essa lógica — a planilha já chega com os dados corretos para a estação escolhida.

### 3. Planejamento
Tela de revisão e ajuste de projeções por segmentação.

- Seletor de segmentação (classificação > tipo > classe)
- Seletor de método de projeção: Média simples (padrão) | Média ponderada | Manual
- Tabela de grade: colunas = tamanhos, linhas = Coleção N-2 | Coleção N-1 | Projeção calculada | Ajuste manual
- Campo de ajuste manual editável por tamanho, inicializado com o valor calculado
- Botão "Restaurar calculado" para desfazer ajustes
- Botão "Salvar projeção"

**Cálculo de média simples:** `(qtd_comprada_colecao_n2 + qtd_comprada_colecao_n1) / 2` por tamanho.
**Cálculo de média ponderada:** `(qtd_n2 × 0.4 + qtd_n1 × 0.6)` por tamanho (pesos configuráveis).

### 4. Compras
Registro de pedidos de compra.

- Formulário: Fornecedor (dropdown) + Segmentação + Data + Valor unitário
- Tabela de grade: colunas = tamanhos, linhas = Projeção ajustada | Já comprado | Saldo | Qtd neste pedido
- Valor total calculado automaticamente (qtd total × valor unitário)
- Ao confirmar, pedido é salvo e dashboard atualizado imediatamente
- Listagem de pedidos por fornecedor e por coleção com histórico financeiro

### 5. Fornecedores
Cadastro de fornecedores. Nome, contato, histórico de pedidos por coleção.

### 6. Configurações
- Gerenciar coleções (criar, ativar, finalizar)
- Gerenciar segmentações (adicionar novos tipos/classes ao longo do tempo)
- Backup: exportar `.db` para local escolhido pelo usuário
- Restore: importar `.db` de backup

---

## Fluxo de uso típico (por coleção)

1. **Criar coleção** (ex: Verão 2026)
2. **Importar histórico**: fazer upload dos PDFs das 2 coleções anteriores equivalentes (Verão 2024 e Verão 2025) — o app extrai o TOTAL GRADE de cada segmentação
3. **Revisar projeções**: o app calcula a média por segmentação; o usuário ajusta onde achar necessário
4. **Fazer compras**: conforme compra com fornecedores, registra os pedidos no app
5. **Acompanhar no dashboard**: visualiza em tempo real o progresso por segmentação

---

## Roadmap de fases

### Fase 1 — MVP (escopo atual)
- Dashboard de coleção
- Importação via PDF (parser MACLE)
- Planejamento com projeção e ajuste manual
- Registro de pedidos de compra
- Cadastro de fornecedores
- Backup/restore do banco SQLite

### Fase 2 — Integração direta com ERP
- Conexão read-only ao banco do MACLE Controle (Sollus)
- Importação automática sem necessidade de PDF
- Atualização de estoque em tempo real

### Fase 3 — Expansão (a definir com o cliente)
- Suporte a múltiplos usuários / sincronização
- Relatórios e exportações
- Histórico financeiro e análise de rentabilidade por fornecedor

---

## Decisões técnicas

| Decisão | Escolha | Motivo |
|---|---|---|
| Framework desktop | Electron | Melhor ecossistema, UX rica, sem custo |
| Frontend | React | Componentes reutilizáveis, grande ecossistema |
| Banco de dados | SQLite (better-sqlite3) | Arquivo único, backup simples, sem servidor |
| Parser de planilha | xlsx (SheetJS) | Parsing de CSV/Excel gerado pelo Claude in Chrome |
| Tamanhos | Dinâmico (linhas de grade por tamanho) | Sistemas distintos por classificação |
| Distribuição | Installer .exe via electron-builder | Simples para o cliente instalar |
| Atualizações | Manual (novo .exe) — auto-update via GitHub Releases se necessário | Sem custo adicional |
