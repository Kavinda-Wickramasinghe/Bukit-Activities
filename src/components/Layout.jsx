import { useState } from 'react'

const tabs = ['Dashboard', 'Monthly Events', 'This Week', 'Admin']
const quickAreas = ['Uluwatu', 'Ungasan', 'Jimbaran', 'Bingin']

export default function Layout({ activeTab, onTabChange, children }) {
	const [sidebarOpen, setSidebarOpen] = useState(false)

	function selectTab(tab) {
		onTabChange(tab)
		setSidebarOpen(false)
	}

	return (
		<div className={`appShell ${sidebarOpen ? 'sidebarOpen' : ''}`}>
			<div className="backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true" />

			<aside className="sidebar">
				
				<div className="sidebarBody">
					<section className="sidebarSection">
						<p className="sidebarSectionTitle">Workspace</p>
						<nav className="sideNav" aria-label="Bukit Activity OS sections">
							{tabs.map((tab) => (
								<a
									key={tab}
									href={`#${tab.toLowerCase().replace(/\s+/g, '-')}`}
									className={`navTab ${activeTab === tab ? 'active' : ''}`}
									aria-current={activeTab === tab ? 'page' : undefined}
									onClick={(event) => {
										event.preventDefault()
										selectTab(tab)
									}}
								>
									<span>{tab}</span>
								</a>
							))}
						</nav>
					</section>

					<section className="sidebarSection">
						<p className="sidebarSectionTitle">Quick Areas</p>
						<div className="areaList">
							{quickAreas.map((area) => <span key={area}>{area}</span>)}
						</div>
					</section>

					<div className="sidebarSpacer" />

					<section className="sidebarHint">
						<strong>Month view</strong>
						<span>Use Monthly Events to scan the month. Use Admin only when updating data.</span>
					</section>
				</div>
			</aside>

			<div className="mainColumn">
				<header className="topBar">
					<div className="topBarTitle">
						<button
							type="button"
							className="menuButton"
							aria-label={sidebarOpen ? 'Hide navigation' : 'Show navigation'}
							onClick={() => setSidebarOpen((current) => !current)}
						>
							<span />
							<span />
							<span />
						</button>
						<h1>{activeTab}</h1>
					</div>
				</header>
				<main className="content">{children}</main>
			</div>
		</div>
	)
}
