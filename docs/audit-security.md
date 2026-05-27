# Auditoria de Segurança — Solução Compras
> Gerado em: 2026-05-27

## Resumo

Nenhuma vulnerabilidade crítica encontrada. A aplicação usa corretamente a anon key do Supabase, RLS habilitado em todas as tabelas, e zero `window.api` exposto no browser.

---

## Achados

### ✅ RLS habilitado em todas as tabelas (15/15)
Todas as tabelas têm `relrowsecurity = true` e ao menos 1 policy.
Tabelas: colecoes, compradores, fornecedores, grade_historica, hist_*, pedido_itens, pedidos, projecoes, segmentacoes, sessoes, user_compradores, visitas.

### ✅ Variáveis de ambiente corretas
- `VITE_SUPABASE_ANON_KEY` = anon key pública (correto, não é service role)
- `VITE_SUPABASE_URL` = URL pública do projeto
- Nenhum secret hardcoded encontrado no código-fonte

### ✅ Sem uso de `window.api` no browser
Migração completa concluída pelo CCR na sessão 10.

### ⚠️ MÉDIO: Write policies permissivas em dados de negócio
**Tabelas afetadas:** pedidos, pedido_itens, sessoes, visitas, colecoes, segmentacoes, fornecedores, compradores, projecoes

**Política atual:** `auth_write (ALL) WHERE auth.role() = 'authenticated'`

Qualquer usuário autenticado pode INSERT/UPDATE/DELETE qualquer registro nessas tabelas, incluindo registros de outros compradores.

**Risco real:** Baixo para este app (contexto interno, todos os usuários são funcionários da mesma família). Se houver expansão para acesso externo, é necessário restringir escrita por `comprador_id`.

**Fix sugerido (futuro):** Para `pedidos` e `visitas`, adicionar `WITH CHECK (comprador_id IN (SELECT comprador_id FROM user_compradores WHERE user_id = auth.uid()))`.

### ⚠️ BAIXO: Policy redundante em `pedidos`
`pedidos` tem duas policies de SELECT:
1. `auth_write (cmd=ALL)` — permite SELECT para qualquer autenticado
2. `comprador_read_own (cmd=SELECT)` — tenta limitar ao próprio comprador

Como as policies usam lógica OR, a `auth_write` já concede SELECT para todos, tornando `comprador_read_own` dead code. O relatório PorFornecedor funciona corretamente porque vê todos os pedidos.

**Fix:** Remover `comprador_read_own` ou separar `auth_write` em policies distintas por comando.

### ✅ `user_compradores` bem protegida
Políticas próprias por `auth.uid()` — só o próprio usuário pode ler/inserir/deletar seu vínculo.

---

## Prioridade de ação

| # | Achado | Prioridade | Esforço |
|---|--------|-----------|---------|
| 1 | Write policies permissivas | MÉDIO | Alto (requer redesign RLS) |
| 2 | Policy redundante em pedidos | BAIXO | 10 min |
| 3 | Anon key exposta via Vite env | INFO | Aceitável (por design Supabase) |
