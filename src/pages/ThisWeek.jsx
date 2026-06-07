import { useEffect, useMemo, useState } from 'react'
import DataTable from '../components/DataTable'
import ExternalLink from '../components/ExternalLink'
import RecurringBadge from '../components/RecurringBadge'
import VenueLinks from '../components/VenueLinks'
import { notifyError } from '../lib/errors'
import { byDateTime, formatDate, formatTime } from '../lib/helpers'
import { getActiveCalendarWeekActivities } from '../services/activities'

export default function ThisWeek({ setToast, refreshKey }) {
	const [rows, setRows] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function load() {
			setLoading(true)
			try {
				setRows(await getActiveCalendarWeekActivities())
			} catch (error) {
				notifyError(setToast, error, 'Could not load this week activities.')
				setRows([])
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [setToast, refreshKey])

	const sortedRows = useMemo(() => [...rows].sort(byDateTime), [rows])

	return (
		<>
			<section className="tabSection">
				<DataTable loading={loading} rows={sortedRows} emptyText="No activities listed for this week yet." columns={[
					{ key: 'activity_date', label: 'Date', render: (row) => formatDate(row.activity_date) },
					{ key: 'start_time', label: 'Time', render: (row) => formatTime(row.start_time) },
					{ key: 'title', label: 'Title' },
					{ key: 'venue_name', label: 'Venue' },
					{ key: 'venue_area', label: 'Venue Area', render: (row) => row.venue_area || row.area },
					{ key: 'venue_category', label: 'Venue Category', render: (row) => row.venue_category || row.category },
					{ key: 'recurring_schedule', label: 'Repeats', render: (row) => <RecurringBadge activity={row} /> },
					{ key: 'cost', label: 'Cost' },
					{ key: 'why_jon_might_care', label: 'Why Jon Might Care' },
					{ key: 'booking_link', label: 'Booking', render: (row) => <ExternalLink href={row.booking_link || row.source_link}>Open</ExternalLink> },
					{ key: 'venue_links', label: 'Venue Links', render: (row) => <VenueLinks row={row} /> },
				]} />
			</section>
		</>
	)
}
