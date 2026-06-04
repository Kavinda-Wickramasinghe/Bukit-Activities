export default function StatCard({ label, value, hint }) {
	return (
		<div className="statCard">
			<p>{label}</p>
			<strong>{value}</strong>
			{hint && <span>{hint}</span>}
		</div>
	)
}
