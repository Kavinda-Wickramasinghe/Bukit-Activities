export default function AdminTable({ title, count, actions, children }) {
	return (
		<section className="tabSection">
			<div className="tabHeading">
				<div>
					<h2>{title}</h2>
					<p>
						{count} record{count === 1 ? '' : 's'} available to edit or delete
					</p>
				</div>
				{actions}
			</div>
			{children}
		</section>
	)
}
