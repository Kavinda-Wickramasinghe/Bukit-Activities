import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Toast from './components/Toast'
import { hasSupabaseKeys } from './lib/supabaseClient'
import Activities from './pages/Activities'
import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import JonPicks from './pages/JonPicks'
import ThisWeek from './pages/ThisWeek'
import Today from './pages/Today'
import Venues from './pages/Venues'
import WhatsAppSources from './pages/WhatsAppSources'

export default function App() {
	const [activeTab, setActiveTab] = useState('Dashboard')
	const [toast, setToast] = useState(null)

	useEffect(() => {
		if (!toast) return undefined
		const timeout = window.setTimeout(() => setToast(null), 4200)
		return () => window.clearTimeout(timeout)
	}, [toast])

	useEffect(() => {
		if (!hasSupabaseKeys) {
			setToast({ type: 'error', text: 'Supabase keys missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.' })
		}
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

		const props = { setToast }
		switch (activeTab) {
			case 'Today':
				return <Today {...props} />
			case 'This Week':
				return <ThisWeek {...props} />
			case 'Jon Picks':
				return <JonPicks {...props} />
			case 'Activities':
				return <Activities {...props} />
			case 'Venues':
				return <Venues {...props} />
			case 'WhatsApp Sources':
				return <WhatsAppSources {...props} />
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
