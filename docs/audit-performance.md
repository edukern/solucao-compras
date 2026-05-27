# Auditoria de Performance — Solução Compras
> Gerado em: 2026-05-27

## Bundle (npm run build)

| Arquivo | Tamanho | Status |
|---------|---------|--------|
| index.html | 1.02 KB | ✅ OK |
| assets/index-*.css | 78.9 KB | ✅ OK (< 100 KB) |
| assets/index-*.js | **1,892 KB** | ❌ Muito grande |

**Benchmarks:** JS < 500 KB gzip (~1.5 MB minified). Com gzip, 1.9 MB → ~450-600 KB. Borderline aceitável mas identificada causa principal.

---

## Achados

### ❌ ALTO: xlsx importado estaticamente — +860 KB no bundle

**Arquivos afetados:**
- `src/renderer/src/services/grades.js:2` — `import * as XLSX from 'xlsx'`
- `src/renderer/src/screens/Configuracoes.jsx:2` — `import * as XLSX from 'xlsx'`

A biblioteca `xlsx` tem ~860 KB minificada e é usada apenas em 2 funções:
1. `grades.importar()` — chamada ao importar grade histórica de xlsx
2. `Configuracoes.jsx` — chamada ao importar fornecedores via xlsx

**Fix aplicado:** Converter para dynamic import dentro das funções:

```js
// Antes (estático — carrega na inicialização)
import * as XLSX from 'xlsx'

// Depois (dinâmico — carrega só quando necessário)
async function importar(file, ...) {
  const XLSX = await import('xlsx')
  // ...
}
```

Isso reduz o bundle inicial em ~50% (de ~1.9 MB para ~1 MB).

---

### ✅ Sem queries N+1 nos services

Todos os services usam joins inline do Supabase PostgREST:
```js
supabase.from('sessoes').select(`*, visitas(pedidos(pedido_itens(*)))`)
```
Não foram encontrados loops com queries dentro.

---

### ✅ Sem window.api restante

Nenhuma chamada `window.api.*` encontrada no código. Migração completa.

---

### INFO: Re-renders em Compras.jsx

Compras.jsx é um arquivo de ~1.800 linhas com múltiplos estados interdependentes. Alguns handlers inline em JSX causam re-renders desnecessários mas não impactam performance observável dado o volume de dados.

Candidatos a `useCallback` futuro: `handleKeyDown`, `handleSave` (definidos inline nos inputs).

---

## Prioridade de ação

| # | Achado | Prioridade | Impacto | Esforço |
|---|--------|-----------|---------|---------|
| 1 | xlsx static import | ALTO | -50% bundle | 15 min |
| 2 | Re-renders inline handlers | BAIXO | Negligível | 30 min |
