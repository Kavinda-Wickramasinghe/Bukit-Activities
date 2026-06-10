import { useEffect, useMemo, useState } from 'react'
import DataTable from '../components/DataTable'
import ExternalLink from '../components/ExternalLink'
import RecurringBadge from '../components/RecurringBadge'
import VenueLinks from '../components/VenueLinks'
import { notifyError } from '../lib/errors'
import { byDateTime, dateKey, display, endOfMonth, endOfWeekSunday, formatDate, formatTime, startOfMonth, startOfWeekMonday } from '../lib/helpers'
import { getActiveMonthActivities } from '../services/activities'

export default function MonthlyEvents({ setToast, refreshKey }) {
	const [rows, setRows] = useState([])
	const [loading, setLoading] = useState(true)
	const monthPeriod = `${formatDate(startOfMonth())} - ${formatDate(endOfMonth())}`

	useEffect(() => {
		async function load() {
			setLoading(true)
			try {
				setRows(await getActiveMonthActivities())
			} catch (error) {
				notifyError(setToast, error, 'Could not load monthly activities.')
				setRows([])
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [setToast, refreshKey])

	const weeklyGroups = useMemo(() => groupActivitiesByWeek(rows), [rows])

	return (
		<section className="tabSection">
			<div className="tabHeading">
				<div>
					<h2>Monthly Events</h2>
					<p>{monthPeriod}</p>
				</div>
			</div>

			{loading ? (
				<DataTable loading rows={[]} emptyText="Loading monthly events..." columns={monthlyColumns} />
			) : weeklyGroups.length ? (
				<div className="space-y-5">
					{weeklyGroups.map((group) => (
						<section key={group.key} className="space-y-3">
							<div className="weekRange">{group.label}</div>
							<DataTable rows={group.items} columns={monthlyColumns} emptyText="No events this week." />
						</section>
					))}
				</div>
			) : (
				<DataTable rows={[]} columns={monthlyColumns} emptyText="No active events listed for this month yet." />
			)}
		</section>
	)
}

const monthlyColumns = [
	{ key: 'activity_date', label: 'Date', render: (row) => formatDate(row.activity_date) },
	{ key: 'start_time', label: 'Time', render: (row) => formatTime(row.start_time) },
	{ key: 'title', label: 'Title' },
	{ key: 'venue_name', label: 'Venue', render: (row) => display(row.venue_name) },
	{ key: 'venue_area', label: 'Venue Area', render: (row) => display(row.venue_area || row.area) },
	{ key: 'venue_category', label: 'Venue Category', render: (row) => display(row.venue_category || row.category) },
	{ key: 'recurring_schedule', label: 'Repeats', render: (row) => <RecurringBadge activity={row} /> },
	{ key: 'cost', label: 'Cost' },
	{ key: 'why_jon_might_care', label: 'Why Jon Might Care' },
	{ key: 'booking_link', label: 'Booking', render: (row) => <ExternalLink href={row.booking_link || row.source_link}>Open</ExternalLink> },
	{ key: 'venue_links', label: 'Venue Links', render: (row) => <VenueLinks row={row} /> },
]

function groupActivitiesByWeek(items) {
	const groups = new Map()

	;[...items].sort(byDateTime).forEach((item) => {
		const weekStart = startOfWeekMonday(new Date(item.activity_date))
		const weekEnd = endOfWeekSunday(new Date(item.activity_date))
		const key = dateKey(weekStart)
		if (!groups.has(key)) {
			groups.set(key, {
				key,
				label: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
				items: [],
			})
		}
		groups.get(key).items.push(item)
	})

	return [...groups.values()]
}
