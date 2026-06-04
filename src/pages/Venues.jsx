import { useEffect, useMemo, useState } from 'react'
import DataTable from '../components/DataTable'
import ExternalLink from '../components/ExternalLink'
import VenueForm from '../components/VenueForm'
import { supabase } from '../lib/supabaseClient'
import { formatDate, textMatches } from '../lib/helpers'

export default function Venues({ setToast }) {
	const [rows, setRows] = useState([])
	const [editing, setEditing] = useState(null)
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState('')

	async function load() {
		setLoading(true)
		const { data, error } = await supabase.from('venues').select('*').order('name', { ascending: true })
		if (error) setToast({ type: 'error', text: error.message })
		setRows(data || [])
		setLoading(false)
	}

	useEffect(() => { load() }, [])

	const visibleRows = useMemo(() => rows.filter((row) => textMatches(row, search, ['name', 'area', 'category'])), [rows, search])

	async function saveVenue(payload) {
		const request = editing ? supabase.from('venues').update(payload).eq('id', editing.id) : supabase.from('venues').insert([payload])
		const { error } = await request
		if (error) return setToast({ type: 'error', text: error.message })
		setToast({ type: 'success', text: editing ? 'Venue updated.' : 'Venue added.' })
		setEditing(null)
		load()
	}

	async function deleteVenue(row) {
		if (!window.confirm(`Delete ${row.name}?`)) return
		const { error } = await supabase.from('venues').delete().eq('id', row.id)
		if (error) return setToast({ type: 'error', text: error.message })
		setToast({ type: 'success', text: 'Venue deleted.' })
		load()
	}

	return (
		<>
			<section className="heroCard"><div><p className="heroLabel">Venues</p><h2>Places worth tracking</h2><p className="heroText">Studios, beach clubs, co-working spaces, courts, cafes, and recurring source venues.</p></div></section>
			<section className="formCard"><div className="sectionHeading"><div><h2>{editing ? 'Edit Venue' : 'Add Venue'}</h2><p>Keep the place record useful enough for quick follow-up.</p></div></div><VenueForm initialRecord={editing} onSubmit={saveVenue} onCancel={() => setEditing(null)} /></section>
			<section className="tabSection">
				<div className="tabHeading"><div><h2>Venues</h2><p>{visibleRows.length} visible</p></div></div>
				<div className="filterBar"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, area, category" /></div>
				<DataTable loading={loading} rows={visibleRows} columns={[
					{ key: 'name', label: 'Name' },
					{ key: 'area', label: 'Area' },
					{ key: 'category', label: 'Category' },
					{ key: 'website', label: 'Website', render: (row) => <ExternalLink href={row.website}>Website</ExternalLink> },
					{ key: 'instagram', label: 'Instagram', render: (row) => <ExternalLink href={row.instagram}>Instagram</ExternalLink> },
					{ key: 'whatsapp', label: 'WhatsApp', render: (row) => <ExternalLink href={row.whatsapp}>WhatsApp</ExternalLink> },
					{ key: 'google_maps_link', label: 'Maps', render: (row) => <ExternalLink href={row.google_maps_link}>Map</ExternalLink> },
					{ key: 'notes', label: 'Notes' },
					{ key: 'last_checked', label: 'Last Checked', render: (row) => formatDate(row.last_checked) },
					{ key: 'actions', label: 'Actions', render: (row) => <div className="tableActions"><button type="button" className="tableButton" onClick={() => setEditing(row)}>Edit</button><button type="button" className="tableButton dangerButton" onClick={() => deleteVenue(row)}>Delete</button></div> },
				]} />
			</section>
		</>
	)
}
