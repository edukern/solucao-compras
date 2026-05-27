# Auditoria de Bugs — Solução Compras
> Gerado em: 2026-05-27

## Resumo

3 useEffects sem cleanup em Compras.jsx que podem causar `setState` em componente desmontado no React 18 StrictMode. Não causam crash visível mas podem gerar warnings. Markup formula já corrigida.

---

## Achados

### ⚠️ BAIXO: useEffect sem cleanup — Compras.jsx:1605

```js
useEffect(() => {
  sessoesService.list(colId).then(list => {
    setSessoesList(list)   // ← pode executar após unmount
    setLoading(false)
  })
}, [colId])
```

**Risco:** Se o usuário navegar para outra tela enquanto a query carrega, `setSessoesList` é chamado em componente desmontado.

**Fix:**
```js
useEffect(() => {
  let cancelled = false
  sessoesService.list(colId).then(list => {
    if (!cancelled) { setSessoesList(list); setLoading(false) }
  })
  return () => { cancelled = true }
}, [colId])
```

---

### ⚠️ BAIXO: useEffect sem cleanup — Compras.jsx:1887

```js
useEffect(() => {
  Promise.all([
    segmentacoesService.list(),
    fornecedoresService.list(),
    compradoresService.list(),
  ]).then(([s, f, c]) => { setSegs(s); setForns(f); setCompradores(c) })
}, [])
```

**Fix:** Mesmo padrão com flag `cancelled`. Embora o dep array `[]` reduza o risco (só roda no mount), o React 18 StrictMode monta/desmonta duas vezes em dev, gerando double-fetch.

---

### ⚠️ BAIXO: useEffect sem cleanup — Compras.jsx:1896

```js
useEffect(() => {
  if (!active?.id) return
  // ...
  sessoesService.byId(data.sessao_id).then(sessaoDb => {
    if (!sessaoDb) { ... setRecoveryData(null); return }
    // ...
    setRecoveryData({ ... })
  })
}, [active?.id])
```

**Fix:** Flag `cancelled` antes do `.then()`.

---

### ✅ RESOLVIDO: Markup formula corrigida

`calcPrecoVenda` agora usa `v * (1 + m)` (correto para markup aditivo).
Ex: valor 100, markup 1.2 → preço 320 (não 120).

---

### INFO: `roundTo99` e `calcPrecoVenda` inline no componente

Definidas dentro do componente `RegistrarPedido` em Compras.jsx:587-598.
Sem impacto no comportamento, mas candidatas a serem movidas para `src/renderer/src/lib/calc.js` para reutilização e testabilidade.

---

## Prioridade de ação

| # | Achado | Arquivo:Linha | Prioridade | Esforço |
|---|--------|-------------|-----------|---------|
| 1 | useEffect sem cleanup | Compras.jsx:1605 | BAIXO | 5 min |
| 2 | useEffect sem cleanup | Compras.jsx:1887 | BAIXO | 5 min |
| 3 | useEffect sem cleanup | Compras.jsx:1896 | BAIXO | 5 min |
| 4 | Funções utilitárias inline | Compras.jsx:587 | INFO | 15 min |
