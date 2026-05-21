# Keyboard-First Session Form — Design Spec

**Data:** 2026-05-21  
**Escopo:** Refatorar `IniciarSessao` em `Compras.jsx` para foco progressivo com navegação por teclado e tutorial de primeira vez.

---

## Objetivo

O Samuel preenche este formulário várias vezes por dia durante feiras de moda. O fluxo atual é um formulário padrão — todos os campos visíveis, Tab entre eles. A mudança é puramente de UX: sem alteração de banco, IPC ou API.

---

## Comportamento geral

O formulário opera com um campo **ativo** por vez. Os demais campos ficam visíveis mas com opacidade reduzida, dando contexto sem distrair.

- **Campo done** — opacidade 50%, label com `✓`, valor exibido como texto estático
- **Campo active** — `border-left: 3px solid var(--accent)`, fundo levemente destacado, input visível e focado automaticamente
- **Campo upcoming** — opacidade 20%, sem interação
- **Barra de progresso** no header: largura = `(campos preenchidos / total) * 100%`
- **Animação:** `transition: opacity 0.2s, border-color 0.2s` — fade suave, sem slide

---

## Campos e atalhos de teclado

| # | Campo | Tipo | Atalho | Auto-avança |
|---|-------|------|--------|-------------|
| 1 | Fornecedor | Autocomplete (filtro da lista existente) | ↑↓ navega lista, Enter seleciona | Sim — ao selecionar |
| 2 | Data da visita | Date input | Enter confirma (padrão: hoje) | Não |
| 3 | Vendedor | Texto livre | Enter avança | Não |
| 4 | Cond. de pagamento | Texto livre | Enter avança | Não |
| 5 | Frete | 3 opções (CIF / FOB / sem frete) | `C` = CIF, `F` = FOB, `Enter` = sem frete | Sim — ao pressionar C ou F |
| 5b | Transportadora | Texto livre (só se Frete = FOB) | Enter avança | Não |
| 6 | Lojas participantes | Multi-select com chips numerados | `1`–`8` seleciona loja participante, Enter confirma e submete | Enter = submit |

**Esc** em qualquer campo volta ao campo anterior. No campo 1 (Fornecedor), Esc não faz nada.

### Fornecedor — autocomplete
- O input filtra a lista de fornecedores em tempo real (já disponível em state)
- ↑↓ navega entre resultados filtrados
- Enter seleciona o item focado e auto-avança para Data
- Se só restar um resultado, Enter seleciona sem precisar navegar

### Frete — seleção por tecla
- Exibe 3 botões: `C CIF` · `F FOB` · `Enter sem frete`
- Pressionar C ou F seleciona e auto-avança (sem precisar de Enter adicional)
- Pressionar Enter com nenhum selecionado = "sem frete"

### Lojas — chips numerados
- Grid 2 colunas, cada chip mostra `[N]` + nome + cidade
- Pressionar `1`–`8` seleciona/deseleciona a loja correspondente
- Chip selecionado: fundo accent, número em destaque
- Enter confirma e chama `handleIniciar` (mesmo comportamento do botão atual)
- Pelo menos 1 loja deve estar selecionada para Enter funcionar

---

## Tutorial de primeira vez

Disparado por: `localStorage.getItem('sessionFormTutorialSeen') !== 'true'`

Ao abrir o formulário pela primeira vez, um overlay escurece o fundo e exibe um card central com os atalhos:

```
⌨️ Preenchimento por teclado
Este formulário é otimizado para velocidade.

  Enter   →  Avança para o próximo campo
  Esc     →  Volta ao campo anterior
  C / F   →  Frete CIF ou FOB
  1–8     →  Seleciona loja participante

[ Não mostrar novamente ]    [ Entendido  Enter ]
```

- **"Entendido"** (ou Enter): fecha o overlay, grava `sessionFormTutorialSeen = true` no localStorage
- **"Não mostrar novamente"**: mesma ação — existe para tornar a intenção explícita
- O overlay não bloqueia o scroll; fecha apenas via ação do usuário (não por clique fora)

### Botão de ajuda `?`
- Ícone circular `?` no canto direito do header do formulário, sempre visível
- Clique reabre o overlay (não altera o localStorage)
- Tooltip ao hover: `"Ver atalhos de teclado"`

---

## State necessário

```js
// Adicionado ao componente IniciarSessao (já existente em Compras.jsx)
const [activeField, setActiveField] = useState('fornecedor')
const [showTutorial, setShowTutorial] = useState(
  () => localStorage.getItem('sessionFormTutorialSeen') !== 'true'
)
```

O estado restante (fornecedor, data, vendedor, etc.) já existe — sem alteração.

---

## Arquivos a modificar

| Arquivo | O que muda |
|---------|------------|
| `src/renderer/src/screens/Compras.jsx` | `IniciarSessao`: adiciona `activeField`, `showTutorial`; refatora renderização dos campos; adiciona handlers de teclado por campo; adiciona overlay de tutorial e botão `?` |
| `src/renderer/src/screens/Compras.module.css` | Classes novas: `.fieldDone`, `.fieldActive`, `.fieldUpcoming`, `.freteOpts`, `.freteOpt`, `.freteOptSelected`, `.lojaChip`, `.lojaChipOn`, `.tutorialOverlay`, `.tutorialCard`, `.helpBtn`, `.progressBar` |

**Sem alterações em:** banco, IPC, preload, contextos, componentes externos.

---

## O que não muda

- O botão "Iniciar Sessão →" continua existindo no footer como fallback — não é removido
- Validações existentes (pelo menos 1 loja, fornecedor obrigatório) permanecem inalteradas
- O banner de recuperação de sessão interrompida (acima do formulário) não é afetado
