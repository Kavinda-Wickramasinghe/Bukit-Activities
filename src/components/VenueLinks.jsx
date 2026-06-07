import ExternalLink from './ExternalLink'

export default function VenueLinks({ row }) {
	return (
		<div className="tableActions">
			<ExternalLink href={row.venue_website}>Web</ExternalLink>
			<ExternalLink href={row.venue_instagram}>IG</ExternalLink>
			<ExternalLink href={row.venue_whatsapp}>WA</ExternalLink>
			<ExternalLink href={row.venue_google_maps_link}>Map</ExternalLink>
		</div>
	)
}
