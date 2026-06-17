# HANDOFF — Sync Macle → Supabase
Data: 2026-06-17 | Sessão #8

---

## ✅ Concluído nesta sessão

- `sync-controle.js` e `sync-config.json` copiados para `C:\sync-controle\` no servidor
- Permissões corrigidas no Supabase (`GRANT` na tabela e na sequence)
- Primeiro sync executado com sucesso: **529 registros** em 4 coleções
- Dados confirmados na tabela `hist_empresa_grade` (compra, venda, estoque por grade × tamanho)

## ⏳ Próximos passos (em ordem)

### 1. Conectar Agregador UI ao hist_empresa_grade

O componente Agregador em `src/renderer/src/screens/Agregador.jsx` ainda não consome `hist_empresa_grade`. Precisa ser atualizado para ler do Supabase com os campos `tipo_grade`, `colecao_id`, `tamanho`, `qtd_comprada`, `qtd_vendida`, `qtd_estoque`.

### 2. Agendar o sync no servidor (Task Scheduler)

Criar uma tarefa agendada no Windows para rodar diariamente:
```
cd C:\sync-controle && node sync-controle.js >> C:\sync-controle\sync.log 2>&1
```

### 3. Projeto macle-integrations

Após o Agregador estar funcionando, criar projeto separado `macle-integrations` (Node.js puro, sem framework) para centralizar sync-controle.js, relatórios e futuras automações — tirando esses scripts do solucao-compras.

---

## 🧠 Decisões técnicas que não estão no código

**Por que tipo_grade e não segmentacao_id no hist_empresa_grade:**
O Macle entrega dados aggregados no nível de grade (AD, EX, PP, BB...) — que é o `gradetamanho.descricao` no banco. A tabela `segmentacoes` é mais granular (tem tipo_produto, classe, estacao), o que não bate com a granularidade do Macle. Trocar para `tipo_grade TEXT` foi a decisão correta.

**Por que agregar todas as lojas num único comprador_id:**
Samuel compra para todo o grupo (lojas 1, 11, 12, 13, 99 = todas Backes). Para o Agregador o que importa é o total do grupo, não por loja. O `codempresa_controle: [1, 11, 12, 13, 99]` agrega tudo via `ANY($1::int[])`.

**Estratégia geral de BI (contexto para outros projetos):**
ERP Macle tem devs conservadores → nunca implementará customizações. O padrão de acesso é: conexão read-only ao PostgreSQL do servidor (10.0.0.1 via WireGuard ou localhost no servidor) → script Node.js → upsert Supabase → frontend React. `sync-controle.js` é o template para qualquer futura ferramenta de BI/automação.

---

## 📁 Arquivos que importam para a próxima tarefa

| Arquivo | Importância |
|---------|-------------|
| `scripts/sync-controle.js` | Script completo e pronto — só falta o config |
| `scripts/sync-config.example.json` | Template para criar o config no servidor |
| `supabase/migrations/020_hist_empresa_grade_v2.sql` | Migration já aplicada no Supabase |
| `C:\sync-controle\` (servidor) | Destino do script no servidor Windows |

**Supabase:** projeto `bhxpkysueyoblizkvomb`
- `compradores`: id=1 (Backes Art. Vestuário), id=2 (Backes Prog 1), id=3 (Backes Prog 2)
- `hist_empresa_grade`: tabela recriada com `tipo_grade TEXT` — vazia, pronta pro sync

**Banco controle:** tabelas-chave do Macle para o sync:
- `itemdoccompra` — compras (filtro: `dtmovto`, `codempresa`)
- `itemdocvenda` — vendas (filtro: `dataemissao`, `codempresa`, `estornado <> 'S'`)
- `estoque` — saldo atual (sem filtro de data)
- `item` — catálogo (tem `codgrade` e `codcolecao`)
- `gradetamanho` — nome da grade: AD, EX, PP, BB…
- `tamanho` — nome e ordem do tamanho: P, M, G, GG…
