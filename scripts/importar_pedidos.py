# Importa pedidos das planilhas da colecao 2026/1 e gera demo/src/mockData.js.
# Uso: cd "C:/Users/eduke/Solucao Compras" && python scripts/importar_pedidos.py
import openpyxl
import warnings
from pathlib import Path
from collections import defaultdict

warnings.filterwarnings('ignore')

PEDIDOS_DIR = Path(r'C:\Users\eduke\Downloads\Pedidos_2026_1')
OUT_FILE    = Path(__file__).parent.parent / 'demo' / 'src' / 'mockData.js'

BUYER_COLS = [8, 28, 48, 68, 88, 108, 128, 148]

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

COMPRADORES = [
    {'id': 1, 'nome': 'Irmãos Backes',        'cnpj': '08.889.201/0001-01', 'cidade': 'Três Coroas/RS'},
    {'id': 2, 'nome': 'Samuel Paulo Backes',   'cnpj': '15.563.106/0001-70', 'cidade': 'Três Coroas/RS'},
    {'id': 3, 'nome': 'PSM Backes',            'cnpj': '28.010.922/0001-07', 'cidade': 'Igrejinha/RS'},
    {'id': 4, 'nome': 'Alexandre Backes',      'cnpj': '06.284.903/0001-28', 'cidade': ''},
    {'id': 5, 'nome': 'Elisangela M. Backes',  'cnpj': '13.706.244/0001-36', 'cidade': 'Santa Maria do Herval/RS'},
    {'id': 6, 'nome': 'Rafael J. Backes',      'cnpj': '46.348.002/0001-77', 'cidade': 'Rolante/RS'},
    {'id': 7, 'nome': 'Streit Conf',           'cnpj': '10.206.469/0001-35', 'cidade': 'Riozinho/RS'},
    {'id': 8, 'nome': 'FMV Streit Conf',       'cnpj': '20.354.516/0001-41', 'cidade': 'Rolante/RS'},
]

FORNECEDORES = [
    {'id':  1, 'nome': 'APPLICATO',         'categoria': 'CONFECCOES'},
    {'id':  2, 'nome': 'AQUECCE',           'categoria': 'CONFECCOES'},
    {'id':  3, 'nome': 'AUTENTICADA',       'categoria': 'CONFECCOES'},
    {'id':  4, 'nome': 'BALBOA',            'categoria': 'CONFECCOES'},
    {'id':  5, 'nome': 'BICHO BAGUNCA',     'categoria': 'CONFECCOES'},
    {'id':  6, 'nome': 'BIOGAS',            'categoria': 'CONFECCOES'},
    {'id':  7, 'nome': 'BLUE MACAW',        'categoria': 'CONFECCOES'},
    {'id':  8, 'nome': 'BRUNA',             'categoria': 'CONFECCOES'},
    {'id':  9, 'nome': 'CATOLELE',          'categoria': 'CONFECCOES'},
    {'id': 10, 'nome': 'CAW',               'categoria': 'CONFECCOES'},
    {'id': 11, 'nome': 'CIA CORPO',         'categoria': 'CONFECCOES'},
    {'id': 12, 'nome': 'COSTAO',            'categoria': 'CONFECCOES'},
    {'id': 13, 'nome': 'COTTON E COTTON',   'categoria': 'CONFECCOES'},
    {'id': 14, 'nome': 'CROCKER',           'categoria': 'CONFECCOES'},
    {'id': 15, 'nome': 'DANKA',             'categoria': 'CONFECCOES'},
    {'id': 16, 'nome': 'DESAYNER',          'categoria': 'CONFECCOES'},
    {'id': 17, 'nome': 'DIANFA',            'categoria': 'CONFECCOES'},
    {'id': 18, 'nome': 'DIXIE',             'categoria': 'CONFECCOES'},
    {'id': 19, 'nome': 'DOCE GLAMOUR',      'categoria': 'CONFECCOES'},
    {'id': 20, 'nome': 'DOLCE ROSE',        'categoria': 'CONFECCOES'},
    {'id': 21, 'nome': 'ED VERTIDO',        'categoria': 'CONFECCOES'},
    {'id': 22, 'nome': 'ETERNITY',          'categoria': 'CONFECCOES'},
    {'id': 23, 'nome': 'FAKINI',            'categoria': 'CONFECCOES'},
    {'id': 24, 'nome': 'FANIKITUS',         'categoria': 'CONFECCOES'},
    {'id': 25, 'nome': 'FARAELLI',          'categoria': 'CONFECCOES'},
    {'id': 26, 'nome': 'FELICITA',          'categoria': 'CONFECCOES'},
    {'id': 27, 'nome': 'FR TEXTIL',         'categoria': 'CONFECCOES'},
    {'id': 28, 'nome': 'GIRAFFE',           'categoria': 'CONFECCOES'},
    {'id': 29, 'nome': 'HIRLOGS',           'categoria': 'CONFECCOES'},
    {'id': 30, 'nome': 'HUTTZ',             'categoria': 'CONFECCOES'},
    {'id': 31, 'nome': 'IZITEX',            'categoria': 'CONFECCOES'},
    {'id': 32, 'nome': 'LEPOQUE',           'categoria': 'CONFECCOES'},
    {'id': 33, 'nome': 'LOTUS',             'categoria': 'CONFECCOES'},
    {'id': 34, 'nome': 'LUCKYS',            'categoria': 'CONFECCOES'},
    {'id': 35, 'nome': 'LUNENDER',          'categoria': 'CONFECCOES'},
    {'id': 36, 'nome': 'LUSSAN',            'categoria': 'CONFECCOES'},
    {'id': 37, 'nome': 'LZT',               'categoria': 'CONFECCOES'},
    {'id': 38, 'nome': 'MARCO TEXTIL',      'categoria': 'CONFECCOES'},
    {'id': 39, 'nome': 'MARU',              'categoria': 'CONFECCOES'},
    {'id': 40, 'nome': 'MOONCITY',          'categoria': 'CONFECCOES'},
    {'id': 41, 'nome': 'OLHO FATAL',        'categoria': 'CONFECCOES'},
    {'id': 42, 'nome': 'OLIVEIRA MALHAS',   'categoria': 'CONFECCOES'},
    {'id': 43, 'nome': 'OVERCOR',           'categoria': 'CONFECCOES'},
    {'id': 44, 'nome': 'PATY MODAS',        'categoria': 'CONFECCOES'},
    {'id': 45, 'nome': 'RALA KIDS',         'categoria': 'CONFECCOES'},
    {'id': 46, 'nome': 'RCA',               'categoria': 'CONFECCOES'},
    {'id': 47, 'nome': 'ROLU',              'categoria': 'CONFECCOES'},
    {'id': 48, 'nome': 'ROSA BELLA',        'categoria': 'CONFECCOES'},
    {'id': 49, 'nome': 'ROVITEX',           'categoria': 'CONFECCOES'},
    {'id': 50, 'nome': 'SBA',               'categoria': 'CONFECCOES'},
    {'id': 51, 'nome': 'SEA BRAZIL',        'categoria': 'CONFECCOES'},
    {'id': 52, 'nome': 'SFIGMOS',           'categoria': 'CONFECCOES'},
    {'id': 53, 'nome': 'SHILMAR',           'categoria': 'CONFECCOES'},
    {'id': 54, 'nome': 'SIGOSTA',           'categoria': 'CONFECCOES'},
    {'id': 55, 'nome': 'TANISE',            'categoria': 'CONFECCOES'},
    {'id': 56, 'nome': 'TEEZZ',             'categoria': 'CONFECCOES'},
    {'id': 57, 'nome': 'TILE SUL',          'categoria': 'CONFECCOES'},
    {'id': 58, 'nome': 'TRAJADINHOS',       'categoria': 'CONFECCOES'},
    {'id': 59, 'nome': 'TRE FIORI',         'categoria': 'CONFECCOES'},
    {'id': 60, 'nome': 'URBAN CITY',        'categoria': 'CONFECCOES'},
    {'id': 61, 'nome': 'VIVA VIDA',         'categoria': 'CONFECCOES'},
    {'id': 62, 'nome': 'GANGSTER',          'categoria': 'ACESSORIOS'},
    {'id': 63, 'nome': 'MORMAII',           'categoria': 'CALCADOS'},
    {'id': 64, 'nome': 'ACONCHEGO DO BEBE', 'categoria': 'CAMA-MESA-BANHO'},
]

GRADE_CLASSIF = {
    'AD': 'AD', 'AD1': 'AD', 'AD2': 'AD',
    'EX': 'EX', 'EX1': 'EX', 'EX2': 'EX',
    'INF': 'INF', 'JUV': 'JUV',
    'PP': 'INF', 'BB': 'INF',
    'U': 'AD',
}


def canonical(name: str) -> str:
    name = name.strip()
    if name.upper().startswith('ACONCHEGO'):
        return 'ACONCHEGO DO BEBE'
    return BRAND_MAP.get(name, name)


def resolve(val, prev):
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
    wb.close()

    raw_brand = rows[0][1] if rows and rows[0][1] else None
    if not raw_brand:
        return None, []

    brand = canonical(str(raw_brand))

    products = []
    prev_produto, prev_classe = None, None

    for row in rows[12:]:
        if not row or row[0] is None or str(row[0]).strip() == '':
            break

        produto = resolve(row[1], prev_produto)
        grade   = row[2]
        classe  = resolve(row[3], prev_classe)
        valor   = row[5]

        if produto: prev_produto = produto
        if classe:  prev_classe  = classe

        if not grade or not produto or not classe:
            continue

        grade   = str(grade).strip().upper()
        produto = str(produto).strip().upper()
        classe  = str(classe).strip().upper()
        valor_u = float(valor) if isinstance(valor, (int, float)) else 0.0

        itens = defaultdict(int)
        for buyer_col in BUYER_COLS:
            bc = buyer_col - 1
            for offset in range(0, 20, 2):
                ci_label = bc + offset
                ci_qty   = bc + offset + 1
                if ci_label >= len(row):
                    break
                size_val = row[ci_label]
                qty_val  = row[ci_qty] if ci_qty < len(row) else None
                if size_val is None or str(size_val).strip() in ('', '--'):
                    break
                if qty_val and isinstance(qty_val, (int, float)) and qty_val > 0:
                    itens[str(size_val).strip()] += int(qty_val)

        if itens:
            products.append({
                'produto': produto,
                'grade':   grade,
                'classe':  classe,
                'valor':   round(valor_u, 2),
                'itens':   dict(itens),
            })

    return brand, products


def js_str(v):
    if isinstance(v, str):
        return "'" + v.replace("'", "\\'") + "'"
    if isinstance(v, float):
        return f'{v:.2f}'
    return str(v)


def write_mockdata(forns, compradores, segs, pedidos, projecoes, out_path):
    lines = [
        '// Gerado automaticamente por scripts/importar_pedidos.py — não editar manualmente',
        '',
        'export const compradores = [',
    ]
    for c in compradores:
        lines.append(f"  {{ id:{c['id']}, nome:{js_str(c['nome'])}, cnpj:{js_str(c['cnpj'])}, cidade:{js_str(c['cidade'])} }},")
    lines += [']', '']

    lines += [
        "export const colecoes = [",
        "  { id: 1, nome: 'Inverno 2026', estacao: 'inverno', ano: 2026, status: 'em_compra' },",
        "]", '',
    ]

    lines.append('export const segmentacoes = [')
    for s in segs:
        lines.append(
            f"  {{ id:{s['id']}, classificacao:{js_str(s['classificacao'])}, "
            f"tipo_produto:{js_str(s['tipo_produto'])}, classe:{js_str(s['classe'])}, "
            f"tipo_grade:{js_str(s['tipo_grade'])}, estacao:'inverno' }},"
        )
    lines += [']', '']

    lines.append('export const fornecedores = [')
    for f in forns:
        lines.append(f"  {{ id:{f['id']}, nome:{js_str(f['nome'])}, categoria:{js_str(f['categoria'])}, contato:'' }},")
    lines += [']', '']

    lines.append('export const projecoes = [')
    for p in projecoes:
        lines.append(
            f"  {{ segmentacao_id:{p['segmentacao_id']}, colecao_id:1, "
            f"tamanho:{js_str(p['tamanho'])}, qtd_ajustada:{p['qtd_ajustada']} }},"
        )
    lines += [']', '']

    lines.append('export const pedidosBase = [')
    cur = None
    for p in pedidos:
        if p['fornecedor_id'] != cur:
            cur = p['fornecedor_id']
            nome = next((f['nome'] for f in forns if f['id'] == cur), str(cur))
            lines.append(f'  // {nome}')
        lines.append(
            f"  {{ fornecedor_id:{p['fornecedor_id']}, colecao_id:1, "
            f"segmentacao_id:{p['segmentacao_id']}, data_pedido:'2026-02-01', "
            f"tamanho:{js_str(p['tamanho'])}, qtd_pedida:{p['qtd_pedida']}, "
            f"valor_unitario:{p['valor_unitario']} }},"
        )
    lines += [']', '']

    out_path.write_text('\n'.join(lines), encoding='utf-8')


def main():
    nome_to_id = {f['nome']: f['id'] for f in FORNECEDORES}

    seg_map  = {}
    seg_list = []
    ped_agg  = defaultdict(int)
    ped_val  = {}
    skipped  = []

    files = sorted(PEDIDOS_DIR.glob('*.xlsx'), key=lambda p: int(p.stem) if p.stem.isdigit() else 999)
    for f in files:
        brand, products = parse_file(f)
        if not brand:
            continue
        if brand not in nome_to_id:
            print(f'  AVISO: "{brand}" não mapeado ({f.name})')
            skipped.append((f.name, brand))
            continue

        forn_id = nome_to_id[brand]
        for p in products:
            key = (p['produto'], p['grade'], p['classe'])
            if key not in seg_map:
                seg_id = len(seg_map) + 1
                seg_map[key] = seg_id
                seg_list.append({
                    'id':            seg_id,
                    'classificacao': GRADE_CLASSIF.get(p['grade'], 'AD'),
                    'tipo_produto':  p['produto'],
                    'classe':        p['classe'],
                    'tipo_grade':    p['grade'],
                })
            seg_id = seg_map[key]
            for tamanho, qty in p['itens'].items():
                k = (forn_id, seg_id, tamanho)
                ped_agg[k] += qty
                ped_val[k]  = p['valor']

    pedidos = []
    for (forn_id, seg_id, tamanho), qty in sorted(ped_agg.items()):
        pedidos.append({
            'fornecedor_id':  forn_id,
            'segmentacao_id': seg_id,
            'tamanho':        tamanho,
            'qtd_pedida':     qty,
            'valor_unitario': ped_val[(forn_id, seg_id, tamanho)],
        })

    proj_agg = defaultdict(int)
    for (_, seg_id, tamanho), qty in ped_agg.items():
        proj_agg[(seg_id, tamanho)] += qty
    projecoes = [
        {'segmentacao_id': s, 'tamanho': t, 'qtd_ajustada': max(1, round(q * 1.2))}
        for (s, t), q in sorted(proj_agg.items())
    ]

    if skipped:
        print('\nMarcas sem mapeamento (adicionar a BRAND_MAP):')
        for fname, brand in skipped:
            print(f'  {fname}: {brand}')

    n_forns = len(set(p['fornecedor_id'] for p in pedidos))
    print(f'\nImportados: {n_forns} fornecedores, {len(seg_list)} segmentações, {len(pedidos)} linhas de pedido')

    write_mockdata(FORNECEDORES, COMPRADORES, seg_list, pedidos, projecoes, OUT_FILE)
    print(f'Arquivo gerado: {OUT_FILE}')


if __name__ == '__main__':
    main()
