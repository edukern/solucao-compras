export const compradores = [
  { id:1, nome:'Irmãos Backes',        cnpj:'08.889.201/0001-01', cidade:'Três Coroas/RS' },
  { id:2, nome:'Samuel Paulo Backes',  cnpj:'15.563.106/0001-70', cidade:'Três Coroas/RS' },
  { id:3, nome:'PSM Backes',           cnpj:'28.010.922/0001-07', cidade:'Igrejinha/RS' },
  { id:4, nome:'Alexandre Backes',     cnpj:'06.284.903/0001-28', cidade:'' },
  { id:5, nome:'Elisangela M. Backes', cnpj:'13.706.244/0001-36', cidade:'Santa Maria do Herval/RS' },
  { id:6, nome:'Rafael J. Backes',     cnpj:'46.348.002/0001-77', cidade:'Rolante/RS' },
  { id:7, nome:'Streit Conf',          cnpj:'10.206.469/0001-35', cidade:'Riozinho/RS' },
  { id:8, nome:'FMV Streit Conf',      cnpj:'20.354.516/0001-41', cidade:'Rolante/RS' },
]

export const colecoes = [
  { id: 1, nome: 'Inverno 2026', estacao: 'inverno', ano: 2026, status: 'em_compra' },
]

export const segmentacoes = [
  { id: 1, classificacao: 'AD',  tipo_produto: 'CALCA',    classe: 'MASC', tipo_grade: 'AD',  estacao: 'inverno' },
  { id: 2, classificacao: 'AD',  tipo_produto: 'CALCA',    classe: 'FEM',  tipo_grade: 'AD',  estacao: 'inverno' },
  { id: 3, classificacao: 'AD',  tipo_produto: 'BLUSINHA', classe: 'FEM',  tipo_grade: 'AD',  estacao: 'inverno' },
  { id: 4, classificacao: 'AD',  tipo_produto: 'CALCADO',  classe: 'MASC', tipo_grade: 'AD1', estacao: 'inverno' },
  { id: 5, classificacao: 'AD',  tipo_produto: 'CALCADO',  classe: 'FEM',  tipo_grade: 'AD1', estacao: 'inverno' },
  { id: 6, classificacao: 'EX',  tipo_produto: 'CALCA',    classe: 'MASC', tipo_grade: 'EX',  estacao: 'inverno' },
  { id: 7, classificacao: 'EX',  tipo_produto: 'BLUSINHA', classe: 'FEM',  tipo_grade: 'EX',  estacao: 'inverno' },
  { id: 8, classificacao: 'INF', tipo_produto: 'CALCA',    classe: 'UNI',  tipo_grade: 'INF', estacao: 'inverno' },
  { id: 9, classificacao: 'INF', tipo_produto: 'BLUSINHA', classe: 'UNI',  tipo_grade: 'INF', estacao: 'inverno' },
]

export const fornecedores = [
  { id:  1, nome: 'GANGSTER',          contato: '' },
  { id:  2, nome: 'LUNENDER',          contato: '' },
  { id:  3, nome: 'HAVAIANAS',         contato: '' },
  { id:  4, nome: 'MOLEKINHO',         contato: '' },
  { id:  5, nome: 'MORMAII CONFECCAO', contato: '' },
  { id:  6, nome: 'BEIRA RIO',         contato: '' },
  { id:  7, nome: 'CROCKER',           contato: '' },
  { id:  8, nome: 'PEGADA',            contato: '' },
  { id:  9, nome: 'ALTENBURG',         contato: '' },
  { id: 10, nome: 'TEEZZ',             contato: '' },
  { id: 11, nome: 'FATTALY',           contato: '' },
  { id: 12, nome: 'JEITO FASHION',     contato: '' },
  { id: 13, nome: 'FATAL SUL',         contato: '' },
  { id: 14, nome: 'DECIZAO',           contato: '' },
  { id: 15, nome: 'RITA MODAS',        contato: '' },
]

// { segmentacao_id, colecao_id, tamanho, qtd_ajustada }
export const projecoes = [
  // seg 1 — AD CALCA MASC  (total 510)
  { segmentacao_id:1, colecao_id:1, tamanho:'PP', qtd_ajustada:60  },
  { segmentacao_id:1, colecao_id:1, tamanho:'P',  qtd_ajustada:120 },
  { segmentacao_id:1, colecao_id:1, tamanho:'M',  qtd_ajustada:150 },
  { segmentacao_id:1, colecao_id:1, tamanho:'G',  qtd_ajustada:120 },
  { segmentacao_id:1, colecao_id:1, tamanho:'GG', qtd_ajustada:60  },
  // seg 2 — AD CALCA FEM  (total 430)
  { segmentacao_id:2, colecao_id:1, tamanho:'PP', qtd_ajustada:50  },
  { segmentacao_id:2, colecao_id:1, tamanho:'P',  qtd_ajustada:100 },
  { segmentacao_id:2, colecao_id:1, tamanho:'M',  qtd_ajustada:130 },
  { segmentacao_id:2, colecao_id:1, tamanho:'G',  qtd_ajustada:100 },
  { segmentacao_id:2, colecao_id:1, tamanho:'GG', qtd_ajustada:50  },
  // seg 3 — AD BLUSINHA FEM  (total 560)
  { segmentacao_id:3, colecao_id:1, tamanho:'PP', qtd_ajustada:70  },
  { segmentacao_id:3, colecao_id:1, tamanho:'P',  qtd_ajustada:130 },
  { segmentacao_id:3, colecao_id:1, tamanho:'M',  qtd_ajustada:160 },
  { segmentacao_id:3, colecao_id:1, tamanho:'G',  qtd_ajustada:130 },
  { segmentacao_id:3, colecao_id:1, tamanho:'GG', qtd_ajustada:70  },
  // seg 4 — AD CALCADO MASC  (total 360)
  { segmentacao_id:4, colecao_id:1, tamanho:'37', qtd_ajustada:40 },
  { segmentacao_id:4, colecao_id:1, tamanho:'38', qtd_ajustada:60 },
  { segmentacao_id:4, colecao_id:1, tamanho:'39', qtd_ajustada:70 },
  { segmentacao_id:4, colecao_id:1, tamanho:'40', qtd_ajustada:70 },
  { segmentacao_id:4, colecao_id:1, tamanho:'41', qtd_ajustada:60 },
  { segmentacao_id:4, colecao_id:1, tamanho:'42', qtd_ajustada:40 },
  { segmentacao_id:4, colecao_id:1, tamanho:'43', qtd_ajustada:20 },
  // seg 5 — AD CALCADO FEM  (total 290)
  { segmentacao_id:5, colecao_id:1, tamanho:'34', qtd_ajustada:20 },
  { segmentacao_id:5, colecao_id:1, tamanho:'35', qtd_ajustada:40 },
  { segmentacao_id:5, colecao_id:1, tamanho:'36', qtd_ajustada:60 },
  { segmentacao_id:5, colecao_id:1, tamanho:'37', qtd_ajustada:70 },
  { segmentacao_id:5, colecao_id:1, tamanho:'38', qtd_ajustada:60 },
  { segmentacao_id:5, colecao_id:1, tamanho:'39', qtd_ajustada:40 },
  // seg 6 — EX CALCA MASC  (total 310)
  { segmentacao_id:6, colecao_id:1, tamanho:'G1', qtd_ajustada:40 },
  { segmentacao_id:6, colecao_id:1, tamanho:'G2', qtd_ajustada:70 },
  { segmentacao_id:6, colecao_id:1, tamanho:'G3', qtd_ajustada:90 },
  { segmentacao_id:6, colecao_id:1, tamanho:'G4', qtd_ajustada:70 },
  { segmentacao_id:6, colecao_id:1, tamanho:'G5', qtd_ajustada:40 },
  // seg 7 — EX BLUSINHA FEM  (total 390)
  { segmentacao_id:7, colecao_id:1, tamanho:'G1', qtd_ajustada:50  },
  { segmentacao_id:7, colecao_id:1, tamanho:'G2', qtd_ajustada:90  },
  { segmentacao_id:7, colecao_id:1, tamanho:'G3', qtd_ajustada:110 },
  { segmentacao_id:7, colecao_id:1, tamanho:'G4', qtd_ajustada:90  },
  { segmentacao_id:7, colecao_id:1, tamanho:'G5', qtd_ajustada:50  },
  // seg 8 — INF CALCA UNI  (total 270)
  { segmentacao_id:8, colecao_id:1, tamanho:'2',  qtd_ajustada:30 },
  { segmentacao_id:8, colecao_id:1, tamanho:'4',  qtd_ajustada:50 },
  { segmentacao_id:8, colecao_id:1, tamanho:'6',  qtd_ajustada:60 },
  { segmentacao_id:8, colecao_id:1, tamanho:'8',  qtd_ajustada:60 },
  { segmentacao_id:8, colecao_id:1, tamanho:'10', qtd_ajustada:50 },
  { segmentacao_id:8, colecao_id:1, tamanho:'12', qtd_ajustada:20 },
  // seg 9 — INF BLUSINHA UNI  (total 230)
  { segmentacao_id:9, colecao_id:1, tamanho:'2',  qtd_ajustada:25 },
  { segmentacao_id:9, colecao_id:1, tamanho:'4',  qtd_ajustada:40 },
  { segmentacao_id:9, colecao_id:1, tamanho:'6',  qtd_ajustada:50 },
  { segmentacao_id:9, colecao_id:1, tamanho:'8',  qtd_ajustada:55 },
  { segmentacao_id:9, colecao_id:1, tamanho:'10', qtd_ajustada:40 },
  { segmentacao_id:9, colecao_id:1, tamanho:'12', qtd_ajustada:20 },
]

// Pedidos raw: ~60% of projeção comprado, distribuídos entre 15 fornecedores
// { fornecedor_id, colecao_id, segmentacao_id, data_pedido, tamanho, qtd_pedida, valor_unitario }
export const pedidosBase = [
  // --- GANGSTER → seg1 (AD CALCA MASC) PP+P+M+G
  { fornecedor_id:1, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-08', tamanho:'PP', qtd_pedida:35,  valor_unitario:89.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-08', tamanho:'P',  qtd_pedida:70,  valor_unitario:89.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-08', tamanho:'M',  qtd_pedida:90,  valor_unitario:89.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-08', tamanho:'G',  qtd_pedida:70,  valor_unitario:89.90 },
  // --- GANGSTER → seg6 (EX CALCA MASC) G1+G2+G3
  { fornecedor_id:1, colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-08', tamanho:'G1', qtd_pedida:24,  valor_unitario:79.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-08', tamanho:'G2', qtd_pedida:42,  valor_unitario:79.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-08', tamanho:'G3', qtd_pedida:54,  valor_unitario:79.90 },
  // --- CROCKER → seg1 GG
  { fornecedor_id:7, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-12', tamanho:'GG', qtd_pedida:36,  valor_unitario:92.00 },
  // --- DECIZAO → seg6 G4+G5
  { fornecedor_id:14,colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-15', tamanho:'G4', qtd_pedida:42,  valor_unitario:82.00 },
  { fornecedor_id:14,colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-15', tamanho:'G5', qtd_pedida:24,  valor_unitario:82.00 },
  // --- LUNENDER → seg2 (AD CALCA FEM) todos os tamanhos
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'PP', qtd_pedida:30,  valor_unitario:94.90 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'P',  qtd_pedida:60,  valor_unitario:94.90 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'M',  qtd_pedida:78,  valor_unitario:94.90 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'G',  qtd_pedida:60,  valor_unitario:94.90 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'GG', qtd_pedida:30,  valor_unitario:94.90 },
  // --- LUNENDER → seg7 (EX BLUSINHA FEM) G1+G2+G3
  { fornecedor_id:2, colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-10', tamanho:'G1', qtd_pedida:30,  valor_unitario:88.00 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-10', tamanho:'G2', qtd_pedida:54,  valor_unitario:88.00 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-10', tamanho:'G3', qtd_pedida:66,  valor_unitario:88.00 },
  // --- TEEZZ → seg2 complemento M
  { fornecedor_id:10,colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-25', tamanho:'M',  qtd_pedida:30,  valor_unitario:96.00 },
  // --- FATTALY → seg3 (AD BLUSINHA FEM) PP+P+M+G
  { fornecedor_id:11,colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-14', tamanho:'PP', qtd_pedida:42,  valor_unitario:76.90 },
  { fornecedor_id:11,colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-14', tamanho:'P',  qtd_pedida:78,  valor_unitario:76.90 },
  { fornecedor_id:11,colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-14', tamanho:'M',  qtd_pedida:96,  valor_unitario:76.90 },
  { fornecedor_id:11,colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-14', tamanho:'G',  qtd_pedida:78,  valor_unitario:76.90 },
  // --- ALTENBURG → seg3 GG
  { fornecedor_id:9, colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-18', tamanho:'GG', qtd_pedida:42,  valor_unitario:79.00 },
  // --- RITA MODAS → seg7 G4+G5
  { fornecedor_id:15,colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-20', tamanho:'G4', qtd_pedida:54,  valor_unitario:91.00 },
  { fornecedor_id:15,colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-20', tamanho:'G5', qtd_pedida:30,  valor_unitario:91.00 },
  // --- BEIRA RIO → seg7 G2 complemento
  { fornecedor_id:6, colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-22', tamanho:'G2', qtd_pedida:36,  valor_unitario:86.00 },
  // --- JEITO FASHION → seg7 G3 complemento
  { fornecedor_id:12,colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-23', tamanho:'G3', qtd_pedida:44,  valor_unitario:93.00 },
  // --- MOLEKINHO → seg9 (INF BLUSINHA UNI)
  { fornecedor_id:4, colecao_id:1, segmentacao_id:9, data_pedido:'2026-04-13', tamanho:'4',  qtd_pedida:24, valor_unitario:49.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:9, data_pedido:'2026-04-13', tamanho:'6',  qtd_pedida:30, valor_unitario:49.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:9, data_pedido:'2026-04-13', tamanho:'8',  qtd_pedida:33, valor_unitario:49.90 },
  // --- HAVAIANAS → seg4 (AD CALCADO MASC) 37-42
  { fornecedor_id:3, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'37', qtd_pedida:24,  valor_unitario:149.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'38', qtd_pedida:36,  valor_unitario:149.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'39', qtd_pedida:42,  valor_unitario:149.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'40', qtd_pedida:42,  valor_unitario:149.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'41', qtd_pedida:36,  valor_unitario:149.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'42', qtd_pedida:24,  valor_unitario:149.90 },
  // --- FATAL SUL → seg4 tamanho 43
  { fornecedor_id:13,colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-16', tamanho:'43', qtd_pedida:12,  valor_unitario:155.00 },
  // --- HAVAIANAS → seg5 (AD CALCADO FEM) 35-38
  { fornecedor_id:3, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-09', tamanho:'35', qtd_pedida:24,  valor_unitario:139.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-09', tamanho:'36', qtd_pedida:36,  valor_unitario:139.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-09', tamanho:'37', qtd_pedida:42,  valor_unitario:139.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-09', tamanho:'38', qtd_pedida:36,  valor_unitario:139.90 },
  // --- PEGADA → seg5 34+39
  { fornecedor_id:8, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-17', tamanho:'34', qtd_pedida:12,  valor_unitario:135.00 },
  { fornecedor_id:8, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-17', tamanho:'39', qtd_pedida:24,  valor_unitario:135.00 },
  // --- MORMAII → seg6 G1+G2 complemento
  { fornecedor_id:5, colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-11', tamanho:'G1', qtd_pedida:16,  valor_unitario:99.90 },
  { fornecedor_id:5, colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-11', tamanho:'G2', qtd_pedida:28,  valor_unitario:99.90 },
  // --- MOLEKINHO → seg8 (INF CALCA INF) todos os tamanhos
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'6',  qtd_pedida:24, valor_unitario:59.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'8',  qtd_pedida:36, valor_unitario:59.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'10', qtd_pedida:42, valor_unitario:59.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'12', qtd_pedida:36, valor_unitario:59.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'14', qtd_pedida:24, valor_unitario:59.90 },
]
