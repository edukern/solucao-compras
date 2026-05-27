# Auto-Cadastro de Usuários — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que os compradores se cadastrem e vinculem sua conta Supabase Auth à sua loja, sem intervenção manual do admin.

**Architecture:** Três camadas: (1) tabela `user_compradores` no Supabase mapeia `auth.uid()` → `comprador_id`; (2) `AuthContext` carrega esse vínculo e expõe `comprador`; (3) `App.jsx` roteia para `<SelecionarLoja />` quando o user está autenticado mas ainda não tem vínculo.

**Tech Stack:** React 18, Supabase JS v2, CSS Modules, Vite/Electron-Vite

---

## Fluxo completo após a feature

```
user === undefined   → splash "Carregando…"
user === null        → <Login /> — sign-in OU sign-up
user + sem vínculo   → <SelecionarLoja /> — escolhe qual comprador é
user + vínculo ok    → app normal (Sidebar + telas)
```

---

## Mapa de arquivos

| Arquivo | Ação |
|---|---|
| `supabase/migrations/003_user_compradores.sql` | CRIAR — tabela + RLS |
| `src/renderer/src/contexts/AuthContext.jsx` | MODIFICAR — adicionar `signUp`, `comprador`, `vincularComprador` |
| `src/renderer/src/screens/Login.jsx` | MODIFICAR — toggle sign-in / sign-up |
| `src/renderer/src/screens/Login.module.css` | MODIFICAR — estilos do toggle e link |
| `src/renderer/src/screens/SelecionarLoja.jsx` | CRIAR — lista compradores, vincula, entra no app |
| `src/renderer/src/screens/SelecionarLoja.module.css` | CRIAR — estilos da tela |
| `src/renderer/src/App.jsx` | MODIFICAR — adicionar guard `comprador === null` |

---

## Task 1: Tabela `user_compradores` no Supabase

**Files:**
- Create: `supabase/migrations/003_user_compradores.sql`

- [ ] **Step 1: Criar o arquivo de migração**

```sql
-- supabase/migrations/003_user_compradores.sql

CREATE TABLE IF NOT EXISTS user_compradores (
  user_id      UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  comprador_id BIGINT  NOT NULL    REFERENCES compradores(id) ON DELETE RESTRICT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_compradores ENABLE ROW LEVEL SECURITY;

-- Cada usuário só enxerga e insere o próprio registro
CREATE POLICY "select_own" ON user_compradores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON user_compradores
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 2: Rodar no Supabase**

Acesse https://supabase.com/dashboard → seu projeto → SQL Editor → New Query, cole o conteúdo acima e clique "Run".

Verificação: Database → Tables → `user_compradores` aparece com 3 colunas.

- [ ] **Step 3: Confirmar que email confirmation está desabilitado**

Supabase Dashboard → Authentication → Providers → Email → desmarque "Confirm email" se estiver marcado.  
Isso permite que o usuário entre direto após o sign-up sem precisar clicar em link de email.

- [ ] **Step 4: Commit**

```bash
cd "C:\Users\eduke\Solução Compras"
git add supabase/migrations/003_user_compradores.sql
git commit -m "feat: tabela user_compradores com RLS no Supabase"
```

---

## Task 2: AuthContext — signUp + carregamento do comprador

**Files:**
- Modify: `src/renderer/src/contexts/AuthContext.jsx`

O contexto precisa:
1. Expor `signUp(email, password)` — chama `supabase.auth.signUp`
2. Carregar `comprador` do banco quando `user` muda (null se sem vínculo, objeto `compradores` se vinculado)
3. Expor `vincularComprador(compradorId)` — insere em `user_compradores` e atualiza `comprador` no estado

- [ ] **Step 1: Reescrever `AuthContext.jsx`**

```jsx
// src/renderer/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(undefined)  // undefined = carregando
  const [comprador, setComprador] = useState(undefined)  // undefined = carregando vínculo

  // Carrega o comprador vinculado ao user
  async function loadComprador(userId) {
    if (!userId) { setComprador(null); return }
    const { data } = await supabase
      .from('user_compradores')
      .select('comprador_id, compradores(*)')
      .eq('user_id', userId)
      .maybeSingle()
    setComprador(data?.compradores ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      loadComprador(u?.id ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      loadComprador(u?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password })

  const signOut = () => supabase.auth.signOut()

  async function vincularComprador(compradorId) {
    const { error } = await supabase
      .from('user_compradores')
      .insert({ user_id: user.id, comprador_id: compradorId })
    if (error) throw error
    await loadComprador(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, comprador, signIn, signUp, signOut, vincularComprador }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Verificar no browser (local dev)**

```bash
cd "C:\Users\eduke\Solução Compras"
npm run dev
```

Abrir http://localhost:5173 — deve aparecer a tela de Login. Console sem erros.  
(O `comprador` ainda é `undefined` enquanto carrega e `null` para usuários sem vínculo — isso é correto.)

- [ ] **Step 3: Commit**

```bash
git add src/renderer/src/contexts/AuthContext.jsx
git commit -m "feat: AuthContext expõe signUp, comprador e vincularComprador"
```

---

## Task 3: Login.jsx — toggle sign-in / sign-up

**Files:**
- Modify: `src/renderer/src/screens/Login.jsx`
- Modify: `src/renderer/src/screens/Login.module.css`

O formulário de sign-up pede: e-mail, senha, confirmar senha. Após sucesso, o Supabase Auth dispara `onAuthStateChange` → o `AuthProvider` detecta o novo user → `App.jsx` vai rotear para `<SelecionarLoja />` automaticamente.

- [ ] **Step 1: Reescrever `Login.jsx`**

```jsx
// src/renderer/src/screens/Login.jsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import styles from './Login.module.css'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [modo,        setModo]        = useState('login')  // 'login' | 'cadastro'
  const [email,       setEmail]       = useState('')
  const [senha,       setSenha]       = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')
  const [erro,        setErro]        = useState(null)
  const [loading,     setLoading]     = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)

    if (modo === 'cadastro') {
      if (senha !== confirmaSenha) { setErro('As senhas não coincidem.'); return }
      if (senha.length < 6)        { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    }

    setLoading(true)
    const fn = modo === 'login' ? signIn : signUp
    const { error } = await fn(email, senha)
    setLoading(false)
    if (error) setErro(error.message)
    // Em caso de sucesso, onAuthStateChange no AuthContext redireciona automaticamente
  }

  function trocarModo() {
    setModo(m => m === 'login' ? 'cadastro' : 'login')
    setErro(null)
    setSenha('')
    setConfirmaSenha('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Solução Compras</h1>
        <p className={styles.subtitle}>Irmãos Backes</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={styles.input}
            placeholder="seu@email.com"
            required
            autoFocus
          />
          <label className={styles.label}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            className={styles.input}
            placeholder="••••••••"
            required
          />
          {modo === 'cadastro' && (
            <>
              <label className={styles.label}>Confirmar senha</label>
              <input
                type="password"
                value={confirmaSenha}
                onChange={e => setConfirmaSenha(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                required
              />
            </>
          )}
          {erro && <p className={styles.erro}>{erro}</p>}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading
              ? (modo === 'login' ? 'Entrando…' : 'Cadastrando…')
              : (modo === 'login' ? 'Entrar' : 'Criar conta')}
          </button>
        </form>
        <p className={styles.link}>
          {modo === 'login' ? 'Novo aqui? ' : 'Já tem conta? '}
          <button type="button" className={styles.linkBtn} onClick={trocarModo}>
            {modo === 'login' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Adicionar estilos ao `Login.module.css`**

Adicionar ao final do arquivo existente:

```css
.link {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: #888;
}
.linkBtn {
  background: none;
  border: none;
  color: #3ecf8e;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}
```

- [ ] **Step 3: Verificar no browser**

No `npm run dev` rodando, ir para http://localhost:5173:
- Clicar "Criar conta" → formulário deve mostrar campo "Confirmar senha"
- Clicar "Entrar" → volta ao form de login sem o campo extra
- Senhas não iguais → exibe mensagem de erro
- Senha com 5 chars → exibe mensagem de erro

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/screens/Login.jsx src/renderer/src/screens/Login.module.css
git commit -m "feat: Login com toggle sign-in/sign-up"
```

---

## Task 4: SelecionarLoja.jsx — vinculação comprador ↔ usuário

**Files:**
- Create: `src/renderer/src/screens/SelecionarLoja.jsx`
- Create: `src/renderer/src/screens/SelecionarLoja.module.css`

Essa tela lista os compradores cadastrados na tabela `compradores`. O usuário clica no card da sua loja, a função `vincularComprador` insere em `user_compradores`, o `AuthContext` recarrega `comprador` e o `App.jsx` sai dessa rota automaticamente.

- [ ] **Step 1: Criar `SelecionarLoja.jsx`**

```jsx
// src/renderer/src/screens/SelecionarLoja.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { compradores as compradoresService } from '../services/compradores'
import styles from './SelecionarLoja.module.css'

export default function SelecionarLoja() {
  const { vincularComprador, signOut } = useAuth()
  const [lista,   setLista]   = useState([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(null)  // id sendo salvo
  const [erro,    setErro]    = useState(null)

  useEffect(() => {
    compradoresService.list()
      .then(setLista)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSelecionar(compradorId) {
    setSalvando(compradorId)
    setErro(null)
    try {
      await vincularComprador(compradorId)
      // AuthContext atualiza comprador → App.jsx roteia para o app
    } catch (e) {
      setErro(e.message)
      setSalvando(null)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Qual é a sua loja?</h1>
        <p className={styles.subtitle}>Selecione para vincular sua conta</p>
        {loading && <p className={styles.info}>Carregando…</p>}
        {erro    && <p className={styles.erro}>{erro}</p>}
        <ul className={styles.lista}>
          {lista.map(c => (
            <li key={c.id}>
              <button
                className={styles.item}
                onClick={() => handleSelecionar(c.id)}
                disabled={salvando !== null}
              >
                <span className={styles.nome}>{c.nome}</span>
                {c.cidade && <span className={styles.cidade}>{c.cidade}</span>}
                {salvando === c.id && <span className={styles.spinner}>…</span>}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className={styles.sair} onClick={signOut}>
          Sair
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Criar `SelecionarLoja.module.css`**

```css
/* src/renderer/src/screens/SelecionarLoja.module.css */
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f5f5;
}
.card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 4px 24px rgba(0,0,0,.08);
}
.title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #1a1a2e;
}
.subtitle {
  font-size: 14px;
  color: #888;
  margin: 0 0 24px;
}
.info { color: #888; font-size: 14px; }
.erro { font-size: 13px; color: #e74c3c; margin: 0 0 12px; }
.lista {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  text-align: left;
  transition: border-color .15s, background .15s;
}
.item:hover:not(:disabled) {
  border-color: #3ecf8e;
  background: #f0fdf8;
}
.item:disabled { opacity: 0.6; cursor: not-allowed; }
.nome { font-size: 15px; font-weight: 600; color: #1a1a2e; }
.cidade { font-size: 13px; color: #888; }
.spinner { font-size: 13px; color: #3ecf8e; }
.sair {
  background: none;
  border: none;
  color: #888;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}
```

- [ ] **Step 3: Verificar no browser**

Para testar essa tela isoladamente, temporariamente altere `App.jsx` para renderizar `<SelecionarLoja />` diretamente e confirmar que a lista de compradores carrega. Depois reverter.

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/screens/SelecionarLoja.jsx src/renderer/src/screens/SelecionarLoja.module.css
git commit -m "feat: SelecionarLoja para vínculo comprador/usuário"
```

---

## Task 5: App.jsx — guard de vínculo

**Files:**
- Modify: `src/renderer/src/App.jsx`

Adicionar o import de `SelecionarLoja` e a lógica de roteamento para o estado intermediário.

- [ ] **Step 1: Reescrever `App.jsx`**

```jsx
// src/renderer/src/App.jsx
import { useState, useEffect } from 'react'
import { CollectionProvider } from './contexts/CollectionContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Sidebar from './components/Sidebar'
import Dashboard from './screens/Dashboard'
import Planejamento from './screens/Planejamento'
import Compras from './screens/Compras'
import Relatorios from './screens/Relatorios'
import Configuracoes from './screens/Configuracoes'
import Login from './screens/Login'
import SelecionarLoja from './screens/SelecionarLoja'

const SCREENS = {
  dashboard:     () => <Dashboard />,
  planejamento:  () => <Planejamento />,
  compras:       () => <Compras />,
  relatorios:    () => <Relatorios />,
  configuracoes: () => <Configuracoes />,
}

function AppInner() {
  const { user, comprador } = useAuth()
  const [screen, setScreen] = useState('dashboard')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  // Carregando auth OU carregando vínculo
  if (user === undefined || (user !== null && comprador === undefined)) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      Carregando…
    </div>
  )

  if (user === null) return <Login />

  // Autenticado mas sem loja vinculada
  if (comprador === null) return <SelecionarLoja />

  const Screen = SCREENS[screen] ?? SCREENS.dashboard

  return (
    <CollectionProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar
            current={screen}
            onNavigate={setScreen}
            theme={theme}
            onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          />
          <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
            <ErrorBoundary key={screen}>
              <Screen />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </CollectionProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
```

- [ ] **Step 2: Verificar fluxo completo**

Com `npm run dev` rodando (http://localhost:5173):

1. **Usuário existente com vínculo** → entra direto no app (sem passar por SelecionarLoja)
2. **Novo cadastro:**
   - Clicar "Criar conta" → preencher email + senha + confirmar senha → "Criar conta"
   - Deve ir para `SelecionarLoja` (lista de compradores aparece)
   - Clicar em uma loja → deve entrar no app principal
3. **Logout → Login de novo com o mesmo email** → deve ir direto para o app (vínculo já existe)
4. **Splash de carregamento** — recarregar a página: deve mostrar "Carregando…" por ~1s e depois ir para o estado correto

- [ ] **Step 3: Commit**

```bash
git add src/renderer/src/App.jsx
git commit -m "feat: App.jsx roteia para SelecionarLoja quando usuário sem vínculo"
```

---

## Task 6: Deploy e verificação em produção

**Files:** (nenhum arquivo novo)

- [ ] **Step 1: Push para main**

```bash
cd "C:\Users\eduke\Solução Compras"
git push origin main
```

O GitHub Actions `deploy-web.yml` dispara automaticamente e faz deploy no Cloudflare Pages em ~2 min.

- [ ] **Step 2: Verificar deploy**

```bash
gh run list --limit 3
```

Aguardar status `completed / success`.

- [ ] **Step 3: Testar em https://bolt-compras.pages.dev**

Repetir o fluxo do Task 5 Step 2 em produção:
- Cadastrar novo usuário
- Selecionar loja
- Verificar que entra no app
- Fazer logout e login de novo → vai direto para o app

- [ ] **Step 4: Verificar no Supabase**

Supabase Dashboard → Table Editor → `user_compradores`: deve ter um registro para o user recém-cadastrado.

Authentication → Users: deve listar o novo usuário.

---

## Checklist final (self-review)

- [x] Tabela `user_compradores` com RLS — Task 1
- [x] `signUp` no AuthContext — Task 2
- [x] `comprador` carregado automaticamente ao logar — Task 2
- [x] `vincularComprador` insere + recarrega estado — Task 2
- [x] Toggle sign-in/sign-up no Login — Task 3
- [x] Validação de senha (mínimo 6 chars, confirmação igual) — Task 3
- [x] SelecionarLoja lista compradores e vincula — Task 4
- [x] App.jsx roteia pelos 3 estados: sem user / sem vínculo / ok — Task 5
- [x] Splash de carregamento cobre ambos os loads (auth + vínculo) — Task 5
- [x] Deploy e verificação produção — Task 6
