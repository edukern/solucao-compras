# Demo Vercel — Design Spec

**Data:** 2026-05-16  
**Escopo:** App de demonstração web para apresentação ao gestor, hospedado no Vercel

---

## Objetivo

Criar um link público que o gestor (Samuel Backes) possa abrir no navegador para entender a solução sem instalar nada. O link mostra: o problema que resolve, o fluxo de uso, o status do projeto e o app interativo com dados realistas da operação.

---

## Arquitetura

Subprojeto `demo/` dentro do repositório existente (`edukern/solucao-compras`). App Vite + React standalone (não Electron) com React Router. Duas rotas: `/` (landing) e `/app` (app interativo).

Os componentes de tela (Dashboard, Compras, Relatórios) são copiados do renderer existente. Uma camada `mockApi.js` exporta o mesmo contrato de `window.api` com dados hardcoded — os screens não sabem que estão rodando em modo demo.

O Vercel faz deploy automático via `vercel.json` na raiz do `demo/`.

```
demo/
├── package.json
├── vite.config.js
├── vercel.json
├── index.html
└── src/
    ├── main.jsx              ← entry + React Router + Provider
    ├── mockApi.js            ← substitui window.api (mesmo contrato)
    ├── mockData.js           ← dados da operação (fornecedores, pedidos, etc.)
    ├── contexts/
    │   └── CollectionContext.jsx  ← cópia do renderer, usa mockApi
    ├── Landing.jsx           ← rota /
    ├── Landing.module.css
    └── screens/              ← cópias dos screens do renderer
        ├── Dashboard.jsx
        ├── Dashboard.module.css
        ├── Compras.jsx
        ├── Compras.module.css
        ├── Relatorios.jsx
        ├── Relatorios.module.css
        └── relatorios/
            ├── PorFornecedor.jsx
            ├── PorFornecedor.module.css
            ├── PorSegmentacao.jsx
            └── PorSegmentacao.module.css
```

Planejamento.jsx não é incluído — substituído por tela simples com aviso "requer histórico de coleções anteriores".

---

## Landing page (`/`)

Página em scroll vertical com fundo escuro (mesma paleta do app). Três seções:

### Seção 1 — Problema
Título grande + subtítulo de contraste:
> "Gestão de compras de moda sem planilhas."  
> "Hoje: 100 arquivos Excel, sem visão consolidada. Depois: um sistema, uma tela."

### Seção 2 — Fluxo
Linha do tempo horizontal com 4 etapas (ícone + título + 1 linha):
1. **Criar coleção** — define a temporada (Inverno 2026, Verão 2027…)
2. **Planejar projeções** — o sistema calcula baseado no histórico das 2 coleções equivalentes anteriores
3. **Registrar pedidos** — a cada negociação fechada, registra fornecedor + segmentação + grade
4. **Acompanhar relatórios** — visão em tempo real: projeção vs comprado, por fornecedor e por segmentação

### Seção 3 — Status do projeto
Dois painéis lado a lado:

**✅ Funcionando hoje:**
- Dashboard com progresso geral
- Planejamento com cálculo de projeção
- Registro de pedidos
- Relatórios: Por Fornecedor e Por Segmentação

**🔧 Em construção:**
- Interface para criar coleções
- Importação automática do histórico (planilhas Excel)
- Cadastro dos ~150 fornecedores do ERP
- Refinamento visual

**CTA:** botão "Explorar o app →" navega para `/app`.

---

## App interativo (`/app`)

### mockApi.js

Exporta objeto com o mesmo contrato de `window.api`. Todas as funções são assíncronas (retornam Promise) para manter compatibilidade com os screens existentes.

```js
export const mockApi = {
  colecoes:     { list, create },
  segmentacoes: { list, create },
  fornecedores: { list, create },
  pedidos:      { salvar, totaisPorFornecedor, itensPorFornecedor, totaisPorTamanho, listarVisitas, listarPorColecao },
  projecoes:    { get, calcular, salvar },
  grades:       { get },
}
```

Em `main.jsx`: `window.api = mockApi` antes de renderizar — os screens funcionam sem alteração.

### mockData.js

**Coleção:** "Inverno 2026" (id=1, status='em_compra')

**Fornecedores (~15):** GANGSTER, LUNENDER, HAVAIANAS, MOLEKINHO, MORMAII CONFECCAO, BEIRA RIO, CROCKER, PEGADA, ALTENBURG, TEEZZ, FATTALY, JEITO FASHION, FATAL SUL, DECIZAO, RITA MODAS

**Segmentações:** combinações reais de classificacao × tipo_produto × classe baseadas na operação do cliente (AD/EX/INF × BERMUDA/CALCA/BLUSINHA/CALCADO × FEM/MASC/INF)

**Pedidos:** distribuídos entre os 15 fornecedores com quantidades plausíveis — temporada em andamento (~60% do previsto comprado). Cada fornecedor tem 1-4 segmentações.

**Projeções:** derivadas dos pedidos × fator de 1.4-1.8 para simular saldo realista.

### Sidebar no modo app

Mantém o visual do Sidebar existente. Adiciona um link "← Voltar à apresentação" no topo que navega para `/`.

Planejamento mostra: "Esta funcionalidade requer o histórico de coleções anteriores importado. Disponível na próxima fase."

---

## Deploy

`demo/vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Deploy manual: `cd demo && npx vercel --prod` na primeira vez. Subsequentes: automáticos via push no GitHub (Vercel conectado ao repo).

---

## Fora de escopo

- Autenticação
- Persistência de dados (tudo é mock, resets ao recarregar)
- Tela de Planejamento interativa
- Mobile responsivo
