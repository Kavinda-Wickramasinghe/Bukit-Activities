import { useCallback, useEffect, useState } from 'react'
import { notifyError } from '../lib/errors'
import { getActivitiesWithVenues } from '../services/activities'
import { getVenues } from '../services/venues'
import { getWeeklyPicks } from '../services/weeklyPicks'
import { getWhatsAppSources } from '../services/whatsappSources'

const emptyAdminData = {
	activities: [],
	venues: [],
	sources: [],
	picks: [],
}

export default function useAdminData(setToast, refreshKey) {
	const [data, setData] = useState(emptyAdminData)
	const [loading, setLoading] = useState(true)

	const reload = useCallback(async function reloadAdminData() {
		setLoading(true)
		try {
			const [activities, venues, sources, picks] = await Promise.all([
				getActivitiesWithVenues(),
				getVenues(),
				getWhatsAppSources(),
				getWeeklyPicks(),
			])

			setData({ activities, venues, sources, picks })
		} catch (error) {
			notifyError(setToast, error, 'Could not load admin data.')
			setData(emptyAdminData)
		} finally {
			setLoading(false)
		}
	}, [setToast])

	useEffect(() => {
		reload()
	}, [refreshKey, reload])

	return { ...data, loading, reload }
}
