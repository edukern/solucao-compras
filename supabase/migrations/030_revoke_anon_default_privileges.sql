-- Migration 030: revoke grants desnecessários de TRUNCATE/REFERENCES/TRIGGER do papel anon
--
-- Contexto: todo projeto Supabase novo recebe, por padrão de fábrica (não é algo que uma
-- migração deste repo introduziu), os privilégios TRUNCATE, REFERENCES e TRIGGER concedidos
-- a anon/authenticated/service_role em toda tabela do schema public. Isso não é explorável
-- pela API REST (PostgREST não expõe TRUNCATE via REST), mas viola o princípio de menor
-- privilégio: TRUNCATE apaga uma tabela inteira ignorando RLS completamente, e não há nenhum
-- fluxo do app que precise disso pelo papel anon. O app só precisa de SELECT/INSERT/UPDATE/
-- DELETE (via RLS) e EXECUTE em funções RPC específicas.
--
-- Escopo: só o papel anon. authenticated e service_role não são tocados aqui.
--
-- ANTES DE APLICAR (SQL editor do Supabase, nunca via `supabase db push` — a CLI não está
-- configurada/sincronizada neste repo):
--
--   -- Passo 0a: quem tem default privileges hoje em tabelas (inclui os GLOBAIS, sem schema)?
--   SELECT r.rolname AS dono_do_default,
--          COALESCE(n.nspname, '*** GLOBAL (sem schema) ***') AS escopo,
--          da.defaclacl::text
--   FROM pg_default_acl da
--   JOIN pg_roles r ON r.oid = da.defaclrole
--   LEFT JOIN pg_namespace n ON n.oid = da.defaclnamespace
--   WHERE da.defaclobjtype = 'r';
--
--   -- Passo 0b: de quais desses papéis o usuário que vai rodar esta migração é membro?
--   SELECT rolname FROM pg_roles WHERE pg_has_role(current_user, oid, 'member');
--
--   Se algum "dono_do_default" do passo 0a não aparecer no passo 0b, o bloco DO abaixo vai
--   pular esse papel (com um WARNING) em vez de travar a migração inteira — mas os defaults
--   dele continuam concedendo a anon até alguém com permissão sobre ele rodar o ajuste.
--
--   -- Passo 0c (opcional, recomendado): ensaiar em transação e desfazer, pra ver erros/
--   -- warnings sem efeito nenhum:
--   -- BEGIN; SET lock_timeout = '5s'; <cole o corpo deste arquivo>; ROLLBACK;

SET lock_timeout = '5s';

-- 1. Revoga nas tabelas que já existem hoje. Tabelas de que o executor não é dono/não tem
--    GRANT OPTION geram WARNING (não erro) e ficam de fora — a query de verificação no fim
--    do arquivo detecta isso.
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon;

-- 2. Ajusta o default para tabelas futuras. Cobre tanto default privileges escopados ao
--    schema public quanto os GLOBAIS (defaclnamespace nulo, que um REVOKE só "IN SCHEMA
--    public" não cancela). Cada ajuste é isolado num sub-bloco: se o executor não tiver
--    permissão sobre aquele papel (ALTER DEFAULT PRIVILEGES FOR ROLE exige ser dono ou membro
--    dele), a migração registra um WARNING e segue — não aborta o REVOKE já aplicado no
--    passo 1.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT ownerrole.rolname AS role_name,
           n.nspname AS schema_name -- NULL = default global (sem schema)
    FROM pg_default_acl da
    JOIN pg_roles ownerrole ON ownerrole.oid = da.defaclrole
    LEFT JOIN pg_namespace n ON n.oid = da.defaclnamespace
    WHERE da.defaclobjtype = 'r' -- 'r' = relations (tabelas)
      AND (n.nspname = 'public' OR n.nspname IS NULL)
  LOOP
    BEGIN
      IF r.schema_name IS NULL THEN
        EXECUTE format(
          'ALTER DEFAULT PRIVILEGES FOR ROLE %I REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon',
          r.role_name
        );
      ELSE
        EXECUTE format(
          'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon',
          r.role_name
        );
      END IF;
      RAISE NOTICE 'default privileges ajustado para o papel: %', r.role_name;
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE WARNING 'PULADO — sem permissão sobre o papel %; tabelas futuras criadas por esse papel ainda vão herdar o grant pra anon até alguém com acesso a ele rodar este mesmo ajuste', r.role_name;
    END;
  END LOOP;

  -- Fallback: garante que o papel que está rodando esta migração (tipicamente quem cria
  -- tabelas nas migrações seguintes deste repo) também não propague o grant, mesmo que hoje
  -- ainda não tenha nenhuma entrada em pg_default_acl.
  BEGIN
    EXECUTE format(
      'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon',
      current_user
    );
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE WARNING 'PULADO — sem permissão sobre o papel atual (%) para ajustar default privileges', current_user;
  END;
END $$;

-- 3. Verificação obrigatória (protocolo docs/MIGRACOES.md, Regra 4): tem que voltar 0 linhas.
-- Se voltar alguma linha, é uma tabela que o passo 1 não conseguiu revogar (dono diferente do
-- executor) — precisa ser revogada manualmente por quem for dono dela.
SELECT table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
  AND table_schema = 'public'
  AND privilege_type IN ('TRUNCATE', 'REFERENCES', 'TRIGGER')
ORDER BY table_name, privilege_type;

-- 4. Teste de tabela futura (rodar manualmente depois de aplicar, não faz parte do efeito
-- desta migração): criar uma tabela descartável e confirmar que anon NÃO recebe os 3 grants.
--   CREATE TABLE zz_teste_grants_030 (id int);
--   SELECT privilege_type FROM information_schema.role_table_grants
--   WHERE grantee = 'anon' AND table_name = 'zz_teste_grants_030';  -- deve voltar vazio
--   DROP TABLE zz_teste_grants_030;
-- Repetir criando a tabela pelo Table Editor do dashboard (não por SQL) — confirma que a
-- interface visual também respeita o novo default.
