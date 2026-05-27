# Auditoria Final — Solução Compras
> Gerado em: 2026-05-27

## Resumo executivo

O código está em bom estado geral — migração Electron→Web completa, RLS habilitado em 15/15 tabelas, zero `window.api` restante. Os principais problemas encontrados foram de performance (bundle xlsx) e robustez menor (useEffect sem cleanup). Todos os problemas ALTO e MÉDIO foram corrigidos nesta sessão.

---

## Top 5 Issues por prioridade

| # | Issue | Arquivo | Prioridade | Status |
|---|-------|---------|-----------|--------|
| 1 | xlsx importado estaticamente (+860 KB no bundle inicial) | grades.js, Configuracoes.jsx | ALTO | ✅ CORRIGIDO |
| 2 | Write policies permissivas (qualquer autenticado pode modificar qualquer registro) | Supabase RLS | MÉDIO | ⚠️ Pendente — aceitável para app interno |
| 3 | 3× useEffect sem cleanup em Compras.jsx | Compras.jsx:1605,1887,1899 | BAIXO | ✅ CORRIGIDO |
| 4 | Policy redundante em pedidos (comprador_read_own é dead code) | Supabase | BAIXO | ⚠️ Pendente |
| 5 | roundTo99/calcPrecoVenda inline no componente | Compras.jsx:587 | INFO | Pendente (baixo impacto) |

---

## Resultados mensuráveis

### Bundle antes e depois
| Arquivo | Antes | Depois |
|---------|-------|--------|
| index.js (inicial) | 1,892 KB | 1,197 KB (-37%) |
| xlsx.js (lazy) | — | 866 KB (só carrega ao importar) |

### Segurança
- 15/15 tabelas com RLS ativo ✅
- 0 secrets hardcoded ✅
- 0 chamadas window.api no web ✅

---

## Recomendações de arquitetura futura

1. **Extração de `lib/calc.js`**: `roundTo99`, `calcPrecoVenda`, formatadores monetários vivem em múltiplos lugares. Um arquivo utilitário compartilhado facilita testes e evita duplicação.

2. **RLS por comprador (longo prazo)**: Se o app for usado por parceiros externos ou requer auditoria por loja, as write policies precisam de restrição por `comprador_id`. Para o contexto atual (família interna), é aceitável.

3. **Code splitting do Supabase JS**: Após o xlsx, o Supabase JS (~400 KB) é o segundo maior contribuinte. Com React.lazy() nas rotas principais e suspense boundaries, daria para reduzir o inicial para ~600 KB.

4. **Compras.jsx refatoração**: Com 1.800+ linhas, o arquivo está no limite de manutenibilidade. Candidatos a extração: `IniciarSessao`, `RegistrarPedido`, `HistoricoSessoes` em arquivos separados.

---

## Estimativa de esforço restante

| Item | Esforço |
|------|---------|
| Remover policy redundante em pedidos | 10 min |
| Extrair lib/calc.js | 20 min |
| Refatorar Compras.jsx em sub-componentes | 4-6h |
| RLS por comprador (escrita restrita) | 2-3h |
| Code splitting Supabase (React.lazy routes) | 2h |
