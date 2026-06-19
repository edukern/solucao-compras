# Setup da colaboradora — prompt pro Claude dela

Este é o prompt que o Eduardo envia para a Scheila (ou qualquer colaborador novo) colar
como **primeira mensagem** no Claude Code dela. O Claude faz o setup inteiro sozinho,
conversando em português simples.

## Pré-requisitos do lado dela (antes de colar o prompt)
- Claude Code instalado e logado.
- Estar logada (ou pronta para logar) no GitHub com a **conta da empresa: `lojaspontoe`**
  — o repo `edukern/solucao-compras` é **privado**, então baixar exige login. O prompt
  guia o login se necessário.
- Abrir o Claude Code numa pasta qualquer (ex.: Documentos) e colar o prompt.

## Prompt (enviar para ela)

```
Você vai me ajudar a preparar o projeto "Solução Compras" neste computador.
Eu sou a Scheila, trabalho no CD e NÃO conheço termos técnicos nem inglês.
Fale comigo sempre em português simples, explique o que está fazendo em cada
passo, faça você a parte técnica, e confirme que cada passo deu certo antes
de ir pro próximo. Se algo der errado, me explique de um jeito fácil o que
fazer (ou me diga pra chamar o Eduardo).

Faça nesta ordem:

1) CONFERIR PROGRAMAS: verifique se o Git e o Node estão instalados
   (git --version e node -v). Se algum faltar, me dê o link pra baixar e
   pare até eu instalar:
   - Git: https://git-scm.com/download/win
   - Node (botão LTS): https://nodejs.org
   Se faltar o GitHub CLI (gh), você pode instalar com: winget install GitHub.cli

2) LOGIN NO GITHUB: o projeto é privado, então preciso estar logada na conta
   da EMPRESA no GitHub (usuário: lojaspontoe). Verifique se já estou logada
   (gh auth status). Se não estiver, inicie o login (gh auth login) e me guie
   passo a passo — quando abrir o navegador ou pedir um código, me diga
   exatamente o que fazer. IMPORTANTE: eu devo entrar com a conta da EMPRESA
   (lojaspontoe), não outra.

3) BAIXAR O PROJETO: dentro da minha pasta de Documentos, baixe o projeto:
   gh repo clone edukern/solucao-compras
   (se preferir, git clone https://github.com/edukern/solucao-compras.git)
   Depois entre na pasta solucao-compras.

4) PREPARAR: dentro da pasta, rode a instalação (npm install). Pode demorar
   uns minutos; me avise quando terminar e se deu certo.

5) CHAVE DE ACESSO: crie um arquivo chamado .env.local na raiz da pasta
   solucao-compras com exatamente este conteúdo:
   VITE_SUPABASE_URL=https://bhxpkysueyoblizkvomb.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_Pe-o7iG5jjV0n0qTTKQI-Q_DUZ8-tHm

6) ABRIR MINHA CÓPIA: rode npm run dev, me passe o endereço (tipo
   http://localhost:5173) e me explique que essa é a MINHA cópia local, que
   só abre no meu computador, e que é onde eu confiro as mudanças antes de
   mandar pro Eduardo.

7) Por fim, leia o arquivo CONTRIBUTING.md que veio no projeto e me explique,
   em português simples, como eu peço uma alteração e como ela chega pro
   Eduardo aprovar. A partir daí eu trabalho conversando com você.

Pode começar pelo passo 1.
```

## Depois do setup
Ela trabalha seguindo o `CONTRIBUTING.md` (na raiz): conversa com o Claude em português,
e o Claude cria a branch, registra, envia e abre o PR. O merge na `main` exige build verde
+ aprovação do Eduardo (`main` protegida).
