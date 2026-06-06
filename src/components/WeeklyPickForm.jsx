import { useEffect, useState } from 'react'
import ExternalLink from './ExternalLink'
import { compactPayload, display, formatDateTime, pickTypes } from '../lib/helpers'

const emptyPick = {
	week_start_date: '',
	pick_type: 'fitness',
	activity_id: '',
	custom_title: '',
	reason: '',
}

export default function WeeklyPickForm({ initialRecord, activities, onSubmit, onCancel }) {
	const [form, setForm] = useState(emptyPick)

	useEffect(() => setForm({ ...emptyPick, ...(initialRecord || {}) }), [initialRecord])

	function handleChange(event) {
		setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
	}

	function handleSubmit(event) {
		event.preventDefault()
		onSubmit(compactPayload({ ...form, activity_id: form.activity_id || null }))
	}

	const selectedActivity = activities.find((activity) => String(activity.id) === String(form.activity_id))

	return (
		<form className="space-y-5" onSubmit={handleSubmit}>
			<section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
				<SectionTitle number="1" tone="violet" title="Pick setup" />
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<Field label="Week Start Date" name="week_start_date" type="date" value={form.week_start_date || ''} onChange={handleChange} required />
					<div className="field">
						<label htmlFor="pick_type">Pick Type</label>
						<select id="pick_type" name="pick_type" value={form.pick_type} onChange={handleChange}>
							{pickTypes.map((type) => <option key={type} value={type}>{type}</option>)}
						</select>
					</div>
					<div className="field xl:col-span-2">
						<label htmlFor="activity_id">Activity</label>
						<select id="activity_id" name="activity_id" value={form.activity_id || ''} onChange={handleChange}>
							<option value="">Custom pick only</option>
							{activities.map((activity) => (
								<option key={activity.id} value={activity.id}>
									{activity.title} · {formatDateTime(activity.activity_date, activity.start_time)}
								</option>
							))}
						</select>
					</div>
				</div>
			</section>

			{selectedActivity && (
				<section className="rounded-2xl border border-slate-200 bg-white p-4">
					<SectionTitle number="2" tone="sky" title="Linked activity preview" />
					<ActivityPreview activity={selectedActivity} />
				</section>
			)}

			<section className="rounded-2xl border border-slate-200 bg-white p-4">
				<SectionTitle number={selectedActivity ? '3' : '2'} tone="amber" title="Pick copy" />
				<div className="grid gap-4 lg:grid-cols-2">
				<Field label="Custom Title" name="custom_title" value={form.custom_title || ''} onChange={handleChange} />
					<Field label="Reason" name="reason" value={form.reason || ''} onChange={handleChange} textarea />
				</div>
			</section>

			<div className="formActions">
				<button className="primary" type="submit">{initialRecord ? 'Update Pick' : 'Add Pick'}</button>
				{initialRecord && <button type="button" onClick={onCancel}>Cancel Edit</button>}
			</div>
		</form>
	)
}

function SectionTitle({ number, tone, title }) {
	const toneClass = {
		violet: 'bg-violet-100 text-violet-700',
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

function ActivityPreview({ activity }) {
	const venueArea = activity.venue_area || activity.area
	const venueCategory = activity.venue_category || activity.category

	return (
		<div className="venuePreview">
			<div>
				<strong>{display(activity.title)}</strong>
				<span>{formatDateTime(activity.activity_date, activity.start_time)}</span>
			</div>
			<p className="venueNotes">{display(activity.venue_name)} · {display(venueArea)} · {display(venueCategory)}</p>
			<div className="venuePreviewGrid">
				<p><b>Booking</b><ExternalLink href={activity.booking_link || activity.source_link}>Open</ExternalLink></p>
				<p><b>Website</b><ExternalLink href={activity.venue_website}>Open</ExternalLink></p>
				<p><b>Instagram</b><ExternalLink href={activity.venue_instagram}>Open</ExternalLink></p>
				<p><b>WhatsApp</b><ExternalLink href={activity.venue_whatsapp}>Open</ExternalLink></p>
				<p><b>Maps</b><ExternalLink href={activity.venue_google_maps_link}>Open</ExternalLink></p>
			</div>
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
