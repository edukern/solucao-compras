# Arquitetura Multi-Usuário — Design

**Data:** 2026-05-26  
**Status:** Aprovado  
**Contexto:** Migração da solução Electron/SQLite local para Web App multi-usuário com acesso simultâneo para os 8 lojistas da rede Irmãos Backes, sem custo mensal.

---

## 1. Problema

A solução atual roda exclusivamente no computador de Samuel como app Electron. Todos os dados chamam `window.electron.ipcRenderer.invoke()`, que não existe no browser — por isso a demo no Vercel usa dados mockados. A pasta de Pedidos está sincronizada no Google Drive e todos os 8 lojistas têm acesso, o que torna necessário um sistema multi-usuário real.

**Restrições:**
- Zero custo mensal (lojas não vão assumir assinatura)
- 8 usuários Windows, conexão estável, uso majoritariamente online
- Sessões de compra independentes por lojista (cada um faz suas visitas)
- Histórico de 10 anos em ~3.000 xlsx não precisa estar em detalhe completo — só o que alimenta projeções, ranking e análise por lojista

---

## 2. Arquitetura escolhida

**Web App + Supabase Free + Cloudflare Pages + GitHub Actions keep-alive**

```
[8 lojistas]
    |
    | HTTPS (qualquer browser)
    ↓
[Cloudflare Pages]
  React SPA — já construído
  Deploy automático via GitHub
  GRÁTIS · comercial OK · sem limites
    |
    | Supabase JS SDK
    ↓
[Supabase Free — PostgreSQL]
  Auth · Realtime · 500MB storage
  Já integrado na tela de Pendências
    ↑
    | import único (histórico) + uso contínuo
[Dados]
  ├── Temporada atual: pedidos, itens, fornecedores, coleções, compradores (detalhe completo)
  ├── Histórico compactado: 4 tabelas hist_* (~10MB · 3.000 xlsx sintetizados)
  └── Drive (arquivo): xlsx originais preservados para auditoria — app não acessa mais
    ↑
[GitHub Actions keep-alive]
  SELECT 1 a cada 4 dias — impede pausa automática do Supabase Free
```

### Por que essa escolha

- Supabase já está integrado no projeto (tela de Pendências usa). Migrar para Supabase Full evita reescrever o modelo de dados.
- Com dados compactados (~10MB histórico + temporada atual), o limite de 500MB do Supabase Free não é problema.
- Cloudflare Pages é gratuito para uso comercial, sem restrição de ToS (Vercel Hobby é "non-commercial only").
- O único ponto fraco do Supabase Free (pausa após 1 semana sem acesso) se resolve com cron de 10 linhas no GitHub Actions.

### Por que não Firebase

Firebase (Firestore) é NoSQL — dificulta as queries relacionais necessárias para Curva ABC (`GROUP BY fornecedor`), Quebra de Estoque (joins de grade), e análise por lojista. Com Supabase PostgreSQL, essas queries são naturais.

### Por que não Electron + sync

Sync bidirecional (SQLite local ↔ Supabase) é complexo: conflitos quando dois usuários editam o mesmo pedido offline. A rede tem conexão estável — o caso offline-first não justifica a complexidade de sync.

---

## 3. Mudanças no código

### 3.1 Trocar data layer (esforço principal)

Substituir ~20 handlers Electron IPC por chamadas Supabase diretas em cada tela:

| Antes (Electron) | Depois (Supabase) |
|---|---|
| `window.electron.ipcRenderer.invoke('get-pedidos')` | `supabase.from('pedidos').select('*')` |
| `window.electron.ipcRenderer.invoke('save-pedido', data)` | `supabase.from('pedidos').upsert(data)` |
| `window.electron.ipcRenderer.invoke('get-fornecedores')` | `supabase.from('fornecedores').select('*')` |

Telas afetadas: Pedidos, Fornecedores, Produtos, Relatórios, Import Excel.
A tela de Pendências já usa Supabase — serve de modelo.

Import de Excel: manter usando a File API do browser (já funciona no build web via `vite.web.config.js`). Remover a dependência de `fs` do Node.js/Electron para leitura de arquivo.

### 3.2 Autenticação

Supabase Auth com login por e-mail e senha. Cada lojista tem credenciais próprias.

Row Level Security (RLS) no Supabase:
- Compradores veem apenas seus próprios pedidos (`comprador_id = auth.uid()`)
- Samuel (admin) vê tudo — identificado por uma coluna `role = 'admin'` na tabela `compradores` ou por e-mail fixo nas policies RLS
- Tabelas hist_* são leitura pública para todos os autenticados (somente leitura — escrita apenas via script de import)

### 3.3 Deploy: Cloudflare Pages

Substituir Vercel Hobby por Cloudflare Pages:
- Build command: `npm run build:web`
- Output directory: `dist/web`
- O `vite.web.config.js` já existe — nenhuma mudança no build
- Conectar repositório GitHub → deploy automático em cada push

### 3.4 Keep-alive cron

```yaml
# .github/workflows/keepalive.yml
name: Supabase keep-alive
on:
  schedule:
    - cron: '0 9 */4 * *'   # a cada 4 dias às 9h UTC
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase
        run: |
          curl -s "${{ secrets.SUPABASE_URL }}/rest/v1/fornecedores?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" > /dev/null
          echo "Pinged at $(date)"
```

Secrets necessários: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (ambos já existem no projeto).

---

## 4. Mudanças no banco de dados

### 4.1 Campos novos em tabelas existentes

Identificados na análise dos 3.000 xlsx históricos — campos presentes nos pedidos reais mas ausentes do schema atual:

```sql
-- Prazo de entrega negociado com o fornecedor
ALTER TABLE pedidos ADD COLUMN prazo_entrega DATE;

-- Cor do item (presente em todos os xlsx como dimensão da grade)
ALTER TABLE pedido_itens ADD COLUMN cor TEXT;

-- Crédito de ICMS negociado (percentual)
ALTER TABLE pedidos ADD COLUMN credito_icms_pct NUMERIC(5,2);

-- Número da nota fiscal (auditoria futura)
ALTER TABLE pedidos ADD COLUMN numero_nota_fiscal TEXT;
```

### 4.2 Tabelas de histórico compactado (4 novas)

Substituem os 3.000 xlsx como fonte de dados para os relatórios históricos.

```sql
-- (A) Grade por produto por temporada → alimenta projeções de tamanho
CREATE TABLE hist_grade (
  id              BIGSERIAL PRIMARY KEY,
  colecao_id      TEXT NOT NULL,       -- ex: "2024-1"
  segmentacao_id  INTEGER REFERENCES segmentacoes(id),
  tamanho         TEXT NOT NULL,        -- PP, P, M, G, GG, XGG, 34, 36...
  qtd_total_comprada INTEGER NOT NULL,
  UNIQUE (colecao_id, segmentacao_id, tamanho)
);
-- ~48K linhas · <5MB

-- (B) Volume por fornecedor por temporada → Curva ABC
CREATE TABLE hist_fornecedor (
  id              BIGSERIAL PRIMARY KEY,
  colecao_id      TEXT NOT NULL,
  fornecedor_id   INTEGER REFERENCES fornecedores(id),
  total_bruto     NUMERIC(12,2),
  total_liquido   NUMERIC(12,2),
  num_referencias INTEGER,
  UNIQUE (colecao_id, fornecedor_id)
);
-- ~2.400 linhas · minúsculo

-- (C) Volume por lojista × fornecedor → análise por comprador
CREATE TABLE hist_comprador_fornecedor (
  id              BIGSERIAL PRIMARY KEY,
  colecao_id      TEXT NOT NULL,
  comprador_id    INTEGER REFERENCES compradores(id),
  fornecedor_id   INTEGER REFERENCES fornecedores(id),
  total_bruto     NUMERIC(12,2),
  total_liquido   NUMERIC(12,2),
  UNIQUE (colecao_id, comprador_id, fornecedor_id)
);
-- ~19K linhas

-- (C) Mix de produto por lojista → preferência por categoria
CREATE TABLE hist_comprador_produto (
  id              BIGSERIAL PRIMARY KEY,
  colecao_id      TEXT NOT NULL,
  comprador_id    INTEGER REFERENCES compradores(id),
  segmentacao_id  INTEGER REFERENCES segmentacoes(id),
  qtd_total       INTEGER,
  valor_total     NUMERIC(12,2),
  UNIQUE (colecao_id, comprador_id, segmentacao_id)
);
-- ~38K linhas
```

**Total histórico compactado: ~110K linhas · ~10MB** (cabe ~50× dentro do Supabase Free de 500MB).

---

## 5. Script de importação histórica (executado 1× só)

Um script Node.js standalone que:
1. Lê todos os xlsx de `Pedidos/` recursivamente
2. Parseia cada arquivo identificando: coleção, compradores, fornecedor, referências, grades, valores
3. Agrega os dados nas 4 tabelas hist_* via upsert no Supabase
4. Grava um log de progresso para poder reiniciar se interrompido

O script roda localmente (acesso ao Drive) uma única vez. Não faz parte do app.

---

## 6. Relatórios habilitados pelo histórico

Com as tabelas hist_* populadas, os botões hoje desabilitados ficam funcionais:

| Relatório | Tabela usada | Query principal |
|---|---|---|
| Curva ABC Fornecedores | `hist_fornecedor` | `GROUP BY fornecedor_id ORDER BY total_liquido DESC` |
| Quebra de Estoque (projeção de grade) | `hist_grade` | média por segmentação/tamanho nas últimas N coleções |
| Análise por Lojista | `hist_comprador_fornecedor` + `hist_comprador_produto` | filter por `comprador_id` |

---

## 7. Sequência de execução

| Etapa | O que fazer | Tempo estimado |
|---|---|---|
| 1 | Schema Supabase: tabelas existentes + 4 hist_* + 4 novos campos + seed | 1–2 dias |
| 2 | Trocar data layer: ~20 handlers IPC → supabase.from() em todas as telas | 1–2 semanas |
| 3 | Auth (Supabase Auth + RLS) + Cloudflare Pages + keep-alive cron | 2–3 dias |
| 4 | Script de import histórico (roda 1×) | 2–3 dias |
| 5 | Relatórios Curva ABC + Quebra de Estoque + Análise por lojista | 1 semana |

**Total estimado: 3–4 semanas**

---

## 8. O que NÃO muda

- Todo o código React (componentes, telas, hooks)
- Modelo de dados (mesmo schema, só adiciona campos e tabelas)
- Fluxo de uso para o comprador (registrar pedido, ver pendências, etc.)
- Import de Excel continua funcionando (só muda de `fs` para File API do browser)
- O `vite.web.config.js` existente já está pronto para o build web

---

## 9. Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Cron keep-alive falha e Supabase pausa | Baixa | Monitorar notificações de e-mail do Supabase; cron roda a cada 4 dias (margem de 3 dias antes da pausa de 7 dias) |
| Schema dos xlsx varia entre temporadas e o import quebra | Média | Script de import com tratamento de erro por arquivo + log detalhado; testar em amostra antes de rodar completo |
| Conflito de dados ao migrar SQLite → Supabase | Baixa | Migrar apenas temporada ativa (poucos registros); histórico vai direto para hist_* sem passar pelo SQLite |
| Supabase Free atinge 500MB no futuro | Muito baixa | Com ~10MB de histórico e ~5MB por temporada, tem espaço para ~90 temporadas futuras |
