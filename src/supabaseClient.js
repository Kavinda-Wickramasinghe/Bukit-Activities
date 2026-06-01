import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabasePublishable = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''

const keyToUse = supabaseAnonKey || supabasePublishable || ''

const hasSupabaseKeys = Boolean(supabaseUrl && keyToUse)

if (!hasSupabaseKeys) {
	// eslint-disable-next-line no-console
	console.error('Supabase keys missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (preferred) in .env')
} else if (!supabaseAnonKey && supabasePublishable) {
	// Using publishable key as fallback — warn because anon key is preferred for public client usage
	// eslint-disable-next-line no-console
	console.warn('Using VITE_SUPABASE_PUBLISHABLE_KEY as fallback. Prefer VITE_SUPABASE_ANON_KEY (anon public key).')
}

export const supabase = createClient(supabaseUrl, keyToUse)
export { hasSupabaseKeys }
