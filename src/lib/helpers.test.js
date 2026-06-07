import { describe, expect, it } from 'vitest'
import { dateKey, endOfWeekSunday, startOfWeekMonday } from './helpers'

describe('calendar week helpers', () => {
	it('starts the week on Monday', () => {
		expect(dateKey(startOfWeekMonday(new Date('2026-06-10T12:00:00Z')))).toBe('2026-06-08')
	})

	it('treats Sunday as the end of the same Monday-start week', () => {
		expect(dateKey(startOfWeekMonday(new Date('2026-06-14T12:00:00Z')))).toBe('2026-06-08')
		expect(dateKey(endOfWeekSunday(new Date('2026-06-14T12:00:00Z')))).toBe('2026-06-14')
	})

	it('ends the week on Sunday', () => {
		expect(dateKey(endOfWeekSunday(new Date('2026-06-08T12:00:00Z')))).toBe('2026-06-14')
	})
})
