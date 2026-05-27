-- Remove redundant SELECT-only policy on pedidos.
-- The "auth_write" ALL policy already covers SELECT for authenticated users,
-- making "comprador_read_own" a dead-code policy that adds confusion.
DROP POLICY IF EXISTS "comprador_read_own" ON pedidos;
