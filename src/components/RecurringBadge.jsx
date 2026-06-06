export default function RecurringBadge({ activity }) {
	if (!activity?.is_recurring) return <span className="text-slate-400">-</span>

	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-extrabold text-indigo-700 ring-1 ring-indigo-100">
			<span aria-hidden="true">↻</span>
			{activity.recurring_schedule || 'Recurring'}
		</span>
	)
}
