-- Migration 012: allow anonymous inserts on pendencias_respostas
-- Samuel uses this page unauthenticated (it's a web page, not the desktop app).
-- Reads remain restricted to authenticated users (the developer).

CREATE POLICY "anon_insert" ON pendencias_respostas
  FOR INSERT WITH CHECK (true);
