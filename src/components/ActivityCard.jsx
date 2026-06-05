import ExternalLink from './ExternalLink'
import { display, formatDateTime } from '../lib/helpers'

export default function ActivityCard({ activity, showDate = false }) {
	const venueArea = activity.venue_area || activity.area
	const venueCategory = activity.venue_category || activity.category

	return (
		<article className="decisionCard">
			<div className="cardTopline">
				<span>{showDate ? formatDateTime(activity.activity_date, activity.start_time) : display(activity.start_time)}</span>
				<span>{display(venueCategory)}</span>
			</div>
			<h3>{display(activity.title)}</h3>
			<p className="mutedLine">{display(activity.venue_name)} · {display(venueArea)} · {display(activity.cost)}</p>
			{activity.why_jon_might_care && <p>{activity.why_jon_might_care}</p>}
			<div className="actionRow compact">
				<ExternalLink href={activity.booking_link || activity.source_link}>Booking</ExternalLink>
				<ExternalLink href={activity.venue_google_maps_link}>Map</ExternalLink>
			</div>
		</article>
	)
}
