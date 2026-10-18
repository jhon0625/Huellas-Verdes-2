import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = cargando
  const [profile, setProfile] = useState(null)

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id || !supabase) return null
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      if (!error && data) {
        setProfile(data)
        return data
      }
    } catch (err) {
      console.warn('Error refrescando perfil:', err)
    }
    return null
  }, [session?.user?.id])

  useEffect(() => {
    if (!supabase) {
      setSession(null)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user?.id || !supabase) {
      setProfile(null)
      return
    }

    refreshProfile()

    // Suscripción a cambios en tiempo real del perfil (para ver las huellas actualizarse en vivo)
    const channel = supabase
      .channel(`profile-changes-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProfile(payload.new)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id, refreshProfile])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    refreshProfile,
    loading: session === undefined,
    signOut: () => supabase?.auth?.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
