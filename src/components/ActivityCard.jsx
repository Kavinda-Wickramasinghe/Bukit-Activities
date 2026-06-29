import ExternalLink from './ExternalLink'
import { display, formatDateTime } from '../lib/helpers'
import RecurringBadge from './RecurringBadge'

export default function ActivityCard({ activity, showDate = false, onOpen }) {
	const venueArea = activity.venue_area || activity.area
	const venueCategory = activity.venue_category || activity.category

	return (
		<article className="decisionCard flex min-h-[210px] flex-col">
			<div className="cardTopline">
				<span>{showDate ? formatDateTime(activity.activity_date, activity.start_time) : display(activity.start_time)}</span>
				<span>{display(venueCategory)}</span>
			</div>
			<h3>{display(activity.title)}</h3>
			<dl className="cardFacts">
				<div className="sm:col-span-2">
					<dt>Place:</dt>
					<dd>{display(activity.venue_name)}</dd>
				</div>
				<div>
					<dt>Area:</dt>
					<dd>{display(venueArea)}</dd>
				</div>
				<div>
					<dt>Cost:</dt>
					<dd>{display(activity.cost)}</dd>
				</div>
			</dl>
			{(activity.is_recurring || activity.is_featured || activity.booking_required) && (
				<div className="mt-2 flex flex-wrap gap-2">
					{activity.is_recurring && <RecurringBadge activity={activity} />}
					{activity.is_featured && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-extrabold text-amber-700 ring-1 ring-amber-100">★ Featured</span>}
					{activity.booking_required && <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-[11px] font-extrabold text-sky-700 ring-1 ring-sky-100">Booking Required</span>}
				</div>
			)}
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
