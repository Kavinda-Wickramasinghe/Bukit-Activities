import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const hasSupabaseKeys = Boolean(supabaseUrl && supabaseAnonKey)

if (!hasSupabaseKeys) {
	console.error('Supabase keys missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = hasSupabaseKeys ? createClient(supabaseUrl, supabaseAnonKey) : null
