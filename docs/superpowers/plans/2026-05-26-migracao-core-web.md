# Migração Core Web — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o app Electron/SQLite local para Web App multi-usuário acessível via browser, com dados no Supabase PostgreSQL e hospedagem no Cloudflare Pages — custo R$0/mês.

**Architecture:** Todo o código React existente é mantido. A camada `window.api.*` (Electron IPC) é substituída por uma camada de serviços (`src/renderer/src/services/`) que chama o Supabase diretamente. O schema SQLite é recriado no Supabase com adições mínimas. Auth via Supabase Auth com RLS por comprador.

**Tech Stack:** React 18, Supabase JS v2, Vite, Cloudflare Pages, GitHub Actions

---

## File Map

**Criar:**
- `supabase/migrations/001_schema_inicial.sql` — schema completo no Supabase
- `supabase/migrations/002_hist_tables.sql` — tabelas de histórico compactado
- `supabase/seed.sql` — compradores e fornecedores iniciais
- `src/renderer/src/services/colecoes.js`
- `src/renderer/src/services/sessoes.js`
- `src/renderer/src/services/pedidos.js`
- `src/renderer/src/services/segmentacoes.js`
- `src/renderer/src/services/fornecedores.js`
- `src/renderer/src/services/compradores.js`
- `src/renderer/src/services/grades.js`
- `src/renderer/src/services/projecoes.js`
- `src/renderer/src/services/dashboard.js`
- `src/renderer/src/contexts/AuthContext.jsx`
- `src/renderer/src/screens/Login.jsx`
- `src/renderer/src/screens/Login.module.css`
- `.github/workflows/keepalive.yml`

**Modificar:**
- `src/renderer/src/contexts/CollectionContext.jsx` — trocar `window.api` → service
- `src/renderer/src/App.jsx` — adicionar AuthContext + remover updater Electron
- `src/renderer/src/screens/Compras.jsx` — trocar todos os `window.api.*`
- `src/renderer/src/screens/Dashboard.jsx` — trocar `window.api.dashboard.data`
- `src/renderer/src/screens/Planejamento.jsx` — trocar `window.api.*`
- `src/renderer/src/screens/Configuracoes.jsx` — remover funcionalidades Electron-only

---

## Task 1: Schema no Supabase

**Files:**
- Create: `supabase/migrations/001_schema_inicial.sql`
- Create: `supabase/migrations/002_hist_tables.sql`
- Create: `supabase/seed.sql`

- [ ] **Step 1: Criar o arquivo de migração principal**

```sql
-- supabase/migrations/001_schema_inicial.sql

CREATE TABLE IF NOT EXISTS colecoes (
  id        BIGSERIAL PRIMARY KEY,
  nome      TEXT NOT NULL,
  estacao   TEXT NOT NULL CHECK(estacao IN ('verao','inverno')),
  ano       INTEGER NOT NULL,
  status    TEXT NOT NULL DEFAULT 'planejamento'
                 CHECK(status IN ('planejamento','em_compra','finalizada'))
);

CREATE TABLE IF NOT EXISTS fornecedores (
  id        BIGSERIAL PRIMARY KEY,
  nome      TEXT NOT NULL UNIQUE,
  contato   TEXT,
  categoria TEXT
);

CREATE TABLE IF NOT EXISTS compradores (
  id      BIGSERIAL PRIMARY KEY,
  nome    TEXT NOT NULL,
  cnpj    TEXT,
  cidade  TEXT,
  role    TEXT NOT NULL DEFAULT 'comprador' CHECK(role IN ('comprador','admin')),
  user_id UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS segmentacoes (
  id              BIGSERIAL PRIMARY KEY,
  classificacao   TEXT NOT NULL,
  tipo_produto    TEXT NOT NULL,
  classe          TEXT NOT NULL,
  tipo_grade      TEXT NOT NULL DEFAULT 'AD',
  estacao         TEXT NOT NULL,
  UNIQUE(classificacao, tipo_produto, classe, tipo_grade)
);

CREATE TABLE IF NOT EXISTS grade_historica (
  id              BIGSERIAL PRIMARY KEY,
  segmentacao_id  BIGINT NOT NULL REFERENCES segmentacoes(id),
  colecao_id      BIGINT NOT NULL REFERENCES colecoes(id),
  tamanho         TEXT NOT NULL,
  ordem           INTEGER NOT NULL DEFAULT 0,
  qtd_comprada    INTEGER NOT NULL DEFAULT 0,
  qtd_vendida     INTEGER NOT NULL DEFAULT 0,
  qtd_estoque     INTEGER NOT NULL DEFAULT 0,
  UNIQUE(segmentacao_id, colecao_id, tamanho)
);

CREATE TABLE IF NOT EXISTS projecoes (
  id              BIGSERIAL PRIMARY KEY,
  segmentacao_id  BIGINT NOT NULL REFERENCES segmentacoes(id),
  colecao_id      BIGINT NOT NULL REFERENCES colecoes(id),
  tamanho         TEXT NOT NULL,
  ordem           INTEGER NOT NULL DEFAULT 0,
  qtd_projetada   INTEGER NOT NULL DEFAULT 0,
  qtd_ajustada    INTEGER NOT NULL DEFAULT 0,
  metodo          TEXT NOT NULL DEFAULT 'media_simples'
                       CHECK(metodo IN ('media_simples','media_ponderada','manual')),
  UNIQUE(segmentacao_id, colecao_id, tamanho)
);

CREATE TABLE IF NOT EXISTS sessoes (
  id              BIGSERIAL PRIMARY KEY,
  fornecedor_id   BIGINT NOT NULL REFERENCES fornecedores(id),
  colecao_id      BIGINT NOT NULL REFERENCES colecoes(id),
  data_visita     DATE NOT NULL,
  vendedor        TEXT,
  cond_pag        TEXT,
  frete           TEXT,
  obs             TEXT,
  transportadora  TEXT
);

CREATE TABLE IF NOT EXISTS visitas (
  id           BIGSERIAL PRIMARY KEY,
  sessao_id    BIGINT NOT NULL REFERENCES sessoes(id) ON DELETE CASCADE,
  comprador_id BIGINT NOT NULL REFERENCES compradores(id)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id              BIGSERIAL PRIMARY KEY,
  visita_id       BIGINT NOT NULL REFERENCES visitas(id) ON DELETE CASCADE,
  comprador_id    BIGINT NOT NULL REFERENCES compradores(id),
  segmentacao_id  BIGINT NOT NULL REFERENCES segmentacoes(id),
  referencia      TEXT,
  valor_unitario  NUMERIC(10,2) NOT NULL DEFAULT 0,
  desconto_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
  icms_pct        NUMERIC(5,2) NOT NULL DEFAULT 0,
  markup_pct      NUMERIC(5,2) NOT NULL DEFAULT 0,
  preco_venda     NUMERIC(10,2) NOT NULL DEFAULT 0,
  transportadora  TEXT,
  nota_fiscal     TEXT,
  cor             TEXT,
  detalhe         TEXT,
  obs             TEXT,
  prazo_entrega   DATE
);

CREATE TABLE IF NOT EXISTS pedido_itens (
  id        BIGSERIAL PRIMARY KEY,
  pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  tamanho   TEXT NOT NULL,
  qtd       INTEGER NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_grade_seg_col ON grade_historica(segmentacao_id, colecao_id);
CREATE INDEX IF NOT EXISTS idx_proj_seg_col  ON projecoes(segmentacao_id, colecao_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_visita ON pedidos(visita_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_visitas_sessao ON visitas(sessao_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_col ON sessoes(colecao_id);

-- RLS: habilitar em todas as tabelas
ALTER TABLE colecoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE compradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE segmentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_historica ENABLE ROW LEVEL SECURITY;
ALTER TABLE projecoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;

-- Policies: usuário autenticado lê tudo (dados de sessão são compartilhados)
CREATE POLICY "auth_read_all" ON colecoes    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_all" ON fornecedores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_all" ON compradores  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_all" ON segmentacoes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_all" ON grade_historica FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_all" ON projecoes    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_all" ON sessoes      FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_all" ON visitas      FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_all" ON pedido_itens FOR SELECT USING (auth.role() = 'authenticated');

-- Pedidos: cada comprador vê os seus; admin vê todos
CREATE POLICY "comprador_read_own" ON pedidos FOR SELECT
  USING (
    comprador_id IN (
      SELECT id FROM compradores WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM compradores WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Write policies: autenticado pode escrever em tudo (simplificado para v1)
CREATE POLICY "auth_write" ON colecoes    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON fornecedores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON compradores  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON segmentacoes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON grade_historica FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON projecoes    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON sessoes      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON visitas      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON pedidos      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON pedido_itens FOR ALL USING (auth.role() = 'authenticated');
```

- [ ] **Step 2: Criar tabelas de histórico compactado**

```sql
-- supabase/migrations/002_hist_tables.sql

CREATE TABLE IF NOT EXISTS hist_grade (
  id              BIGSERIAL PRIMARY KEY,
  colecao_id      TEXT NOT NULL,
  segmentacao_id  BIGINT REFERENCES segmentacoes(id),
  tamanho         TEXT NOT NULL,
  qtd_total_comprada INTEGER NOT NULL,
  UNIQUE (colecao_id, segmentacao_id, tamanho)
);

CREATE TABLE IF NOT EXISTS hist_fornecedor (
  id              BIGSERIAL PRIMARY KEY,
  colecao_id      TEXT NOT NULL,
  fornecedor_id   BIGINT REFERENCES fornecedores(id),
  total_bruto     NUMERIC(12,2),
  total_liquido   NUMERIC(12,2),
  num_referencias INTEGER,
  UNIQUE (colecao_id, fornecedor_id)
);

CREATE TABLE IF NOT EXISTS hist_comprador_fornecedor (
  id              BIGSERIAL PRIMARY KEY,
  colecao_id      TEXT NOT NULL,
  comprador_id    BIGINT REFERENCES compradores(id),
  fornecedor_id   BIGINT REFERENCES fornecedores(id),
  total_bruto     NUMERIC(12,2),
  total_liquido   NUMERIC(12,2),
  UNIQUE (colecao_id, comprador_id, fornecedor_id)
);

CREATE TABLE IF NOT EXISTS hist_comprador_produto (
  id              BIGSERIAL PRIMARY KEY,
  colecao_id      TEXT NOT NULL,
  comprador_id    BIGINT REFERENCES compradores(id),
  segmentacao_id  BIGINT REFERENCES segmentacoes(id),
  qtd_total       INTEGER,
  valor_total     NUMERIC(12,2),
  UNIQUE (colecao_id, comprador_id, segmentacao_id)
);

-- RLS: leitura pública para autenticados, escrita apenas via service role
ALTER TABLE hist_grade             ENABLE ROW LEVEL SECURITY;
ALTER TABLE hist_fornecedor        ENABLE ROW LEVEL SECURITY;
ALTER TABLE hist_comprador_fornecedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE hist_comprador_produto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read" ON hist_grade             FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON hist_fornecedor        FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON hist_comprador_fornecedor FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON hist_comprador_produto FOR SELECT USING (auth.role() = 'authenticated');
```

- [ ] **Step 3: Criar seed de dados iniciais**

```sql
-- supabase/seed.sql
INSERT INTO compradores (nome, cnpj, cidade, role) VALUES
  ('Irmãos Backes',        '08.889.201/0001-01', 'Três Coroas/RS',          'admin'),
  ('Samuel Paulo Backes',  '15.563.106/0001-70', 'Três Coroas/RS',          'comprador'),
  ('PSM Backes',           '28.010.922/0001-07', 'Igrejinha/RS',            'comprador'),
  ('Alexandre Backes',     '06.284.903/0001-28', '',                        'comprador'),
  ('Elisangela M. Backes', '13.706.244/0001-36', 'Santa Maria do Herval/RS','comprador'),
  ('Rafael J. Backes',     '46.348.002/0001-77', 'Rolante/RS',              'comprador'),
  ('Streit Conf',          '10.206.469/0001-35', 'Riozinho/RS',             'comprador'),
  ('FMV Streit Conf',      '20.354.516/0001-41', 'Rolante/RS',              'comprador')
ON CONFLICT DO NOTHING;

INSERT INTO fornecedores (nome, contato, categoria) VALUES
  ('LUNENDER', '', 'CONFECCOES'),
  ('GANGSTER',  '', 'ACESSORIOS'),
  ('FAKINI',    '', 'CONFECCOES'),
  ('ROVITEX',   '', 'CONFECCOES'),
  ('BIOGAS',    '', 'CONFECCOES'),
  ('CROCKER',   '', 'CONFECCOES'),
  ('HUTTZ',     '', 'CONFECCOES'),
  ('MOONCITY',  '', 'CONFECCOES')
ON CONFLICT DO NOTHING;
```

- [ ] **Step 4: Rodar as migrações no Supabase**

Acesse o Supabase Dashboard → SQL Editor e execute na ordem:
1. Conteúdo de `supabase/migrations/001_schema_inicial.sql`
2. Conteúdo de `supabase/migrations/002_hist_tables.sql`
3. Conteúdo de `supabase/seed.sql`

Verificação esperada: todas as tabelas aparecem em Database → Tables sem erro.

- [ ] **Step 5: Commit**

```bash
git add supabase/
git commit -m "feat: schema Supabase completo com hist_* e seed de compradores/fornecedores"
```

---

## Task 2: Camada de Serviços

**Objetivo:** Criar `src/renderer/src/services/` com um arquivo por entidade. Cada arquivo exporta funções com a mesma assinatura que `window.api.*` usa nas telas, mas implementadas via Supabase.

**Files:**
- Create: `src/renderer/src/services/colecoes.js`
- Create: `src/renderer/src/services/sessoes.js`
- Create: `src/renderer/src/services/pedidos.js`
- Create: `src/renderer/src/services/segmentacoes.js`
- Create: `src/renderer/src/services/fornecedores.js`
- Create: `src/renderer/src/services/compradores.js`
- Create: `src/renderer/src/services/grades.js`
- Create: `src/renderer/src/services/projecoes.js`
- Create: `src/renderer/src/services/dashboard.js`

- [ ] **Step 1: Criar serviço de coleções**

```js
// src/renderer/src/services/colecoes.js
import { supabase } from '../lib/supabase'

export const colecoes = {
  async list() {
    const { data, error } = await supabase
      .from('colecoes')
      .select('*')
      .order('ano', { ascending: false })
      .order('estacao')
    if (error) throw error
    return data
  },
  async create({ nome, estacao, ano }) {
    const { data, error } = await supabase
      .from('colecoes')
      .insert({ nome, estacao, ano })
      .select()
      .single()
    if (error) throw error
    return data
  },
  async setStatus(id, status) {
    const { error } = await supabase
      .from('colecoes')
      .update({ status })
      .eq('id', id)
    if (error) throw error
  }
}
```

- [ ] **Step 2: Criar serviço de sessões**

```js
// src/renderer/src/services/sessoes.js
import { supabase } from '../lib/supabase'

export const sessoes = {
  async create({ fornecedor_id, colecao_id, data_visita, vendedor, cond_pag, frete, obs, transportadora }) {
    const { data, error } = await supabase
      .from('sessoes')
      .insert({ fornecedor_id, colecao_id, data_visita, vendedor, cond_pag, frete, obs, transportadora })
      .select()
      .single()
    if (error) throw error
    return data
  },
  async list(colecao_id) {
    const { data, error } = await supabase
      .from('sessoes')
      .select(`*, fornecedor:fornecedores(id,nome), visitas(id, comprador_id)`)
      .eq('colecao_id', colecao_id)
      .order('data_visita', { ascending: false })
    if (error) throw error
    return data
  },
  async byId(id) {
    const { data, error } = await supabase
      .from('sessoes')
      .select(`*, fornecedor:fornecedores(id,nome), visitas(id, comprador_id)`)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },
  async update(id, fields) {
    const { data, error } = await supabase
      .from('sessoes')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
  async cancelar(id) {
    // Cancela a sessão e todas as visitas/pedidos em cascata (ON DELETE CASCADE no schema)
    const { error } = await supabase.from('sessoes').delete().eq('id', id)
    if (error) throw error
  }
}
```

- [ ] **Step 3: Criar serviço de pedidos**

```js
// src/renderer/src/services/pedidos.js
import { supabase } from '../lib/supabase'

export const pedidos = {
  // Salva um lote de pedidos de uma visita.
  // batch: [{ comprador_id, segmentacao_id, referencia, valor_unitario, desconto_pct,
  //           icms_pct, markup_pct, preco_venda, cor, detalhe, obs, prazo_entrega,
  //           itens: [{tamanho, qtd}] }]
  // sessao_id: ID da sessão à qual estes pedidos pertencem
  async salvarBatch(batch, sessao_id) {
    const results = []
    for (const ped of batch) {
      if (!ped.comprador_id) continue
      // 1. Garantir que a visita (sessao × comprador) existe
      let { data: visita } = await supabase
        .from('visitas')
        .select('id')
        .eq('sessao_id', sessao_id)
        .eq('comprador_id', ped.comprador_id)
        .single()
      if (!visita) {
        const { data: novaVisita, error: ve } = await supabase
          .from('visitas')
          .insert({ sessao_id, comprador_id: ped.comprador_id })
          .select()
          .single()
        if (ve) throw ve
        visita = novaVisita
      }
      // 2. Upsert do pedido
      const { itens, ...pedFields } = ped
      const { data: pedido, error: pe } = await supabase
        .from('pedidos')
        .upsert(
          { ...pedFields, visita_id: visita.id },
          { onConflict: 'visita_id,segmentacao_id' }
        )
        .select()
        .single()
      if (pe) throw pe
      // 3. Substituir itens
      await supabase.from('pedido_itens').delete().eq('pedido_id', pedido.id)
      if (itens?.length) {
        const rows = itens.map(it => ({ pedido_id: pedido.id, tamanho: it.tamanho, qtd: it.qtd }))
        const { error: ie } = await supabase.from('pedido_itens').insert(rows)
        if (ie) throw ie
      }
      results.push(pedido)
    }
    return results
  },

  async byVisita(visita_id) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`*, segmentacao:segmentacoes(*), itens:pedido_itens(tamanho,qtd)`)
      .eq('visita_id', visita_id)
    if (error) throw error
    return data
  },

  async cancelar(id) {
    const { error } = await supabase.from('pedidos').delete().eq('id', id)
    if (error) throw error
  },

  async itensPorFornecedor(sessao_id) {
    // Retorna todos os pedidos de uma sessão com itens, agrupados por comprador
    const { data, error } = await supabase
      .from('visitas')
      .select(`id, comprador_id, comprador:compradores(nome), pedidos(*, segmentacao:segmentacoes(*), itens:pedido_itens(tamanho,qtd))`)
      .eq('sessao_id', sessao_id)
    if (error) throw error
    return data
  },

  async totaisPorFornecedor(sessao_id) {
    const { data, error } = await supabase
      .from('visitas')
      .select(`comprador_id, comprador:compradores(nome), pedidos(valor_unitario, desconto_pct, icms_pct, pedido_itens(qtd))`)
      .eq('sessao_id', sessao_id)
    if (error) throw error
    return data
  }
}
```

- [ ] **Step 4: Criar serviço de segmentações**

```js
// src/renderer/src/services/segmentacoes.js
import { supabase } from '../lib/supabase'

export const segmentacoes = {
  async list() {
    const { data, error } = await supabase.from('segmentacoes').select('*').order('classificacao')
    if (error) throw error
    return data
  },
  async findOrCreate({ classificacao, tipo_produto, classe, tipo_grade, estacao }) {
    const { data: existing } = await supabase
      .from('segmentacoes')
      .select('*')
      .eq('classificacao', classificacao)
      .eq('tipo_produto', tipo_produto)
      .eq('classe', classe)
      .eq('tipo_grade', tipo_grade)
      .single()
    if (existing) return existing
    const { data, error } = await supabase
      .from('segmentacoes')
      .insert({ classificacao, tipo_produto, classe, tipo_grade, estacao })
      .select()
      .single()
    if (error) throw error
    return data
  },
  async create(fields) {
    const { data, error } = await supabase.from('segmentacoes').insert(fields).select().single()
    if (error) throw error
    return data
  },
  async update(id, fields) {
    const { data, error } = await supabase.from('segmentacoes').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async remove(id) {
    const { error } = await supabase.from('segmentacoes').delete().eq('id', id)
    if (error) throw error
  }
}
```

- [ ] **Step 5: Criar serviços de fornecedores e compradores**

```js
// src/renderer/src/services/fornecedores.js
import { supabase } from '../lib/supabase'

export const fornecedores = {
  async list() {
    const { data, error } = await supabase.from('fornecedores').select('*').order('nome')
    if (error) throw error
    return data
  },
  async create(fields) {
    const { data, error } = await supabase.from('fornecedores').insert(fields).select().single()
    if (error) throw error
    return data
  },
  async update(id, fields) {
    const { data, error } = await supabase.from('fornecedores').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async remove(id) {
    const { error } = await supabase.from('fornecedores').delete().eq('id', id)
    if (error) throw error
  },
  // importarArquivo: no web, o parse do xlsx é feito no browser antes de chamar o serviço.
  // Esta função recebe os dados já parseados (array de objetos {nome, contato, categoria}).
  async importarDados(rows) {
    const { data, error } = await supabase
      .from('fornecedores')
      .upsert(rows, { onConflict: 'nome' })
      .select()
    if (error) throw error
    return data
  }
}
```

```js
// src/renderer/src/services/compradores.js
import { supabase } from '../lib/supabase'

export const compradores = {
  async list() {
    const { data, error } = await supabase.from('compradores').select('*').order('nome')
    if (error) throw error
    return data
  },
  async create(fields) {
    const { data, error } = await supabase.from('compradores').insert(fields).select().single()
    if (error) throw error
    return data
  },
  async update(id, fields) {
    const { data, error } = await supabase.from('compradores').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async remove(id) {
    const { error } = await supabase.from('compradores').delete().eq('id', id)
    if (error) throw error
  }
}
```

- [ ] **Step 6: Criar serviços de grades e projeções**

```js
// src/renderer/src/services/grades.js
import { supabase } from '../lib/supabase'
import * as XLSX from 'xlsx'  // yarn add xlsx  (se ainda não instalado)

export const grades = {
  async get(segmentacao_id, colecao_id) {
    const { data, error } = await supabase
      .from('grade_historica')
      .select('*')
      .eq('segmentacao_id', segmentacao_id)
      .eq('colecao_id', colecao_id)
      .order('ordem')
    if (error) throw error
    return data
  },
  // importar: recebe um File object (do <input type="file">), retorna linhas inseridas
  async importar(file, segmentacao_id, colecao_id) {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws)
    // Espera colunas: tamanho, qtd_comprada, qtd_vendida, qtd_estoque, ordem (opcional)
    const toInsert = rows.map((r, i) => ({
      segmentacao_id,
      colecao_id,
      tamanho: String(r.tamanho ?? r.Tamanho ?? ''),
      qtd_comprada: Number(r.qtd_comprada ?? r['Qtd Comprada'] ?? 0),
      qtd_vendida:  Number(r.qtd_vendida  ?? r['Qtd Vendida']  ?? 0),
      qtd_estoque:  Number(r.qtd_estoque  ?? r['Qtd Estoque']  ?? 0),
      ordem: i
    }))
    const { data, error } = await supabase
      .from('grade_historica')
      .upsert(toInsert, { onConflict: 'segmentacao_id,colecao_id,tamanho' })
      .select()
    if (error) throw error
    return data
  }
}
```

```js
// src/renderer/src/services/projecoes.js
import { supabase } from '../lib/supabase'

export const projecoes = {
  async get(segmentacao_id, colecao_id) {
    const { data, error } = await supabase
      .from('projecoes')
      .select('*')
      .eq('segmentacao_id', segmentacao_id)
      .eq('colecao_id', colecao_id)
      .order('ordem')
    if (error) throw error
    return data
  },

  // Calcula projeção com base em coleções históricas (baseIds: array de colecao_id)
  async calcular(segmentacao_id, colecao_id, baseIds, metodo) {
    if (!baseIds?.length) return []
    const { data: historico } = await supabase
      .from('grade_historica')
      .select('tamanho, ordem, qtd_comprada')
      .eq('segmentacao_id', segmentacao_id)
      .in('colecao_id', baseIds)
    if (!historico?.length) return []
    // Agrupa por tamanho
    const byTam = {}
    for (const row of historico) {
      if (!byTam[row.tamanho]) byTam[row.tamanho] = { qtds: [], ordem: row.ordem }
      byTam[row.tamanho].qtds.push(row.qtd_comprada)
    }
    return Object.entries(byTam).map(([tamanho, { qtds, ordem }]) => {
      let qtd_projetada
      if (metodo === 'media_simples') {
        qtd_projetada = Math.round(qtds.reduce((s, v) => s + v, 0) / qtds.length)
      } else if (metodo === 'media_ponderada') {
        // Mais recente tem peso maior
        const total = qtds.reduce((s, _, i) => s + (i + 1), 0)
        qtd_projetada = Math.round(qtds.reduce((s, v, i) => s + v * (i + 1), 0) / total)
      } else {
        qtd_projetada = qtds[qtds.length - 1] ?? 0 // manual: último valor como sugestão
      }
      return { segmentacao_id, colecao_id, tamanho, ordem, qtd_projetada, qtd_ajustada: qtd_projetada, metodo }
    })
  },

  async salvar(segmentacao_id, colecao_id, rows, metodo) {
    const toUpsert = rows.map(r => ({
      segmentacao_id,
      colecao_id,
      tamanho: r.tamanho,
      ordem: r.ordem ?? 0,
      qtd_projetada: r.qtd_projetada,
      qtd_ajustada: r.qtd_ajustada,
      metodo
    }))
    const { error } = await supabase
      .from('projecoes')
      .upsert(toUpsert, { onConflict: 'segmentacao_id,colecao_id,tamanho' })
    if (error) throw error
  }
}
```

- [ ] **Step 7: Criar serviço de dashboard**

```js
// src/renderer/src/services/dashboard.js
import { supabase } from '../lib/supabase'

export const dashboard = {
  async data(colecao_id) {
    // Retorna projeções vs. comprado por segmentação para a coleção
    const [{ data: proj }, { data: ped }] = await Promise.all([
      supabase
        .from('projecoes')
        .select('segmentacao_id, tamanho, qtd_ajustada')
        .eq('colecao_id', colecao_id),
      supabase
        .from('pedidos')
        .select(`segmentacao_id, pedido_itens(tamanho, qtd)`)
        .eq('visita:visitas.sessao:sessoes.colecao_id', colecao_id)
    ])
    // Nota: a query acima pode precisar de ajuste dependendo de como
    // pedidos são filtrados por coleção (via visita → sessao → colecao_id).
    // Query alternativa mais simples:
    const { data: pedidosPorSessao } = await supabase
      .from('sessoes')
      .select(`id, visitas(pedidos(segmentacao_id, pedido_itens(tamanho, qtd)))`)
      .eq('colecao_id', colecao_id)
    return { projecoes: proj ?? [], sessoes: pedidosPorSessao ?? [] }
  }
}
```

- [ ] **Step 8: Commit da camada de serviços**

```bash
git add src/renderer/src/services/
git commit -m "feat: camada de serviços Supabase (substitui window.api.*)"
```

---

## Task 3: Instalar xlsx e atualizar CollectionContext

**Files:**
- Modify: `src/renderer/src/contexts/CollectionContext.jsx`
- Modify: `src/renderer/src/App.jsx`

- [ ] **Step 1: Instalar dependência xlsx**

```bash
npm install xlsx
```

Verificação: `package.json` deve ter `"xlsx": "^0.18.x"` em `dependencies`.

- [ ] **Step 2: Atualizar CollectionContext**

Substituir a chamada `window.api.colecoes.list()` pelo serviço:

```jsx
// src/renderer/src/contexts/CollectionContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { colecoes as colecoesService } from '../services/colecoes'

const CollectionContext = createContext(null)

export function CollectionProvider({ children }) {
  const [collections, setCollections] = useState([])
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    colecoesService.list().then(list => {
      setCollections(list)
      if (list.length > 0) setActiveId(list[0].id)
    }).catch(console.error)
  }, [])

  const active = collections.find(c => c.id === activeId) ?? null

  return (
    <CollectionContext.Provider value={{ collections, setCollections, active, activeId, setActiveId }}>
      {children}
    </CollectionContext.Provider>
  )
}

export function useCollection() {
  const ctx = useContext(CollectionContext)
  if (!ctx) throw new Error('useCollection must be inside CollectionProvider')
  return ctx
}
```

- [ ] **Step 3: Atualizar App.jsx — remover updater Electron**

Encontre as linhas que referenciam `window.api.updater` em `src/renderer/src/App.jsx` e remova-as. O updater não é necessário em Web App (Cloudflare Pages atualiza automaticamente a cada deploy).

Remover:
- `window.api.updater.onStatus(setUpdateStatus)` (no useEffect)
- O botão `onClick={() => window.api.updater.install()}` 
- O estado `updateStatus` se não for mais usado

Manter tudo o mais do App.jsx intacto.

- [ ] **Step 4: Verificar que o build web funciona**

```bash
npm run build:web
```

Esperado: build concluído sem erros em `dist/web/`.

- [ ] **Step 5: Commit**

```bash
git add src/renderer/src/contexts/CollectionContext.jsx src/renderer/src/App.jsx package.json package-lock.json
git commit -m "feat: CollectionContext migrado para Supabase, updater Electron removido"
```

---

## Task 4: Migrar Compras.jsx

**Files:**
- Modify: `src/renderer/src/screens/Compras.jsx`

Esta é a tela principal e tem o maior número de chamadas `window.api.*`. O padrão é: importar o serviço no topo do arquivo e substituir cada chamada.

- [ ] **Step 1: Adicionar imports dos serviços no topo de Compras.jsx**

Adicionar após os imports existentes:

```jsx
import { sessoes as sessoesService } from '../services/sessoes'
import { pedidos as pedidosService } from '../services/pedidos'
import { segmentacoes as segmentacoesService } from '../services/segmentacoes'
import { fornecedores as fornecedoresService } from '../services/fornecedores'
import { compradores as compradoresService } from '../services/compradores'
import { projecoes as projecoesService } from '../services/projecoes'
```

- [ ] **Step 2: Substituir chamadas de dados — sessões e inicialização**

Localizar e substituir cada `window.api.*` conforme a tabela:

| Linha original | Substituição |
|---|---|
| `window.api.sessoes.create({...})` | `sessoesService.create({...})` |
| `window.api.sessoes.list(colId)` | `sessoesService.list(colId)` |
| `window.api.sessoes.byId(id)` | `sessoesService.byId(id)` |
| `window.api.sessoes.update(id, form)` | `sessoesService.update(id, form)` |
| `window.api.sessoes.cancelar(id)` | `sessoesService.cancelar(id)` |
| `window.api.pedidos.salvarBatch(batch)` | `pedidosService.salvarBatch(batch, sessaoAtiva.id)` |
| `window.api.pedidos.byVisita(visitaId)` | `pedidosService.byVisita(visitaId)` |
| `window.api.pedidos.cancelar(pedidoId)` | `pedidosService.cancelar(pedidoId)` |
| `window.api.segmentacoes.findOrCreate({...})` | `segmentacoesService.findOrCreate({...})` |
| `window.api.segmentacoes.list()` | `segmentacoesService.list()` |
| `window.api.fornecedores.list()` | `fornecedoresService.list()` |
| `window.api.compradores.list()` | `compradoresService.list()` |
| `window.api.projecoes.get(segId, colId)` | `projecoesService.get(segId, colId)` |

- [ ] **Step 3: Substituir PDF — salvarNaPasta**

A função `salvarNaPasta` usa Electron para salvar PDF no disco. No browser, substituir por `window.print()` ou blob download.

Localizar a função `salvarNaPasta` em Compras.jsx e substituir:

```jsx
// ANTES (Electron):
// return window.api.pdf.salvarNaPasta(html, nome, pasta)

// DEPOIS (browser):
async function salvarNaPasta(html, nome) {
  const blob = new Blob([`<!DOCTYPE html><html><body>${html}</body></html>`], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nome}.html`
  a.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 4: Substituir escolherPasta**

`window.api.pdf.escolherPasta()` pede para o usuário escolher uma pasta (Electron dialog). No browser não existe pasta — os PDFs são baixados automaticamente.

Localizar todas as chamadas `window.api.pdf.escolherPasta()` e substituir por `Promise.resolve('downloads')`.

Remover o estado `pastaDestino` se existir e simplificar a UX (no web, o arquivo vai direto para Downloads do browser sem pedir pasta).

- [ ] **Step 5: Verificar build e testar no browser**

```bash
npm run build:web && npx serve dist/web
```

Abrir `http://localhost:3000` e verificar que a tela de Compras carrega. Testar: criar sessão, adicionar pedido, ver lista de sessões.

Erros esperados (corrigir em seguida): quaisquer `window.api.*` que restarem causarão `TypeError: Cannot read properties of undefined`.

- [ ] **Step 6: Commit**

```bash
git add src/renderer/src/screens/Compras.jsx
git commit -m "feat: Compras.jsx migrado de Electron IPC para serviços Supabase"
```

---

## Task 5: Migrar Dashboard.jsx e Planejamento.jsx

**Files:**
- Modify: `src/renderer/src/screens/Dashboard.jsx`
- Modify: `src/renderer/src/screens/Planejamento.jsx`

- [ ] **Step 1: Migrar Dashboard.jsx**

Adicionar import:
```jsx
import { dashboard as dashboardService } from '../services/dashboard'
```

Substituir:
```jsx
// ANTES:
const flatRows = await window.api.dashboard.data(colId)

// DEPOIS:
const flatRows = await dashboardService.data(colId)
```

- [ ] **Step 2: Migrar Planejamento.jsx**

Adicionar imports:
```jsx
import { segmentacoes as segmentacoesService } from '../services/segmentacoes'
import { grades as gradesService } from '../services/grades'
import { projecoes as projecoesService } from '../services/projecoes'
```

Substituições em Planejamento.jsx:

| Original | Novo |
|---|---|
| `window.api.segmentacoes.list()` | `segmentacoesService.list()` |
| `window.api.grades.get(sid, n2Id)` | `gradesService.get(sid, n2Id)` |
| `window.api.grades.get(sid, n1Id)` | `gradesService.get(sid, n1Id)` |
| `window.api.projecoes.get(sid, active.id)` | `projecoesService.get(sid, active.id)` |
| `window.api.projecoes.calcular(sid, active.id, baseIds, met)` | `projecoesService.calcular(sid, active.id, baseIds, met)` |
| `window.api.projecoes.salvar(segId, active.id, toSave, metodo)` | `projecoesService.salvar(segId, active.id, toSave, metodo)` |

- [ ] **Step 3: Migrar o import de arquivo em Planejamento.jsx**

`window.api.dialog.openFile({...})` abre o file picker do sistema via Electron. No browser, substituir por input HTML oculto:

Localizar onde `openFile` é chamado e substituir pelo padrão File API:

```jsx
// Adicionar ref no topo do componente:
const fileInputRef = useRef(null)

// Substituir a lógica de abertura de arquivo:
// ANTES:
// const filePath = await window.api.dialog.openFile({ filters: [...] })
// const result = await window.api.grades.importar(...)

// DEPOIS:
function handleImportClick() {
  fileInputRef.current?.click()
}
async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const result = await gradesService.importar(file, segId, active.id)
    // ... resto da lógica de sucesso que já existe
  } catch (err) {
    console.error('Erro ao importar:', err)
  }
  e.target.value = '' // reset para permitir reimport do mesmo arquivo
}

// No JSX, adicionar o input oculto onde o botão de import está:
<input
  ref={fileInputRef}
  type="file"
  accept=".xlsx,.xls"
  style={{ display: 'none' }}
  onChange={handleFileChange}
/>
// Trocar o onClick do botão existente por: onClick={handleImportClick}
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/screens/Dashboard.jsx src/renderer/src/screens/Planejamento.jsx
git commit -m "feat: Dashboard e Planejamento migrados para serviços Supabase"
```

---

## Task 6: Autenticação

**Files:**
- Create: `src/renderer/src/contexts/AuthContext.jsx`
- Create: `src/renderer/src/screens/Login.jsx`
- Create: `src/renderer/src/screens/Login.module.css`
- Modify: `src/renderer/src/App.jsx`

- [ ] **Step 1: Criar AuthContext**

```jsx
// src/renderer/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = carregando

  useEffect(() => {
    // Sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    // Ouvir mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Criar tela de Login**

```jsx
// src/renderer/src/screens/Login.jsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import styles from './Login.module.css'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail]     = useState('')
  const [senha, setSenha]     = useState('')
  const [erro, setErro]       = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)
    setLoading(true)
    const { error } = await signIn(email, senha)
    setLoading(false)
    if (error) setErro(error.message)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Solução Compras</h1>
        <p className={styles.subtitle}>Irmãos Backes</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={styles.input}
            placeholder="seu@email.com"
            required
            autoFocus
          />
          <label className={styles.label}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            className={styles.input}
            placeholder="••••••••"
            required
          />
          {erro && <p className={styles.erro}>{erro}</p>}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

```css
/* src/renderer/src/screens/Login.module.css */
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f5f5;
}
.card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 4px 24px rgba(0,0,0,.08);
}
.title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #1a1a2e;
}
.subtitle {
  font-size: 14px;
  color: #888;
  margin: 0 0 28px;
}
.form { display: flex; flex-direction: column; gap: 8px; }
.label { font-size: 13px; font-weight: 600; color: #444; }
.input {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 8px;
}
.input:focus { outline: none; border-color: #3ecf8e; box-shadow: 0 0 0 3px rgba(62,207,142,.15); }
.button {
  margin-top: 8px;
  padding: 12px;
  background: #3ecf8e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.button:disabled { opacity: 0.6; cursor: not-allowed; }
.erro { font-size: 13px; color: #e74c3c; margin: 0; }
```

- [ ] **Step 3: Proteger o App com AuthProvider + guard de login**

Localizar o componente raiz em `App.jsx` e envolver com `AuthProvider`. Adicionar lógica de guard:

```jsx
// Adicionar no topo de App.jsx:
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './screens/Login'

// Criar componente interno que usa o guard:
function AppInner() {
  const { user } = useAuth()
  if (user === undefined) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>Carregando…</div>
  if (user === null) return <Login />
  return (/* JSX original do App — tudo que já estava */)
}

// Envolver o export default com AuthProvider:
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
```

- [ ] **Step 4: Adicionar botão de logout no Sidebar**

Localizar `src/renderer/src/components/Sidebar.jsx` e adicionar botão de sair:

```jsx
// Adicionar no topo de Sidebar.jsx:
import { useAuth } from '../contexts/AuthContext'

// Dentro do componente Sidebar, antes do return final:
const { signOut } = useAuth()

// No JSX, adicionar ao final da sidebar (antes do fechamento):
<button
  onClick={signOut}
  style={{
    marginTop: 'auto',
    padding: '8px 12px',
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#888'
  }}
>
  Sair
</button>
```

- [ ] **Step 5: Criar usuários no Supabase Auth**

No Supabase Dashboard → Authentication → Users, criar um usuário para cada lojista:
- Email: usar o e-mail real de cada lojista
- Senha: temporária (cada um troca no primeiro acesso)

Depois linkar o `user_id` do Auth com o `compradores.id` correto:

```sql
-- No SQL Editor do Supabase, após criar os usuários:
-- Substituir os UUIDs pelos IDs reais do auth.users
UPDATE compradores SET user_id = '<uuid-do-usuario>'
WHERE nome = 'Samuel Paulo Backes';
-- Repetir para cada lojista
```

- [ ] **Step 6: Commit**

```bash
git add src/renderer/src/contexts/AuthContext.jsx src/renderer/src/screens/Login.jsx src/renderer/src/screens/Login.module.css src/renderer/src/App.jsx src/renderer/src/components/Sidebar.jsx
git commit -m "feat: autenticação Supabase Auth com tela de login e guard de sessão"
```

---

## Task 7: Deploy Cloudflare Pages + keep-alive

**Files:**
- Create: `.github/workflows/keepalive.yml`

- [ ] **Step 1: Criar projeto no Cloudflare Pages**

1. Acesse https://pages.cloudflare.com → Create a project → Connect to Git
2. Selecionar o repositório GitHub da Solução Compras
3. Configurar:
   - **Framework preset:** None (Vite)
   - **Build command:** `npm run build:web`
   - **Build output directory:** `dist/web`
   - **Node.js version:** 18

4. Em **Environment Variables**, adicionar:
   - `VITE_SUPABASE_URL` = `https://bhxpkysueyoblizkvomb.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `<sua anon key>`

- [ ] **Step 2: Atualizar supabase.js para usar variáveis de ambiente**

```js
// src/renderer/src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

Criar `.env.local` (não commitar — já deve estar no `.gitignore`):
```
VITE_SUPABASE_URL=https://bhxpkysueyoblizkvomb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Pe-o7iG5jjV0n0qTTKQI-Q_DUZ8-tHm
```

- [ ] **Step 3: Criar workflow keep-alive**

```yaml
# .github/workflows/keepalive.yml
name: Supabase keep-alive

on:
  schedule:
    - cron: '0 9 */4 * *'   # a cada 4 dias às 9h UTC (06h BRT)
  workflow_dispatch:          # permite rodar manualmente

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase para evitar pausa automática
        run: |
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            "${{ secrets.SUPABASE_URL }}/rest/v1/fornecedores?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}")
          echo "Status: $HTTP_STATUS"
          if [ "$HTTP_STATUS" != "200" ]; then
            echo "ERRO: Supabase não respondeu com 200"
            exit 1
          fi
```

- [ ] **Step 4: Adicionar secrets no GitHub**

GitHub → Settings → Secrets → Actions → New repository secret:
- `SUPABASE_URL` = `https://bhxpkysueyoblizkvomb.supabase.co`
- `SUPABASE_ANON_KEY` = `<sua anon key>`

- [ ] **Step 5: Testar o keep-alive manualmente**

GitHub → Actions → Supabase keep-alive → Run workflow

Verificação esperada: job passa com `Status: 200`.

- [ ] **Step 6: Commit e push**

```bash
git add .github/workflows/keepalive.yml src/renderer/src/lib/supabase.js
git commit -m "feat: keep-alive cron GitHub Actions + supabase via env vars"
git push
```

Verificação final: Cloudflare Pages faz deploy automático. Acessar a URL gerada (ex: `solucao-compras.pages.dev`) e testar login.

---

## Checklist de Validação Final

Antes de considerar este plano concluído, testar cada item:

- [ ] Login funciona com e-mail/senha no browser
- [ ] Coleções carregam (via `colecoes.list()`)
- [ ] Criar nova sessão de compra salva no Supabase
- [ ] Registrar pedido com itens de grade e verificar no Supabase Dashboard
- [ ] Dashboard mostra dados da coleção ativa
- [ ] Planejamento carrega grade e projeção
- [ ] Botão de import em Planejamento abre seletor de arquivo do browser
- [ ] Logout encerra sessão e mostra tela de login
- [ ] GitHub Actions keep-alive passa com status 200
- [ ] Deploy no Cloudflare Pages funciona via push no GitHub

---

## Follow-on Plans

Este plano entrega o app multi-usuário funcionando. Os planos seguintes são independentes:

- **2026-05-26-import-historico.md** — Script Node.js que lê os 3.000 xlsx do Drive e popula as tabelas `hist_*`
- **2026-05-26-relatorios.md** — Curva ABC (hist_fornecedor), Quebra de Estoque (hist_grade), Análise por Lojista (hist_comprador_*)
