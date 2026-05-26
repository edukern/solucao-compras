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
