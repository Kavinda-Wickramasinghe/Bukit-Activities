import { supabase } from '../lib/supabaseClient'
import { unwrapQuery } from './supabaseService'

export async function getWhatsAppSources() {
	const { data } = await unwrapQuery(
		supabase
			.from('whatsapp_sources')
			.select('*')
			.order('group_name', { ascending: true })
	)
	return data
}

export async function getWhatsAppSourceCount() {
	const { count } = await unwrapQuery(
		supabase
			.from('whatsapp_sources')
			.select('id', { count: 'exact', head: true })
	)
	return count
}
