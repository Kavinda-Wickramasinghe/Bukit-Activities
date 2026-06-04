import { normalizeUrl } from '../lib/helpers'

export default function ExternalLink({ href, children }) {
	const normalized = normalizeUrl(href)
	if (!normalized) return <span>-</span>
	return (
		<a className="tableLink" href={normalized} target="_blank" rel="noreferrer">
			{children || 'Open'}
		</a>
	)
}
