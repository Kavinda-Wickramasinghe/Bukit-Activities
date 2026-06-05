import { useEffect, useMemo, useState } from 'react'
import ActivityForm from '../components/ActivityForm'
import DataTable from '../components/DataTable'
import ExternalLink from '../components/ExternalLink'
import QuickFilters from '../components/QuickFilters'
import { supabase } from '../lib/supabaseClient'
import { display, formatDate, formatTime, textMatches } from '../lib/helpers'

export default function Activities({ setToast }) {
	const [rows, setRows] = useState([])
	const [venues, setVenues] = useState([])
	const [editing, setEditing] = useState(null)
	const [loading, setLoading] = useState(true)
	const [filters, setFilters] = useState({ search: '', category: '', status: '', featured: '', quick: '' })

	async function load() {
		setLoading(true)
		const [activitiesResult, venuesResult] = await Promise.all([
			supabase.from('activities_with_venues').select('*').order('activity_date', { ascending: true }),
			supabase.from('venues').select('id,name').order('name', { ascending: true }),
		])
		const error = activitiesResult.error || venuesResult.error
		if (error) setToast({ type: 'error', text: error.message })
		setRows(activitiesResult.data || [])
		setVenues(venuesResult.data || [])
		setLoading(false)
	}

	useEffect(() => { load() }, [])

	const categories = useMemo(() => unique(rows, 'category'), [rows])
	const visibleRows = useMemo(() => rows.filter((row) => {
		if (filters.search && !textMatches(row, filters.search, ['title', 'venue_name', 'category', 'area', 'venue_area', 'venue_category'])) return false
		if (filters.quick && !textMatches(row, filters.quick, ['title', 'venue_name', 'category', 'area', 'venue_area', 'venue_category', 'why_jon_might_care', 'description'])) return false
		if (filters.category && row.category !== filters.category) return false
		if (filters.status && row.status !== filters.status) return false
		if (filters.featured === 'yes' && !row.is_featured) return false
		if (filters.featured === 'no' && row.is_featured) return false
		return true
	}), [rows, filters])

	async function saveActivity(payload) {
		const request = editing
			? supabase.from('activities').update(payload).eq('id', editing.id)
			: supabase.from('activities').insert([payload])
		const { error } = await request
		if (error) return setToast({ type: 'error', text: error.message })
		setToast({ type: 'success', text: editing ? 'Activity updated.' : 'Activity added.' })
		setEditing(null)
		load()
	}

	async function updateStatus(row, status) {
		const { error } = await supabase.from('activities').update({ status }).eq('id', row.id)
		if (error) return setToast({ type: 'error', text: error.message })
		setToast({ type: 'success', text: `Activity ${status}.` })
		load()
	}

	async function deleteActivity(row) {
		if (!window.confirm(`Delete ${row.title}?`)) return
		const { error } = await supabase.from('activities').delete().eq('id', row.id)
		if (error) return setToast({ type: 'error', text: error.message })
		setToast({ type: 'success', text: 'Activity deleted.' })
		load()
	}

	return (
		<>
			<section className="heroCard"><div><p className="heroLabel">Activities</p><h2>New Discoveries and known options</h2><p className="heroText">Search fast, feature the good stuff, and keep stale listings out of the decision flow.</p></div></section>
			<QuickFilters activeFilter={filters.quick} onChange={(quick) => setFilters((current) => ({ ...current, quick }))} />
			<section className="formCard">
				<div className="sectionHeading"><div><h2>{editing ? 'Edit Activity' : 'Add Activity'}</h2><p>Venue names are shown here, but the selected venue id is saved to Supabase.</p></div></div>
				<ActivityForm initialRecord={editing} venues={venues} onSubmit={saveActivity} onCancel={() => setEditing(null)} />
			</section>
			<section className="tabSection">
				<div className="tabHeading"><div><h2>Activities</h2><p>{visibleRows.length} visible</p></div></div>
				<div className="filterBar">
					<input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search title, venue, category, area" />
					<select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
					<select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">All status</option><option value="active">active</option><option value="archived">archived</option><option value="cancelled">cancelled</option></select>
					<select value={filters.featured} onChange={(event) => setFilters((current) => ({ ...current, featured: event.target.value }))}><option value="">Featured?</option><option value="yes">Featured</option><option value="no">Not featured</option></select>
				</div>
				<DataTable loading={loading} rows={visibleRows} columns={[
					{ key: 'title', label: 'Title' },
					{ key: 'venue_name', label: 'Venue' },
					{ key: 'venue_area', label: 'Venue Area', render: (row) => display(row.venue_area || row.area) },
					{ key: 'venue_category', label: 'Venue Category', render: (row) => display(row.venue_category || row.category) },
					{ key: 'activity_date', label: 'Date', render: (row) => formatDate(row.activity_date) },
					{ key: 'start_time', label: 'Time', render: (row) => formatTime(row.start_time) },
					{ key: 'recurring_schedule', label: 'Recurring' },
					{ key: 'cost', label: 'Cost' },
					{ key: 'status', label: 'Status', render: (row) => display(row.status) },
					{ key: 'why_jon_might_care', label: 'Why Jon Might Care' },
					{ key: 'venue_links', label: 'Venue Links', render: (row) => <VenueLinks row={row} /> },
					{ key: 'actions', label: 'Actions', render: (row) => <div className="tableActions"><ExternalLink href={row.booking_link || row.source_link}>Open</ExternalLink><button type="button" className="tableButton" onClick={() => setEditing(row)}>Edit</button><button type="button" className="tableButton" onClick={() => updateStatus(row, 'archived')}>Archive</button><button type="button" className="tableButton" onClick={() => updateStatus(row, 'cancelled')}>Cancel</button><button type="button" className="tableButton dangerButton" onClick={() => deleteActivity(row)}>Delete</button></div> },
				]} />
			</section>
		</>
	)
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

function unique(rows, key) {
	return Array.from(new Set(rows.map((row) => row[key]).filter(Boolean))).sort()
}
