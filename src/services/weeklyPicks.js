import { supabase } from '../lib/supabaseClient'
import { getActivitiesByIds } from './activities'
import { unwrapQuery } from './supabaseService'

export async function getWeeklyPicks() {
	const { data } = await unwrapQuery(
		supabase
			.from('weekly_picks')
			.select('*')
			.order('week_start_date', { ascending: false })
	)
	return data
}

export async function getRecentWeeklyPicksWithActivities(limit = 8) {
	const { data: picks } = await unwrapQuery(
		supabase
			.from('weekly_picks')
			.select('*')
			.order('week_start_date', { ascending: false })
			.limit(limit)
	)

	const activities = await getActivitiesByIds(picks.map((pick) => pick.activity_id))
	const activityById = Object.fromEntries(activities.map((activity) => [activity.id, activity]))

	return picks.map((pick) => ({
		...pick,
		activity: activityById[pick.activity_id] || null,
	}))
}
