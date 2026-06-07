import { addCalendarDays, dateKey, endOfWeekSunday, startOfWeekMonday } from '../lib/helpers'
import { supabase } from '../lib/supabaseClient'
import { unwrapQuery } from './supabaseService'

const activityView = () => supabase.from('activities_with_venues')
const activityTable = () => supabase.from('activities')

export async function getActiveTodayActivities() {
	const { data } = await unwrapQuery(
		activityView()
			.select('*')
			.eq('status', 'active')
			.eq('activity_date', dateKey())
			.order('start_time', { ascending: true })
	)
	return data
}

export async function getActiveDashboardWeekActivities() {
	const tomorrowKey = dateKey(addCalendarDays(new Date(), 1))
	const weekEndKey = dateKey(endOfWeekSunday())
	const { data } = await unwrapQuery(
		activityView()
			.select('*')
			.eq('status', 'active')
			.gte('activity_date', tomorrowKey)
			.lte('activity_date', weekEndKey)
			.order('activity_date', { ascending: true })
			.order('start_time', { ascending: true })
	)
	return data
}

export async function getActiveCalendarWeekActivities() {
	const weekStartKey = dateKey(startOfWeekMonday())
	const weekEndKey = dateKey(endOfWeekSunday())
	const { data } = await unwrapQuery(
		activityView()
			.select('*')
			.eq('status', 'active')
			.gte('activity_date', weekStartKey)
			.lte('activity_date', weekEndKey)
			.order('activity_date', { ascending: true })
			.order('start_time', { ascending: true })
	)
	return data
}

export async function getActivitiesWithVenues() {
	const { data } = await unwrapQuery(
		activityView()
			.select('*')
			.order('activity_date', { ascending: true })
			.order('start_time', { ascending: true })
	)
	return data
}

export async function getActivitiesByIds(ids) {
	const uniqueIds = [...new Set((ids || []).filter(Boolean))]
	if (!uniqueIds.length) return []

	const { data } = await unwrapQuery(
		activityView()
			.select('*')
			.in('id', uniqueIds)
	)
	return data
}

export async function getFeaturedActivityCount() {
	const { count } = await unwrapQuery(
		activityTable()
			.select('id', { count: 'exact', head: true })
			.eq('status', 'active')
			.eq('is_featured', true)
	)
	return count
}

export async function archiveActivity(id) {
	const { error } = await activityTable().update({ status: 'archived' }).eq('id', id)
	if (error) throw error
}
