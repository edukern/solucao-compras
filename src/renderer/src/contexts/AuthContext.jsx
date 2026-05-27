// src/renderer/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(undefined)  // undefined = carregando
  const [comprador, setComprador] = useState(undefined)  // undefined = carregando vínculo

  async function loadComprador(userId) {
    if (!userId) { setComprador(null); return }
    try {
      const { data, error } = await supabase
        .from('user_compradores')
        .select('comprador_id, compradores(*)')
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw error
      setComprador(data?.compradores ?? null)
    } catch {
      setComprador(null)
    }
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
    if (!user) throw new Error('Usuário não autenticado')
    const { error } = await supabase
      .from('user_compradores')
      .upsert({ user_id: user.id, comprador_id: compradorId }, { onConflict: 'user_id' })
    if (error) throw error
    await loadComprador(user.id)
  }

  async function desvincularComprador() {
    if (!user) return
    const { error } = await supabase
      .from('user_compradores')
      .delete()
      .eq('user_id', user.id)
    if (error) throw error
    setComprador(null)
  }

  return (
    <AuthContext.Provider value={{ user, comprador, signIn, signUp, signOut, vincularComprador, desvincularComprador }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
