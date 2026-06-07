import { supabase } from '../lib/supabaseClient'
import { deleteById, saveRecord } from './supabaseService'

export function upsertAdminRecord(table, payload, id) {
	return saveRecord(supabase.from(table), payload, id)
}

export function deleteAdminRecord(table, id) {
	return deleteById(supabase.from(table), id)
}
