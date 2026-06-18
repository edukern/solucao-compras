# Protocolo de Migração — Bolt Compras (produção)

O app roda em produção com uso real. Migrações de schema seguem estas regras
para nunca corromper dados de quem está usando.

## Regra 1 — Migrações são sempre aditivas (expand-contract)
- Pode: `ADD COLUMN ... DEFAULT`, criar tabela/índice/constraint nova, criar função.
- Nunca na mesma migração que mantém o app no ar: `DROP COLUMN`, `RENAME COLUMN`,
  mudar tipo de coluna em uso, `DROP`/alterar constraint usada por escrita ativa.
- Remoção de algo antigo só depois que nenhuma versão do app usa mais (fase "contract",
  em migração separada e posterior).

## Regra 2 — Migração pesada roda em modo manutenção
1. Ligar o modo manutenção: `UPDATE app_config SET manutencao = true WHERE id = 1;`
2. Aguardar ~30s (clientes detectam e param de gravar).
3. Aplicar a migração no SQL editor do Supabase.
4. Rodar a query de verificação da migração.
5. Desligar: `UPDATE app_config SET manutencao = false WHERE id = 1;`

## Regra 3 — Janela de baixo uso
Preferir aplicar à noite/fim de semana. Avisar os usuários quando possível.

## Regra 4 — Verificação obrigatória
Toda migração tem uma query de verificação que confirma o efeito esperado,
rodada imediatamente após aplicar.
