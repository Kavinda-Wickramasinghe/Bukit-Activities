import { useEffect, useState } from 'react'
import { compactPayload } from '../lib/helpers'
import VenueSelect from './VenueSelect'

const emptyActivity = {
	title: '',
	venue_id: '',
	category: '',
	area: '',
	description: '',
	activity_date: '',
	start_time: '',
	end_time: '',
	is_recurring: false,
	recurring_schedule: '',
	cost: '',
	booking_required: false,
	booking_link: '',
	source_link: '',
	why_jon_might_care: '',
	status: 'active',
	is_featured: false,
	last_checked: '',
}

const activityFields = Object.keys(emptyActivity)

export default function ActivityForm({ initialRecord, onSubmit, onCancel }) {
	const [form, setForm] = useState(emptyActivity)

	useEffect(() => {
		setForm({ ...emptyActivity, ...(initialRecord || {}) })
	}, [initialRecord])

	function handleChange(event) {
		const { name, value, type, checked } = event.target
		setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
	}

	function handleVenueChange(venue) {
		setForm((current) => ({
			...current,
			venue_id: venue?.id || '',
			area: venue?.area || '',
			category: venue?.category || '',
		}))
	}

	function handleSubmit(event) {
		event.preventDefault()
		const payload = Object.fromEntries(activityFields.map((field) => [field, form[field]]))
		onSubmit(compactPayload({ ...payload, venue_id: form.venue_id || null }))
	}

	return (
		<form className="space-y-5" onSubmit={handleSubmit}>
			<section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
				<div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
					<span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">1</span>
					Core details
				</div>
				<div className="grid gap-4 lg:grid-cols-2">
					<Field label="Title" name="title" value={form.title} onChange={handleChange} required />
					<VenueSelect value={form.venue_id} onChange={handleVenueChange} />
				</div>
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-4">
				<div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
					<span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">2</span>
					Classify and schedule
				</div>
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<Field label="Category" name="category" value={form.category} onChange={handleChange} />
					<Field label="Area" name="area" value={form.area} onChange={handleChange} />
					<Field label="Date" name="activity_date" type="date" value={form.activity_date || ''} onChange={handleChange} />
					<Field label="Start Time" name="start_time" type="time" value={form.start_time || ''} onChange={handleChange} />
					<Field label="End Time" name="end_time" type="time" value={form.end_time || ''} onChange={handleChange} />
					<Field
						label="Recurring Schedule"
						name="recurring_schedule"
						value={form.recurring_schedule || ''}
						onChange={handleChange}
						list="recurring-schedule-options"
						placeholder="Daily, Weekly, Monthly..."
					/>
					<Field label="Cost" name="cost" value={form.cost || ''} onChange={handleChange} />
					<div className="field">
						<label htmlFor="status">Status</label>
						<select id="status" name="status" value={form.status || 'active'} onChange={handleChange}>
							<option value="active">active</option>
							<option value="archived">archived</option>
							<option value="cancelled">cancelled</option>
						</select>
					</div>
				</div>
			</section>

			<datalist id="recurring-schedule-options">
				<option value="Daily" />
				<option value="Weekly" />
				<option value="Biweekly" />
				<option value="Monthly" />
				<option value="Yearly" />
				<option value="Every 2 weeks" />
				<option value="Every 3 months" />
			</datalist>

			<section className="rounded-2xl border border-slate-200 bg-white p-4">
				<div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
					<span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">3</span>
					Links and notes
				</div>
				<div className="grid gap-4 lg:grid-cols-2">
					<Field label="Booking Link" name="booking_link" value={form.booking_link || ''} onChange={handleChange} />
					<Field label="Source Link" name="source_link" value={form.source_link || ''} onChange={handleChange} />
					<Field label="Description" name="description" value={form.description || ''} onChange={handleChange} textarea />
					<Field label="Why Jon Might Care" name="why_jon_might_care" value={form.why_jon_might_care || ''} onChange={handleChange} textarea />
					<Field label="Last Checked" name="last_checked" type="date" value={form.last_checked || ''} onChange={handleChange} />
				</div>
			</section>

			<section className="rounded-2xl border border-slate-200 bg-indigo-50/60 p-4">
				<div className="checkRow">
					<label><input type="checkbox" name="is_recurring" checked={Boolean(form.is_recurring)} onChange={handleChange} /> Recurring</label>
					<label><input type="checkbox" name="booking_required" checked={Boolean(form.booking_required)} onChange={handleChange} /> Booking Required</label>
					<label><input type="checkbox" name="is_featured" checked={Boolean(form.is_featured)} onChange={handleChange} /> Featured</label>
				</div>
			</section>

			<div className="actionRow !mt-0">
				<button className="primary" type="submit">{initialRecord ? 'Update Activity' : 'Add Activity'}</button>
				{initialRecord && <button type="button" onClick={onCancel}>Cancel Edit</button>}
			</div>
		</form>
	)
}

function Field({ label, name, value, onChange, type = 'text', textarea = false, required = false, list, placeholder }) {
	return (
		<div className="field">
			<label htmlFor={name}>{label}</label>
			{textarea ? (
				<textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder || label} />
			) : (
				<input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder || label} required={required} list={list} />
			)}
		</div>
	)
}
