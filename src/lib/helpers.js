export const quickFilters = [
	'Fitness',
	'Padel',
	'Social',
	'Business',
	'Recovery',
	'Date-friendly',
	'Low-energy',
	'Novelty',
]

export const pickTypes = [
	'fitness',
	'social',
	'business',
	'novelty',
	'date-idea',
	'exposure-challenge',
	'recovery',
	'padel',
]

export function formatDate(value) {
	if (!value) return '-'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value
	return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatTime(value) {
	if (!value) return '-'
	const parts = String(value).split(':')
	if (parts.length < 2) return value
	const date = new Date()
	date.setHours(Number(parts[0]), Number(parts[1]), 0, 0)
	if (Number.isNaN(date.getTime())) return value
	return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function formatDateTime(date, time) {
	const dateText = formatDate(date)
	const timeText = formatTime(time)
	if (dateText === '-' && timeText === '-') return '-'
	if (dateText === '-') return timeText
	if (timeText === '-') return dateText
	return `${dateText}, ${timeText}`
}

export function display(value) {
	return value === null || value === undefined || value === '' ? '-' : String(value)
}

export function normalizeUrl(value) {
	if (!value) return ''
	const trimmed = String(value).trim()
	if (!trimmed) return ''
	return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function textMatches(record, query, keys) {
	if (!query) return true
	const needle = query.toLowerCase()
	return keys.some((key) => String(record?.[key] || '').toLowerCase().includes(needle))
}

export function compactPayload(payload) {
	return Object.fromEntries(
		Object.entries(payload).map(([key, value]) => [key, value === '' ? null : value])
	)
}

export function byDateTime(a, b) {
	const aValue = `${a.activity_date || ''} ${a.start_time || ''}`
	const bValue = `${b.activity_date || ''} ${b.start_time || ''}`
	return aValue.localeCompare(bValue)
}

export function groupBy(items, key) {
	return items.reduce((acc, item) => {
		const groupKey = item?.[key] || 'Unsorted'
		acc[groupKey] = acc[groupKey] || []
		acc[groupKey].push(item)
		return acc
	}, {})
}
