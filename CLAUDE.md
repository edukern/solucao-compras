# Solução Compras — Mapa do projeto

## Stack
React 18 + Vite + Supabase. SPA puro — **NÃO É Electron, não tem versão desktop**.
Deploy: Cloudflare Pages (bolt-compras.pages.dev). O código do app fica em `src/renderer/src/`.
O repositório contém arquivos de configuração do electron-vite mas são resquícios — ignorar.
Hook git: prevent-destructive-commands.py bloqueia `git add`/`git commit` — usuário roda git manualmente.

> Para rodar localmente: precisa de `.env` com as credenciais do Supabase. Sem isso o app não renderiza (tela preta).

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
