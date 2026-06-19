# Guia da colaboradora — Solução Compras (Bolt Compras)

Bem-vinda! Este guia te leva do zero até conseguir fazer uma alteração no sistema com segurança, sem quebrar nada que está no ar. É pra seguir na ordem, com calma. Não precisa saber programar — você vai pedir as mudanças ao **Claude** em português; este guia é só pra montar o ambiente e entender o caminho que a mudança percorre.

> **A regra de ouro, antes de tudo:** existe **um banco de dados só**, que é o de verdade (produção). Não há "banco de teste". Por isso: mexer em **aparência** (cores, textos, posição de botão) é seguro; **criar/salvar pedidos** na sua cópia local grava nos dados reais — não faça isso "pra testar".

---

## 1. Instalar os programas (uma vez só)

Baixe e instale, nesta ordem:

1. **Node.js** (versão 24 ou mais nova) — https://nodejs.org → baixe o "LTS".
2. **Git** — https://git-scm.com/download/win → instale com as opções padrão.
3. **Claude Code** — siga as instruções que o Eduardo te passar para instalar e fazer login.

Para conferir que deu certo, abra o **Prompt de Comando** (tecla Windows → digite `cmd` → Enter) e digite:

```
node -v
git --version
```

Se aparecer um número de versão em cada (ex.: `v24.15.0`), está tudo certo.

---

## 2. Baixar o projeto (clonar)

No Prompt de Comando, escolha uma pasta para guardar o projeto e rode:

```
cd %USERPROFILE%\Documents
git clone https://github.com/edukern/solucao-compras.git
cd solucao-compras
```

Isso cria a pasta `solucao-compras` com tudo dentro. O agente de revisão e as regras do projeto já vêm junto no clone.

---

## 3. Instalar as dependências

Ainda no Prompt de Comando, dentro da pasta do projeto:

```
npm install
```

Demora alguns minutos na primeira vez. É normal aparecerem muitas linhas e alguns avisos (`warn`) — só não pode terminar com `error`.

---

## 4. Criar o arquivo de configuração (`.env.local`)

O app não abre sem as chaves de acesso ao banco (senão fica uma **tela preta**). Crie um arquivo chamado **`.env.local`** na raiz da pasta `solucao-compras`, com este conteúdo:

```
VITE_SUPABASE_URL=https://bhxpkysueyoblizkvomb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Pe-o7iG5jjV0n0qTTKQI-Q_DUZ8-tHm
```

Jeito fácil de criar: no Prompt de Comando, dentro da pasta, rode `notepad .env.local`, clique em "Sim" para criar, cole o conteúdo acima e salve.

---

## 5. Rodar a sua cópia local

```
npm run dev
```

Vai aparecer um endereço tipo `http://localhost:5173`. Abra ele no navegador.

**O que é isso:** é o app rodando **só no seu computador**, uma cópia privada. Ninguém mais enxerga. O site público (`bolt-compras.pages.dev`) continua intocado. É aqui que você confere suas mudanças **antes** de mandar pra valer.

Para parar, volte no Prompt de Comando e aperte `Ctrl + C`.

---

## 6. Como fazer uma alteração (o caminho seguro)

Você nunca vai mandar uma mudança direto pro site. O caminho é sempre este:

1. **Crie um "ramo" de trabalho** (uma cópia da linha principal, pra mexer sem afetar o que está no ar). No Prompt de Comando:
   ```
   git checkout main
   git pull
   git checkout -b minha-mudanca
   ```
   (troque `minha-mudanca` por um nome curto do que vai fazer, ex.: `ajuste-cor-botao`)

2. **Peça a mudança ao Claude**, em português, na pasta do projeto. Ele escreve o código. Quando a mudança mexer em algo sensível (banco, regras de pedido), o **agente de revisão de impacto roda sozinho** e mostra os riscos antes — é a primeira rede de segurança.

3. **Veja na sua cópia local** (`npm run dev`) se ficou como você queria. Ajuste com o Claude quantas vezes precisar.

4. **Envie e abra um Pedido de Inclusão (Pull Request / PR).** O Claude pode fazer isso pra você, ou:
   ```
   git push -u origin minha-mudanca
   ```
   Depois abra o link que aparece e clique em "Create pull request".

5. **Espere as duas travas:**
   - ✅ **Build verde** — um robô confere automaticamente que o app não quebrou. Se ficar vermelho, tem erro; peça ao Claude pra corrigir.
   - ✅ **Aprovação do Eduardo** — ele revisa e aprova.

   Só com as duas o botão de juntar (merge) libera. **Aí sim** a mudança vai pro site público (leva ~2 minutos pra aparecer).

---

## Regras de ouro (resumo)

- **Nunca** tente mandar direto pra linha principal (`main`) — está bloqueado de propósito, sempre passe por PR.
- Na sua **cópia local**, mexa em aparência à vontade; **não** crie/salve pedidos "de teste" (o banco é o real).
- Sempre **peça ao Claude em português** — você não precisa escrever código.
- Erro vermelho não é problema: é o sistema te avisando **antes** de ir pro ar. É só pedir o conserto ao Claude.
- Na dúvida, pergunte ao Eduardo. Melhor perguntar do que adivinhar.
