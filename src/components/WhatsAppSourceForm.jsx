import { useEffect, useState } from 'react'
import { compactPayload } from '../lib/helpers'

const emptySource = {
	group_name: '',
	category: '',
	area: '',
	link: '',
	admin_contact: '',
	purpose: '',
	check_frequency: '',
	notes: '',
	last_checked: '',
}

export default function WhatsAppSourceForm({ initialRecord, onSubmit, onCancel }) {
	const [form, setForm] = useState(emptySource)

	useEffect(() => setForm({ ...emptySource, ...(initialRecord || {}) }), [initialRecord])

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
				<Field label="Group Name" name="group_name" value={form.group_name} onChange={handleChange} required />
				<Field label="Category" name="category" value={form.category || ''} onChange={handleChange} />
				<Field label="Area" name="area" value={form.area || ''} onChange={handleChange} />
				<Field label="Link" name="link" value={form.link || ''} onChange={handleChange} />
				<Field label="Admin Contact" name="admin_contact" value={form.admin_contact || ''} onChange={handleChange} />
				<Field label="Purpose" name="purpose" value={form.purpose || ''} onChange={handleChange} />
				<Field label="Check Frequency" name="check_frequency" value={form.check_frequency || ''} onChange={handleChange} />
				<Field label="Last Checked" name="last_checked" type="date" value={form.last_checked || ''} onChange={handleChange} />
			</div>
			<Field label="Notes" name="notes" value={form.notes || ''} onChange={handleChange} textarea />
			<div className="actionRow">
				<button className="primary" type="submit">{initialRecord ? 'Update Source' : 'Add Source'}</button>
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
