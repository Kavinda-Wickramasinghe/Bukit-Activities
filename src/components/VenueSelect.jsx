import { useEffect, useMemo, useState } from 'react'
import { display } from '../lib/helpers'
import { supabase } from '../lib/supabaseClient'
import ExternalLink from './ExternalLink'

export default function VenueSelect({ value, onChange }) {
	const [venues, setVenues] = useState([])
	const [search, setSearch] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		async function loadVenues() {
			setLoading(true)
			setError('')
			const { data, error: venueError } = await supabase
				.from('venues')
				.select('*')
				.order('name', { ascending: true })

			if (venueError) {
				setError(venueError.message || 'Could not load venues')
				setVenues([])
			} else {
				setVenues(data || [])
			}
			setLoading(false)
		}

		loadVenues()
	}, [])

	const filteredVenues = useMemo(() => {
		const query = search.trim().toLowerCase()
		if (!query) return venues
		return venues.filter((venue) => (
			String(venue.name || '').toLowerCase().includes(query) ||
			String(venue.area || '').toLowerCase().includes(query) ||
			String(venue.category || '').toLowerCase().includes(query)
		))
	}, [venues, search])

	const selectedVenue = useMemo(
		() => venues.find((venue) => String(venue.id) === String(value)) || null,
		[venues, value]
	)

	function handleSelect(event) {
		const venue = venues.find((item) => String(item.id) === String(event.target.value)) || null
		onChange(venue)
	}

	return (
		<div className="field venueSelectField">
			<label htmlFor="venue-search">Venue</label>
			<input
				id="venue-search"
				type="search"
				value={search}
				onChange={(event) => setSearch(event.target.value)}
				placeholder="Search venue, area, or category"
			/>
			<select id="venue_id" name="venue_id" value={value || ''} onChange={handleSelect} disabled={loading || Boolean(error)}>
				<option value="">{loading ? 'Loading venues...' : 'Select venue'}</option>
				{filteredVenues.map((venue) => (
					<option key={venue.id} value={venue.id}>
						{venue.name} {venue.area ? `· ${venue.area}` : ''} {venue.category ? `· ${venue.category}` : ''}
					</option>
				))}
			</select>
			{error && <div className="errorText">{error}</div>}
			{!loading && !error && venues.length === 0 && <div className="emptyMini">No venues available yet. Add a venue first.</div>}
			{!loading && !error && venues.length > 0 && filteredVenues.length === 0 && <div className="emptyMini">No venues match that search.</div>}
			{selectedVenue && <VenuePreview venue={selectedVenue} />}
		</div>
	)
}

function VenuePreview({ venue }) {
	return (
		<div className="venuePreview">
			<div>
				<strong>{display(venue.name)}</strong>
				<span>{display(venue.area)} · {display(venue.category)}</span>
			</div>
			<div className="venuePreviewGrid">
				<p><b>Website</b><ExternalLink href={venue.website}>Open</ExternalLink></p>
				<p><b>Instagram</b><ExternalLink href={venue.instagram}>Open</ExternalLink></p>
				<p><b>WhatsApp</b><ExternalLink href={venue.whatsapp}>Open</ExternalLink></p>
				<p><b>Maps</b><ExternalLink href={venue.google_maps_link}>Open</ExternalLink></p>
			</div>
			{venue.notes && <p className="venueNotes">{venue.notes}</p>}
		</div>
	)
}
