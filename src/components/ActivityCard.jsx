import ExternalLink from './ExternalLink'
import { display, formatDateTime } from '../lib/helpers'

export default function ActivityCard({ activity, showDate = false }) {
	return (
		<article className="decisionCard">
			<div className="cardTopline">
				<span>{showDate ? formatDateTime(activity.activity_date, activity.start_time) : display(activity.start_time)}</span>
				<span>{display(activity.category)}</span>
			</div>
			<h3>{display(activity.title)}</h3>
			<p className="mutedLine">{display(activity.venue_name)} · {display(activity.area)} · {display(activity.cost)}</p>
			{activity.why_jon_might_care && <p>{activity.why_jon_might_care}</p>}
			<div className="actionRow compact">
				<ExternalLink href={activity.booking_link || activity.source_link}>Booking</ExternalLink>
			</div>
		</article>
	)
}
