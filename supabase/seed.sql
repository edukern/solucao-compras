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
