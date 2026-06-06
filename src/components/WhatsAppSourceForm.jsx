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
		<form className="space-y-5" onSubmit={handleSubmit}>
			<section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
				<SectionTitle number="1" tone="emerald" title="Source identity" />
				<div className="grid gap-4 md:grid-cols-3">
					<Field label="Group Name" name="group_name" value={form.group_name} onChange={handleChange} required />
					<Field label="Category" name="category" value={form.category || ''} onChange={handleChange} />
					<Field label="Area" name="area" value={form.area || ''} onChange={handleChange} />
				</div>
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-4">
				<SectionTitle number="2" tone="sky" title="Access and checking" />
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<Field label="Link" name="link" value={form.link || ''} onChange={handleChange} />
					<Field label="Admin Contact" name="admin_contact" value={form.admin_contact || ''} onChange={handleChange} />
					<Field label="Check Frequency" name="check_frequency" value={form.check_frequency || ''} onChange={handleChange} />
					<Field label="Last Checked" name="last_checked" type="date" value={form.last_checked || ''} onChange={handleChange} />
				</div>
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-4">
				<SectionTitle number="3" tone="amber" title="Purpose and notes" />
				<div className="grid gap-4 lg:grid-cols-2">
					<Field label="Purpose" name="purpose" value={form.purpose || ''} onChange={handleChange} />
					<Field label="Notes" name="notes" value={form.notes || ''} onChange={handleChange} textarea />
				</div>
			</section>

			<div className="formActions">
				<button className="primary" type="submit">{initialRecord ? 'Update Source' : 'Add Source'}</button>
				{initialRecord && <button type="button" onClick={onCancel}>Cancel Edit</button>}
			</div>
		</form>
	)
}

function SectionTitle({ number, tone, title }) {
	const toneClass = {
		emerald: 'bg-emerald-100 text-emerald-700',
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
