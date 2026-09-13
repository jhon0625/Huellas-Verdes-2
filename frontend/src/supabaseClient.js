import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const hasSupabaseConfig = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('TU-PROYECTO') &&
    !supabaseAnonKey.includes('tu-anon-key')
)

if (!hasSupabaseConfig) {
  console.warn(
    '[Huellas Verdes] Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
      'Copia frontend/.env.example a frontend/.env y completa tus datos de Supabase.'
  )
}

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = hasSupabaseConfig
