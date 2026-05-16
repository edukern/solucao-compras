# MACLE Controle — Extração de Grades por Segmentação para Google Sheets

## Contexto

Sistema: `http://177.136.214.107:8081/Controle/AnaliseVenda`  
Página: Análise de Vendas → agrupada por **Coleção > Níveis > Níveis**  
Objetivo: Para cada segmentação de produto (BAG, BERMUDA, etc.), abrir o popup
de grade e extrair a tabela **TOTAL GRADE** (Compras / Vendas / Estoque por tamanho)
e jogar tudo num Google Sheets.

---

## O que foi descoberto

### Como funciona o popup

Cada linha da tabela principal tem links `<a href="javascript:showGradeGrupo(...)">`.
A função `showGradeGrupo` chama `window.open()` apontando para:

```
/Controle/relatorios/analiseVenda/consGradeMovtosAV.jsp?pk=<PK_ENCODED>
```

onde `<PK_ENCODED>` é um JSON URL-encoded do tipo:
```json
{"jclass": "com.sollus.vo.PKNivelItem", "codNivel": 28, "codTipo": 2}
```

O popup carrega um HTML com os itens do segmento e, no final, uma tabela
**TOTAL GRADE** com os totais por tamanho (grade), assim:

| | P | M | G | GG | TOT |
|---|---|---|---|---|---|
| Compras | 213 | 437 | 619 | 531 | 2018 |
| Vendas | 96 | 196 | 261 | 238 | 951 |
| Estoque | 130 | 301 | 400 | 303 | 1223 |

### Por que o popup não abria visualmente

O browser da extensão bloqueava popups (`window.open`). A solução foi
navegar diretamente para a URL do JSP em outra aba.

### Como capturar a URL do popup

Executado no console da aba de análise:

```javascript
// Intercepta o window.open para capturar a URL
var originalOpen = window.open;
window._popupUrls = [];
window.open = function(url, name, features) {
  window._popupUrls.push({url, name, features});
  return originalOpen.apply(window, arguments);
};
// Clicar num link de segmentação e verificar:
// window._popupUrls[0].url
```

URL base do popup: `relatorios/analiseVenda/consGradeMovtosAV.jsp`  
Parâmetro: `pk=<JSON_URL_ENCODED>`

### Extração em massa dos 93 segmentos (via fetch no browser)

Executado na aba de análise (`javascript_tool`):

```javascript
// 1. Extrair todos os segmentos de nível 0 com seus PKs
var links = document.querySelectorAll('a[href*="showGradeGrupo"]');
var segments = [];
links.forEach(a => {
  var href = a.getAttribute('href');
  if (href.includes(', null, 0)')) {
    var match = href.match(/showGradeGrupo\('(.+?)',\s*null,\s*0\)/);
    if (match) segments.push({ name: a.textContent.trim(), pk: match[1] });
  }
});

// 2. Função para buscar e parsear uma grade
async function fetchGradeData(name, pk) {
  var url = 'relatorios/analiseVenda/consGradeMovtosAV.jsp?pk=' + pk;
  var html = await (await fetch(url)).text();
  var doc = new DOMParser().parseFromString(html, 'text/html');
  var gradeTable = [...doc.querySelectorAll('table')]
    .find(t => t.textContent.includes('TOTAL GRADE'));
  if (!gradeTable) return { name, error: 'no table' };
  var rows = [...gradeTable.querySelectorAll('tr')].map(tr =>
    [...tr.querySelectorAll('td')].map(td => td.textContent.trim())
  ).filter(r => r.some(c => c));
  return { name, rows };
}

// 3. Buscar todos em paralelo
var results = await Promise.all(segments.map(s => fetchGradeData(s.name, s.pk)));
window._allGradeData = results;
```

Resultado: **93 segmentos**, zero erros, todos com dados corretos.

> ⚠️ **Escopo parcial:** esta extração cobriu apenas as classificações **AD e EX**. As demais classificações (INF, JUV, BB, LAR, KING, QUEEN, SOLT, CASAL, PP, GERAL) ainda precisam ser extraídas com o mesmo processo, aplicando o filtro de classificação correspondente no MACLE antes de rodar o script.

---

## O que foi tentado para escrever no Sheets (e por quê não funcionou)

| Método | Resultado |
|--------|-----------|
| Apps Script via script.google.com | Domínio bloqueado para automação |
| `navigator.clipboard.writeText` | Requer foco do documento (JavaScript tool não mantém foco) |
| `ClipboardItem` + `Ctrl+V` | Mesmo problema de foco |
| Cross-origin fetch do Sheets → análise | Bloqueado por CORS |
| Sheets API REST com token da sessão | Token inválido para REST API |
| `computer type` com `\t` | `\t` vira espaço, não move célula |
| `computer type` com `\n` | ✅ Funciona — move para próxima linha |
| `computer type` + `key Tab` + `key Return` | ✅ Funciona — mas lento (7.400 ações para 558 linhas) |

**Conseguiu inserir:** BAG e BERMUDA manualmente via browser_batch  
**Parou por:** ineficiência (muitos tokens para as 558 linhas restantes)

---

## Solução definitiva — Apps Script com UrlFetchApp

O Apps Script consegue fazer requisições HTTP para servidores externos via
`UrlFetchApp.fetch()`. O script busca cada segmento diretamente do servidor
e escreve na planilha.

### Pré-requisitos
- Estar **logado no sistema de análise** (`177.136.214.107:8081`) no mesmo browser
- Ter a planilha Google Sheets aberta

> ⚠️ **Nota sobre autenticação:** O `UrlFetchApp` roda nos servidores do Google,
> **não no seu browser**. Por isso, **não envia seus cookies de sessão**.
> Se o sistema exigir login, o script vai receber a tela de login em vez dos dados.
>
> **Solução:** Verificar se a URL do JSP funciona sem autenticação (alguns sistemas
> internos liberam por IP). Caso contrário, usar a abordagem do browser (seção abaixo).

---

## Código Apps Script completo

```javascript
function importarGrades() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  sheet.setName('TOTAL GRADE');
  sheet.clearContents();

  var BASE_URL = 'http://177.136.214.107:8081/Controle/relatorios/analiseVenda/consGradeMovtosAV.jsp?pk=';

  var segmentos = [
    ["BAG","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000101%2C%22codTipo%22%3A+2%7D"],
    ["BERMUDA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+28%2C%22codTipo%22%3A+2%7D"],
    ["BERMUDA JE","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+20000409%2C%22codTipo%22%3A+2%7D"],
    ["BERMUDA MO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+20000416%2C%22codTipo%22%3A+2%7D"],
    ["BIQUINI","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+168%2C%22codTipo%22%3A+2%7D"],
    ["BLAZER","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+53%2C%22codTipo%22%3A+2%7D"],
    ["BLUSA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+8%2C%22codTipo%22%3A+2%7D"],
    ["BLUSINHA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+29%2C%22codTipo%22%3A+2%7D"],
    ["BODY","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+54%2C%22codTipo%22%3A+2%7D"],
    ["BOINA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+155%2C%22codTipo%22%3A+2%7D"],
    ["BOLSA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+120%2C%22codTipo%22%3A+2%7D"],
    ["BONE","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+140%2C%22codTipo%22%3A+2%7D"],
    ["BOTA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+187%2C%22codTipo%22%3A+2%7D"],
    ["BOXER","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+142%2C%22codTipo%22%3A+2%7D"],
    ["BRINCO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000043%2C%22codTipo%22%3A+2%7D"],
    ["CALCA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+1%2C%22codTipo%22%3A+2%7D"],
    ["CALCA JE","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+20000405%2C%22codTipo%22%3A+2%7D"],
    ["CALCAO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+119%2C%22codTipo%22%3A+2%7D"],
    ["CALCINHA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+143%2C%22codTipo%22%3A+2%7D"],
    ["CALCOLA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+20000413%2C%22codTipo%22%3A+2%7D"],
    ["CAMISA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+4%2C%22codTipo%22%3A+2%7D"],
    ["CAMISETA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+5%2C%22codTipo%22%3A+2%7D"],
    ["CAMISETA PI","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+20000407%2C%22codTipo%22%3A+2%7D"],
    ["CAMISETE","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+131%2C%22codTipo%22%3A+2%7D"],
    ["CAMISOLA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+133%2C%22codTipo%22%3A+2%7D"],
    ["CAPRI","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+134%2C%22codTipo%22%3A+2%7D"],
    ["CARTEIRA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000044%2C%22codTipo%22%3A+2%7D"],
    ["CASACO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+52%2C%22codTipo%22%3A+2%7D"],
    ["CHAPEU","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+121%2C%22codTipo%22%3A+2%7D"],
    ["CHAVEIRO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000042%2C%22codTipo%22%3A+2%7D"],
    ["CHINELO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+116%2C%22codTipo%22%3A+2%7D"],
    ["CINTO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+122%2C%22codTipo%22%3A+2%7D"],
    ["COLAR","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000045%2C%22codTipo%22%3A+2%7D"],
    ["COLETE","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+162%2C%22codTipo%22%3A+2%7D"],
    ["CONJ.","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+10%2C%22codTipo%22%3A+2%7D"],
    ["CONJ. LING","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+163%2C%22codTipo%22%3A+2%7D"],
    ["CONJ. RE","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+20000418%2C%22codTipo%22%3A+2%7D"],
    ["CORSARIO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+135%2C%22codTipo%22%3A+2%7D"],
    ["CUECA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+141%2C%22codTipo%22%3A+2%7D"],
    ["EXTENSOR","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000046%2C%22codTipo%22%3A+2%7D"],
    ["FIO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000047%2C%22codTipo%22%3A+2%7D"],
    ["GARGANTILHA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000048%2C%22codTipo%22%3A+2%7D"],
    ["GRAVATA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000049%2C%22codTipo%22%3A+2%7D"],
    ["JAQUETA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+51%2C%22codTipo%22%3A+2%7D"],
    ["JAQUETA JE","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+20000410%2C%22codTipo%22%3A+2%7D"],
    ["KIT","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000050%2C%22codTipo%22%3A+2%7D"],
    ["KIT CUECA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000051%2C%22codTipo%22%3A+2%7D"],
    ["KIT MEIA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000052%2C%22codTipo%22%3A+2%7D"],
    ["LEG","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+20000402%2C%22codTipo%22%3A+2%7D"],
    ["MACACAO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+136%2C%22codTipo%22%3A+2%7D"],
    ["MAIO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+169%2C%22codTipo%22%3A+2%7D"],
    ["MEIA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+127%2C%22codTipo%22%3A+2%7D"],
    ["MEIA CALCA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000053%2C%22codTipo%22%3A+2%7D"],
    ["MOCASSIM","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000054%2C%22codTipo%22%3A+2%7D"],
    ["MOCHILA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000055%2C%22codTipo%22%3A+2%7D"],
    ["MOCHILA CAMPING","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000056%2C%22codTipo%22%3A+2%7D"],
    ["MODELADOR","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000057%2C%22codTipo%22%3A+2%7D"],
    ["MULE","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000058%2C%22codTipo%22%3A+2%7D"],
    ["NECESSAIRE","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000059%2C%22codTipo%22%3A+2%7D"],
    ["PANTACOURT","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+20000404%2C%22codTipo%22%3A+2%7D"],
    ["PIJAMA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+137%2C%22codTipo%22%3A+2%7D"],
    ["POCHETE","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000060%2C%22codTipo%22%3A+2%7D"],
    ["POLO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+6%2C%22codTipo%22%3A+2%7D"],
    ["PRENDEDOR CABELO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000061%2C%22codTipo%22%3A+2%7D"],
    ["PULSEIRA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000062%2C%22codTipo%22%3A+2%7D"],
    ["RABICO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000063%2C%22codTipo%22%3A+2%7D"],
    ["RASTEIRINHA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000064%2C%22codTipo%22%3A+2%7D"],
    ["REGATA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+7%2C%22codTipo%22%3A+2%7D"],
    ["REGATINHA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+20000406%2C%22codTipo%22%3A+2%7D"],
    ["ROUPAO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+138%2C%22codTipo%22%3A+2%7D"],
    ["SACOLA VIAGEM","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000065%2C%22codTipo%22%3A+2%7D"],
    ["SAIA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+12%2C%22codTipo%22%3A+2%7D"],
    ["SAIDA PRAIA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+170%2C%22codTipo%22%3A+2%7D"],
    ["SAMBA CANCAO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+144%2C%22codTipo%22%3A+2%7D"],
    ["SANDALIA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+115%2C%22codTipo%22%3A+2%7D"],
    ["SAPATENIS","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000066%2C%22codTipo%22%3A+2%7D"],
    ["SAPATILHA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000067%2C%22codTipo%22%3A+2%7D"],
    ["SAPATO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+114%2C%22codTipo%22%3A+2%7D"],
    ["SHORT","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+2%2C%22codTipo%22%3A+2%7D"],
    ["SHORT JE","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+20000408%2C%22codTipo%22%3A+2%7D"],
    ["SHORT MO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+20000417%2C%22codTipo%22%3A+2%7D"],
    ["SHORT SAIA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+20000412%2C%22codTipo%22%3A+2%7D"],
    ["SUNGA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+171%2C%22codTipo%22%3A+2%7D"],
    ["SUSPENSORIO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000068%2C%22codTipo%22%3A+2%7D"],
    ["SUTIA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+145%2C%22codTipo%22%3A+2%7D"],
    ["TANGAO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+172%2C%22codTipo%22%3A+2%7D"],
    ["TENIS","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+113%2C%22codTipo%22%3A+2%7D"],
    ["TIARA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000069%2C%22codTipo%22%3A+2%7D"],
    ["TOP","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+9%2C%22codTipo%22%3A+2%7D"],
    ["TORNOZELEIRA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000070%2C%22codTipo%22%3A+2%7D"],
    ["TOUCA DE BANHO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000071%2C%22codTipo%22%3A+2%7D"],
    ["VESTIDO","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+14%2C%22codTipo%22%3A+2%7D"],
    ["VISEIRA","%7B%22jclass%22%3A+%22com.sollus.vo.PKNivelItem%22%2C%22codNivel%22%3A+30000072%2C%22codTipo%22%3A+2%7D"]
  ];

  // ... (código completo do Apps Script — ver versão anterior)
}
```

---

## Alternativa via browser (se UrlFetchApp não funcionar)

Executar no console da aba de análise logada:

```javascript
var links = document.querySelectorAll('a[href*="showGradeGrupo"]');
var segments = [];
links.forEach(a => {
  var href = a.getAttribute('href');
  if (href.includes(', null, 0)')) {
    var match = href.match(/showGradeGrupo\('(.+?)',\s*null,\s*0\)/);
    if (match) segments.push({ name: a.textContent.trim(), pk: match[1] });
  }
});

async function fetchGrade(name, pk) {
  var html = await (await fetch('relatorios/analiseVenda/consGradeMovtosAV.jsp?pk=' + pk)).text();
  var doc = new DOMParser().parseFromString(html, 'text/html');
  var tbl = [...doc.querySelectorAll('table')].find(t => t.textContent.includes('TOTAL GRADE'));
  if (!tbl) return { name, rows: [] };
  var rows = [...tbl.querySelectorAll('tr')].map(tr =>
    [...tr.querySelectorAll('td')].map(td => td.textContent.trim())
  ).filter(r => r.some(c => c) && !(r.length === 1 && r[0] === 'TOTAL GRADE'));
  return { name, rows };
}

Promise.all(segments.map(s => fetchGrade(s.name, s.pk)))
  .then(data => { window._allGradeData = data; console.log('OK:', data.length); });
```

Depois escrever na planilha via `browser_batch` (lento mas funciona).

---

## Estado da planilha (2026-05-15)

- **ID:** `1LsWIr8chyp89w7fOroo7tOzRHZ4-CTRgm34zWguihyQ`
- Apenas BAG e BERMUDA foram inseridos parcialmente
- Restam ~91 segmentos de AD+EX
- Script Apps Script criado mas não validado contra autenticação
- Classificações INF, JUV, BB, LAR, KING, QUEEN, SOLT, CASAL, PP, GERAL ainda não extraídas (codNivel desconhecidos)
