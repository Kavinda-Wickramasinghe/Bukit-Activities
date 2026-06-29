import { useEffect, useMemo, useState } from 'react'
import ActivityCard from '../components/ActivityCard'
import ActivityDetailsModal from '../components/ActivityDetailsModal'
import QuickFilters from '../components/QuickFilters'
import StatCard from '../components/StatCard'
import { notifyError } from '../lib/errors'
import { byDateTime, endOfWeekSunday, formatDate, startOfWeekMonday, textMatches } from '../lib/helpers'
import { getActiveDashboardWeekActivities, getActiveTodayActivities, getFeaturedActivityCount } from '../services/activities'
import { getVenueCount } from '../services/venues'
import { getWhatsAppSourceCount } from '../services/whatsappSources'

export default function Dashboard({ setToast, refreshKey }) {
	const [loading, setLoading] = useState(true)
	const [quickFilter, setQuickFilter] = useState('')
	const [today, setToday] = useState([])
	const [week, setWeek] = useState([])
	const [stats, setStats] = useState({ today: 0, week: 0, featured: 0, venues: 0, sources: 0 })
	const [selectedActivity, setSelectedActivity] = useState(null)

	useEffect(() => {
		async function loadDashboard() {
			setLoading(true)
			try {
				const [todayData, weekData, featuredCount, venuesCount, sourcesCount] = await Promise.all([
					getActiveTodayActivities(),
					getActiveDashboardWeekActivities(),
					getFeaturedActivityCount(),
					getVenueCount(),
					getWhatsAppSourceCount(),
				])
				setToday(todayData)
				setWeek(weekData)
				setStats({
					today: todayData.length,
					week: weekData.length,
					featured: featuredCount,
					venues: venuesCount,
					sources: sourcesCount,
				})
			} catch (error) {
				notifyError(setToast, error, 'Could not load dashboard.')
				setToday([])
				setWeek([])
				setStats({ today: 0, week: 0, featured: 0, venues: 0, sources: 0 })
			} finally {
				setLoading(false)
			}
		}
		loadDashboard()
	}, [setToast, refreshKey])

	const filteredToday = useMemo(() => filterActivities(today, quickFilter).slice(0, 4), [today, quickFilter])
	const filteredWeek = useMemo(() => filterActivities(week, quickFilter).sort(byDateTime).slice(0, 6), [week, quickFilter])
	const weekPeriod = `${formatDate(startOfWeekMonday())} - ${formatDate(endOfWeekSunday())}`

	return (
		<div className="dashboardContent">
			<QuickFilters activeFilter={quickFilter} onChange={setQuickFilter} />
			<section className="statsGrid">
				<StatCard label="Today" value={stats.today} hint="options live now" />
				<StatCard label="This Week" value={stats.week} hint="through Sunday" />
				<StatCard label="Featured" value={stats.featured} hint="worth a look" />
				<StatCard label="Venues" value={stats.venues} hint="places tracked" />
				<StatCard label="WhatsApp" value={stats.sources} hint="sources to check" />
			</section>
			<DecisionSection title="☀️ What's Good Today" loading={loading} items={filteredToday} onOpen={setSelectedActivity} />
			<DecisionSection title="📅 This Week Highlights" subtitle={weekPeriod} loading={loading} items={filteredWeek} showDate onOpen={setSelectedActivity} />
			<ActivityDetailsModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
		</div>
	)
}

function DecisionSection({ title, subtitle = 'Low-friction options first.', items, loading, showDate = false, onOpen }) {
	return (
		<section className="tabSection">
			<div className="tabHeading"><div><h2>{title}</h2><p>{subtitle}</p></div></div>
			<div className="decisionGrid">
				{loading ? <p className="emptyState">Loading...</p> : items.length ? items.map((item) => <ActivityCard key={item.id} activity={item} showDate={showDate} onOpen={onOpen} />) : <p className="emptyState">Nothing matched yet.</p>}
			</div>
		</section>
	)
}

function filterActivities(items, quickFilter) {
	if (!quickFilter) return items
	return items.filter((item) => textMatches(item, quickFilter, ['title', 'venue_name', 'category', 'area', 'why_jon_might_care', 'description']))
}
