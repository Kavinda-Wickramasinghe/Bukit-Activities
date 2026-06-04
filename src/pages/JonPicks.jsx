import { useEffect, useMemo, useState } from 'react'
import ExternalLink from '../components/ExternalLink'
import WeeklyPickForm from '../components/WeeklyPickForm'
import { supabase } from '../lib/supabaseClient'
import { display, formatDateTime, groupBy, pickTypes } from '../lib/helpers'

export default function JonPicks({ setToast }) {
	const [picks, setPicks] = useState([])
	const [activities, setActivities] = useState([])
	const [editing, setEditing] = useState(null)
	const [loading, setLoading] = useState(true)

	async function load() {
		setLoading(true)
		const [picksResult, activitiesResult] = await Promise.all([
			supabase.from('weekly_picks').select('*').order('week_start_date', { ascending: false }),
			supabase.from('activities_with_venues').select('*').order('activity_date', { ascending: true }),
		])
		const error = picksResult.error || activitiesResult.error
		if (error) setToast({ type: 'error', text: error.message })
		setPicks(picksResult.data || [])
		setActivities(activitiesResult.data || [])
		setLoading(false)
	}

	useEffect(() => { load() }, [])

	const activityById = useMemo(() => Object.fromEntries(activities.map((activity) => [activity.id, activity])), [activities])
	const enriched = picks.map((pick) => ({ ...pick, activity: activityById[pick.activity_id] }))
	const grouped = groupBy(enriched, 'pick_type')

	async function savePick(payload) {
		const request = editing
			? supabase.from('weekly_picks').update(payload).eq('id', editing.id)
			: supabase.from('weekly_picks').insert([payload])
		const { error } = await request
		if (error) return setToast({ type: 'error', text: error.message })
		setToast({ type: 'success', text: editing ? 'Weekly pick updated.' : 'Weekly pick added.' })
		setEditing(null)
		load()
	}

	async function deletePick(pick) {
		if (!window.confirm(`Delete ${pick.custom_title || pick.pick_type} pick?`)) return
		const { error } = await supabase.from('weekly_picks').delete().eq('id', pick.id)
		if (error) return setToast({ type: 'error', text: error.message })
		setToast({ type: 'success', text: 'Weekly pick deleted.' })
		load()
	}

	return (
		<>
			<section className="heroCard"><div><p className="heroLabel">Jon Picks</p><h2>Curated reasons to leave the house</h2><p className="heroText">Fitness, social, business, novelty, recovery, padel, and the occasional useful stretch.</p></div></section>
			<section className="formCard">
				<div className="sectionHeading"><div><h2>{editing ? 'Edit Weekly Pick' : 'Add Weekly Pick'}</h2><p>Keep the picks opinionated and easy to scan.</p></div></div>
				<WeeklyPickForm initialRecord={editing} activities={activities} onSubmit={savePick} onCancel={() => setEditing(null)} />
			</section>
			{loading ? <p className="emptyState">Loading...</p> : pickTypes.map((type) => (
				<section className="tabSection" key={type}>
					<div className="tabHeading"><div><h2>{type}</h2><p>{grouped[type]?.length || 0} pick{grouped[type]?.length === 1 ? '' : 's'}</p></div></div>
					<div className="decisionGrid">
						{grouped[type]?.length ? grouped[type].map((pick) => <PickCard key={pick.id} pick={pick} onEdit={setEditing} onDelete={deletePick} />) : <p className="emptyState">No {type} pick yet.</p>}
					</div>
				</section>
			))}
		</>
	)
}

function PickCard({ pick, onEdit, onDelete }) {
	const activity = pick.activity
	return (
		<article className="decisionCard">
			<div className="cardTopline"><span>{pick.pick_type}</span><span>{pick.week_start_date}</span></div>
			<h3>{pick.custom_title || activity?.title || 'Untitled pick'}</h3>
			{activity && <p className="mutedLine">{display(activity.venue_name)} · {formatDateTime(activity.activity_date, activity.start_time)}</p>}
			{pick.reason && <p>{pick.reason}</p>}
			<div className="tableActions">
				<ExternalLink href={activity?.booking_link || activity?.source_link}>Open</ExternalLink>
				<button type="button" className="tableButton" onClick={() => onEdit(pick)}>Edit</button>
				<button type="button" className="tableButton dangerButton" onClick={() => onDelete(pick)}>Delete</button>
			</div>
		</article>
	)
}
