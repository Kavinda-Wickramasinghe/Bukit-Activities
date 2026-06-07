import { describe, expect, it } from 'vitest'
import { getNextRecurringDate } from './recurring'

const today = new Date('2026-06-07T12:00:00Z')

describe('getNextRecurringDate', () => {
	it('rolls daily events forward to today', () => {
		expect(getNextRecurringDate('2026-06-05', 'Daily', today)).toBe('2026-06-07')
	})

	it('rolls weekly events forward by seven-day steps', () => {
		expect(getNextRecurringDate('2026-05-25', 'Weekly', today)).toBe('2026-06-08')
	})

	it('supports every-n-weeks schedules', () => {
		expect(getNextRecurringDate('2026-05-11', 'Every 2 weeks', today)).toBe('2026-06-08')
	})

	it('handles monthly events near the end of the month', () => {
		expect(getNextRecurringDate('2026-01-31', 'Monthly', new Date('2026-02-15T12:00:00Z'))).toBe('2026-02-28')
	})

	it('does not update unknown schedules', () => {
		expect(getNextRecurringDate('2026-06-01', 'Every market day', today)).toBeNull()
	})
})
