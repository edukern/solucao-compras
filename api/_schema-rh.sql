-- ============================================================
-- Schema completo do módulo RH + migrações LGPD
-- Rodar no Supabase SQL Editor ou via Management API
-- ============================================================

create extension if not exists "uuid-ossp";

-- Empresas (multi-tenant)
create table if not exists empresas (
  id        uuid primary key default uuid_generate_v4(),
  nome      text not null,
  criado_em timestamptz default now()
);

-- Usuários do módulo RH (auth própria, separada do Supabase Auth)
create table if not exists usuarios (
  id          uuid primary key default uuid_generate_v4(),
  empresa_id  uuid references empresas(id) on delete cascade,
  email       text unique not null,
  nome        text not null,
  senha_hash  text not null,
  criado_em   timestamptz default now()
);

-- Vagas
create table if not exists vagas (
  id            uuid primary key default uuid_generate_v4(),
  empresa_id    uuid references empresas(id) on delete cascade,
  titulo        text not null,
  descricao     text,
  local         text,
  status        text not null default 'aberta' check (status in ('aberta','pausada','encerrada')),
  criado_em     timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Candidatos
-- cpf:      armazenado criptografado (AES-256-GCM) — LGPD
-- cpf_hash: HMAC-SHA256 determinístico para lookup indexado (nunca plain text)
create table if not exists candidatos (
  id          uuid primary key default uuid_generate_v4(),
  empresa_id  uuid references empresas(id) on delete cascade,
  nome        text,
  cpf         text,      -- cifrado, formato "enc:iv:tag:data"
  cpf_hash    text,      -- HMAC para dedup/lookup, sem expor o CPF
  email       text,
  telefone    text,
  criado_em   timestamptz default now()
);

-- Índice único por hash (substitui o índice direto em cpf)
create unique index if not exists candidatos_cpf_hash_empresa
  on candidatos(empresa_id, cpf_hash) where cpf_hash is not null;

-- Candidaturas (candidato × vaga com pipeline)
create table if not exists candidaturas (
  id            uuid primary key default uuid_generate_v4(),
  vaga_id       uuid references vagas(id) on delete cascade,
  candidato_id  uuid references candidatos(id) on delete cascade,
  empresa_id    uuid references empresas(id) on delete cascade,
  etapa         text not null default 'triagem' check (etapa in (
                  'triagem','background_check','entrevista_rh',
                  'entrevista_gestor','aprovado','reprovado'
                )),
  notas         text,
  criado_em     timestamptz default now(),
  atualizado_em timestamptz default now(),
  unique(vaga_id, candidato_id)
);

-- Currículos (referência ao arquivo no Storage)
create table if not exists curriculos (
  id             uuid primary key default uuid_generate_v4(),
  candidato_id   uuid references candidatos(id) on delete cascade,
  empresa_id     uuid references empresas(id) on delete cascade,
  storage_path   text not null,
  nome_arquivo   text,
  cpf_extraido   text,   -- cifrado se CPF detectado no currículo
  texto_extraido text,
  criado_em      timestamptz default now()
);

-- Background checks
-- cpf:          cifrado (AES-256-GCM) — LGPD
-- resultado_bv/spc: NOT armazenados (minimização de dados — LGPD Art. 6 III)
-- resumo_texto: só métricas necessárias à decisão (sem PII além do score)
-- expira_em:    retenção automática (90 dias por padrão) — LGPD Art. 16
create table if not exists background_checks (
  id            uuid primary key default uuid_generate_v4(),
  candidato_id  uuid references candidatos(id) on delete cascade,
  empresa_id    uuid references empresas(id) on delete cascade,
  cpf           text not null,    -- cifrado
  status        text not null default 'ok' check (status in ('pendente','ok','erro')),
  restricao     boolean,
  resumo_texto  text,             -- métricas resumidas (sem PII detalhada)
  expira_em     timestamptz,      -- LGPD: dados removidos após este prazo
  criado_em     timestamptz default now()
);

-- Auditoria de acessos a dados pessoais — LGPD Art. 37 (registro de operações)
-- alvo_hash: HMAC do CPF consultado (prova de acesso sem expor o dado)
-- Nunca armazenar o CPF em plain text aqui
create table if not exists rh_audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  empresa_id  uuid references empresas(id) on delete cascade,
  usuario_id  uuid references usuarios(id) on delete set null,
  acao        text not null,   -- 'background_check' | 'batch_check_avulso' | 'apagar_candidato_lgpd' | ...
  alvo_id     text,            -- candidato_id (UUID)
  alvo_hash   text,            -- HMAC-SHA256 do CPF consultado
  ip          text,
  user_agent  text,
  criado_em   timestamptz default now()
);

create index if not exists rh_audit_logs_empresa_criado
  on rh_audit_logs(empresa_id, criado_em desc);

-- Storage bucket para currículos (privado)
insert into storage.buckets (id, name, public)
  values ('curriculos', 'curriculos', false)
  on conflict (id) do nothing;

-- RLS: todas as tabelas com dados de candidatos ficam bloqueadas ao acesso direto.
-- As APIs usam SUPABASE_SERVICE_KEY (service role) que ignora RLS — controle de acesso
-- é feito na camada da API (authenticate + empresa_id filter).
alter table vagas             enable row level security;
alter table candidatos        enable row level security;
alter table candidaturas      enable row level security;
alter table curriculos        enable row level security;
alter table background_checks enable row level security;
alter table rh_audit_logs     enable row level security;

-- Sem políticas = nenhuma linha acessível pelo anon key (só service role tem acesso)
-- Isso significa que qualquer acesso direto ao Supabase sem a service key é bloqueado.

-- ============================================================
-- Job de limpeza: remover checks expirados (rodar periodicamente)
-- Pode ser chamado via /api/rh-cleanup (a criar) ou cron no Supabase
-- ============================================================
-- delete from background_checks where expira_em < now();
