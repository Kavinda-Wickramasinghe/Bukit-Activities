import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import ExternalLink from '../components/ExternalLink'
import WhatsAppSourceForm from '../components/WhatsAppSourceForm'
import { supabase } from '../lib/supabaseClient'
import { formatDate } from '../lib/helpers'

export default function WhatsAppSources({ setToast }) {
	const [rows, setRows] = useState([])
	const [editing, setEditing] = useState(null)
	const [loading, setLoading] = useState(true)

	async function load() {
		setLoading(true)
		const { data, error } = await supabase.from('whatsapp_sources').select('*').order('group_name', { ascending: true })
		if (error) setToast({ type: 'error', text: error.message })
		setRows(data || [])
		setLoading(false)
	}

	useEffect(() => { load() }, [])

	async function saveSource(payload) {
		const request = editing ? supabase.from('whatsapp_sources').update(payload).eq('id', editing.id) : supabase.from('whatsapp_sources').insert([payload])
		const { error } = await request
		if (error) return setToast({ type: 'error', text: error.message })
		setToast({ type: 'success', text: editing ? 'WhatsApp source updated.' : 'WhatsApp source added.' })
		setEditing(null)
		load()
	}

	async function deleteSource(row) {
		if (!window.confirm(`Delete ${row.group_name}?`)) return
		const { error } = await supabase.from('whatsapp_sources').delete().eq('id', row.id)
		if (error) return setToast({ type: 'error', text: error.message })
		setToast({ type: 'success', text: 'WhatsApp source deleted.' })
		load()
	}

	return (
		<>
			<section className="heroCard"><div><p className="heroLabel">WhatsApp Sources</p><h2>Where the useful signals come from</h2><p className="heroText">Groups, admins, check frequency, and notes for the VA maintenance loop.</p></div></section>
			<section className="formCard"><div className="sectionHeading"><div><h2>{editing ? 'Edit WhatsApp Source' : 'Add WhatsApp Source'}</h2><p>Track where to look and how often to check it.</p></div></div><WhatsAppSourceForm initialRecord={editing} onSubmit={saveSource} onCancel={() => setEditing(null)} /></section>
			<section className="tabSection">
				<div className="tabHeading"><div><h2>Sources</h2><p>{rows.length} tracked</p></div></div>
				<DataTable loading={loading} rows={rows} columns={[
					{ key: 'group_name', label: 'Group Name' },
					{ key: 'category', label: 'Category' },
					{ key: 'area', label: 'Area' },
					{ key: 'link', label: 'Link', render: (row) => <ExternalLink href={row.link}>Open</ExternalLink> },
					{ key: 'purpose', label: 'Purpose' },
					{ key: 'check_frequency', label: 'Check Frequency' },
					{ key: 'notes', label: 'Notes' },
					{ key: 'last_checked', label: 'Last Checked', render: (row) => formatDate(row.last_checked) },
					{ key: 'actions', label: 'Actions', render: (row) => <div className="tableActions"><button type="button" className="tableButton" onClick={() => setEditing(row)}>Edit</button><button type="button" className="tableButton dangerButton" onClick={() => deleteSource(row)}>Delete</button></div> },
				]} />
			</section>
		</>
	)
}
