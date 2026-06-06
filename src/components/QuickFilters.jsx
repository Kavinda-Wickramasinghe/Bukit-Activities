import { quickFilters } from '../lib/helpers'

export default function QuickFilters({ activeFilter, onChange }) {
	return (
		<div className="quickFilters" aria-label="Quick filters">
			{quickFilters.map((filter) => (
				<button
					key={filter}
					type="button"
					className={activeFilter === filter ? 'active' : ''}
					onClick={() => onChange(activeFilter === filter ? '' : filter)}
				>
					{filter}
				</button>
			))}
		</div>
	)
}
