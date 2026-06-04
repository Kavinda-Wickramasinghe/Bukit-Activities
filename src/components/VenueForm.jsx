import { useEffect, useState } from 'react'
import { compactPayload } from '../lib/helpers'

const emptyVenue = {
	name: '',
	area: '',
	category: '',
	website: '',
	instagram: '',
	whatsapp: '',
	google_maps_link: '',
	description: '',
	notes: '',
	last_checked: '',
}

export default function VenueForm({ initialRecord, onSubmit, onCancel }) {
	const [form, setForm] = useState(emptyVenue)

	useEffect(() => setForm({ ...emptyVenue, ...(initialRecord || {}) }), [initialRecord])

	function handleChange(event) {
		setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
	}

	function handleSubmit(event) {
		event.preventDefault()
		onSubmit(compactPayload(form))
	}

	return (
		<form className="formStack" onSubmit={handleSubmit}>
			<div className="grid">
				<Field label="Name" name="name" value={form.name} onChange={handleChange} required />
				<Field label="Area" name="area" value={form.area || ''} onChange={handleChange} />
				<Field label="Category" name="category" value={form.category || ''} onChange={handleChange} />
				<Field label="Website" name="website" value={form.website || ''} onChange={handleChange} />
				<Field label="Instagram" name="instagram" value={form.instagram || ''} onChange={handleChange} />
				<Field label="WhatsApp" name="whatsapp" value={form.whatsapp || ''} onChange={handleChange} />
				<Field label="Google Maps Link" name="google_maps_link" value={form.google_maps_link || ''} onChange={handleChange} />
				<Field label="Last Checked" name="last_checked" type="date" value={form.last_checked || ''} onChange={handleChange} />
			</div>
			<div className="grid twoColumn">
				<Field label="Description" name="description" value={form.description || ''} onChange={handleChange} textarea />
				<Field label="Notes" name="notes" value={form.notes || ''} onChange={handleChange} textarea />
			</div>
			<div className="actionRow">
				<button className="primary" type="submit">{initialRecord ? 'Update Venue' : 'Add Venue'}</button>
				{initialRecord && <button type="button" onClick={onCancel}>Cancel Edit</button>}
			</div>
		</form>
	)
}

function Field({ label, name, value, onChange, type = 'text', textarea = false, required = false }) {
	return (
		<div className="field">
			<label htmlFor={name}>{label}</label>
			{textarea ? <textarea id={name} name={name} value={value} onChange={onChange} placeholder={label} /> : <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={label} required={required} />}
		</div>
	)
}
