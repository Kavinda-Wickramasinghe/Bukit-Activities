import { supabase } from '../lib/supabaseClient'
import { unwrapQuery } from './supabaseService'

export async function getVenues() {
	const { data } = await unwrapQuery(
		supabase
			.from('venues')
			.select('*')
			.order('name', { ascending: true })
	)
	return data
}

export async function getVenueCount() {
	const { count } = await unwrapQuery(
		supabase
			.from('venues')
			.select('id', { count: 'exact', head: true })
	)
	return count
}
