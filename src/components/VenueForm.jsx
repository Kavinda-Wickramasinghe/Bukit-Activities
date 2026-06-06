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
		<form className="space-y-5" onSubmit={handleSubmit}>
			<section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
				<SectionTitle number="1" tone="indigo" title="Venue identity" />
				<div className="grid gap-4 md:grid-cols-3">
					<Field label="Name" name="name" value={form.name} onChange={handleChange} required />
					<Field label="Area" name="area" value={form.area || ''} onChange={handleChange} />
					<Field label="Category" name="category" value={form.category || ''} onChange={handleChange} />
				</div>
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-4">
				<SectionTitle number="2" tone="sky" title="Contact and location links" />
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<Field label="Website" name="website" value={form.website || ''} onChange={handleChange} />
					<Field label="Instagram" name="instagram" value={form.instagram || ''} onChange={handleChange} />
					<Field label="WhatsApp" name="whatsapp" value={form.whatsapp || ''} onChange={handleChange} />
					<Field label="Google Maps Link" name="google_maps_link" value={form.google_maps_link || ''} onChange={handleChange} />
					<Field label="Last Checked" name="last_checked" type="date" value={form.last_checked || ''} onChange={handleChange} />
				</div>
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-4">
				<SectionTitle number="3" tone="amber" title="Context notes" />
				<div className="grid gap-4 lg:grid-cols-2">
					<Field label="Description" name="description" value={form.description || ''} onChange={handleChange} textarea />
					<Field label="Notes" name="notes" value={form.notes || ''} onChange={handleChange} textarea />
				</div>
			</section>

			<div className="formActions">
				<button className="primary" type="submit">{initialRecord ? 'Update Venue' : 'Add Venue'}</button>
				{initialRecord && <button type="button" onClick={onCancel}>Cancel Edit</button>}
			</div>
		</form>
	)
}

function SectionTitle({ number, tone, title }) {
	const toneClass = {
		indigo: 'bg-indigo-100 text-indigo-700',
		sky: 'bg-sky-100 text-sky-700',
		amber: 'bg-amber-100 text-amber-700',
	}[tone]

	return (
		<div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
			<span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${toneClass}`}>{number}</span>
			{title}
		</div>
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
