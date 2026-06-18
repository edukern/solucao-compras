/**
 * gerar-form-confirmacao-262.gs
 *
 * Cria automaticamente o Google Form "Confirmação — Importação de Pedidos 26/2"
 * no seu Drive, com todas as perguntas para os compradores.
 *
 * Como usar:
 *   1. Abra https://script.google.com  → Novo projeto
 *   2. Apague o conteúdo e cole TUDO isto
 *   3. Clique em Executar (▶). Autorize quando pedir (é sua conta, seu Drive).
 *   4. Veja o link do form no log (Ver → Registro de execução) — esse é o link p/ enviar.
 */
function criarFormConfirmacao262() {
  const form = FormApp.create('Confirmação — Importação de Pedidos 26/2');
  form.setDescription(
    'Algumas confirmações rápidas para fecharmos a importação dos pedidos da coleção 26/2 no sistema. ' +
    'Leva uns minutos. Qualquer dúvida, respondam em "Outro" ou nos campos de texto. Obrigado!'
  );
  form.setProgressBar(true);
  form.setCollectEmail(false);

  // ───────────────────────── SEÇÃO 1 — FORNECEDORES NOVOS ─────────────────────────
  form.addPageBreakItem()
    .setTitle('1. Fornecedores novos para cadastrar')
    .setHelpText('Estão nas planilhas mas ainda não no sistema. Encontramos a maioria no sistema antigo (controle).');

  form.addMultipleChoiceItem()
    .setTitle('Podemos cadastrar estes 11 com os dados do sistema antigo (CNPJ/razão social)?')
    .setHelpText('AGGY · DOBELLE · DOCE MEL · ESTILO A · JEITO FASHION · KANOA · PONTO IGUI · RECOLLETA · ROYACK · SHAPE · SOLRAC')
    .setChoiceValues(['Sim, pode cadastrar todos', 'Tenho ressalva em algum (explico abaixo)'])
    .showOtherOption(false)
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Se teve ressalva acima, em qual(is) e por quê?')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('BEAVER — qual é o nosso fornecedor? (há dois no sistema antigo)')
    .setChoiceValues([
      'Matos Muniz Ltda (CNPJ 43.964.001/0001-69)',
      'W Modas Ind. Com. (CNPJ 05.909.354/0001-77)',
    ])
    .showOtherOption(true)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('FATAL SUL — é a "FATAL SUL (BW.DISTR)" / BW Indústria?')
    .setHelpText('Há outra "Fatal" no sistema que é a Fatal Surf — essa NÃO é, certo?')
    .setChoiceValues(['Sim, é a FATAL SUL (BW.DISTR)', 'Não, é outra (explico em Outro)'])
    .showOtherOption(true)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('LINDA BEL — é a "Linda Bel" / Miss Bel Ind.?')
    .setHelpText('Há uma "Linda" (calcinhas), nome parecido — essa NÃO é, certo?')
    .setChoiceValues(['Sim, é a Linda Bel (Miss Bel)', 'Não, é outra (explico em Outro)'])
    .showOtherOption(true)
    .setRequired(true);

  form.addTextItem()
    .setTitle('CHARMS — existe com outro nome no sistema? Qual? (ou é fornecedor novo)')
    .setRequired(false);
  form.addTextItem()
    .setTitle('LOOK CHIC — existe com outro nome no sistema? Qual? (ou é fornecedor novo)')
    .setRequired(false);
  form.addTextItem()
    .setTitle('PURO MAR — existe com outro nome no sistema? Qual? (ou é fornecedor novo)')
    .setRequired(false);

  // ───────────────────────── SEÇÃO 2 — DUPLICADOS NO CADASTRO ─────────────────────
  form.addPageBreakItem()
    .setTitle('2. Fornecedores que aparecem repetidos no cadastro')
    .setHelpText('Estão cadastrados mais de uma vez. Precisamos saber qual manter.');

  form.addMultipleChoiceItem()
    .setTitle('RAKELS — está cadastrado duas vezes. Qual mantemos?')
    .setChoiceValues(["RAKEL'S (#587)", 'RAKELS (#642)', 'São empresas diferentes (explico em Outro)'])
    .showOtherOption(true)
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('MORMAII — quais destes são a MESMA empresa? (marque os que são iguais)')
    .setHelpText('O que NÃO for marcado entendemos como fornecedor diferente.')
    .setChoiceValues(['Mormaii', 'Mormaii Conf.', 'Mormaii Calçados', 'Mormaii Programação'])
    .setRequired(false);
  form.addParagraphTextItem()
    .setTitle('MORMAII — quer detalhar algo sobre os Mormaii acima?')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('ACONCHEGO DO BEBÊ — há três cadastros. Qual mantemos?')
    .setChoiceValues([
      'ACONCHEGO DO BEBE (#9)',
      'ACONCHEGO (#89)',
      'ACONCHEGO DO BEBÊ (#594)',
      'São diferentes / não sei (explico em Outro)',
    ])
    .showOtherOption(true)
    .setRequired(true);

  // ───────────────────────── SEÇÃO 3 — PROGRAMAÇÃO ────────────────────────────────
  form.addPageBreakItem()
    .setTitle('3. Planilhas de "Programação"')
    .setHelpText('Há planilhas separadas com "Programação" no nome. Precisamos saber se é um pedido à parte do mesmo fornecedor.');

  ['FEMMINART Programação', 'LZT Programação', 'Mormaii Programação'].forEach(function (nome) {
    form.addMultipleChoiceItem()
      .setTitle(nome + ' — é um pedido SEPARADO do fornecedor, ou já faz parte do pedido principal dele?')
      .setChoiceValues(['Pedido separado (entra como pedido novo)', 'Faz parte do pedido principal'])
      .showOtherOption(true)
      .setRequired(true);
  });

  // ───────────────────────── SEÇÃO 4 — LUPO ───────────────────────────────────────
  form.addPageBreakItem().setTitle('4. Lupo');
  form.addMultipleChoiceItem()
    .setTitle('Lupo é um fornecedor só, ou são vários sob esse nome?')
    .setChoiceValues(['Um só', 'São vários (descrevo abaixo)'])
    .showOtherOption(true)
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('Se são vários, quais? (nome / como diferenciar)')
    .setRequired(false);

  // ───────────────────────── SEÇÃO 5 — CONFERÊNCIA DE PEDIDOS ─────────────────────
  form.addPageBreakItem()
    .setTitle('5. Conferência de alguns pedidos')
    .setHelpText('Encontramos pequenas diferenças entre a planilha e o sistema. Confirmem para corrigirmos certo.');

  form.addMultipleChoiceItem()
    .setTitle('URBAN CITY — qual é o código de referência CERTO desse produto?')
    .setHelpText('Na planilha está "1512509"; no sistema entrou como "10512509". Como o código vai no PDF do fornecedor, precisamos do correto.')
    .setChoiceValues(['1512509 (planilha)', '10512509 (sistema)'])
    .showOtherOption(true)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('URBAN CITY — na loja FMV Streit, o sistema tem 1 peça a mais nas refs 6012661 e 6012692. Está certo?')
    .setChoiceValues([
      'Certo — o pedido é esse (planilha que está desatualizada)',
      'Errado — o sistema lançou a mais (corrigir pela planilha)',
    ])
    .showOtherOption(true)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('ACONCHEGO — o sistema tem algumas peças a mais (FMV Streit: ref 0045500077 = 2 pç; J. Backes: +1). Está certo?')
    .setChoiceValues([
      'Certo — o pedido é esse (planilha desatualizada)',
      'Errado — corrigir pela planilha',
    ])
    .showOtherOption(true)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Padronização de códigos — alguns códigos no sistema têm um zero ou espaço a mais que a planilha (ex.: "B3686 X" vs "B3686X", "055..." vs "0055..."). Podemos padronizar pelo código da planilha?')
    .setChoiceValues(['Sim, padronizar pela planilha', 'Não — falo com vocês antes'])
    .showOtherOption(true)
    .setRequired(true);

  // ───────────────────────── LINK ─────────────────────────────────────────────────
  Logger.log('FORM CRIADO ✅');
  Logger.log('Link para responder (enviar aos compradores): ' + form.getPublishedUrl());
  Logger.log('Link para editar: ' + form.getEditUrl());
}
