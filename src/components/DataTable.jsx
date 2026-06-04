import { display } from '../lib/helpers'

export default function DataTable({ columns, rows, loading, emptyText = 'Nothing here yet.' }) {
	return (
		<div className="tableWrap">
			<table className="dataTable">
				<thead>
					<tr>
						{columns.map((column) => (
							<th key={column.key}>{column.label}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{loading ? (
						<tr>
							<td className="emptyCell" colSpan={columns.length}>Loading...</td>
						</tr>
					) : rows.length ? (
						rows.map((row) => (
							<tr key={row.id || `${row.title}-${row.activity_date}-${row.start_time}`}>
								{columns.map((column) => (
									<td key={column.key}>
										{column.render ? column.render(row) : display(row[column.key])}
									</td>
								))}
							</tr>
						))
					) : (
						<tr>
							<td className="emptyCell" colSpan={columns.length}>{emptyText}</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	)
}
