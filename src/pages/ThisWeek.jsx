import { useEffect, useMemo, useState } from 'react'
import DataTable from '../components/DataTable'
import ExternalLink from '../components/ExternalLink'
import { supabase } from '../lib/supabaseClient'
import { byDateTime, formatDate, formatTime } from '../lib/helpers'

export default function ThisWeek({ setToast }) {
	const [rows, setRows] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function load() {
			setLoading(true)
			const { data, error } = await supabase.from('this_week_activities').select('*').order('activity_date', { ascending: true }).order('start_time', { ascending: true })
			if (error) setToast({ type: 'error', text: error.message })
			setRows(data || [])
			setLoading(false)
		}
		load()
	}, [setToast])

	const sortedRows = useMemo(() => [...rows].sort(byDateTime), [rows])

	return (
		<>
			<section className="heroCard"><div><p className="heroLabel">This Week</p><h2>Low Friction Options</h2><p className="heroText">The next seven days, sorted so the best time-sensitive choices rise naturally.</p></div></section>
			<section className="tabSection">
				<DataTable loading={loading} rows={sortedRows} emptyText="No activities listed for this week yet." columns={[
					{ key: 'activity_date', label: 'Date', render: (row) => formatDate(row.activity_date) },
					{ key: 'start_time', label: 'Time', render: (row) => formatTime(row.start_time) },
					{ key: 'title', label: 'Title' },
					{ key: 'venue_name', label: 'Venue' },
					{ key: 'area', label: 'Area' },
					{ key: 'category', label: 'Category' },
					{ key: 'cost', label: 'Cost' },
					{ key: 'why_jon_might_care', label: 'Why Jon Might Care' },
					{ key: 'booking_link', label: 'Booking', render: (row) => <ExternalLink href={row.booking_link || row.source_link}>Open</ExternalLink> },
				]} />
			</section>
		</>
	)
}
