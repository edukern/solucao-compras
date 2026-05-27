-- Fornecedores extraídos de todas as coleções históricas
-- Total: 736 fornecedores
-- Gerado em: 2026-05-27T10:39:57.116Z

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('3RD', NULL, NULL, 'avista', 'FOB', 'troca', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('3RD FASHION', NULL, NULL, NULL, 'FOB', 'troca', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('767 JEANS', 'ARI', NULL, '20 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('767 JENAS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('A FONTE DAS BOLSAS', NULL, NULL, 'AVISTA', 'FOB', 'TROCA', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ACESSORIUM', NULL, NULL, 'ABVISTA', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ACONCHEGO', NULL, NULL, '14/28', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ACONCHEGO BEBE', 'NATALICIO', NULL, '14/28', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ACONCHEGO DO BEBE', 'NATALICIO', NULL, '14/28/42', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ACONCHEGO DO BEBÊ', 'NATALICIO', NULL, '14/21/38/35/42', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ACONCHEGPO', NULL, NULL, '14/28', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ADDAN', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ADICAO', NULL, NULL, 'Avista', 'FOB', 'Troca', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ADOMES', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ADRUN', NULL, NULL, '45/75/105', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('AEROS', NULL, NULL, '30 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('AGGEJO', NULL, NULL, '20 DIAS', NULL, 'EXPRESSO LEOMAR', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('AILILY', NULL, NULL, 'AVISTA', 'FOB', 'LEOMAR', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ALCANTARA', NULL, NULL, '15 dias', 'FOB', 'Troca Transp.', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ALEKID`S', 'MIRO', NULL, '30/60/90', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ALEKIDS', 'Rodrigo', NULL, '30/60', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ALEKIS', 'RODRIGO', NULL, '30/60/90', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ALFIS', 'SERGINHO', NULL, '15 DIAS', 'CIF', NULL, 'Pode faturar Parcial. Mas grade completa', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ALLDENIN', NULL, NULL, '30/45/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ALTEMBURG', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ALTENBURG', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ALTOMAX', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ALTOMAX / HOAHI', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ALVER KLEIN', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('AMANDA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('AMORE VICTORIA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('APCCE', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('APELL', NULL, NULL, '45/75', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('APLICATTO', 'JEFERSON', '47-999242-4776', '15/30', NULL, NULL, 'NÃO MANDAR AZUL COLD', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('APPCCE', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('APPEL', NULL, NULL, '15/30/45', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('APPLICATO', 'JEFERSON', NULL, '15/30', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('AQUECCE', 'JONATHAN', NULL, '30 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('AQUECCE TRICOT', NULL, NULL, 'Avista', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('AQUECE TRICOT', 'JONATAM', NULL, '30 DIAS', 'cif', NULL, NULL, 17, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('AREIA DO MAR', 'Bruno', NULL, '30/60/90', NULL, NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ARRUMADINHOS', NULL, NULL, '15 DIAS', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ART-C', NULL, NULL, '30 DIAS ALEMAO', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ASIA TEX', NULL, NULL, '20 dias', 'CIF', 'Troca trans.', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ATLANTICA', NULL, NULL, '30/45/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ATLÂNTICA', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('AUTENTICADA', 'CHARLENE', NULL, '15 DIAS', 'CIF', NULL, '* 70 % PRETO E 30 % CARAMELO/OFF/VERDE OLIVIA', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('AZUL E ROSA', 'CLAUDIO', NULL, '15 DIAS', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('AZZUM', NULL, NULL, '30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BABY E KIDS', 'RENATO', '(47) 98897-5218', 'À VISTA', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BACCI', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BALBOA', 'CLAUDIO', NULL, '30/60/90', 'CIF', NULL, NULL, 4, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BALLA BALLU', NULL, NULL, '20 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BANANA DOCE', 'CLAUDIA', '47-99981-1696', '15 DIAS', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BARAVELLI', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BARRAGE', NULL, NULL, 'Imediato', 'fob', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BBC', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BBC TEXTIL', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BEBECE', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BEGINS', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BELA JOIA', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BELLA ENXOVAIS', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BELLA JANELA', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BELLA JOIA', 'ANDRÉ', NULL, 'À VISTA', 'CIF', NULL, '* PRETO, TONS TERROSOS E PINK', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BELLA JÓIA', 'ANDRÉ', NULL, 'À VISTA', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BELLA JOIA INT', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BELLA JOIA INT.', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BENEVIDES', NULL, NULL, '15/30', 'FOB', 'Expresso Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BENEVIDES E BERTATO', NULL, NULL, '20/40', 'CIF', 'EXPRESSO LEOMAR', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BENNE CASA', NULL, NULL, '30/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BERTATO E BENEVIDES,', NULL, NULL, NULL, 'FOB', 'EXPRESSO LEOMAR', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BETE', NULL, NULL, 'Avista', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BETU`S', NULL, NULL, '30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BETUS', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BICHO BAGUNCA', 'VERA', NULL, '15/30', 'CIF', NULL, 'NÃO MANDAR NADA BRANCA', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BICHO BAGUNÇA', 'RODRIGO', '(51) 99143-3232', '30/60/90/120', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BIKER', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BIKER KIDS', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BIOGAS', 'JONATHAN', '(54) 99992-0742', '60/80/100', 'CIF', NULL, 'NÃO MANDAR BRANCO NOS TAMANHO EXTRAS', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BIOGAS BÁSICO', 'JONATHAN', '(54) 99992-0742', '25/50/75', 'CIF', NULL, '61118 NÃO MANDAR BRANCA E BORDO/ MANDAR GRADES COMPLETAS', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BKR', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BLUE BAY', NULL, NULL, 'JU/AG/SE/22', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BLUE BIRD', NULL, NULL, 'Avista', 'FOB', 'SÃO MIGUEL COTAR', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BLUE MACAW', 'ELISEU', '(51) 99988-6961', '15 DIAS', 'FOB', 'Transduarte', 'ATENCAO PARA AS GRADES', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BLUEBIRD', NULL, NULL, '15 DIAS', 'CIF', 'Mandar e cobrar junto com mercadoria', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BONEKINHA LINDA', NULL, NULL, '20 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BONETINHOS', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BONETTINHOS', NULL, NULL, '30/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BONN PÉ', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BOX 162', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BRANDILI', 'kerli', NULL, '15 DIAS', 'CIF', NULL, 'REFERENCIA 80106 CORES 003,0194,0219,1123', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BRAS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BREZZI', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BRUNA', 'ANDRÉ', '(51) 98056-8157', '30/60/90', 'CIF', NULL, 'NÃO ENVIAR NADA AMARELO / * NÃO ENVIAR AZUL', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BRUNA E BIA', 'ANDRE', '(51) 98056-8157', '30/60/90', 'CIF', NULL, 'NÃO MANDAR MARSALA', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BRUVI', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BUETNER', NULL, NULL, '14 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BUETTNER', NULL, NULL, '14 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BUGALOO', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BUTON', NULL, NULL, '14 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BY FENIX', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('BY FIAPO', NULL, NULL, '20 DIAS', 'CIF', 'TROCA TRANSP', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CA-VA', NULL, NULL, 'avista', 'fob', 'troca transp', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CALNAL DA MANCHA', NULL, NULL, '20/30/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CAMIM', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CAMIN', NULL, NULL, '15/25', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CAMPESI', NULL, NULL, '30/45/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CANAL DA MANCHA', NULL, NULL, '20/30/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CARBELLA', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CARDIUM', 'NEIDE/GABRIELA', '47-99922-0028', '30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CARTAGO', NULL, NULL, '90/97/105', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CAS A HOUSE', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CASA HAUS', NULL, NULL, '10 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CASA HOUSE', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CATALELE', NULL, NULL, '20/30/40/50', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CATOELELE', 'NELSON', NULL, '20/40/60', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CATOLELE', 'NELSON', NULL, '30/40/50', 'CIF', NULL, 'ndallongaro@outlook.com', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CATOLELE - PROG', 'NELSON', NULL, '30/40/50', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CATOLELE PROG.', 'NELSON', NULL, '20/40/60', 'CIF', NULL, 'ndallongaro@outlook.com', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CAW', 'SABIÁ', '(54) 99978-9532', '15 DIAS', 'CIF', NULL, '* CINZA, AZUL, MARINHO E CHUMBO', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CDKA', NULL, NULL, '15/30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CENTER VARIEDADE', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CENTER VARIEDADES', NULL, NULL, '15 DIAS', 'CIF', 'expresso Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CENTER VARIQDADES', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CHARME', 'Fabrica', NULL, NULL, NULL, NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CHARME E ELEGÂNCIA', 'ALGENIO', '(51) 99802-7010', '15 DIAS', 'CIF', NULL, 'TECIDO DUNA: 03, 10, 23 E 08', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CHOCOPIE', NULL, NULL, 'Avista', 'Fob', 'Expresso Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CIA CORPO', 'DÉCIO', NULL, '30 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CIA DO CORPO', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CIA GOTA', 'BASÍLIO', NULL, '30/60/90', 'CIF', NULL, 'NÃO MANDAR LARANJA', 0.12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CIA SIN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CIA SUN', NULL, NULL, '20/40', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CLASSE', NULL, NULL, 'avista', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('COCA-COLA', NULL, NULL, '21 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CODIGO FINAL', NULL, NULL, '30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CÓDIGO FINAL', 'SENO', NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('COLISAO', 'Erico', NULL, '30/45/60', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('COLLODA', NULL, NULL, 'AVISTA', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CONVER-STAR', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CORRENTE MARINHA', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CORTEX', NULL, NULL, '60/90/120', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('COSTA RICA', 'VITOR', NULL, '30/60/90', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('COSTAO', NULL, NULL, '30 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('COSTÃO', 'FABRICA', NULL, '30/60/90/120', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('COTTON E COTTON', 'DANIELA', NULL, '15/30', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CRIS', NULL, NULL, '15 DIAS', 'CIF', NULL, '1654: NÃO ENVIAR VERMELHO', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CRIS CONF', 'JAOA', NULL, '15 DIAS', 'CIF', NULL, 'NÃO MANDAR NADA NA COR MARRON', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CRISMAURO', NULL, NULL, 'Avista', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CROCKER', 'LUCIANA', '(11) 983066-9287', '30/60', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CROMIC', NULL, NULL, 'Avista', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CROSS STYLE', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('CURIOSO', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('D E M', 'DANTIEL', NULL, 'À VISTA', 'CIF ATÉ SP', 'EXPRESSO LEOMAR', 'CORES: PRETO, MARINHO, PETROLEO, CINZA GRAFITE', NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('D SIX', NULL, NULL, '30 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('D''SIX', NULL, NULL, '30/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('D`SIX', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DAL PONTE', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DANKA', 'SANDRO', NULL, '60/90/120/150/180/210', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DE LEON', NULL, NULL, '15/30', 'FOB', 'Expresso Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DEBORA STEFANI', NULL, NULL, 'Boleto 20 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DECOY', 'PAULO', NULL, '30/60', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DEINARA', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DEKINHA', 'eduardo', '47-99979-9555', '30/60', 'CIF', NULL, '** ROSA E ROSE - ** AZUL E VERDE', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DELINHO KIDS', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DESAYNER', 'ADRIANO', '(51) 99866-8151', '15', 'CIF', NULL, 'NÃO MANDAR NADA DE AMARELO E LARANJA', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DESORDEM', 'TITA', NULL, '15/30/45', 'CIF', NULL, 'NÃO MANDA NADA OFF E BRANCO ESTAMPAS NOVAS', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DEUSA METIS', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DIANA', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DIANFA', 'ANDRE', NULL, '15/30/45', 'CIF', NULL, '* NÃO ENVIAR CAMISETA MASC BRANCA', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DIANFA PROG.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DIJORIS', NULL, NULL, 'mesma', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DINOPARK', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DISAYNER', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DISNEP', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DISNEY', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DISNEY (RAFAEL HANG)', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DIVITEX', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DIXIE', 'IBRAIN', NULL, '30/60/90/120', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DIXIE IMP', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DIXIE IMPORT', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DIXIE IMPORTADO', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DIXIE NAC', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DIXIE NAC.', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DIXIE NACIONAL', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DIXIE PROMO', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DOCE GLAMOUR', 'THIAGO', '(47) 99688-5857', '15 DIAS', 'CIF', NULL, 'ANARRUGA = NÃO MANDAR VERDE', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DOHLER', NULL, NULL, '7 DIAS', 'CIF', 'FINANCEIRO DEU DIFERENCA DE 6,7% DE 60 PARA 7 DIAS. GANHAMOS TABELA DE 7 DIAS COM 27 DIAS DE PRAZO', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DOLCE ROSE', 'WILLIAM', '(51) 99981-7822', '15/30/45/60/75', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DON CARLI', 'SANDRO', NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DONA NESSA', NULL, NULL, 'Avista', 'CIF SP', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DONDOKA', NULL, NULL, '20 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DOQUINHA', NULL, NULL, '21/28/35', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DRAY', NULL, NULL, '30/45/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DREAM', NULL, NULL, NULL, 'FOB', 'troca', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DRESS CODE', 'DIEGO', '51-99457-5000', 'AVISTA 7 DIAS', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DRIGUEMAR', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DULUNA', NULL, NULL, '30 dias', 'FOB', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DULUPE', NULL, NULL, 'alemao', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DUPLEX CALÇADOS', NULL, NULL, 'Avista', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DUPLO J', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DUXX', 'KAIRON', '51-982502626', '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DUZIZO', NULL, NULL, '30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DYANJO', 'ROMEU', NULL, '15/30', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('DYJORIS', NULL, NULL, '30/60/90/120', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ED VERTIDO', 'RODRIGO', '(51) 99143-3232', '21 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ELEGANCE', 'BASÍLIO', NULL, '30 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ELITE', 'SERGINHO', NULL, '15/30/45', 'CIF', NULL, 'CALÇÃO PRETO 40%, MARINHO 20%, CHUMBO 15%, ROYAL 15%, VERMELHO 5% E BRANCO 5%', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ELITE IMPORT', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ELLEGANCE', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('EMPORIO', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ENERGY', NULL, NULL, '20/40', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ENGOTEX', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ERIDU', 'SABIA', NULL, 'NA ENTREGA', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ERIDU MALHAS', 'FELIPE', NULL, 'À VISTA', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ESTILO PROPRIO', 'CATIA', NULL, '15 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ETERNETY', 'DENIS', NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ETERNITY', 'DENIS', '(51) 99673-3681', 'A VISTA', 'CIF', 'não', 'teste', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ETERNO', NULL, NULL, 'avista', 'FOB', 'troca', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ETRURIA', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('EUROPA', NULL, NULL, '30/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('EXPRIM', NULL, NULL, 'avista', 'fob', 'Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FAKINI', 'VITOR', NULL, '30/60/90', 'CIF', NULL, 'NÃO MANDAR NADA NA COR BORDO', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FAKINI KIT', NULL, NULL, '30 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FAKINI PERSONAGEM', 'VITOR', NULL, '15/30/45', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FANIKITUS', NULL, NULL, '30/45/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FANTONI', 'FABRICA', NULL, '15/30/45', 'CIF', NULL, 'NADA DE TELHA E BORDO', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FARAELI', 'RONALDO', '51 99207-5074', '20/40/60', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FARAELLI', 'RONALDO', '(51) 99207-5074', '20/40/60', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FARAELY', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FARRAELI', 'RONALDO', NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FATALLY', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FATALY', 'SANDRO', NULL, '15 DIAS', 'CIF', NULL, NULL, 17, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FATTALY', 'SANDRO', NULL, '15 DIAS', 'CIF', NULL, 'DEPÓSITO NA PARTE COMPLEMENTAR', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FAZ DE SANTA', 'MURILO', '47-99965-1808', '15/30', NULL, NULL, 'SE POSSIVEL ANTECIAPAR', NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FELICITA', 'SANDRA', '(54) 996004822', 'À VISTA', 'CIF', NULL, '60% PRETO - NÃO MANDAR FUCSIA', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FEMMINART', 'SOLANGE', '(85) 99900-2146', '30/60/90', 'CIF RS', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FERRAT', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FG IMPORTACAO', NULL, NULL, '20/30/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FILIPIM', NULL, NULL, '21 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FILIPIM (PHLIN-PHLIN)', NULL, NULL, '21 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FILLON', NULL, NULL, '10 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FILTTON', 'MARLUSSE', '51-99977-1663', '30/60/90/120', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FINA ESSENCIA', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FINA ESSÊNCIA', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FINE COLECTION', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FLORART', NULL, NULL, 'DEPOSITO', 'CIF ATÉ SP', 'EXPRESSO LEOMAR', NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FLUIDOS', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FORMITZ', 'JANAINA', NULL, '7 DIAS', 'CIF', NULL, NULL, 0.12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FORMTIZ', 'JANAINA', NULL, '20/40 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FR TEXTIL', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FREE FENIX', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FREE LOOK', NULL, NULL, '30/60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FREELOOK', 'IAD', NULL, '30/60/90/120/150', 'CIF', NULL, NULL, 17, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FUFFY', NULL, NULL, '15 dis', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FULL SURF', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('FUTTY', NULL, NULL, '15 dis', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('G E G', NULL, NULL, NULL, 'FOB', 'Troca', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER', 'IBRAIN', NULL, '30/60/90/120', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER 2', NULL, NULL, '60/90/120', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER ACESSORIOS', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER CALCADO', NULL, NULL, '30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER IMP', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER IMP.', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER IMPORT', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER IMPORTADO', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER INF', NULL, NULL, '43146', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER JEANS', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER NAC', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER NAC.', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER NACIONAL', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER PROMO', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER PROMOCIAL', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGSTER/MOSAICO', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GANGTER', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GATA LUI', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GATALUI', NULL, NULL, '20 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GERACAO 3000', NULL, NULL, '30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GIMARA', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GIOGIO BIANCO', NULL, NULL, '30/60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GIRAFFE', 'RODRIGO', '(47) 99980-1849', '30/60/90/120', 'CIF', NULL, 'MONTAR CONJUNTO NAS FAMILIAS', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GLAMMOUR', 'TITA', NULL, '15 DIAS', 'CIF', NULL, '** NÃO ENVIAR AZUL BIC E MOSTARDA/AMARELO', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GRENDENE', NULL, NULL, '90/97/105', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GRENDENE CARTAGO', NULL, NULL, '90/97/105', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GRENDENE INFANTIL', NULL, NULL, '90/97/105', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GRENDENE MORMAII', NULL, NULL, '90/97/105', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GRENDENE RIDER', NULL, NULL, '90/97/105', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GUARDA CHUVA', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GUITA RIO', NULL, NULL, 'avista', 'CIF', 'Troca Trans', NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('GUITO RIO', NULL, NULL, NULL, 'FOB', 'Expresso Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HABANA', 'EVANDRO', '(51) 99811-9991', '15/30', 'CIF', NULL, 'Nada de Laranja, Amarelo e Branco', 0.12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HABANNA', 'JOAO', NULL, '15/30', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HAVAIANAS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HAVAIANAS 2', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HAVAINAS', NULL, NULL, '28/42/56', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HEAD FREE', NULL, NULL, '15/30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HEZAG', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HIPER TEXTIL', NULL, NULL, '30/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HIRLOGS', NULL, NULL, '30/60', 'CIF', NULL, 'NÃO MANDAR BORDÔ', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HONG', NULL, NULL, 'avista', 'FOB', 'troca', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HONG CHUN', NULL, NULL, NULL, 'CIF', 'Troca Trans', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HOST', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HURY', 'ADILSON', '47-98496-1230', '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HUTTZ', 'SANDRO', NULL, '20 DIAS', 'CIF', NULL, 'EMPRESA VAI AVISAR SE VAI DAR CREDITO FINANCEIRO OU NA NF', NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('HUUTZ', 'SANDRO', NULL, '20 DIAS', 'CIF', NULL, 'NÃO ENVIAR COR 27 (MOSTARDA)', NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('I MISS', NULL, NULL, NULL, 'FOV', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('IARA LINE', NULL, NULL, '20 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('INCOFRAL', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('INCOMFRAL', NULL, NULL, 'À VISTA', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('INCONFRAL', NULL, NULL, '20/30/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('INTIMA FLOR', 'Bruno', NULL, '15/30', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ÍNTIMA FLOR', 'MATEUS', '(85) 98750-6015', '30/60/90', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('INTIUTO', 'Serginho', NULL, '20/40', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('INTUITO', 'SERGIO', NULL, '20 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('IRMAOS', 'Samuel', 'GG', 'PP', '3', '3', NULL, 24, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('IRMÃOS', NULL, NULL, '5875.47', '2219.87', '10656.11', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ITALIAN', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('IVETE', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('IZITEX', 'TITA', NULL, '30 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('JDRESS FASHION', NULL, NULL, NULL, 'FOB', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('JEANS GOAINIA', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('JED', NULL, NULL, '15 DIAS', 'FOB', 'TRANS HOFF', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('JEZZIAN', NULL, NULL, NULL, 'FOB', 'EXPRESSO LEOMAR', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('JIN D G', NULL, NULL, NULL, 'FOB', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('JOLITEX', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('JOLITEX 2', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('JR DE ANGELO', NULL, NULL, NULL, 'FOB', 'Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('JUCATEL', 'KATIA', '51 98190-6740', '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('JULIANA GODOI', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('JULIANA GODOY', NULL, NULL, '20/40', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('JUWAN', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KAHUNNA', 'RODRIGO', NULL, '21/28 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KAIRON', NULL, NULL, NULL, 'FOB', 'Expresso Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KAIZUKA', NULL, NULL, 'Avista', 'Fob', 'Troca', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KALISKA', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KAMAJE', NULL, NULL, 'avista', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KAMILU`S', NULL, NULL, '14/28/42', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KAMILUS', 'SANDRO', NULL, '60/90/120/150/180', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KAMYLUS', NULL, NULL, '15/30/45', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KAPPA', 'CLAUDINHO', '51 99933-2309', '30/60/90', 'CIF', NULL, 'PODE ANTECIPAR A ENTREGA', 4, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KARSTEN', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KDORI', NULL, NULL, '15 dias c/ Decio', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KEEPER', NULL, NULL, '20/40', 'CIF', '52,00 de frete na nota', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KEPPER', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KIKI - XODO', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KIKI XODO', 'SHEILA', '98115-7494', '15/30/45', 'CIF', NULL, NULL, 0.12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KIKI XODÓ', 'SHIEILA', '(51) 98115-7494', '30/45/60', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KIKI-XODO', 'SHEILA', NULL, 'INICIO DE MARCO', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KIKI-XODÓ', NULL, NULL, '15/30/45', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KIKIXODO', NULL, NULL, '15/30/45', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KILTY', 'SANDRO', NULL, '30 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KLA', NULL, NULL, '30/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KLIMER', NULL, NULL, '30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KMM', 'RAFAEL', '47 33540414', '20/40', 'CIF', NULL, 'ENVIAR BRANCAS AVULSAS NO PACOTE', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KMM UNIFORME', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KOLOSCH', NULL, NULL, '30/45/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KOLOSH', NULL, NULL, '30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KORUJA', NULL, NULL, '15', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KORUJA AZUL', NULL, NULL, 'DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KORUJA CHINELO', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KRISLE', NULL, NULL, '30 dias Alemao', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('KUSTON', 'Adimilson', '47-99191-5086', '15/30', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LA DOTTA', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LA MISS LINGERIE', NULL, NULL, NULL, 'CIF SP', 'Trans Hoff', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LA PROVENCE', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LANCER', NULL, NULL, '15 DIAS', 'FOB', 'EXPRESSO LEOMAR', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LANCY', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LANDI', NULL, NULL, NULL, 'FOB', 'Troca', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LANDIE', NULL, NULL, NULL, 'fob', 'troca', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LANSER', 'BASILIO', NULL, '30/60', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LARABI', 'ADRIANO', NULL, '15/30', NULL, NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LATEST', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LATEST/APCCE', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LAYOUT KIDS', 'CLENIO', NULL, '45/75', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LECIMAR', NULL, NULL, '30/60/90/120', 'CIF', NULL, 'NÃO MANDAR NADA BRANCO', NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LEGEND', 'CLAUDINHO', '99960-0311', '30/60/90', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LEGEND GRENAL', 'CASSIO', '51-99614-6339', '30/60/90', NULL, 'CIF', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LEKE', NULL, NULL, 'avista dep', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LEPOQUE', 'JONATHAN', '(47) 99917-5051', '15 DIAS', 'CIF', NULL, 'NÃO MANDAR A ESTAMPA 71', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LEPPER', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LIFE ZOOM', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LIKE ONE', 'SAMY', '51 98024-6152', '10/20/30', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LINDA FASHION', NULL, NULL, 'Avista', 'FOB', 'Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LINHA LEVE', 'JORGE', NULL, '20 dias', 'CIF', NULL, '* NÃO MANDAR BRANCA E VERMELHO', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LIPS', NULL, NULL, '30 dias', 'FOB', 'TROCA TRANSPORTES', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LIS LINGERIE', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LITORAL SURF', NULL, NULL, 'Avista', 'FOB', 'Expresso Leomar', NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LOCAL', 'CASSIA', '(11) 99720-5189', '30/45/60', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LOGUS', NULL, NULL, '30 DIAS', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LOOCK', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LOTUS', 'CLAUDIO', '(51) 99960-0311', '30/60/90', 'CIF', NULL, NULL, 4, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUALUA', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUAN', 'NELSON', NULL, '30 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUANA BABY', 'NELSON', NULL, '30 DIAS', 'FOB', 'LEOMAR', NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUCKY BOLSAS', NULL, NULL, NULL, 'fob', 'Ouro Negro', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUCKY GIRL BOLSAS', NULL, NULL, 'AVSIAT', 'FOB', 'TROCA', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUCKYS', NULL, NULL, '15/30', 'CIF', NULL, 'REFERENCIA 191 E 202 50% PRETO', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUCKYS MODAS', 'ADRIANO', NULL, '15/30', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUCXEL', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUELUA', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUMARIER', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUNA', NULL, NULL, '20 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUNENDER', 'RAFAEL', '51 983008200', '42/70/98/126', 'CIF', NULL, '* NÃO MANDAR AMARELO', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUNENDER AD', 'RAFAEL', NULL, '42/70/98/126', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUNENDER INF', 'DEIVIS', '(51) 98612-2512', '28/56/84/112/140', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUPO', NULL, NULL, '21 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUPO CUECA', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUPO CUECAS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUPO MEIA', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUPO MEIAS', NULL, NULL, '14 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUSSAN', 'ELOISA', NULL, '15/30/45/60', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LUXCEL', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LYNEL', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LYNEL TEXTIL', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LZT', 'LAZARO', '(47) 98835-1682', '30/60/90/120', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LZT PROG.', 'LAZARO', '(47) 98835-1682', '30/60/90/120', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('LZT PROGRAMA', 'LAZARO', NULL, '30/60/90/120', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MA-RAQUEL DIAS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MA-YUUPIII', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MAC GIANT', 'JORGE', NULL, '20/30/40', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MADJER', NULL, NULL, 'C/ Mauro', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MAGNON', 'ADRIANO', NULL, 'À VISTA 15 DIAS', 'FOB', NULL, NULL, 4, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MAKELI', NULL, NULL, '15 dias', 'CIF', 'Ouro Negro', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MAKELY', NULL, NULL, '46052', 'CIF', 'Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MALWEE', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MANENTI', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MAR NATIVO', NULL, NULL, '10 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MARCA', NULL, NULL, '15/30/45', 'CIF', 'Expresso Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MARCO TEXTIL', 'SENO', NULL, '30/60/90', 'CIF', 'tranduarte', 'NÃO MANDAR NADA BORDO /  * CONJ. CORES', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MARINS', 'SANDRO', NULL, '15/30', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MARINZ', 'SANDRO', NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MARU', 'GERALDO', NULL, 'À VISTA', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MARU CONF', 'GERALDO', '48-99933-0988', 'À VISTA', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MARU CONFEC', 'GERALDO', NULL, 'A VISTA', 'CIF', NULL, '* JOGGER APELUCIADA COM BOLSO', NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MARU PROG.', NULL, NULL, 'À VISTA', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MASSEY', NULL, NULL, '20 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MAURICIO SACOLAS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MAURO', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MAX DENIN', 'VERA', NULL, '30/60/90/120', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MAX DENIN 1', NULL, NULL, '30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MAX DENIN 2', NULL, NULL, '30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MC FITNESS', 'LUIUS', '57-99918-9799', '15/30/45', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MEGA TEEN', NULL, NULL, 'AVISTA', 'CIF', 'Expresso Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MENINA SAPECA', 'ANA CLARA', NULL, 'DEPOSITO', 'CIF ATÉ SP', 'EXPRESSO LEOMAR', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MERLIN MALHAS', NULL, NULL, '15', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MERLIN TRICOT', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MERVER', NULL, NULL, '20 dias', 'CIF', 'Troca trans', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MEZUL', 'CARMELO', '(51) 99928-3421', '15/30', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MIMOS DE BEBE', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MIRA BABY', NULL, NULL, '10/20dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MIS AMORES', 'DJONE', '47-99672-2840', '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MISS AMORES', 'DIONE', NULL, '15/30', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MISS PECK', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MISSISSIPI', NULL, NULL, '30 DIAS', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MITTO TEX', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MITTOTEX', 'SABIA', NULL, '15 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MIX ATACADISTA', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MIX ATACADISTAQ', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MJ - KEEKS', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MODARE', NULL, NULL, '30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MOGA', NULL, NULL, '15/30/45/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MOGLES', NULL, NULL, NULL, 'FOB', 'Troca', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MOLECA', NULL, NULL, '21 Dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MOLEKINHO', NULL, NULL, '45 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MONCITY', 'FRED', NULL, '15/30/45', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MOONCITY', 'FRED', NULL, '20/30/40', 'CIF', NULL, 'PODE ENTREGAR DATA BASE 05/03', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MORMAII', 'HARISSON', '(51) 99894-5778', '14 DE MARÇO', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MORMAII CALÇADOS', NULL, NULL, '30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MORMAII CONF', 'HARISSON', NULL, '14 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MORMAII CONF.', 'ADRIANO', NULL, '7/14/21', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MORMAII CONFEC', 'HARISSON', NULL, '14 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MORMAII PROG.', 'HARRISON', '(51) 99894-5778', '14 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MOSAICO', NULL, NULL, '60/90/120', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MOSAICO IMP', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MOSAICO IMP.', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MOSAICO IMPORT', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MOSAICO IMPORTADO', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MOSAICO NAC', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MOSAICO NACIONAL', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MOSAICO PROMO', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MR CAMISAS', NULL, NULL, 'Avista', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MTR', NULL, NULL, '20 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MULEKA SAPEKA', 'RONALDO', NULL, '20/40', 'CIF', NULL, '* NÃO MANDAR AMARELO EM NENHUM MODELO', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MUST', NULL, NULL, 'avista', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MY ZON', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('MYZON', NULL, NULL, 'avsita 15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NARA MARTINS', NULL, NULL, 'Final agosto', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NATA', 'PABLO', NULL, '20 DIAS', 'FOB', 'EXPRESSO LEOMAR', '60% PRETO, 20% MARINHO, 10% ROYAL, 5% VERMELHO E 5% VERDE', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NATHIELLY', NULL, NULL, '30 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NATHIELY', NULL, NULL, '20 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NEEC', NULL, NULL, '30 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NELLONDA', 'BARBOSA', '51 99979-6511', '30/60/90', 'CIF', NULL, 'RESPEITA DATA DE FATURAMENTO, CONFORME COMBINADO COM  LUCIANA E PODE ANTECIPAR', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NELONDA', 'BARBOSA', NULL, '30/60/90', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NETHUNO', 'CLAUDIO', NULL, '15 DIAS', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NEW VISION', NULL, NULL, NULL, 'CIF', 'Ouro Negro 11 2085-5121', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NEWCASTLE', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NICO BOCO', 'DAVI', '51-98313-8168', '60/90/120/150', 'CIF', NULL, 'NÃO MANDAR NAS CORES OFF - VINHO - VERDE / MANDAR SACOLA', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NICOBOCO', 'DAVI', NULL, '60/90/120/150', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NICOLLY', NULL, NULL, NULL, 'FOB', 'EXPRESSO LEOMAR', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NINETY', 'IBRAIN', NULL, '30/60/90/120', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NINETY EIGHT', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NITRO BOX', NULL, NULL, 'Avista', 'FOB', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NO STRESS', NULL, NULL, '60/90/120', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NOVA RIO', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NOVO PE', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NOVO PÉ', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NOVOPE', NULL, NULL, '10/15/20', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('NOVOPÉ', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OAIS', NULL, NULL, '30 dias', 'FOB', 'Ouro Negro', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OASIS', NULL, NULL, '30/60', 'FOB', 'EXPRESSO LEOMAR', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OCEANICA', NULL, NULL, 'av. Deposito', 'CIF 80', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OLHA FATAL', NULL, NULL, '15/30/45', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OLHO FATAL', 'RAFAEL', '(54) 99130-8830', '15/30', 'CIF', NULL, '*MANDAR CONJUNTO', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OLIMPIKUS', NULL, NULL, '21 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OLIVEIRA MALHAS', 'CARMELO', NULL, '30/60', 'CIF', NULL, 'NÃO MANDAR AMARELA, MOSTARDA, MARSALA,AZUL BB, LARANJA, PESSEGO, LILAS, LILAS, CERAMICA, MANGO', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OLV', 'ROGERIO', NULL, '30/45/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OLYMPIKUS', NULL, NULL, '21 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OLYNS', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ONE JEANS', 'SERGIO', NULL, '20 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ONEDA', NULL, NULL, '30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ONITY', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ONZI SACOLAS', NULL, NULL, '15/30', '35', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ORTO BABY', NULL, NULL, '15/25', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ORTOBABY', NULL, NULL, '20 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OVER 93', NULL, NULL, '30/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OVER CORE', NULL, NULL, '60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OVER93', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OVERCOR IMPORT', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OVERCOR NACIO', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OVERCORE', 'IBRAIN', NULL, '30/60/90/120', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OZNE S JEANS', NULL, NULL, '20/40', 'FOB', 'Troca transportes', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OZNES', NULL, NULL, 'avista', 'FOB', 'Trans Hoff', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('OZNES JEANS', NULL, NULL, '15/30/45', 'FOB', 'Troca transportes', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PACELLE', NULL, NULL, '20/30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PACELLE CRIS', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PAJE', 'JOAO', NULL, '15/30 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PARIS', NULL, NULL, 'Avista', 'CIF', 'EXPRESSO LEOMAR', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PARIS INVERNO', NULL, NULL, NULL, 'FOB', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PASSO FORTE', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PATY MODAS', 'NELO', '47-98473-8239', 'À VISTA', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PATY MODAS PROG.', 'NELO', NULL, 'À VISTA', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PEDRA MAGIA', NULL, NULL, 'Avista', 'FOB', 'Troca Transportes', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PEG E VEST', NULL, NULL, 'avista', 'Fob', 'Expresso Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PEGADA', NULL, NULL, '30 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PEGADA ACESSORIOS', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PEGADA CINTOS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PENALTY', NULL, NULL, '70 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PERUSIN', NULL, NULL, '20/30', 'FOB', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PHIERMO', NULL, NULL, 'avista', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PHLIN PHILIN', NULL, NULL, '21 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PIJAMA', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PIMPINHA', 'NATALICIO', NULL, '20/30/40', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PIT BULL', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PITBULL', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PKN', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PLACAR', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PLASPAPPER', NULL, NULL, '28/42', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PLJ', NULL, NULL, 'AVISTA', 'FOB', 'TROCA 11-26362484', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PODER DO IMPACTO', NULL, NULL, 'AVISTA', 'FOB', 'TRANS HOFF', '* SUEDE NÃO MANDAR MOSTARDA', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PODER DO IMPACTP', NULL, NULL, NULL, 'FOB', 'troca transp', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('POKOTINHA', 'JEAN', NULL, '30/60/90/120', NULL, NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('POLO', 'Charles SC', NULL, '30/60/90', NULL, NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PORTO FRANCO', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PRESTON JEANS', 'NEI', '(48) 99974-0858', '15 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PRETA ROSA', 'FELIPE', NULL, 'AVISTA', 'CIF', NULL, NULL, 18, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PRI-LA', NULL, NULL, 'avista', 'FOB', 'Expresso Leomar', NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PRIKA MODAS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PRILA', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PRS', NULL, NULL, '20/40', 'CIF', 'Ouro Negro 11- 2085-5121', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PRS JEANS', NULL, NULL, '15/30', 'FOB', 'Expresso Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PS CONFECCOES', 'ELANO', NULL, '30 DIAS', NULL, NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('PUBLICCO', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RAFF', NULL, NULL, '21 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RAFITHY', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RAKEL`S', 'MILTON', '54-99957-6959', '30/60/90', 'FOB', 'EXPRESSO LEOMAR', NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RAKELS', 'LINIKER', '(54) 99943-8242', '30/60/90', 'FOB', 'EXPRESSO LEOMAR', 'RESPEITAR A GRADE', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RALA KIDS', NULL, NULL, '20/30/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RALAKIDS', 'BRUNO', '(47) 99963-3879', '20/30/40', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RANER', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RASTER', NULL, NULL, '30 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RCA', 'WILIAN', '47-99977-0859', '15/30/45', 'CIF', NULL, '* NÃO MARRON - ** NÃO BRANCA', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RED PLAY', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RED RUBY', NULL, NULL, '15 dias', 'FOB', 'Troca transportes', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RED TAG', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RED WAY', NULL, NULL, NULL, 'FOB', 'Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('REDTAG', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('REINSTIM', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('REINSTIN', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('REISTIN', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('REVEDOR', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('REVEDOR GRENAL', NULL, NULL, '14 DIAS', NULL, 'CIF', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RICH BOY', NULL, NULL, '30/45/60', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('RIDER', NULL, NULL, '90/97/105', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ROLLU', 'ELISEU', NULL, '15 DIAS', 'CIF', NULL, '* SEM OFF', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ROLU', 'ELISEU', NULL, '15 DIAS', 'CIF', NULL, NULL, 0.12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ROMAG', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ROSA BELLA', 'SANDRO', NULL, '15 DIAS', 'CIF', NULL, '* NÃO MANDAR VERDE', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ROSA URBANA', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ROSANA MALHAS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ROVITEX', 'MARINA', NULL, '28/56/84/112/140', 'CIF', NULL, '* NÃO ENVIAR COR MINERAL', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ROVITEX INF', 'SCHUMAKER', '51 999766723', '14/28/42', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ROZAC', NULL, NULL, '30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SACOLAS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SAFIRA', NULL, NULL, '30/60/90/120', 'FOB', 'EXPRESSO LEOMAR', NULL, 4, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SAGA IMPORTADORA', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SANDILLI', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SANNY BABY', 'NATALICIO', NULL, '20/40', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SANNYBABY', 'NATALICIO', NULL, '20/40', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SANTA HELENA', NULL, NULL, '15/30/45', NULL, NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SANY BABY', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SAO FRANCISCO', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SAO FRANSCISCO', NULL, NULL, '15/30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SBA', 'RODRIGO', '(51) 99143-3232', '30/60/90/120', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SBX', NULL, NULL, 'AVISTA', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SCALK', 'PATRICIA', '47-99244-8673', '15/30', 'CIF', NULL, NULL, 121, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SCHRAMM', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SEA BRASIL', 'LUCIANO', '(41) 99965-7330', '30/60/90/120/150', 'CIF', NULL, NULL, 4, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SEA BRASIL I FEMININO', NULL, NULL, '30/60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SEA BRASIL I MASCULINO', NULL, NULL, '30/60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SEA BRASIL INFANTIL', NULL, NULL, '30/60/90/120/150', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SEA BRAZIL', 'LUIZ', NULL, '60/90/120/150/180', 'CIF', NULL, NULL, 4, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SELENE', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SENS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SERENA', NULL, NULL, '30/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SERIAL LIMITS', 'DJONE', '47-99672-2840', '20/40 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SERIAL LIMITS/ MISS AMORES', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SERRA DA ESTRELA', NULL, NULL, '30/45', 'FOB', 'TROCA TRANSPORTES', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SEVEN', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SFIGMOS', 'ELIANE', '47-992440116', '30/60/90', 'CIF', NULL, '* PRETA E MARRON - ** PRETA', NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SFIGNOS', NULL, NULL, '30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SFOGGIA', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SHARK', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SHILMAR', 'JUNIOR', '(48) 98819-6666', '30/45/60', 'CIF', NULL, 'NÃO MANDAR TERRACOTA', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SHRAMM', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SIBRA', NULL, NULL, '60/90/120 data base 30/04', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SIGOSTA', 'MARCO', '47-99116-7410', '30/60/90/120/150', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SILO DA MODA', NULL, NULL, '7', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SININHO', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SIZE', 'SANDRO', '(54) 99999-0909', '15 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SJR', NULL, NULL, 'AVISTA', 'CIF', 'Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SJR JEANS', NULL, NULL, 'A VISTA', 'CIF', 'EXPRESSO LEOMAR', NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SJW', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SKINNER', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SKYNNER', NULL, NULL, '20 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SLIN KIDS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SOFIE', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SOFTERS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SOLETEX', NULL, NULL, '30/60/90', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SONEKINHA', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SONEQUINHA', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SOPHIA ALMEIDA', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SORRIMAR', 'CATIA', NULL, '15', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SPARK', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('STEEL', NULL, NULL, '20 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('STEMP', NULL, NULL, '20 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('STRIKWEAR', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('STUF', NULL, NULL, '30/45/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('STUFF', NULL, NULL, '30/45/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('STYLO CASA', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SUL BRASIL', NULL, NULL, '44105', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SULMAX', NULL, NULL, '14 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SURUKINHA', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('SURUQUINHA', NULL, NULL, '20/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TAMIRA', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TANGRAM', NULL, NULL, '30', 'FOB', 'TRANDUARTE', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TANISE', 'JACINTO', NULL, '30 DIAS', 'CIF', 'CIF', NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TEEZZ', 'ULIANO', '(54) 99162-5024', '30/60/90/120', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TEEZZ - CD', 'ULIANO', '(54) 99162-5024', '30/60/90/120', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TEKA', NULL, NULL, 'ANTECIPADO', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TEND VEST', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TEREZA LUCIA', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TESSERE', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TEZZ', 'ULIANO', '(54) 99162-5024', '30/60/90/120', 'CIF', NULL, 'NÃO ENVIAR REFERÊNCIA PARCIAL', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TH CONF', NULL, NULL, 'Avista', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('THIESEN', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TIANE', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TIGS', NULL, NULL, 'a combinar', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TIGS BOY', NULL, NULL, '15/30/45', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TILE E SUL', 'JUNIOR', '(51) 99132-1011', '60/90/120/150', 'CIF', NULL, '* NÃO ENVIAR OFF', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TILE SUL', 'SANDRO', NULL, '45/75/105/135', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TILEESUL', 'JUNIOR', '(51) 99132-1011', '30/60/90', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TOALHAS GROH', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TOLHAS GROH', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TOOKAS', NULL, NULL, '30/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TOPTRIBO', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TOQUE DE COR', NULL, NULL, '60/90/120', 'FOB', 'Troca transportes', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TORP', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TORPE', NULL, NULL, '14/21', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TOTO MALHAS', NULL, NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TRAJADINHOS', 'CARMELO', '(51) 99928-3421', '30/45', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TRICOFAR', 'ALEX', NULL, 'A VISTA', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TRICOLAN', NULL, NULL, 'AVISTA', 'CIF', 'Trans', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TRITEX', NULL, NULL, '15 dias', 'FOB', 'TROCA TRANSP.', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TRY VEST', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('TRY VEST.', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('UNIFORMES', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('URBAN CITY', 'JONATHAN', '(54) 99992-0742', '15 DIAS', 'CIF', NULL, '14621901 = NÃO BRANCA', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('URBANCITY', NULL, NULL, '20 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('URBANO', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VALEIKO', NULL, NULL, 'avista', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VALMOR', NULL, NULL, '15 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VARIOS', NULL, NULL, NULL, 'FOB', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VECTROM', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VECTRON', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VENERI', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VERDE VIVER', NULL, NULL, 'Avista', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VERSALLY', 'BRUNO', NULL, '30/60', '30/60/90', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VERSASE', NULL, NULL, 'AVISTA', 'CIF', 'TRANS HOFF', NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VIA SAMP', 'WILIAN', NULL, '60/90/120/150', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VIA SAN`P', 'WILIAN', '54 99981-7822', '15/30', 'CIF', NULL, 'NÃO MANDAR LAVANDA/MEL/AZUL BIC/ VERDE BANDEIRA', 2.5, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VIA VIP', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VICK STAR', NULL, NULL, NULL, 'FOB', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VICTOR MARCEL', 'JONATAN', NULL, '20 dias', 'CIF', NULL, NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VILA FLOR', 'ANNA', '51 98052-8119', '15/30', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VINCULO', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VINI MALHARIA', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VIT JEANS', NULL, NULL, '15/30', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VITALITE', 'BRUNO', NULL, '20/40', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VIVA VIDA', 'FABIO', '(51) 98186-2278', '20 DIAS', 'CIF', NULL, 'TOP R1433 = MAIS LARGO | SUPLEX SORTIR: PRETO, MARINHO, MESCLA CLARO E ESCURO.', 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VIVACCI', NULL, NULL, 'AVISTA', 'FOB', 'TROCA TRANSPORTES', NULL, 4, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('VIVANZ', NULL, NULL, '30/60', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('W.  PINK', NULL, NULL, 'avista', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('W. PINK', 'LOJA', NULL, 'BOLETO 10 DIAS', 'CIF', 'Expresso Leomar', NULL, 12, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('W.PINK', NULL, NULL, 'avista', 'FOB', 'Expresso Leomar', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('WEST COAST', NULL, NULL, '56 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('YOHANA CALCADOS', NULL, NULL, 'AVISTA', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('YUPII', NULL, NULL, '30 dias', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ZANNY BABY', NULL, NULL, '30/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ZANY BABY', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ZAPY', NULL, NULL, '20/40', NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ZEE RUCCI', NULL, NULL, '15 DIAS', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ZEERUCCI', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ZEN BOLSAS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ZEUS', NULL, NULL, '30/45/60', 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ZHENG BOLSAS', NULL, NULL, 'Avista', 'FOB', 'Troca Transportes', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ZHOU BOLSAS', NULL, NULL, 'AVISTA', 'FOB', 'LEOMAR', NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);

INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)
  VALUES ('ZHOW BOLSAS', NULL, NULL, NULL, 'CIF', NULL, NULL, NULL, 'CONFECCOES')
  ON CONFLICT (nome) DO UPDATE SET
    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),
    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),
    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),
    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),
    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),
    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),
    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);
