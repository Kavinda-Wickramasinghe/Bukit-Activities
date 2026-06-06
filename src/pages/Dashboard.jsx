import { useEffect, useMemo, useState } from 'react'
import ActivityCard from '../components/ActivityCard'
import QuickFilters from '../components/QuickFilters'
import StatCard from '../components/StatCard'
import { supabase } from '../lib/supabaseClient'
import { addCalendarDays, byDateTime, dateKey, textMatches } from '../lib/helpers'

export default function Dashboard({ setToast }) {
	const [loading, setLoading] = useState(true)
	const [quickFilter, setQuickFilter] = useState('')
	const [today, setToday] = useState([])
	const [week, setWeek] = useState([])
	const [picks, setPicks] = useState([])
	const [stats, setStats] = useState({ today: 0, week: 0, featured: 0, venues: 0, sources: 0 })

	useEffect(() => {
		async function loadDashboard() {
			setLoading(true)
			const todayKey = dateKey()
			const weekEndKey = dateKey(addCalendarDays(new Date(), 7))
			const [todayResult, weekResult, picksResult, featuredResult, venuesResult, sourcesResult] = await Promise.all([
				supabase.from('activities_with_venues').select('*').eq('activity_date', todayKey).order('start_time', { ascending: true }),
				supabase.from('activities_with_venues').select('*').gte('activity_date', todayKey).lte('activity_date', weekEndKey).order('activity_date', { ascending: true }).order('start_time', { ascending: true }),
				supabase.from('weekly_picks').select('*').order('week_start_date', { ascending: false }).limit(8),
				supabase.from('activities').select('id', { count: 'exact', head: true }).eq('is_featured', true),
				supabase.from('venues').select('id', { count: 'exact', head: true }),
				supabase.from('whatsapp_sources').select('id', { count: 'exact', head: true }),
			])
			const error = [todayResult, weekResult, picksResult, featuredResult, venuesResult, sourcesResult].find((result) => result.error)?.error
			if (error) setToast({ type: 'error', text: error.message })
			setToday(todayResult.data || [])
			setWeek(weekResult.data || [])
			setPicks(picksResult.data || [])
			setStats({
				today: todayResult.data?.length || 0,
				week: weekResult.data?.length || 0,
				featured: featuredResult.count || 0,
				venues: venuesResult.count || 0,
				sources: sourcesResult.count || 0,
			})
			setLoading(false)
		}
		loadDashboard()
	}, [setToast])

	const filteredToday = useMemo(() => filterActivities(today, quickFilter).slice(0, 4), [today, quickFilter])
	const filteredWeek = useMemo(() => filterActivities(week, quickFilter).sort(byDateTime).slice(0, 6), [week, quickFilter])

	return (
		<>
			<section className="heroCard">
				<div>
					<p className="heroLabel">Quick Decision Menu</p>
					<h2>🌴 What is worth doing?</h2>
					<p className="heroText">Open this, scan the best options, and pick the next good move without spelunking through chats.</p>
				</div>
			</section>
			<QuickFilters activeFilter={quickFilter} onChange={setQuickFilter} />
			<section className="statsGrid">
				<StatCard label="Today" value={stats.today} hint="options live now" />
				<StatCard label="This Week" value={stats.week} hint="next 7 days" />
				<StatCard label="Featured" value={stats.featured} hint="worth a look" />
				<StatCard label="Venues" value={stats.venues} hint="places tracked" />
				<StatCard label="WhatsApp" value={stats.sources} hint="sources to check" />
			</section>
			<DecisionSection title="☀️ What's Good Today" loading={loading} items={filteredToday} />
			<DecisionSection title="📅 This Week Highlights" loading={loading} items={filteredWeek} showDate />
			<section className="tabSection">
				<div className="tabHeading"><div><h2>⭐ Jon Picks</h2><p>Weekly picks grouped by intent.</p></div></div>
				<div className="decisionGrid">
					{loading ? <p className="emptyState">Loading...</p> : picks.length ? picks.map((pick) => (
						<article className="decisionCard" key={pick.id}>
							<div className="cardTopline"><span>{pick.pick_type}</span><span>{pick.week_start_date}</span></div>
							<h3>{pick.custom_title || 'Linked activity pick'}</h3>
							{pick.reason && <p>{pick.reason}</p>}
						</article>
					)) : <p className="emptyState">No picks yet.</p>}
				</div>
			</section>
		</>
	)
}

function DecisionSection({ title, items, loading, showDate = false }) {
	return (
		<section className="tabSection">
			<div className="tabHeading"><div><h2>{title}</h2><p>Low-friction options first.</p></div></div>
			<div className="decisionGrid">
				{loading ? <p className="emptyState">Loading...</p> : items.length ? items.map((item) => <ActivityCard key={item.id} activity={item} showDate={showDate} />) : <p className="emptyState">Nothing matched yet.</p>}
			</div>
		</section>
	)
}

function filterActivities(items, quickFilter) {
	if (!quickFilter) return items
	return items.filter((item) => textMatches(item, quickFilter, ['title', 'venue_name', 'category', 'area', 'why_jon_might_care', 'description']))
}
