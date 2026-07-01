# Plano: Quebrar Compras.jsx em arquivos menores

**Motivação:** Compras.jsx tem ~3.600 linhas. Cada sessão com IA exige múltiplos `Read` paginados
e `Grep` para navegar — ineficiente em tokens e propenso a perder contexto.

---

## Estrutura-alvo

```
src/renderer/src/screens/
  Compras.jsx                    # Orchestrator (~350 linhas)
  RegistrarPedidoSessao.jsx      # Phase 2 (~1.300 linhas)
  FecharSessao.jsx               # Phase 3 (~300 linhas)
  VisualizarSessao.jsx           # Phase 4 (~200 linhas)
  Historico.jsx                  # Phase 0 / listagem (~400 linhas)
  PreencherMinhaLoja.jsx         # Phase 5 (~250 linhas)

src/renderer/src/lib/
  pdfHelpers.js                  # gerarHTMLOrdem, wrapDoc, gerarPDFSessao, PDF_STYLES (~250 linhas)
```

---

## Passos de execução (ordem importa)

> **Atualizado após análise de impacto (revisor-impacto) em 2026-07-01.** O arquivo real tem
> **4.746 linhas** (não ~3.600) e diverge do plano original em pontos que quebrariam telas se
> seguidos ao pé da letra: `N_TPAIRS` e `AddItemForm` (como componente) **não existem** no
> arquivo atual (o form é JSX inline dentro de RegistrarPedidoSessao, ~l1491–1600); faltavam
> `MarkupSessao` (usado em 2 lugares: dentro de VisualizarSessao e no orchestrator) e metade do
> bloco de PDF (FICHA_STYLES, gerarHTMLFichaLoja, gerarFichasLojas, fmtDataPDF, gerador jsPDF/
> autoTable). Passos 0–2 abaixo blindam o que é compartilhado por vários componentes ANTES de
> separar as telas — isso reduz o risco de `ReferenceError` em runtime (não pega no build).

### 0. Extrair helpers de formato para `lib/format.js` (fazer primeiro)
- Mover: `fmt`, `fmtDate`, `today`, `esc`, `PLUS_SIZE_DEFAULT` (hoje no topo do módulo, ~l22–26)
- Importar em TODOS os arquivos novos que os usam (praticamente todos os componentes e os PDF helpers)
- Sem teste visual próprio — é pré-requisito dos passos seguintes

### 1. Extrair `pdfHelpers.js` (bloco completo, não só 4 helpers)
- Mover TODO o bloco ~l2345–2932: `PDF_STYLES`, `MESES_PT`, `fmtEntrega`, `fmtV`, `wrapDoc`,
  `gerarHTMLOrdem`, `gerarPDFSessao`, `FICHA_STYLES`, `gerarHTMLFichaLoja`, `gerarFichasLojas`,
  `fmtDataPDF`, gerador via `jsPDF`/`jspdf-autotable` (com os respectivos imports de pacote)
- Importar em `FecharSessao` e `Historico` (que chama reimprimir)
- Testar: botão "Gerar PDF de Ordem" **e** "Gerar Fichas das Lojas" (são caminhos diferentes) + "Reimprimir" no Histórico

### 2. Extrair `MarkupSessao.jsx` (usado em 2 lugares — não estava no plano original)
- Mover o componente `MarkupSessao` (~l2933)
- É usado dentro de `VisualizarSessao` (modal de markup) E dentro do orchestrator `Compras` — importar nos dois
- Testar: abrir o modal de Markup a partir do Histórico e a partir de Visualizar Sessão

### 4. Extrair `Historico.jsx`
- Mover o componente `Historico` (~l2490–2900)
- Importa: `supabase`, `sessoesService`, `pedidosService`, `pdfHelpers`, `useAuth`, `styles`
- Compras.jsx importa `Historico` de `./Historico`
- Testar: listagem, botões Editar/Visualizar/Preencher/Reimprimir

### 5. Extrair `VisualizarSessao.jsx`
- Mover o componente `VisualizarSessao` (~l2400–2490)
- Importa: `supabase`, `sessoesService`, `pedidosService`, `styles`, `MarkupSessao`
- Testar: botão Visualizar no Histórico + modal de Markup dentro dele

### 6. Extrair `PreencherMinhaLoja.jsx`
- Mover o componente `PreencherMinhaLoja` (~l2877–3280)
- Importa: `supabase`, `pedidosService`, `GRADE_DEFINITIONS`, `tamanhosDeTipoGrade`, `useAuth`, `styles`
- Testar: botão Preencher no Histórico

### 7. Extrair `FecharSessao.jsx`
- Mover o componente `FecharSessao` (~l2100–2400)
- Importa: `pedidosService`, `fornecedoresService`, `pdfHelpers`, `useAuth`, `styles`
- Testar: Phase 3 completo + Gerar PDFs (Ordem e Ficha)

### 8. Extrair `RegistrarPedidoSessao.jsx` (maior risco — deixar por último)
- Mover tudo entre ~l558–1878: estados, helpers, form inline de nova referência, render completo
- Importa: `supabase`, todos os services, `GRADE_DEFINITIONS`, `tamanhosDeTipoGrade`,
  `segmentacoesService`, `projCache`, `distribTargets`, `useAuth`, `styles`
- Testar: Phase 2 completo — adicionar item, editar grade, digitar quantidades e ver `SaveStatus`
  ir a "salvo", recarregar a aba e confirmar que o rascunho voltou (recovery), remover loja,
  distribuir por projeção, liberar colaboração

### 9. Limpar `Compras.jsx` (orchestrator)
- Fica com: state global (phase, sessao, visitas, recoveryInitial, compradores, forns, segs),
  handlers de navegação (handleStart, handleRetomarSessao, handleVisualizar, handlePreencherLoja),
  e o JSX de roteamento entre phases
- ~350 linhas

---

## Armadilhas conhecidas

- Não existe um componente `AddItemForm` separado nem constante `N_TPAIRS` no arquivo atual —
  o form de nova referência é JSX inline dentro do bloco de RegistrarPedidoSessao (~l1491–1600)
  e já vai junto no passo 8, sem mover à parte.

- `MarkupSessao` (~l2933) é usado em DOIS lugares: dentro de `VisualizarSessao` e dentro do
  orchestrator `Compras`. Extrair para arquivo próprio (passo 2) e importar nos dois.

- Os helpers de formato (`fmt`, `fmtDate`, `today`, `esc`, `PLUS_SIZE_DEFAULT`) hoje vivem no
  topo do módulo e são enxergados por escopo léxico por todos os componentes. Um `import`
  faltando não estoura no build — só em runtime, ao abrir a tela que usa o helper. Por isso
  viram passo 0, antes de tudo.

- `Compras.module.css` é compartilhado. Todos os arquivos novos importam o mesmo CSS:
  `import styles from './Compras.module.css'` — sem mudança no CSS.

- `GRADE_DEFINITIONS` e `tamanhosDeTipoGrade` vêm de `../lib/grades.js` — importar diretamente
  em cada componente que precisar.

- Não renomear variáveis, não refatorar lógica — apenas mover blocos. Commit entre cada passo.

---

## Resultado esperado

| Métrica | Antes | Depois |
|---|---|---|
| Linhas por arquivo (máx) | 3.600 | ~1.300 (Phase 2) |
| Reads para entender Phase 3 | 3–4 paginados | 1 completo |
| Tokens por sessão de debug | alto | ~60% menos |
| Risco de contexto perdido | alto | baixo |

---

## Quando fazer

Após estabilizar os bugs do Phase 2/3 (reduce errors, salvar sessão, gerar PDFs).
Fazer em branch separada, testando cada passo antes de avançar.
