import ExternalLink from './ExternalLink'
import RecurringBadge from './RecurringBadge'
import { display, formatDate, formatTime } from '../lib/helpers'

export default function ActivityDetailsModal({ activity, onClose }) {
	if (!activity) return null

	const venueArea = activity.venue_area || activity.area
	const venueCategory = activity.venue_category || activity.category

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
			<div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
				<div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Activity Details</p>
						<h2 className="mt-1 text-xl font-bold text-slate-950">{display(activity.title)}</h2>
						<p className="mt-1 text-sm text-slate-500">{display(activity.venue_name)} · {display(venueArea)}</p>
					</div>
					<button type="button" className="rounded-lg px-2.5 py-1.5 text-slate-500 ring-0 hover:bg-slate-100 hover:text-slate-900" onClick={onClose} aria-label="Close details">
						×
					</button>
				</div>

				<div className="space-y-5 px-5 py-5">
					<Section title="Overview">
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<Detail label="Date" value={formatDate(activity.activity_date)} />
							<Detail label="Start" value={formatTime(activity.start_time)} />
							<Detail label="End" value={formatTime(activity.end_time)} />
							<Detail label="Cost" value={display(activity.cost)} />
							<Detail label="Activity Category" value={display(activity.category)} />
							<Detail label="Status" value={display(activity.status)} />
							<div className="min-w-0">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Repeats</p>
								<div className="mt-1"><RecurringBadge activity={activity} /></div>
							</div>
							<Detail label="Recurring Schedule" value={display(activity.recurring_schedule)} />
						</div>
					</Section>

					<Section title="Venue">
						<div className="grid gap-4 sm:grid-cols-3">
							<Detail label="Name" value={display(activity.venue_name)} />
							<Detail label="Area" value={display(venueArea)} />
							<Detail label="Category" value={display(venueCategory)} />
						</div>
					</Section>

					<Section title="Why Jon Might Care">
						<p className="text-sm leading-7 text-slate-700">{display(activity.why_jon_might_care)}</p>
					</Section>

					<Section title="Description">
						<p className="text-sm leading-7 text-slate-700">{display(activity.description)}</p>
					</Section>

					<Section title="Links">
						<div className="flex flex-wrap items-center gap-x-5 gap-y-2">
							<ExternalLink href={activity.booking_link || activity.source_link}>Booking</ExternalLink>
							<ExternalLink href={activity.source_link}>Source</ExternalLink>
							<ExternalLink href={activity.venue_website}>Web</ExternalLink>
							<ExternalLink href={activity.venue_instagram}>IG</ExternalLink>
							<ExternalLink href={activity.venue_whatsapp}>WA</ExternalLink>
							<ExternalLink href={activity.venue_google_maps_link}>Map</ExternalLink>
						</div>
					</Section>

					<Section title="Admin Details">
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<Detail label="Booking Required" value={activity.booking_required ? 'Yes' : 'No'} />
							<Detail label="Featured" value={activity.is_featured ? 'Yes' : 'No'} />
							<Detail label="Last Checked" value={formatDate(activity.last_checked)} />
							<Detail label="Activity Area" value={display(activity.area)} />
						</div>
					</Section>
				</div>
			</div>
		</div>
	)
}

function Detail({ label, value }) {
	return (
		<div className="min-w-0">
			<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
			<p className="mt-1 break-words text-sm font-medium text-slate-800">{value}</p>
		</div>
	)
}

function Section({ title, children }) {
	return (
		<section className="rounded-2xl border border-slate-200 bg-white p-4">
			<h3 className="mb-3 text-sm font-bold text-slate-950">{title}</h3>
			<div>{children}</div>
		</section>
	)
}
