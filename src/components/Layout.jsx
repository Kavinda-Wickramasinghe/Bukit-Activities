import { useState } from 'react'

const tabs = ['Dashboard', 'Today', 'This Week', 'Admin']

export default function Layout({ activeTab, onTabChange, children }) {
	const [sidebarOpen, setSidebarOpen] = useState(false)

	function selectTab(tab) {
		onTabChange(tab)
		setSidebarOpen(false)
	}

	return (
		<div className={`appShell ${sidebarOpen ? 'sidebarOpen' : ''}`}>
			<button
				type="button"
				className={`menuButton ${sidebarOpen ? 'hidden' : ''}`}
				aria-label="Open navigation"
				onClick={() => setSidebarOpen(true)}
			>
				<span />
				<span />
				<span />
			</button>
			<div className="backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
			<aside className="sidebar">
				<button type="button" className="closeButton" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}>×</button>
				<div className="brandBlock">
					<p className="eyebrow">Private Dashboard</p>
					<h1>Bukit Activity OS</h1>
					<p className="brandNote">A fast read on what is worth doing around Uluwatu, Ungasan, Jimbaran, Pecatu, Bingin, and nearby Bukit spots.</p>
				</div>
				<nav className="sideNav" aria-label="Bukit Activity OS sections">
					{tabs.map((tab) => (
						<button key={tab} type="button" className={`navTab ${activeTab === tab ? 'active' : ''}`} onClick={() => selectTab(tab)}>
							{tab}
						</button>
					))}
				</nav>
			</aside>
			<main className="content">{children}</main>
		</div>
	)
}
