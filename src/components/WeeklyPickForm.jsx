import { useEffect, useState } from 'react'
import { compactPayload, formatDateTime, pickTypes } from '../lib/helpers'

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

	return (
		<form className="formStack" onSubmit={handleSubmit}>
			<div className="grid">
				<Field label="Week Start Date" name="week_start_date" type="date" value={form.week_start_date || ''} onChange={handleChange} required />
				<div className="field">
					<label htmlFor="pick_type">Pick Type</label>
					<select id="pick_type" name="pick_type" value={form.pick_type} onChange={handleChange}>
						{pickTypes.map((type) => <option key={type} value={type}>{type}</option>)}
					</select>
				</div>
				<div className="field">
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
				<Field label="Custom Title" name="custom_title" value={form.custom_title || ''} onChange={handleChange} />
			</div>
			<Field label="Reason" name="reason" value={form.reason || ''} onChange={handleChange} textarea />
			<div className="actionRow">
				<button className="primary" type="submit">{initialRecord ? 'Update Pick' : 'Add Pick'}</button>
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
