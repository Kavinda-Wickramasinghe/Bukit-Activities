import { quickFilters } from '../lib/helpers'

const filterIcons = {
	Fitness: '💪',
	Padel: '🎾',
	Social: '🤝',
	Business: '💼',
	Recovery: '🧘',
	'Date-friendly': '✨',
	'Low-energy': '🌙',
	Novelty: '🧭',
}

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
					<span aria-hidden="true">{filterIcons[filter]}</span>
					{filter}
				</button>
			))}
		</div>
	)
}
