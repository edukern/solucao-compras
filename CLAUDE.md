# Solução Compras — Mapa do projeto

## Stack
React 18 + Vite + Supabase. SPA puro — **NÃO É Electron, não tem versão desktop**.
Deploy: Cloudflare Pages (bolt-compras.pages.dev). O código do app fica em `src/renderer/src/`.
O repositório contém arquivos de configuração do electron-vite mas são resquícios — ignorar.
**Deploy obrigatório:** após qualquer mudança de código, fazer commit e push antes de reportar como "feito". Nunca dizer que algo está resolvido sem ter deployado.
- Sempre `git add <arquivos específicos>` — nunca `git add .` ou `git add -A`
- Git path bash: `/d/projetos/solucao-compras`

> Para rodar localmente: precisa de `.env` com as credenciais do Supabase. Sem isso o app não renderiza (tela preta).

## Revisão de impacto obrigatória (antever quebras)

O deploy vai direto pro ar, sem staging — então a quebra costuma aparecer no uso real. Para evitar isso:

**Antes de implementar qualquer mudança que toque schema/migração, serviços compartilhados (`src/renderer/src/services/`), dados do Supabase, fluxo de pedidos (sessoes/visitas/pedidos/pedido_itens/segmentacoes), ou deploy**, rode primeiro a análise de implicações de 1ª/2ª/3ª ordem (agente `revisor-impacto` em `.claude/agents/`) e **apresente o resultado para aprovação ANTES de mexer**. Não depende do Eduardo pedir — é o passo padrão.

Mudança trivial e isolada (texto, estilo de 1 componente, sem efeito em dados/contratos) não precisa — diga que é trivial e siga.

A análise deve sempre responder: **"como dá pra testar isso ANTES de ir pro ar?"** e, se houver dado existente afetado, qual backup específico fazer antes.

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
constraint: pedidos(visita_id, referencia, variante_key) UNIQUE

**Migração criada ≠ migração aplicada.** Um arquivo em `supabase/migrations/` só existir no repo não
significa que a coluna/tabela existe no banco de produção — aplicar é um passo manual (via MCP do
Supabase ou dashboard), não automático no deploy. Já causou pelo menos dois bugs silenciosos em
produção (colunas de markup em `sessoes` e de cond_pag/frete/transportadora em `visitas`, ambas
mescladas mas nunca aplicadas). Ao mesclar um PR que inclui migração nova, aplicar no banco de
produção **no mesmo momento do merge**, não deixar para depois.

## Convenções
- `referencia` = código do produto (string), não `ref` (palavra reservada JS)
- `classificacao` é derivada de GRADE_DEFINITIONS[tipo_grade].classificacao — nunca armazenada diretamente
- `localId` em items do Phase 2 = ped.referencia quando carregado via Retomar

---

## Memória local

A memória deste projeto está em `.claude/memory/` na raiz do repo — git-tracked para portabilidade entre máquinas.

Ao escrever memória, use sempre o caminho absoluto: `D:\projetos\solucao-compras\.claude\memory\`

O `MEMORY.md` nessa pasta é o índice. Nunca escreva conteúdo diretamente no `MEMORY.md`.
