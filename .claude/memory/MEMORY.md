# Memory Index

- [Estado do projeto e próximos passos](project_grupo_compras.md) — Contexto completo: o que está pronto, o que falta, demo Vercel em andamento, fixes importantes, schema do banco
- [Comandos de terminal p/ o Eduardo](feedback_terminal_commands.md) — Projeto em D:\projetos\solucao-compras; no cmd usar `cd /d` p/ trocar de drive, barra invertida `\`
- [Verificar release após publicar](feedback_release_verification.md) — Sempre rodar `gh release list` após push de tag para confirmar Latest, não Draft
- [ponto-e-stock — integração pendente](project_ponto_e_stock_integracao.md) — Projeto irmão em D:\projetos\ponto-e-stock (Next.js, Prisma); motor de reposição precisa de hist_empresa_grade do Supabase para substituir mocks
- [Importação 26/2 — estado e fatos críticos](project_importacao_26_2.md) — FEMMINART gravado (sessão 40, 10654 pç, AD/46-52); backup *_backup_2622 feito; ACHADO: fornecedores DUPLICADOS (Aconchego/Rakels já no Bolt sob nome variante) — blindar guard antes do próximo apply
- [Definição de sessão "fechada"](sessao-fechada-definicao.md) — Fechada = clicou em "Fechar sessão"; reabrir edição volta a aberta. Para futura separação aberta/fechada no Histórico (precisa campo de status em sessoes)
- [Migração 27/1→26/2 (CONCLUÍDA 18/06)](migracao-27-1-para-26-2.md) — 20 sessões movidas da colecao id 1 (27/1) para id 17 (26/2), 27/1 apagada. Verificação 0·21·0. Backup em backup_move_colecao_20260618
- [Acesso da Scheila — main protegida](colaboracao-scheila-branch-protection.md) — repo PRIVADO; main exige PR+build+1 review (admin tem bypass); Scheila usa conta da empresa `lojaspontoe` (Write, aceito); setup em docs/SETUP-SCHEILA.md; preview de PR descartado (sem staging)
