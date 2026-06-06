import { useEffect, useMemo, useState } from 'react'
import ActivityForm from '../components/ActivityForm'
import DataTable from '../components/DataTable'
import ExternalLink from '../components/ExternalLink'
import VenueForm from '../components/VenueForm'
import WhatsAppSourceForm from '../components/WhatsAppSourceForm'
import WeeklyPickForm from '../components/WeeklyPickForm'
import RecurringBadge from '../components/RecurringBadge'
import { notifyError } from '../lib/errors'
import { display, formatDate, formatDateTime, formatTime } from '../lib/helpers'
import { supabase } from '../lib/supabaseClient'

const adminTabs = ['Add Activity', 'Add Venue', 'Add WhatsApp Source', 'Add Weekly Pick']

export default function Admin({ setToast, refreshKey }) {
	const [activeForm, setActiveForm] = useState(adminTabs[0])
	const [activities, setActivities] = useState([])
	const [venues, setVenues] = useState([])
	const [sources, setSources] = useState([])
	const [picks, setPicks] = useState([])
	const [editing, setEditing] = useState(null)
	const [loading, setLoading] = useState(true)
	const [formVersion, setFormVersion] = useState(0)

	async function loadAdminData() {
		setLoading(true)
		try {
			const [activitiesResult, venuesResult, sourcesResult, picksResult] = await Promise.all([
				supabase.from('activities_with_venues').select('*').order('activity_date', { ascending: true }).order('start_time', { ascending: true }),
				supabase.from('venues').select('*').order('name', { ascending: true }),
				supabase.from('whatsapp_sources').select('*').order('group_name', { ascending: true }),
				supabase.from('weekly_picks').select('*').order('week_start_date', { ascending: false }),
			])

			const error = [activitiesResult, venuesResult, sourcesResult, picksResult].find((result) => result.error)?.error
			if (error) {
				notifyError(setToast, error, 'Could not load admin data.')
				setActivities([])
				setVenues([])
				setSources([])
				setPicks([])
				return
			}

			setActivities(activitiesResult.data || [])
			setVenues(venuesResult.data || [])
			setSources(sourcesResult.data || [])
			setPicks(picksResult.data || [])
		} catch (error) {
			notifyError(setToast, error, 'Could not load admin data.')
			setActivities([])
			setVenues([])
			setSources([])
			setPicks([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { loadAdminData() }, [refreshKey])

	const activityById = useMemo(() => Object.fromEntries(activities.map((activity) => [activity.id, activity])), [activities])

	function changeForm(tab) {
		setActiveForm(tab)
		setEditing(null)
		setFormVersion((current) => current + 1)
	}

	async function saveRecord(table, payload, label) {
		try {
			const request = editing
				? supabase.from(table).update(payload).eq('id', editing.id)
				: supabase.from(table).insert([payload])

			const { error } = await request
			if (error) return notifyError(setToast, error, `Could not save ${label.toLowerCase()}.`)

			setToast({ type: 'success', text: editing ? `${label} updated.` : `${label} added.` })
			setEditing(null)
			setFormVersion((current) => current + 1)
			await loadAdminData()
		} catch (error) {
			notifyError(setToast, error, `Could not save ${label.toLowerCase()}.`)
		}
	}

	async function deleteRecord(table, row, label, name) {
		if (!window.confirm(`Delete ${name || label}?`)) return
		try {
			const { error } = await supabase.from(table).delete().eq('id', row.id)
			if (error) return notifyError(setToast, error, `Could not delete ${label.toLowerCase()}.`)

			setToast({ type: 'success', text: `${label} deleted.` })
			if (editing?.id === row.id) {
				setEditing(null)
				setFormVersion((current) => current + 1)
			}
			await loadAdminData()
		} catch (error) {
			notifyError(setToast, error, `Could not delete ${label.toLowerCase()}.`)
		}
	}

	function startEdit(row) {
		setEditing(row)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	return (
		<>
			<section className="heroCard">
				<div>
					<p className="heroLabel">Admin</p>
					<h2>⚙️ Admin maintenance desk</h2>
					<p className="heroText">Add, edit, and clean up records from one focused workspace.</p>
				</div>
			</section>

			<section className="formCard">
				<div className="sectionHeading">
					<div>
						<h2>{editing ? activeForm.replace('Add', 'Edit') : activeForm}</h2>
						<p>{editing ? 'Update the selected record, or cancel to add a new one.' : 'Add the thing, then review the existing rows below.'}</p>
					</div>
					{editing && <button type="button" onClick={() => { setEditing(null); setFormVersion((current) => current + 1) }}>Cancel Edit</button>}
				</div>

				<div className="innerTabs">
					{adminTabs.map((tab) => (
						<button key={tab} type="button" className={activeForm === tab ? 'active' : ''} onClick={() => changeForm(tab)}>
							{tab}
						</button>
					))}
				</div>

				{activeForm === 'Add Activity' && (
					<ActivityForm
						key={`activity-${formVersion}`}
						initialRecord={editing}
						onSubmit={(payload) => saveRecord('activities', payload, 'Activity')}
						onCancel={() => { setEditing(null); setFormVersion((current) => current + 1) }}
					/>
				)}
				{activeForm === 'Add Venue' && (
					<VenueForm
						key={`venue-${formVersion}`}
						initialRecord={editing}
						onSubmit={(payload) => saveRecord('venues', payload, 'Venue')}
						onCancel={() => { setEditing(null); setFormVersion((current) => current + 1) }}
					/>
				)}
				{activeForm === 'Add WhatsApp Source' && (
					<WhatsAppSourceForm
						key={`source-${formVersion}`}
						initialRecord={editing}
						onSubmit={(payload) => saveRecord('whatsapp_sources', payload, 'WhatsApp source')}
						onCancel={() => { setEditing(null); setFormVersion((current) => current + 1) }}
					/>
				)}
				{activeForm === 'Add Weekly Pick' && (
					<WeeklyPickForm
						key={`pick-${formVersion}`}
						initialRecord={editing}
						activities={activities}
						onSubmit={(payload) => saveRecord('weekly_picks', payload, 'Weekly pick')}
						onCancel={() => { setEditing(null); setFormVersion((current) => current + 1) }}
					/>
				)}
			</section>

			{activeForm === 'Add Activity' && (
				<AdminTable title="Available Activities" count={activities.length}>
					<DataTable loading={loading} rows={activities} emptyText="No activities yet." columns={[
						{ key: 'title', label: 'Title' },
						{ key: 'venue_name', label: 'Venue' },
						{ key: 'venue_area', label: 'Venue Area', render: (row) => display(row.venue_area || row.area) },
						{ key: 'venue_category', label: 'Venue Category', render: (row) => display(row.venue_category || row.category) },
						{ key: 'activity_date', label: 'Date', render: (row) => formatDate(row.activity_date) },
						{ key: 'start_time', label: 'Time', render: (row) => formatTime(row.start_time) },
						{ key: 'is_recurring', label: 'Repeats', render: (row) => <RecurringBadge activity={row} /> },
						{ key: 'cost', label: 'Cost' },
						{ key: 'status', label: 'Status' },
						{ key: 'why_jon_might_care', label: 'Why Jon Might Care' },
						{ key: 'booking_link', label: 'Booking', render: (row) => <ExternalLink href={row.booking_link || row.source_link}>Open</ExternalLink> },
						{ key: 'venue_links', label: 'Venue Links', render: (row) => <VenueLinks row={row} /> },
						{ key: 'actions', label: 'Actions', render: (row) => (
							<div className="tableActions">
								<button type="button" className="tableButton" onClick={() => startEdit(row)}>Edit</button>
								<button type="button" className="tableButton dangerButton" onClick={() => deleteRecord('activities', row, 'Activity', row.title)}>Delete</button>
							</div>
						) },
					]} />
				</AdminTable>
			)}

			{activeForm === 'Add Venue' && (
				<AdminTable title="Available Venues" count={venues.length}>
					<DataTable loading={loading} rows={venues} emptyText="No venues yet." columns={[
						{ key: 'name', label: 'Name' },
						{ key: 'area', label: 'Area' },
						{ key: 'category', label: 'Category' },
						{ key: 'website', label: 'Website', render: (row) => <ExternalLink href={row.website}>Website</ExternalLink> },
						{ key: 'instagram', label: 'Instagram', render: (row) => <ExternalLink href={row.instagram}>Instagram</ExternalLink> },
						{ key: 'whatsapp', label: 'WhatsApp', render: (row) => <ExternalLink href={row.whatsapp}>WhatsApp</ExternalLink> },
						{ key: 'google_maps_link', label: 'Maps', render: (row) => <ExternalLink href={row.google_maps_link}>Map</ExternalLink> },
						{ key: 'notes', label: 'Notes' },
						{ key: 'last_checked', label: 'Last Checked', render: (row) => formatDate(row.last_checked) },
						{ key: 'actions', label: 'Actions', render: (row) => (
							<div className="tableActions">
								<button type="button" className="tableButton" onClick={() => startEdit(row)}>Edit</button>
								<button type="button" className="tableButton dangerButton" onClick={() => deleteRecord('venues', row, 'Venue', row.name)}>Delete</button>
							</div>
						) },
					]} />
				</AdminTable>
			)}

			{activeForm === 'Add WhatsApp Source' && (
				<AdminTable title="Available WhatsApp Sources" count={sources.length}>
					<DataTable loading={loading} rows={sources} emptyText="No WhatsApp sources yet." columns={[
						{ key: 'group_name', label: 'Group Name' },
						{ key: 'category', label: 'Category' },
						{ key: 'area', label: 'Area' },
						{ key: 'link', label: 'Link', render: (row) => <ExternalLink href={row.link}>Open</ExternalLink> },
						{ key: 'purpose', label: 'Purpose' },
						{ key: 'check_frequency', label: 'Check Frequency' },
						{ key: 'notes', label: 'Notes' },
						{ key: 'last_checked', label: 'Last Checked', render: (row) => formatDate(row.last_checked) },
						{ key: 'actions', label: 'Actions', render: (row) => (
							<div className="tableActions">
								<button type="button" className="tableButton" onClick={() => startEdit(row)}>Edit</button>
								<button type="button" className="tableButton dangerButton" onClick={() => deleteRecord('whatsapp_sources', row, 'WhatsApp source', row.group_name)}>Delete</button>
							</div>
						) },
					]} />
				</AdminTable>
			)}

			{activeForm === 'Add Weekly Pick' && (
				<AdminTable title="Available Weekly Picks" count={picks.length}>
					<DataTable loading={loading} rows={picks} emptyText="No weekly picks yet." columns={[
						{ key: 'week_start_date', label: 'Week', render: (row) => formatDate(row.week_start_date) },
						{ key: 'pick_type', label: 'Type' },
						{ key: 'title', label: 'Title', render: (row) => display(row.custom_title || activityById[row.activity_id]?.title) },
						{ key: 'venue', label: 'Venue', render: (row) => display(activityById[row.activity_id]?.venue_name) },
						{ key: 'activity', label: 'Activity Time', render: (row) => {
							const activity = activityById[row.activity_id]
							return activity ? formatDateTime(activity.activity_date, activity.start_time) : '-'
						} },
						{ key: 'reason', label: 'Reason' },
						{ key: 'actions', label: 'Actions', render: (row) => {
							const activity = activityById[row.activity_id]
							return (
								<div className="tableActions">
									<ExternalLink href={activity?.booking_link || activity?.source_link}>Open</ExternalLink>
									<button type="button" className="tableButton" onClick={() => startEdit(row)}>Edit</button>
									<button type="button" className="tableButton dangerButton" onClick={() => deleteRecord('weekly_picks', row, 'Weekly pick', row.custom_title || row.pick_type)}>Delete</button>
								</div>
							)
						} },
					]} />
				</AdminTable>
			)}
		</>
	)
}

function VenueLinks({ row }) {
	return (
		<div className="tableActions">
			<ExternalLink href={row.venue_website}>Web</ExternalLink>
			<ExternalLink href={row.venue_instagram}>IG</ExternalLink>
			<ExternalLink href={row.venue_whatsapp}>WA</ExternalLink>
			<ExternalLink href={row.venue_google_maps_link}>Map</ExternalLink>
		</div>
	)
}

function AdminTable({ title, count, children }) {
	return (
		<section className="tabSection">
			<div className="tabHeading">
				<div>
					<h2>{title}</h2>
					<p>{count} record{count === 1 ? '' : 's'} available to edit or delete</p>
				</div>
			</div>
			{children}
		</section>
	)
}
