import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import ExternalLink from '../components/ExternalLink'
import { supabase } from '../lib/supabaseClient'
import { display, formatTime } from '../lib/helpers'

export default function Today({ setToast }) {
	const [rows, setRows] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function load() {
			setLoading(true)
			const { data, error } = await supabase.from('today_activities').select('*').order('start_time', { ascending: true })
			if (error) setToast({ type: 'error', text: error.message })
			setRows(data || [])
			setLoading(false)
		}
		load()
	}, [setToast])

	return (
		<>
			<Hero label="Today" title="What's Good Today" text="A clean scan of events, classes, and easy yes options happening today." />
			<section className="tabSection">
				<DataTable loading={loading} rows={rows} emptyText="Nothing listed for today yet." columns={[
					{ key: 'start_time', label: 'Time', render: (row) => formatTime(row.start_time) },
					{ key: 'title', label: 'Title' },
					{ key: 'venue_name', label: 'Venue', render: (row) => display(row.venue_name) },
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

function Hero({ label, title, text }) {
	return <section className="heroCard"><div><p className="heroLabel">{label}</p><h2>{title}</h2><p className="heroText">{text}</p></div></section>
}
