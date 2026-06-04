export default function Toast({ message }) {
	if (!message) return null
	return (
		<div className={`toast ${message.type === 'success' ? 'success' : 'error'}`} role="status">
			{message.text}
		</div>
	)
}
