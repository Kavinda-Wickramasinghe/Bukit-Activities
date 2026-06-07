export async function unwrapQuery(query) {
	const { data, error, count } = await query
	if (error) throw error
	return { data: data || [], count: count || 0 }
}

export async function saveRecord(tableQuery, payload, id) {
	const request = id ? tableQuery.update(payload).eq('id', id) : tableQuery.insert([payload])
	const { error } = await request
	if (error) throw error
}

export async function deleteById(tableQuery, id) {
	const { error } = await tableQuery.delete().eq('id', id)
	if (error) throw error
}
