import { dateKey } from './helpers'
import { supabase } from './supabaseClient'

function addDays(date, days) {
	const next = new Date(date)
	next.setDate(next.getDate() + days)
	return next
}

function addMonths(date, months) {
	const next = new Date(date)
	const originalDay = next.getDate()
	next.setMonth(next.getMonth() + months)
	if (next.getDate() < originalDay) next.setDate(0)
	return next
}

function getRecurringStep(schedule) {
	const value = String(schedule || '').trim().toLowerCase()
	if (!value) return null

	const everyMatch = value.match(/every\s+(\d+)\s+(day|days|week|weeks|month|months)/)
	if (everyMatch) {
		const amount = Number(everyMatch[1])
		const unit = everyMatch[2]
		if (unit.startsWith('day')) return { unit: 'day', amount }
		if (unit.startsWith('week')) return { unit: 'day', amount: amount * 7 }
		if (unit.startsWith('month')) return { unit: 'month', amount }
	}

	if (value.includes('daily') || value === 'day') return { unit: 'day', amount: 1 }
	if (value.includes('biweekly') || value.includes('fortnight')) return { unit: 'day', amount: 14 }
	if (value.includes('weekly') || value === 'week') return { unit: 'day', amount: 7 }
	if (value.includes('monthly') || value === 'month') return { unit: 'month', amount: 1 }
	if (value.includes('yearly') || value.includes('annually')) return { unit: 'month', amount: 12 }

	return null
}

export function getNextRecurringDate(activityDate, schedule, today = new Date()) {
	if (!activityDate) return null
	const step = getRecurringStep(schedule)
	if (!step) return null

	const todayDate = new Date(dateKey(today))
	let next = new Date(activityDate)
	if (Number.isNaN(next.getTime())) return null

	while (next < todayDate) {
		next = step.unit === 'month' ? addMonths(next, step.amount) : addDays(next, step.amount)
	}

	return dateKey(next)
}

export async function rolloverRecurringActivities() {
	const { data, error } = await supabase
		.from('activities')
		.select('id,title,activity_date,is_recurring,recurring_schedule,status')
		.eq('is_recurring', true)
		.eq('status', 'active')

	if (error) throw error

	const today = dateKey()
	const updates = (data || [])
		.map((activity) => ({
			activity,
			nextDate: getNextRecurringDate(activity.activity_date, activity.recurring_schedule),
		}))
		.filter(({ activity, nextDate }) => nextDate && activity.activity_date < today && nextDate !== activity.activity_date)

	if (!updates.length) return { updated: 0 }

	const results = await Promise.all(updates.map(({ activity, nextDate }) => (
		supabase
			.from('activities')
			.update({ activity_date: nextDate })
			.eq('id', activity.id)
	)))

	const updateError = results.find((result) => result.error)?.error
	if (updateError) throw updateError

	return { updated: updates.length }
}
