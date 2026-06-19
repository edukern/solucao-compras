# Guia da Scheila — como mexer no sistema com segurança

Oi, Scheila! Este guia é pra você. Não precisa saber programar, nem inglês, nem termos de computador. A ideia é simples: **você conversa com o Claude em português dizendo o que quer, e ele faz a parte difícil.** Este guia tem duas partes:

1. **Preparar o computador** — você faz uma vez só (com calma; se travar, chama o Eduardo).
2. **No dia a dia** — você só conversa com o Claude.

> **A regra mais importante de todas:** existe **um sistema só, que é o de verdade**, usado pelos compradores. Não existe um "sistema de brincadeira" pra testar. Por isso: mudar **a aparência** (cor, texto, lugar de um botão) é seguro; mas **não saia criando ou salvando pedidos "só pra ver"** — isso mexe nos dados de verdade.

---

# PARTE 1 — Preparar o computador (uma vez só)

Você vai instalar 3 programas e baixar o sistema. Vai por partes. Não precisa entender o que cada um faz — só seguir.

## Passo 1 — Instalar os 3 programas

Baixe e instale, um de cada vez (vá clicando em "Avançar/Próximo" com as opções que já vêm marcadas):

1. **Node** → https://nodejs.org (clique no botão grande que diz "LTS")
2. **Git** → https://git-scm.com/download/win
3. **Claude** → o Eduardo te passa o link e te ajuda a entrar com a conta.

## Passo 2 — Baixar o sistema pro seu computador

Abra o programa **"Prompt de Comando"** (aperte a tecla Windows, digite `cmd`, aperte Enter). Vai abrir uma tela preta. Cole estas linhas, **uma de cada vez**, apertando Enter depois de cada (pra colar, clique com o botão direito do mouse dentro da tela preta):

```
cd %USERPROFILE%\Documents
git clone https://github.com/edukern/solucao-compras.git
cd solucao-compras
```

Pronto: agora existe uma pasta chamada `solucao-compras` dentro dos seus Documentos, com o sistema dentro.

## Passo 3 — Preparar o sistema

Na mesma tela preta, cole e aperte Enter:

```
npm install
```

Vai demorar uns minutinhos e vai aparecer um monte de texto correndo. É normal. Pode aparecer a palavra `warn` (aviso) — tudo bem. Só **não pode** terminar com a palavra `error` em vermelho. Se terminar com erro, tire uma foto da tela e mande pro Eduardo.

## Passo 4 — Colocar a "chave" de acesso

O sistema não abre sem uma chave de acesso. Na tela preta, cole e aperte Enter:

```
notepad .env.local
```

Vai abrir o Bloco de Notas perguntando se quer criar o arquivo — clique em **Sim**. Cole exatamente isto dentro e salve (menu Arquivo → Salvar):

```
VITE_SUPABASE_URL=https://bhxpkysueyoblizkvomb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Pe-o7iG5jjV0n0qTTKQI-Q_DUZ8-tHm
```

Feche o Bloco de Notas.

## Passo 5 — Abrir sua cópia do sistema

Na tela preta, cole e aperte Enter:

```
npm run dev
```

Vai aparecer um endereço parecido com `http://localhost:5173`. **Esse endereço é a SUA cópia do sistema, que só abre no seu computador** — ninguém mais vê. É aqui que você confere suas mudanças antes de mandar pro Eduardo. Abra esse endereço no navegador (Chrome, Edge).

Pra fechar essa cópia depois, volte na tela preta e aperte as teclas `Ctrl` e `C` juntas.

✅ **Terminou a preparação.** Da próxima vez, pra abrir sua cópia é só abrir a tela preta e digitar:
```
cd %USERPROFILE%\Documents\solucao-compras
npm run dev
```

---

# PARTE 2 — No dia a dia: você conversa com o Claude

Aqui está o segredo: **você não precisa digitar comandos nem saber os termos técnicos.** Você abre o Claude na pasta do sistema e fala com ele em português, como se estivesse pedindo pra um colega. Ele cuida de toda a parte complicada (que tem nome em inglês, mas isso é problema dele, não seu).

## Frases prontas que você pode usar

**Para começar uma mudança:**
> "Claude, quero mudar [explique o que quer, ex.: 'a cor do botão de salvar pra verde']. Pode preparar tudo pra eu trabalhar nisso?"

**Para ver como ficou (antes de mandar pra qualquer lugar):**
> "Claude, como eu vejo essa mudança funcionando na minha cópia?"

(ele vai te lembrar de usar a sua cópia do sistema — o `npm run dev` do Passo 5)

**Quando gostar do resultado:**
> "Claude, ficou bom. Pode mandar pro Eduardo revisar e aprovar?"

Aí o Claude faz sozinho toda a parte técnica de empacotar e enviar a sua mudança pra fila de aprovação do Eduardo. Você **não** precisa entender essa parte.

**Se aparecer alguma tela vermelha ou aviso de erro:**
> "Claude, apareceu este aviso aqui: [cole o texto do aviso]. Pode resolver?"

Erro não é problema seu nem motivo de susto — é o sistema avisando **antes** de ir pro ar, justamente pra nada quebrar. É só pedir pro Claude consertar.

## O que acontece depois que você manda pro Eduardo

1. Um **conferente automático** testa sua mudança pra ver se não quebrou nada. (Aparece um ✓ verde quando está ok, ou um ✗ vermelho se tem problema — aí é só pedir pro Claude corrigir.)
2. O **Eduardo revisa e aprova.**
3. Só depois das duas coisas a mudança **vai pro sistema de verdade**, que os compradores usam (aparece lá em uns 2 minutos).

Ou seja: **nada que você fizer vai pro ar sem passar pela conferência automática e pela aprovação do Eduardo.** Você pode trabalhar tranquila — não tem como "quebrar o sistema sem querer".

---

# Resumo (as 4 coisas pra lembrar)

1. **Sua cópia** (`npm run dev`) é só sua — mexa à vontade na aparência.
2. **Não crie nem salve pedidos "de teste"** — os dados são de verdade.
3. **Fale com o Claude em português** — ele faz a parte técnica; você não precisa dos termos.
4. **Na dúvida, pergunte ao Eduardo.** Sempre melhor perguntar do que adivinhar.
