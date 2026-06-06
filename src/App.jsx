import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Toast from './components/Toast'
import { hasSupabaseKeys } from './lib/supabaseClient'
import { rolloverRecurringActivities } from './lib/recurring'
import { getErrorMessage } from './lib/errors'
import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import ThisWeek from './pages/ThisWeek'
import Today from './pages/Today'

export default function App() {
	const [activeTab, setActiveTab] = useState('Dashboard')
	const [toast, setToast] = useState(null)
	const [refreshKey, setRefreshKey] = useState(0)

	useEffect(() => {
		if (!toast) return undefined
		const timeout = window.setTimeout(() => setToast(null), 4200)
		return () => window.clearTimeout(timeout)
	}, [toast])

	useEffect(() => {
		if (!hasSupabaseKeys) {
			setToast({ type: 'error', text: 'Supabase keys missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.' })
			return
		}

		async function updateRecurringActivities() {
			try {
				const result = await rolloverRecurringActivities()
				if (result.updated > 0) {
					setToast({ type: 'success', text: `Updated ${result.updated} recurring activit${result.updated === 1 ? 'y' : 'ies'} to the next date.` })
					setRefreshKey((current) => current + 1)
				}
			} catch (error) {
				setToast({ type: 'error', text: getErrorMessage(error, 'Could not update recurring activities.') })
			}
		}

		updateRecurringActivities()
	}, [])

	function renderPage() {
		if (!hasSupabaseKeys) {
			return (
				<section className="heroCard">
					<div>
						<p className="heroLabel">Supabase Setup</p>
						<h2>Add your private app keys</h2>
						<p className="heroText">
							Create a `.env` file at the project root with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then restart `npm run dev`.
						</p>
					</div>
				</section>
			)
		}

		const props = { setToast, refreshKey }
		switch (activeTab) {
			case 'Today':
				return <Today {...props} />
			case 'This Week':
				return <ThisWeek {...props} />
			case 'Admin':
				return <Admin {...props} />
			case 'Dashboard':
			default:
				return <Dashboard {...props} />
		}
	}

	return (
		<Layout activeTab={activeTab} onTabChange={setActiveTab}>
			<Toast message={toast} />
			{renderPage()}
		</Layout>
	)
}
