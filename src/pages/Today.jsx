import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import ExternalLink from '../components/ExternalLink'
import RecurringBadge from '../components/RecurringBadge'
import { supabase } from '../lib/supabaseClient'
import { dateKey, display, formatTime } from '../lib/helpers'

export default function Today({ setToast, refreshKey }) {
	const [rows, setRows] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function load() {
			setLoading(true)
			const { data, error } = await supabase
				.from('activities_with_venues')
				.select('*')
				.eq('activity_date', dateKey())
				.order('start_time', { ascending: true })
			if (error) setToast({ type: 'error', text: error.message })
			setRows(data || [])
			setLoading(false)
		}
		load()
	}, [setToast, refreshKey])

	return (
		<>
			<section className="tabSection">
				<DataTable loading={loading} rows={rows} emptyText="Nothing listed for today yet." columns={[
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
				]} />
			</section>
		</>
	)
}

function Hero({ label, title, text }) {
	return <section className="heroCard"><div><p className="heroLabel">{label}</p><h2>{title}</h2><p className="heroText">{text}</p></div></section>
}

function VenueLinks({ row }) {
	return (
		<div className="tableActions">
			<ExternalLink href={row.venue_website}>Web</ExternalLink>
			<ExternalLink href={row.venue_instagram}>IG</ExternalLink>
			<ExternalLink href={row.venue_whatsapp}>WA</ExternalLink>
			<ExternalLink href={row.venue_google_maps_link}>Map</ExternalLink>
		</div>
	)
}
