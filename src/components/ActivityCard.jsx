import ExternalLink from './ExternalLink'
import { display, formatDateTime } from '../lib/helpers'
import RecurringBadge from './RecurringBadge'

export default function ActivityCard({ activity, showDate = false, onOpen }) {
	const venueArea = activity.venue_area || activity.area
	const venueCategory = activity.venue_category || activity.category

	return (
		<article className="decisionCard flex min-h-[230px] flex-col">
			<div className="cardTopline">
				<span>{showDate ? formatDateTime(activity.activity_date, activity.start_time) : display(activity.start_time)}</span>
				<span>{display(venueCategory)}</span>
			</div>
			<h3>{display(activity.title)}</h3>
			<p className="mutedLine">{display(activity.venue_name)} · {display(venueArea)} · {display(activity.cost)}</p>
			{activity.is_recurring && <div className="mt-2"><RecurringBadge activity={activity} /></div>}
			{activity.why_jon_might_care && <p>{activity.why_jon_might_care}</p>}
			<div className="actionRow compact">
				<ExternalLink href={activity.booking_link || activity.source_link}>Booking</ExternalLink>
				<ExternalLink href={activity.venue_google_maps_link}>Map</ExternalLink>
			</div>
			<div className="mt-auto flex justify-end pt-4">
				<button
					type="button"
					className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-0 hover:bg-emerald-500"
					onClick={() => onOpen?.(activity)}
				>
					Open
				</button>
			</div>
		</article>
	)
}
