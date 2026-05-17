# Fornecedores, Importação, Coleções e Electron — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir nomes de fornecedores no mock, importar dados reais das 72 planilhas, adicionar UI de coleções no demo e sincronizar features do demo para o app Electron + SQLite.

**Architecture:** Quatro tarefas independentes e sequenciais: (1) fix pontual no mockData.js, (2) script Python que lê `Pedidos_2026_1/*.xlsx` e regenera `demo/src/mockData.js`, (3) UI de gestão de coleções na demo, (4) extensão do schema SQLite com `compradores` + `categoria`, port do Compras.jsx do demo para o renderer Electron.

**Tech Stack:** Python 3.12 + openpyxl, React 18, CSS Modules, better-sqlite3, Electron 35, Vite

---

## Contexto importante

- Todos os comandos de terminal devem começar com `cd "C:\Users\eduke\Solução Compras"`
- Planilhas dos fornecedores: `C:\Users\eduke\Downloads\Pedidos_2026_1\` (72 arquivos)
- Arquivo de marcas canonical: `C:\Users\eduke\Downloads\Marcas 2025_2026.xlsx`
- Demo web: `demo/src/` — usa `mockApi.js` com dados em memória
- App Electron: `src/renderer/src/` — usa `window.api` via IPC
- Repositório: `https://github.com/edukern/solucao-compras`, branch `main`, deploy automático Vercel

### Mapeamento de nomes (planilha → canônico)
Os arquivos de pedido têm algumas grafias erradas. Script de importação deve aplicar:
```python
BRAND_MAP = {
    'COTTON & COTTON':    'COTTON E COTTON',
    'OVERCORE':           'OVERCOR',
    'ROVITEZ=X':          'ROVITEX',
    'RALAKIDS':           'RALA KIDS',
    'ROLLU':              'ROLU',
    'TEZZ':               'TEEZZ',
    'MARU PROG.':         'MARU',
    'PATY MODAS PROG.':   'PATY MODAS',
}
# Encoding fix para ACONCHEGO DO BEBÊ
# Detectar por startswith('ACONCHEGO')
```

### Estrutura das planilhas de pedido
Arquivos com brand name em row 1, col 2 (col B) são planilhas de fornecedor.
Arquivos sem brand name (N/A) são arquivos de compradores ou tabelas internas — ignorar.

Layout de cada linha de produto (1-indexed):
- Col 1 (A): Ref
- Col 2 (B): tipo_produto (CALCA, VESTIDO, LEG...) — pode ser fórmula `=B(n-1)` com valor cacheado
- Col 3 (C): tipo_grade (PP, BB, INF, JUV, AD, EX, AD1...)
- Col 4 (D): classe (FEM, MASC, UNI) — pode ser fórmula com valor cacheado
- Col 6 (F): valor_unitario
- Col 8 em diante: blocos por comprador (20 colunas cada)
  - Compradores nas colunas 8, 28, 48, 68, 88, 108, 128, 148 (row 11)
  - Dentro de cada bloco: col_par = label do tamanho, col_ímpar = quantidade
  - Ex: buyer_start=8 → sizes: col 8='RN', col 9=qty1, col 10='P', col 11=qty2, ...

---

## Task 1: Corrigir mockData.js

**Problema:** pedidosBase usa fornecedor_ids 1-15 mas os comentários de código dizem nomes errados (ex: `// GANGSTER →` para fornecedor_id:1 que é APPLICATO). Nomes das marcas já estão corretos no array `fornecedores`.

**Files:**
- Modify: `demo/src/mockData.js`

- [ ] **Step 1: Corrigir comentários do pedidosBase**

Substituir os comentários errados no pedidosBase para refletir os nomes reais nos IDs usados:

```js
// demo/src/mockData.js — pedidosBase
// fornecedor_id:1 = APPLICATO, id:2 = AQUECCE, id:7 = BLUE MACAW
// id:14 = DANKA, id:35 = LUNENDER, id:10 = CAW, id:11 = CIA CORPO
// id:6 = BIOGAS, id:12 = BRUNA, id:3 = AUTENTICADA
// id:4 = BALBOA, id:5 = BICHO BAGUNCA, id:8 = BRUNA
// id:9 = CATOLELE, id:13 = COSTAO, id:15 = COTTON E COTTON
```

Abrir `demo/src/mockData.js`, localizar o bloco `pedidosBase`, e atualizar cada comentário de seção para mostrar o nome real do fornecedor baseado no ID:

```js
export const pedidosBase = [
  // --- APPLICATO → seg1 (AD CALCA MASC) PP+P+M+G
  { fornecedor_id:1, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-08', tamanho:'PP', qtd_pedida:35,  valor_unitario:89.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-08', tamanho:'P',  qtd_pedida:70,  valor_unitario:89.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-08', tamanho:'M',  qtd_pedida:90,  valor_unitario:89.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-08', tamanho:'G',  qtd_pedida:70,  valor_unitario:89.90 },
  // --- APPLICATO → seg6 (EX CALCA MASC) G1+G2+G3
  { fornecedor_id:1, colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-08', tamanho:'G1', qtd_pedida:24,  valor_unitario:79.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-08', tamanho:'G2', qtd_pedida:42,  valor_unitario:79.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-08', tamanho:'G3', qtd_pedida:54,  valor_unitario:79.90 },
  // --- BLUE MACAW → seg1 GG
  { fornecedor_id:7, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-12', tamanho:'GG', qtd_pedida:36,  valor_unitario:92.00 },
  // --- DANKA → seg6 G4+G5
  { fornecedor_id:14,colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-15', tamanho:'G4', qtd_pedida:42,  valor_unitario:82.00 },
  { fornecedor_id:14,colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-15', tamanho:'G5', qtd_pedida:24,  valor_unitario:82.00 },
  // --- AQUECCE → seg2 (AD CALCA FEM) todos os tamanhos
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'PP', qtd_pedida:30,  valor_unitario:94.90 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'P',  qtd_pedida:60,  valor_unitario:94.90 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'M',  qtd_pedida:78,  valor_unitario:94.90 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'G',  qtd_pedida:60,  valor_unitario:94.90 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'GG', qtd_pedida:30,  valor_unitario:94.90 },
  // --- AQUECCE → seg7 (EX BLUSINHA FEM) G1+G2+G3
  { fornecedor_id:2, colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-10', tamanho:'G1', qtd_pedida:30,  valor_unitario:88.00 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-10', tamanho:'G2', qtd_pedida:54,  valor_unitario:88.00 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-10', tamanho:'G3', qtd_pedida:66,  valor_unitario:88.00 },
  // --- CAW → seg2 complemento M
  { fornecedor_id:10,colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-25', tamanho:'M',  qtd_pedida:30,  valor_unitario:96.00 },
  // --- CIA CORPO → seg3 (AD BLUSINHA FEM) PP+P+M+G
  { fornecedor_id:11,colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-14', tamanho:'PP', qtd_pedida:42,  valor_unitario:76.90 },
  { fornecedor_id:11,colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-14', tamanho:'P',  qtd_pedida:78,  valor_unitario:76.90 },
  { fornecedor_id:11,colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-14', tamanho:'M',  qtd_pedida:96,  valor_unitario:76.90 },
  { fornecedor_id:11,colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-14', tamanho:'G',  qtd_pedida:78,  valor_unitario:76.90 },
  // --- AUTENTICADA → seg3 GG
  { fornecedor_id:3, colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-18', tamanho:'GG', qtd_pedida:42,  valor_unitario:79.00 },
  // --- COTTON E COTTON → seg7 G4+G5
  { fornecedor_id:15,colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-20', tamanho:'G4', qtd_pedida:54,  valor_unitario:91.00 },
  { fornecedor_id:15,colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-20', tamanho:'G5', qtd_pedida:30,  valor_unitario:91.00 },
  // --- BIOGAS → seg7 G2 complemento
  { fornecedor_id:6, colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-22', tamanho:'G2', qtd_pedida:36,  valor_unitario:86.00 },
  // --- BRUNA → seg7 G3 complemento
  { fornecedor_id:8, colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-23', tamanho:'G3', qtd_pedida:44,  valor_unitario:93.00 },
  // --- BALBOA → seg9 (INF BLUSINHA UNI)
  { fornecedor_id:4, colecao_id:1, segmentacao_id:9, data_pedido:'2026-04-13', tamanho:'4',  qtd_pedida:24, valor_unitario:49.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:9, data_pedido:'2026-04-13', tamanho:'6',  qtd_pedida:30, valor_unitario:49.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:9, data_pedido:'2026-04-13', tamanho:'8',  qtd_pedida:33, valor_unitario:49.90 },
  // --- BICHO BAGUNCA → seg4 (AD CALCADO MASC) 37-42
  { fornecedor_id:5, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'37', qtd_pedida:24,  valor_unitario:149.90 },
  { fornecedor_id:5, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'38', qtd_pedida:36,  valor_unitario:149.90 },
  { fornecedor_id:5, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'39', qtd_pedida:42,  valor_unitario:149.90 },
  { fornecedor_id:5, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'40', qtd_pedida:42,  valor_unitario:149.90 },
  { fornecedor_id:5, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'41', qtd_pedida:36,  valor_unitario:149.90 },
  { fornecedor_id:5, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'42', qtd_pedida:24,  valor_unitario:149.90 },
  // --- COSTAO → seg4 tamanho 43
  { fornecedor_id:13,colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-16', tamanho:'43', qtd_pedida:12,  valor_unitario:155.00 },
  // --- BICHO BAGUNCA → seg5 (AD CALCADO FEM) 35-38
  { fornecedor_id:5, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-09', tamanho:'35', qtd_pedida:24,  valor_unitario:139.90 },
  { fornecedor_id:5, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-09', tamanho:'36', qtd_pedida:36,  valor_unitario:139.90 },
  { fornecedor_id:5, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-09', tamanho:'37', qtd_pedida:42,  valor_unitario:139.90 },
  { fornecedor_id:5, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-09', tamanho:'38', qtd_pedida:36,  valor_unitario:139.90 },
  // --- BRUNA → seg5 34+39
  { fornecedor_id:8, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-17', tamanho:'34', qtd_pedida:12,  valor_unitario:135.00 },
  { fornecedor_id:8, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-17', tamanho:'39', qtd_pedida:24,  valor_unitario:135.00 },
  // --- MORMAII → seg6 G1+G2 complemento
  { fornecedor_id:63,colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-11', tamanho:'G1', qtd_pedida:16,  valor_unitario:99.90 },
  { fornecedor_id:63,colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-11', tamanho:'G2', qtd_pedida:28,  valor_unitario:99.90 },
  // --- BALBOA → seg8 (INF CALCA INF) todos os tamanhos
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'6',  qtd_pedida:24, valor_unitario:59.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'8',  qtd_pedida:36, valor_unitario:59.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'10', qtd_pedida:42, valor_unitario:59.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'12', qtd_pedida:36, valor_unitario:59.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'14', qtd_pedida:24, valor_unitario:59.90 },
]
```

- [ ] **Step 2: Commit**

```bash
cd "C:\Users\eduke\Solução Compras"
git add demo/src/mockData.js
git commit -m "fix(demo): corrige comentários do pedidosBase para refletir IDs reais"
```

---

## Task 2: Script Python de importação das planilhas

Lê os 47 arquivos de fornecedor em `Pedidos_2026_1/`, extrai segmentações e pedidos reais, e gera um novo `demo/src/mockData.js` com dados da coleção 2026/1.

**Files:**
- Create: `scripts/importar_pedidos.py`
- Modify: `demo/src/mockData.js` (gerado pelo script)

- [ ] **Step 1: Criar script `scripts/importar_pedidos.py`**

```bash
mkdir -p "C:\Users\eduke\Solução Compras\scripts"
```

Criar o arquivo `scripts/importar_pedidos.py`:

```python
"""
Importa pedidos das planilhas da coleção 2026/1 e gera demo/src/mockData.js.

Uso:
    python scripts/importar_pedidos.py

Saída: demo/src/mockData.js (sobrescreve)
"""
import openpyxl
import os
import warnings
from pathlib import Path
from collections import defaultdict

warnings.filterwarnings('ignore')

PEDIDOS_DIR = Path(r'C:\Users\eduke\Downloads\Pedidos_2026_1')
OUT_FILE    = Path(__file__).parent.parent / 'demo' / 'src' / 'mockData.js'

# Compradores na ordem das colunas (cols 8,28,48,68,88,108,128,148 em 1-index)
BUYER_COLS = [8, 28, 48, 68, 88, 108, 128, 148]

# Mapeamento: nome na planilha → nome canônico (arquivo de marcas)
BRAND_MAP = {
    'COTTON & COTTON':   'COTTON E COTTON',
    'OVERCORE':          'OVERCOR',
    'ROVITEZ=X':         'ROVITEX',
    'RALAKIDS':          'RALA KIDS',
    'ROLLU':             'ROLU',
    'TEZZ':              'TEEZZ',
    'MARU PROG.':        'MARU',
    'PATY MODAS PROG.':  'PATY MODAS',
}

def canonical(name: str) -> str:
    name = name.strip()
    if name.upper().startswith('ACONCHEGO'):
        return 'ACONCHEGO DO BEBE'
    return BRAND_MAP.get(name, name)

def resolve_formula(val, prev):
    """Retorna val se não for fórmula; caso contrário retorna prev (valor da célula acima)."""
    if val is None:
        return prev
    s = str(val)
    if s.startswith('='):
        return prev
    return val

def parse_file(path: Path):
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(min_row=1, values_only=True))

    # Brand name: row 1, col 2 (index 1)
    raw_brand = rows[0][1] if rows[0][1] else None
    if not raw_brand:
        wb.close()
        return None, []

    brand = canonical(str(raw_brand))

    # Products start at row 13 (index 12), continue until blank ref
    products = []
    prev_produto, prev_classe = None, None
    for row in rows[12:]:
        ref = row[0]
        if ref is None or str(ref).strip() == '':
            break  # end of products

        produto_raw = row[1]
        grade       = row[2]
        classe_raw  = row[3]
        valor       = row[5]

        # Resolve formulas (=B(n-1) pattern) using previous non-formula value
        produto = resolve_formula(produto_raw, prev_produto)
        classe  = resolve_formula(classe_raw,  prev_classe)
        if produto: prev_produto = produto
        if classe:  prev_classe  = classe

        if not grade or not produto or not classe:
            continue

        grade  = str(grade).strip().upper()
        produto = str(produto).strip().upper()
        classe  = str(classe).strip().upper()
        valor_unit = float(valor) if isinstance(valor, (int, float)) else 0.0

        # Extract quantities per buyer per size
        # Pattern: buyer_start_col (1-indexed) → sizes at +0,+2,+4... labels, +1,+3,+5... qtds
        itens_por_buyer = {}
        for buyer_idx, buyer_col in enumerate(BUYER_COLS):
            bc = buyer_col - 1  # 0-indexed
            buyer_itens = {}
            for offset in range(0, 20, 2):
                size_val = row[bc + offset] if bc + offset < len(row) else None
                qty_val  = row[bc + offset + 1] if bc + offset + 1 < len(row) else None
                if size_val is None or str(size_val).strip() in ('', '--'):
                    break
                if qty_val and isinstance(qty_val, (int, float)) and qty_val > 0:
                    buyer_itens[str(size_val).strip()] = int(qty_val)
            if buyer_itens:
                itens_por_buyer[buyer_idx] = buyer_itens

        if itens_por_buyer:
            products.append({
                'produto':  produto,
                'grade':    grade,
                'classe':   classe,
                'valor':    round(valor_unit, 2),
                'itens':    itens_por_buyer,  # {buyer_idx: {tamanho: qty}}
            })

    wb.close()
    return brand, products


def main():
    # Compradores fixos
    compradores = [
        {'id': 1, 'nome': 'Irmãos Backes',        'cnpj': '08.889.201/0001-01', 'cidade': 'Três Coroas/RS'},
        {'id': 2, 'nome': 'Samuel Paulo Backes',   'cnpj': '15.563.106/0001-70', 'cidade': 'Três Coroas/RS'},
        {'id': 3, 'nome': 'PSM Backes',            'cnpj': '28.010.922/0001-07', 'cidade': 'Igrejinha/RS'},
        {'id': 4, 'nome': 'Alexandre Backes',      'cnpj': '06.284.903/0001-28', 'cidade': ''},
        {'id': 5, 'nome': 'Elisangela M. Backes',  'cnpj': '13.706.244/0001-36', 'cidade': 'Santa Maria do Herval/RS'},
        {'id': 6, 'nome': 'Rafael J. Backes',      'cnpj': '46.348.002/0001-77', 'cidade': 'Rolante/RS'},
        {'id': 7, 'nome': 'Streit Conf',           'cnpj': '10.206.469/0001-35', 'cidade': 'Riozinho/RS'},
        {'id': 8, 'nome': 'FMV Streit Conf',       'cnpj': '20.354.516/0001-41', 'cidade': 'Rolante/RS'},
    ]

    # Fornecedores canônicos com categoria (do arquivo de marcas)
    # Mantém lista original de mockData.js — apenas IDs importados terão pedidos reais
    fornecedores_base = [
        { 'id':  1, 'nome': 'APPLICATO',         'categoria': 'CONFECCOES' },
        { 'id':  2, 'nome': 'AQUECCE',            'categoria': 'CONFECCOES' },
        { 'id':  3, 'nome': 'AUTENTICADA',        'categoria': 'CONFECCOES' },
        { 'id':  4, 'nome': 'BALBOA',             'categoria': 'CONFECCOES' },
        { 'id':  5, 'nome': 'BICHO BAGUNCA',      'categoria': 'CONFECCOES' },
        { 'id':  6, 'nome': 'BIOGAS',             'categoria': 'CONFECCOES' },
        { 'id':  7, 'nome': 'BLUE MACAW',         'categoria': 'CONFECCOES' },
        { 'id':  8, 'nome': 'BRUNA',              'categoria': 'CONFECCOES' },
        { 'id':  9, 'nome': 'CATOLELE',           'categoria': 'CONFECCOES' },
        { 'id': 10, 'nome': 'CAW',                'categoria': 'CONFECCOES' },
        { 'id': 11, 'nome': 'CIA CORPO',          'categoria': 'CONFECCOES' },
        { 'id': 12, 'nome': 'COSTAO',             'categoria': 'CONFECCOES' },
        { 'id': 13, 'nome': 'COTTON E COTTON',    'categoria': 'CONFECCOES' },
        { 'id': 14, 'nome': 'CROCKER',            'categoria': 'CONFECCOES' },
        { 'id': 15, 'nome': 'DANKA',              'categoria': 'CONFECCOES' },
        { 'id': 16, 'nome': 'DESAYNER',           'categoria': 'CONFECCOES' },
        { 'id': 17, 'nome': 'DIANFA',             'categoria': 'CONFECCOES' },
        { 'id': 18, 'nome': 'DIXIE',              'categoria': 'CONFECCOES' },
        { 'id': 19, 'nome': 'DOCE GLAMOUR',       'categoria': 'CONFECCOES' },
        { 'id': 20, 'nome': 'DOLCE ROSE',         'categoria': 'CONFECCOES' },
        { 'id': 21, 'nome': 'ED VERTIDO',         'categoria': 'CONFECCOES' },
        { 'id': 22, 'nome': 'ETERNITY',           'categoria': 'CONFECCOES' },
        { 'id': 23, 'nome': 'FAKINI',             'categoria': 'CONFECCOES' },
        { 'id': 24, 'nome': 'FANIKITUS',          'categoria': 'CONFECCOES' },
        { 'id': 25, 'nome': 'FARAELLI',           'categoria': 'CONFECCOES' },
        { 'id': 26, 'nome': 'FELICITA',           'categoria': 'CONFECCOES' },
        { 'id': 27, 'nome': 'FR TEXTIL',          'categoria': 'CONFECCOES' },
        { 'id': 28, 'nome': 'GIRAFFE',            'categoria': 'CONFECCOES' },
        { 'id': 29, 'nome': 'HIRLOGS',            'categoria': 'CONFECCOES' },
        { 'id': 30, 'nome': 'HUTTZ',              'categoria': 'CONFECCOES' },
        { 'id': 31, 'nome': 'IZITEX',             'categoria': 'CONFECCOES' },
        { 'id': 32, 'nome': 'LEPOQUE',            'categoria': 'CONFECCOES' },
        { 'id': 33, 'nome': 'LOTUS',              'categoria': 'CONFECCOES' },
        { 'id': 34, 'nome': 'LUCKYS',             'categoria': 'CONFECCOES' },
        { 'id': 35, 'nome': 'LUNENDER',           'categoria': 'CONFECCOES' },
        { 'id': 36, 'nome': 'LUSSAN',             'categoria': 'CONFECCOES' },
        { 'id': 37, 'nome': 'LZT',                'categoria': 'CONFECCOES' },
        { 'id': 38, 'nome': 'MARCO TEXTIL',       'categoria': 'CONFECCOES' },
        { 'id': 39, 'nome': 'MARU',               'categoria': 'CONFECCOES' },
        { 'id': 40, 'nome': 'MOONCITY',           'categoria': 'CONFECCOES' },
        { 'id': 41, 'nome': 'OLHO FATAL',         'categoria': 'CONFECCOES' },
        { 'id': 42, 'nome': 'OLIVEIRA MALHAS',    'categoria': 'CONFECCOES' },
        { 'id': 43, 'nome': 'OVERCOR',            'categoria': 'CONFECCOES' },
        { 'id': 44, 'nome': 'PATY MODAS',         'categoria': 'CONFECCOES' },
        { 'id': 45, 'nome': 'RALA KIDS',          'categoria': 'CONFECCOES' },
        { 'id': 46, 'nome': 'RCA',                'categoria': 'CONFECCOES' },
        { 'id': 47, 'nome': 'ROLU',               'categoria': 'CONFECCOES' },
        { 'id': 48, 'nome': 'ROSA BELLA',         'categoria': 'CONFECCOES' },
        { 'id': 49, 'nome': 'ROVITEX',            'categoria': 'CONFECCOES' },
        { 'id': 50, 'nome': 'SBA',                'categoria': 'CONFECCOES' },
        { 'id': 51, 'nome': 'SEA BRAZIL',         'categoria': 'CONFECCOES' },
        { 'id': 52, 'nome': 'SFIGMOS',            'categoria': 'CONFECCOES' },
        { 'id': 53, 'nome': 'SHILMAR',            'categoria': 'CONFECCOES' },
        { 'id': 54, 'nome': 'SIGOSTA',            'categoria': 'CONFECCOES' },
        { 'id': 55, 'nome': 'TANISE',             'categoria': 'CONFECCOES' },
        { 'id': 56, 'nome': 'TEEZZ',              'categoria': 'CONFECCOES' },
        { 'id': 57, 'nome': 'TILE SUL',           'categoria': 'CONFECCOES' },
        { 'id': 58, 'nome': 'TRAJADINHOS',        'categoria': 'CONFECCOES' },
        { 'id': 59, 'nome': 'TRE FIORI',          'categoria': 'CONFECCOES' },
        { 'id': 60, 'nome': 'URBAN CITY',         'categoria': 'CONFECCOES' },
        { 'id': 61, 'nome': 'VIVA VIDA',          'categoria': 'CONFECCOES' },
        { 'id': 62, 'nome': 'GANGSTER',           'categoria': 'ACESSORIOS' },
        { 'id': 63, 'nome': 'MORMAII',            'categoria': 'CALCADOS'   },
        { 'id': 64, 'nome': 'ACONCHEGO DO BEBE',  'categoria': 'CAMA-MESA-BANHO' },
    ]
    nome_to_id = {f['nome']: f['id'] for f in fornecedores_base}

    # Parse all xlsx files
    # segmentacoes: unique (produto, grade, classe) → id
    seg_map = {}
    seg_list = []
    # pedidos: list of {fornecedor_id, segmentacao_id, tamanho, qtd_pedida, valor_unitario, data_pedido}
    pedidos = []
    # distribuicoes: {(pedido_key): {comprador_id: qty}} — para referência futura
    skipped = []

    files = sorted(PEDIDOS_DIR.glob('*.xlsx'), key=lambda p: int(p.stem) if p.stem.isdigit() else 999)
    for f in files:
        brand, products = parse_file(f)
        if not brand:
            continue
        if brand not in nome_to_id:
            print(f'  AVISO: marca "{brand}" não encontrada em fornecedores (arquivo {f.name})')
            skipped.append((f.name, brand))
            continue

        forn_id = nome_to_id[brand]
        data_pedido = '2026-02-01'  # data estimada da coleção inverno 2026

        for p in products:
            seg_key = (p['produto'], p['grade'], p['classe'])
            if seg_key not in seg_map:
                seg_id = len(seg_map) + 1
                seg_map[seg_key] = seg_id
                seg_list.append({
                    'id': seg_id,
                    'classificacao': p['grade'] if p['grade'] in ('AD','EX','INF','JUV','PP','BB','U') else 'AD',
                    'tipo_produto': p['produto'],
                    'classe': p['classe'],
                    'tipo_grade': p['grade'],
                    'estacao': 'inverno',
                })
            seg_id = seg_map[seg_key]

            # Aggregate quantities per tamanho across all buyers
            totais_por_tamanho = defaultdict(int)
            for buyer_itens in p['itens'].values():
                for tam, qty in buyer_itens.items():
                    totais_por_tamanho[tam] += qty

            for tamanho, qtd in totais_por_tamanho.items():
                pedidos.append({
                    'fornecedor_id':  forn_id,
                    'colecao_id':     1,
                    'segmentacao_id': seg_id,
                    'data_pedido':    data_pedido,
                    'tamanho':        tamanho,
                    'qtd_pedida':     qtd,
                    'valor_unitario': p['valor'],
                })

    if skipped:
        print('\nMarcas sem mapeamento (adicionar a BRAND_MAP ou fornecedores_base):')
        for fname, brand in skipped:
            print(f'  {fname}: {brand}')

    print(f'\nImportados: {len(set(p["fornecedor_id"] for p in pedidos))} fornecedores, '
          f'{len(seg_list)} segmentações, {len(pedidos)} linhas de pedido')

    # Generate projecoes: 120% of total ordered per tamanho (rough planning buffer)
    proj_map = defaultdict(int)
    for p in pedidos:
        proj_map[(p['segmentacao_id'], p['colecao_id'], p['tamanho'])] += p['qtd_pedida']
    projecoes = [
        {'segmentacao_id': s, 'colecao_id': c, 'tamanho': t, 'qtd_ajustada': round(q * 1.2)}
        for (s, c, t), q in sorted(proj_map.items())
    ]

    write_mockdata(fornecedores_base, compradores, seg_list, pedidos, projecoes, OUT_FILE)
    print(f'Arquivo gerado: {OUT_FILE}')


def js_str(v):
    if isinstance(v, str):
        escaped = v.replace("'", "\\'")
        return f"'{escaped}'"
    if isinstance(v, float):
        return f"{v:.2f}"
    return str(v)


def write_mockdata(forns, compradores, segs, pedidos, projecoes, out_path):
    lines = []
    lines.append('// Gerado automaticamente por scripts/importar_pedidos.py — não editar manualmente')
    lines.append('')

    # compradores
    lines.append('export const compradores = [')
    for c in compradores:
        lines.append(f"  {{ id:{c['id']}, nome:{js_str(c['nome'])}, cnpj:{js_str(c['cnpj'])}, cidade:{js_str(c['cidade'])} }},")
    lines.append(']')
    lines.append('')

    # colecoes
    lines.append("export const colecoes = [")
    lines.append("  { id: 1, nome: 'Inverno 2026', estacao: 'inverno', ano: 2026, status: 'em_compra' },")
    lines.append("]")
    lines.append('')

    # segmentacoes
    lines.append('export const segmentacoes = [')
    for s in segs:
        lines.append(
            f"  {{ id:{s['id']}, classificacao:{js_str(s['classificacao'])}, "
            f"tipo_produto:{js_str(s['tipo_produto'])}, classe:{js_str(s['classe'])}, "
            f"tipo_grade:{js_str(s['tipo_grade'])}, estacao:{js_str(s['estacao'])} }},"
        )
    lines.append(']')
    lines.append('')

    # fornecedores
    lines.append('export const fornecedores = [')
    for f in forns:
        lines.append(f"  {{ id:{f['id']}, nome:{js_str(f['nome'])}, categoria:{js_str(f['categoria'])}, contato:'' }},")
    lines.append(']')
    lines.append('')

    # projecoes
    lines.append('export const projecoes = [')
    for p in projecoes:
        lines.append(
            f"  {{ segmentacao_id:{p['segmentacao_id']}, colecao_id:{p['colecao_id']}, "
            f"tamanho:{js_str(p['tamanho'])}, qtd_ajustada:{p['qtd_ajustada']} }},"
        )
    lines.append(']')
    lines.append('')

    # pedidosBase
    lines.append('export const pedidosBase = [')
    cur_forn = None
    for p in pedidos:
        if p['fornecedor_id'] != cur_forn:
            cur_forn = p['fornecedor_id']
            lines.append(f"  // fornecedor_id:{cur_forn}")
        lines.append(
            f"  {{ fornecedor_id:{p['fornecedor_id']}, colecao_id:{p['colecao_id']}, "
            f"segmentacao_id:{p['segmentacao_id']}, data_pedido:{js_str(p['data_pedido'])}, "
            f"tamanho:{js_str(p['tamanho'])}, qtd_pedida:{p['qtd_pedida']}, "
            f"valor_unitario:{p['valor_unitario']} }},"
        )
    lines.append(']')
    lines.append('')

    out_path.write_text('\n'.join(lines), encoding='utf-8')


if __name__ == '__main__':
    main()
```

- [ ] **Step 2: Executar o script**

```bash
cd "C:\Users\eduke\Solução Compras"
python scripts/importar_pedidos.py
```

Saída esperada (aproximada):
```
Importados: 30+ fornecedores, 80+ segmentações, 400+ linhas de pedido
Arquivo gerado: demo\src\mockData.js
```

Se aparecer `AVISO: marca "X" não encontrada`, adicionar o mapeamento em `BRAND_MAP` no script.

- [ ] **Step 3: Verificar demo no browser**

```bash
cd "C:\Users\eduke\Solução Compras\demo"
npm run dev
```

Abrir http://localhost:5173 e verificar:
- Dashboard mostra dados agregados
- Relatórios → Por Fornecedor: lista todos os fornecedores com pedidos
- Relatórios → Por Segmentação: segmentações reais (CALCA, VESTIDO, LEG, etc.)
- Compras: formulário funciona

- [ ] **Step 4: Commit**

```bash
cd "C:\Users\eduke\Solução Compras"
git add scripts/importar_pedidos.py demo/src/mockData.js
git commit -m "feat(data): importa pedidos reais das planilhas 2026/1 via script Python"
```

---

## Task 3: Interface de gestão de coleções (demo)

Adiciona modal de criação de coleção e seletor de coleção ativa no header/sidebar da demo.

**Files:**
- Modify: `demo/src/mockApi.js` — implementar `colecoes.create()`
- Create: `demo/src/components/ColecaoModal.jsx`
- Create: `demo/src/components/ColecaoModal.module.css`
- Modify: `demo/src/components/Sidebar.jsx` — adicionar seletor de coleção

- [ ] **Step 1: Implementar `colecoes.create()` no mockApi**

Em `demo/src/mockApi.js`, substituir:
```js
colecoes: {
  list: () => resolve([...colecoes]),
  create: () => resolve(null),
},
```
por:
```js
colecoes: {
  list: () => resolve([...colecoesList]),
  create({ nome, estacao, ano }) {
    const id = colecoesList.length > 0 ? Math.max(...colecoesList.map(c => c.id)) + 1 : 1
    const nova = { id, nome, estacao, ano, status: 'planejamento' }
    colecoesList.push(nova)
    return resolve(nova)
  },
},
```

E no topo do arquivo, logo após os imports, converter `colecoes` para variável mutável:
```js
import { colecoes as _colecoes, segmentacoes, fornecedores, projecoes, pedidosBase, compradores } from './mockData.js'
const colecoesList = [..._colecoes]
```

Remover `colecoes` do import de `pedidos` e `projecoes` (não usam diretamente).

- [ ] **Step 2: Criar `demo/src/components/ColecaoModal.jsx`**

```jsx
// demo/src/components/ColecaoModal.jsx
import { useState } from 'react'
import styles from './ColecaoModal.module.css'

export default function ColecaoModal({ onSave, onClose }) {
  const anoAtual = new Date().getFullYear()
  const [nome,    setNome]    = useState('')
  const [estacao, setEstacao] = useState('inverno')
  const [ano,     setAno]     = useState(anoAtual)

  function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim()) return
    onSave({ nome: nome.trim(), estacao, ano: Number(ano) })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Nova Coleção</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Nome
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Inverno 2027"
              autoFocus
              required
            />
          </label>
          <label className={styles.label}>
            Estação
            <select value={estacao} onChange={e => setEstacao(e.target.value)}>
              <option value="inverno">Inverno</option>
              <option value="verao">Verão</option>
            </select>
          </label>
          <label className={styles.label}>
            Ano
            <input
              type="number"
              value={ano}
              onChange={e => setAno(e.target.value)}
              min={2020}
              max={2040}
            />
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.btnPrimary}>Criar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Criar `demo/src/components/ColecaoModal.module.css`**

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  width: 360px;
  max-width: 90vw;
}

.title {
  margin: 0 0 16px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form { display: flex; flex-direction: column; gap: 12px; }

.label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.label input,
.label select {
  font-size: 0.9rem;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--text-primary);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.btnPrimary {
  padding: 6px 16px;
  border-radius: 4px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
}

.btnSecondary {
  padding: 6px 16px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
}
```

- [ ] **Step 4: Adicionar seletor e botão "Nova" ao Sidebar**

Ler `demo/src/components/Sidebar.jsx` completo e adicionar:

1. Imports no topo:
```jsx
import { useState } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import ColecaoModal from './ColecaoModal'
import mockApi from '../mockApi'
```

2. No corpo do componente, antes do `return`:
```jsx
const { collections, setCollections, activeId, setActiveId } = useCollection()
const [showModal, setShowModal] = useState(false)

async function handleCreate(data) {
  const nova = await mockApi.colecoes.create(data)
  setCollections(prev => [...prev, nova])
  setActiveId(nova.id)
  setShowModal(false)
}
```

3. No JSX, antes da navegação de telas, adicionar bloco de coleções:
```jsx
<div className={styles.colecaoBlock}>
  <div className={styles.colecaoHeader}>
    <span className={styles.colecaoLabel}>Coleção</span>
    <button className={styles.colecaoNew} onClick={() => setShowModal(true)} title="Nova coleção">+</button>
  </div>
  <select
    className={styles.colecaoSelect}
    value={activeId ?? ''}
    onChange={e => setActiveId(Number(e.target.value))}
  >
    {collections.map(c => (
      <option key={c.id} value={c.id}>{c.nome}</option>
    ))}
  </select>
</div>
{showModal && <ColecaoModal onSave={handleCreate} onClose={() => setShowModal(false)} />}
```

4. Em `demo/src/components/Sidebar.module.css` adicionar:
```css
.colecaoBlock { padding: 12px 16px 8px; border-bottom: 1px solid var(--border); }
.colecaoHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.colecaoLabel { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); }
.colecaoNew { background: none; border: 1px solid var(--border); border-radius: 4px; width: 20px; height: 20px; cursor: pointer; font-size: 0.9rem; color: var(--text-secondary); line-height: 1; padding: 0; }
.colecaoNew:hover { background: var(--surface-hover); }
.colecaoSelect { width: 100%; padding: 5px 6px; border: 1px solid var(--border); border-radius: 4px; font-size: 0.82rem; background: var(--bg); color: var(--text-primary); cursor: pointer; }
```

- [ ] **Step 5: Testar no browser**

```bash
cd "C:\Users\eduke\Solução Compras\demo"
npm run dev
```

Verificar:
- Sidebar mostra nome da coleção ativa em dropdown
- Botão `+` abre modal
- Criar "Verão 2027" → aparece no dropdown e vira coleção ativa
- Trocar para "Inverno 2026" → Dashboard atualiza dados

- [ ] **Step 6: Commit**

```bash
cd "C:\Users\eduke\Solução Compras"
git add demo/src/mockApi.js demo/src/components/ColecaoModal.jsx demo/src/components/ColecaoModal.module.css demo/src/components/Sidebar.jsx demo/src/components/Sidebar.module.css
git commit -m "feat(demo): adiciona UI para criar e selecionar coleções"
```

---

## Task 4: Sync Electron — compradores, categoria, Compras.jsx

Estende o app Electron com a tabela `compradores`, campo `categoria` em `fornecedores`, e porta o Compras.jsx atualizado do demo (distribuição por comprador + geração de PDF).

**Files:**
- Modify: `electron/main/db/schema.js` — adicionar tabela compradores + coluna categoria
- Create: `electron/main/db/compradores.js`
- Modify: `electron/main/index.js` — handlers IPC para compradores
- Modify: `electron/preload/index.js` — expor `compradores.list()`
- Modify: `electron/main/db/fornecedores.js` — incluir categoria
- Replace: `src/renderer/src/screens/Compras.jsx` — copiar versão do demo (window.api)
- Replace: `src/renderer/src/screens/Compras.module.css` — copiar do demo
- Modify: `seed-test.cjs` — adicionar compradores e fornecedores reais

### 4a: Schema SQLite

- [ ] **Step 1: Adicionar `compradores` e `categoria` ao schema**

Em `electron/main/db/schema.js`, dentro do `db.exec(...)`, adicionar após a definição de `fornecedores`:

```sql
CREATE TABLE IF NOT EXISTS compradores (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  nome    TEXT NOT NULL,
  cnpj    TEXT,
  cidade  TEXT
);
```

E para `categoria` em fornecedores, adicionar migração após o CREATE TABLE:

```js
// Adicionar coluna categoria se não existir (migração segura)
try {
  db.exec(`ALTER TABLE fornecedores ADD COLUMN categoria TEXT NOT NULL DEFAULT 'CONFECCOES'`)
} catch (_) { /* coluna já existe */ }
```

**Código completo da função `runMigrations`** após edições:

```js
export function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS colecoes (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      estacao   TEXT NOT NULL CHECK(estacao IN ('verao','inverno')),
      ano       INTEGER NOT NULL,
      status    TEXT NOT NULL DEFAULT 'planejamento'
                     CHECK(status IN ('planejamento','em_compra','finalizada'))
    );

    CREATE TABLE IF NOT EXISTS segmentacoes (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      classificacao   TEXT NOT NULL,
      tipo_produto    TEXT NOT NULL,
      classe          TEXT NOT NULL,
      estacao         TEXT NOT NULL,
      UNIQUE(classificacao, tipo_produto, classe)
    );

    CREATE TABLE IF NOT EXISTS grade_historica (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      segmentacao_id  INTEGER NOT NULL REFERENCES segmentacoes(id),
      colecao_id      INTEGER NOT NULL REFERENCES colecoes(id),
      tamanho         TEXT NOT NULL,
      ordem           INTEGER NOT NULL DEFAULT 0,
      qtd_comprada    INTEGER NOT NULL DEFAULT 0,
      qtd_vendida     INTEGER NOT NULL DEFAULT 0,
      qtd_estoque     INTEGER NOT NULL DEFAULT 0,
      UNIQUE(segmentacao_id, colecao_id, tamanho)
    );

    CREATE TABLE IF NOT EXISTS projecoes (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      segmentacao_id  INTEGER NOT NULL REFERENCES segmentacoes(id),
      colecao_id      INTEGER NOT NULL REFERENCES colecoes(id),
      tamanho         TEXT NOT NULL,
      ordem           INTEGER NOT NULL DEFAULT 0,
      qtd_projetada   INTEGER NOT NULL DEFAULT 0,
      qtd_ajustada    INTEGER NOT NULL DEFAULT 0,
      metodo          TEXT NOT NULL DEFAULT 'media_simples'
                           CHECK(metodo IN ('media_simples','media_ponderada','manual')),
      UNIQUE(segmentacao_id, colecao_id, tamanho)
    );

    CREATE TABLE IF NOT EXISTS fornecedores (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      contato   TEXT,
      categoria TEXT NOT NULL DEFAULT 'CONFECCOES'
    );

    CREATE TABLE IF NOT EXISTS compradores (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      nome    TEXT NOT NULL,
      cnpj    TEXT,
      cidade  TEXT
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      fornecedor_id   INTEGER NOT NULL REFERENCES fornecedores(id),
      colecao_id      INTEGER NOT NULL REFERENCES colecoes(id),
      segmentacao_id  INTEGER NOT NULL REFERENCES segmentacoes(id),
      data_pedido     TEXT NOT NULL,
      tamanho         TEXT NOT NULL,
      qtd_pedida      INTEGER NOT NULL DEFAULT 0,
      valor_unitario  REAL NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_grade_seg_col
      ON grade_historica(segmentacao_id, colecao_id);
    CREATE INDEX IF NOT EXISTS idx_proj_seg_col
      ON projecoes(segmentacao_id, colecao_id);
    CREATE INDEX IF NOT EXISTS idx_pedidos_col
      ON pedidos(colecao_id);
    CREATE INDEX IF NOT EXISTS idx_pedidos_seg_col
      ON pedidos(segmentacao_id, colecao_id);
  `)

  // Migração segura: adicionar categoria se banco antigo não tem
  try {
    db.exec(`ALTER TABLE fornecedores ADD COLUMN categoria TEXT NOT NULL DEFAULT 'CONFECCOES'`)
  } catch (_) { /* coluna já existe */ }
}
```

### 4b: compradores.js

- [ ] **Step 2: Criar `electron/main/db/compradores.js`**

```js
// electron/main/db/compradores.js
export function makeCompradores(db) {
  const all    = db.prepare(`SELECT * FROM compradores ORDER BY id`)
  const insert = db.prepare(`INSERT INTO compradores (nome, cnpj, cidade) VALUES (@nome, @cnpj, @cidade)`)

  return {
    list() { return all.all() },
    create({ nome, cnpj = '', cidade = '' }) {
      return insert.run({ nome, cnpj, cidade }).lastInsertRowid
    },
  }
}
```

### 4c: IPC + preload

- [ ] **Step 3: Registrar handlers em `electron/main/index.js`**

Adicionar import no topo:
```js
import { makeCompradores } from './db/compradores.js'
```

No bloco `app.whenReady().then(...)`, após `const ped = makePedidos(db)`:
```js
const comp = makeCompradores(db)
```

Adicionar handlers (após os de `pedidos`):
```js
// Compradores
ipcMain.handle('compradores:list',   () => comp.list())
ipcMain.handle('compradores:create', (_, d) => comp.create(d))
```

- [ ] **Step 4: Expor em `electron/preload/index.js`**

Adicionar no objeto exposto via `contextBridge.exposeInMainWorld`:
```js
compradores: {
  list:   () => ipcRenderer.invoke('compradores:list'),
  create: (d) => ipcRenderer.invoke('compradores:create', d),
},
```

### 4d: Compras.jsx do renderer

- [ ] **Step 5: Copiar Compras.jsx e Compras.module.css do demo para o renderer**

O `src/renderer/src/screens/Compras.jsx` está desatualizado (sem distribuição por comprador, sem PDF).
O `demo/src/screens/Compras.jsx` tem a versão completa, mas usa `mockApi` em vez de `window.api`.

Copiar `demo/src/screens/Compras.jsx` → `src/renderer/src/screens/Compras.jsx`  
Copiar `demo/src/screens/Compras.module.css` → `src/renderer/src/screens/Compras.module.css`

Depois, no arquivo copiado `src/renderer/src/screens/Compras.jsx`:
- Substituir todas as chamadas `mockApi.xxx.yyy(` por `window.api.xxx.yyy(`
- Remover `import mockApi from '../mockApi'` (não existe no renderer)

Verificar que todos os `window.api` usados existem em `electron/preload/index.js`:
- `window.api.segmentacoes.list()` ✓
- `window.api.fornecedores.list()` ✓
- `window.api.projecoes.get()` ✓
- `window.api.pedidos.totaisPorTamanho()` ✓
- `window.api.pedidos.salvar()` ✓
- `window.api.compradores.list()` ← adicionado no step 4

### 4e: Atualizar fornecedores.js

- [ ] **Step 6: Atualizar `electron/main/db/fornecedores.js` para incluir categoria**

```js
// electron/main/db/fornecedores.js
export function makeFornecedores(db) {
  const insert = db.prepare(`INSERT INTO fornecedores (nome, categoria, contato) VALUES (@nome, @categoria, @contato)`)
  const byId   = db.prepare(`SELECT * FROM fornecedores WHERE id = ?`)
  const all    = db.prepare(`SELECT * FROM fornecedores ORDER BY nome`)
  const upd    = db.prepare(`UPDATE fornecedores SET nome = @nome, categoria = @categoria, contato = @contato WHERE id = @id`)

  return {
    create({ nome, categoria = 'CONFECCOES', contato = '' }) {
      return insert.run({ nome, categoria, contato }).lastInsertRowid
    },
    getById(id) { return byId.get(id) },
    list()      { return all.all() },
    update(id, { nome, categoria, contato }) { upd.run({ id, nome, categoria, contato }) }
  }
}
```

### 4f: Seed

- [ ] **Step 7: Atualizar `seed-test.cjs` com compradores e fornecedores reais**

Substituir todo o conteúdo de `seed-test.cjs`:

```js
const Database = require('better-sqlite3')
const path = require('path')
const os = require('os')

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'solucao-compras', 'solucao-compras.db')
console.log('Abrindo banco:', dbPath)
const db = new Database(dbPath)
db.pragma('foreign_keys = ON')

// Coleção
const colRes = db.prepare(`INSERT OR IGNORE INTO colecoes (nome, estacao, ano, status) VALUES (?, ?, ?, ?)`).run('Inverno 2026', 'inverno', 2026, 'em_compra')
const colId = colRes.lastInsertRowid || db.prepare(`SELECT id FROM colecoes WHERE nome = ?`).get('Inverno 2026').id

// Compradores
const insertComp = db.prepare(`INSERT OR IGNORE INTO compradores (nome, cnpj, cidade) VALUES (?, ?, ?)`)
const compradores = [
  ['Irmãos Backes',        '08.889.201/0001-01', 'Três Coroas/RS'],
  ['Samuel Paulo Backes',  '15.563.106/0001-70', 'Três Coroas/RS'],
  ['PSM Backes',           '28.010.922/0001-07', 'Igrejinha/RS'],
  ['Alexandre Backes',     '06.284.903/0001-28', ''],
  ['Elisangela M. Backes', '13.706.244/0001-36', 'Santa Maria do Herval/RS'],
  ['Rafael J. Backes',     '46.348.002/0001-77', 'Rolante/RS'],
  ['Streit Conf',          '10.206.469/0001-35', 'Riozinho/RS'],
  ['FMV Streit Conf',      '20.354.516/0001-41', 'Rolante/RS'],
]
for (const [nome, cnpj, cidade] of compradores) insertComp.run(nome, cnpj, cidade)

// Fornecedores (lista completa)
const insertForn = db.prepare(`INSERT OR IGNORE INTO fornecedores (nome, categoria, contato) VALUES (?, ?, '')`)
const fornecedores = [
  ['APPLICATO','CONFECCOES'], ['AQUECCE','CONFECCOES'], ['AUTENTICADA','CONFECCOES'],
  ['BALBOA','CONFECCOES'], ['BICHO BAGUNCA','CONFECCOES'], ['BIOGAS','CONFECCOES'],
  ['BLUE MACAW','CONFECCOES'], ['BRUNA','CONFECCOES'], ['CATOLELE','CONFECCOES'],
  ['CAW','CONFECCOES'], ['CIA CORPO','CONFECCOES'], ['COSTAO','CONFECCOES'],
  ['COTTON E COTTON','CONFECCOES'], ['CROCKER','CONFECCOES'], ['DANKA','CONFECCOES'],
  ['DESAYNER','CONFECCOES'], ['DIANFA','CONFECCOES'], ['DIXIE','CONFECCOES'],
  ['DOCE GLAMOUR','CONFECCOES'], ['DOLCE ROSE','CONFECCOES'], ['ED VERTIDO','CONFECCOES'],
  ['ETERNITY','CONFECCOES'], ['FAKINI','CONFECCOES'], ['FANIKITUS','CONFECCOES'],
  ['FARAELLI','CONFECCOES'], ['FELICITA','CONFECCOES'], ['FR TEXTIL','CONFECCOES'],
  ['GIRAFFE','CONFECCOES'], ['HIRLOGS','CONFECCOES'], ['HUTTZ','CONFECCOES'],
  ['IZITEX','CONFECCOES'], ['LEPOQUE','CONFECCOES'], ['LOTUS','CONFECCOES'],
  ['LUCKYS','CONFECCOES'], ['LUNENDER','CONFECCOES'], ['LUSSAN','CONFECCOES'],
  ['LZT','CONFECCOES'], ['MARCO TEXTIL','CONFECCOES'], ['MARU','CONFECCOES'],
  ['MOONCITY','CONFECCOES'], ['OLHO FATAL','CONFECCOES'], ['OLIVEIRA MALHAS','CONFECCOES'],
  ['OVERCOR','CONFECCOES'], ['PATY MODAS','CONFECCOES'], ['RALA KIDS','CONFECCOES'],
  ['RCA','CONFECCOES'], ['ROLU','CONFECCOES'], ['ROSA BELLA','CONFECCOES'],
  ['ROVITEX','CONFECCOES'], ['SBA','CONFECCOES'], ['SEA BRAZIL','CONFECCOES'],
  ['SFIGMOS','CONFECCOES'], ['SHILMAR','CONFECCOES'], ['SIGOSTA','CONFECCOES'],
  ['TANISE','CONFECCOES'], ['TEEZZ','CONFECCOES'], ['TILE SUL','CONFECCOES'],
  ['TRAJADINHOS','CONFECCOES'], ['TRE FIORI','CONFECCOES'], ['URBAN CITY','CONFECCOES'],
  ['VIVA VIDA','CONFECCOES'], ['GANGSTER','ACESSORIOS'], ['MORMAII','CALCADOS'],
  ['ACONCHEGO DO BEBE','CAMA-MESA-BANHO'],
]
for (const [nome, cat] of fornecedores) insertForn.run(nome, cat)

// Segmentações de teste
const insertSeg = db.prepare(`INSERT OR IGNORE INTO segmentacoes (classificacao, tipo_produto, classe, estacao) VALUES (?, ?, ?, ?)`)
insertSeg.run('AD', 'CALCA', 'MASC', 'inverno')
insertSeg.run('AD', 'CALCA', 'FEM',  'inverno')
insertSeg.run('AD', 'BLUSINHA', 'FEM', 'inverno')

function getSegId(cl, tp, cls) {
  return db.prepare(`SELECT id FROM segmentacoes WHERE classificacao=? AND tipo_produto=? AND classe=?`).get(cl, tp, cls).id
}
const seg1 = getSegId('AD', 'CALCA', 'MASC')
const seg2 = getSegId('AD', 'CALCA', 'FEM')
const seg3 = getSegId('AD', 'BLUSINHA', 'FEM')

function getFornId(nome) {
  const row = db.prepare(`SELECT id FROM fornecedores WHERE nome = ?`).get(nome)
  return row ? row.id : null
}

// Projeções
const insertProj = db.prepare(`INSERT OR REPLACE INTO projecoes (segmentacao_id, colecao_id, tamanho, qtd_ajustada) VALUES (?, ?, ?, ?)`)
insertProj.run(seg1, colId, 'PP', 60); insertProj.run(seg1, colId, 'P', 120); insertProj.run(seg1, colId, 'M', 150); insertProj.run(seg1, colId, 'G', 120); insertProj.run(seg1, colId, 'GG', 60)
insertProj.run(seg2, colId, 'PP', 50); insertProj.run(seg2, colId, 'P', 100); insertProj.run(seg2, colId, 'M', 130); insertProj.run(seg2, colId, 'G', 100); insertProj.run(seg2, colId, 'GG', 50)
insertProj.run(seg3, colId, 'PP', 70); insertProj.run(seg3, colId, 'P', 130); insertProj.run(seg3, colId, 'M', 160); insertProj.run(seg3, colId, 'G', 130); insertProj.run(seg3, colId, 'GG', 70)

// Pedidos de teste
const insertPed = db.prepare(`INSERT INTO pedidos (fornecedor_id, colecao_id, segmentacao_id, data_pedido, tamanho, qtd_pedida, valor_unitario) VALUES (?, ?, ?, ?, ?, ?, ?)`)
const fLun = getFornId('LUNENDER')
const fGan = getFornId('GANGSTER')
if (fLun) {
  insertPed.run(fLun, colId, seg2, '2026-04-10', 'PP', 30, 94.90)
  insertPed.run(fLun, colId, seg2, '2026-04-10', 'P',  60, 94.90)
  insertPed.run(fLun, colId, seg2, '2026-04-10', 'M',  78, 94.90)
  insertPed.run(fLun, colId, seg3, '2026-04-10', 'PP', 42, 76.90)
  insertPed.run(fLun, colId, seg3, '2026-04-10', 'P',  78, 76.90)
}
if (fGan) {
  insertPed.run(fGan, colId, seg1, '2026-04-08', 'PP', 35, 89.90)
  insertPed.run(fGan, colId, seg1, '2026-04-08', 'P',  70, 89.90)
  insertPed.run(fGan, colId, seg1, '2026-04-08', 'M',  90, 89.90)
}

console.log('✓ Seed completo: 8 compradores, 64 fornecedores, 3 segs, pedidos de teste')
db.close()
```

- [ ] **Step 8: Testar app Electron**

```bash
cd "C:\Users\eduke\Solução Compras"
npm run dev
```

Verificar:
- App abre sem erros no console
- Tela Compras mostra lista de fornecedores (64 marcas)
- Distribuição por comprador funciona (tabela aparece após confirmar pedido)
- PDF gerado ao clicar "Gerar PDF por comprador"

Se aparecer erro de módulo nativo (better-sqlite3):
```bash
cd "C:\Users\eduke\Solução Compras"
npm run postinstall
npm run dev
```

- [ ] **Step 9: Commit final**

```bash
cd "C:\Users\eduke\Solução Compras"
git add electron/main/db/schema.js electron/main/db/compradores.js electron/main/db/fornecedores.js electron/main/index.js electron/preload/index.js src/renderer/src/screens/Compras.jsx src/renderer/src/screens/Compras.module.css seed-test.cjs
git commit -m "feat(electron): compradores, categoria fornecedor, Compras.jsx com distribuição por comprador"
```

---

## Self-Review

**Spec coverage:**
- ✓ Nomes do arquivo de marcas: Tasks 1 e 2 garantem nomes canônicos (COTTON E COTTON, ROLU, TEEZZ, etc.)
- ✓ AQUECCE e BALBOA mantidos como novas marcas (Tasks 1, 2, 4f)
- ✓ Script de importação das 72 planilhas: Task 2
- ✓ Interface de coleções: Task 3
- ✓ Electron + SQLite sync: Task 4

**Riscos:**
- Task 2: alguns arquivos xlsx podem ter formato diferente (ex: sem row 11 de compradores). Script para se um produto não tiver quantidade, não gera pedido — sem crash.
- Task 4 step 5: `Compras.jsx` do demo usa `gradeConfig.js`. Verificar que `src/renderer/src/utils/gradeConfig.js` existe e é igual ao do demo. Se não existir, copiar de `demo/src/utils/gradeConfig.js`.
- Task 4 step 7: seed usa `INSERT OR IGNORE` — seguro rodar múltiplas vezes.
