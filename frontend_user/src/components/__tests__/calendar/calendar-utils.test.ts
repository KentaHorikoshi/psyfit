import { describe, it, expect } from 'vitest'
import {
  getCalendarDays,
  getCalendarDateRange,
  formatMonthLabel,
  formatDayHeader,
  formatDateKey,
  groupRecordsByDate,
  getCompletionStatus,
} from '../../calendar/calendar-utils'
import type { ExerciseRecordWithExercise } from '../../../lib/api-types'

describe('calendar-utils', () => {
  describe('getCalendarDays', () => {
    it('should return 42 days', () => {
      const days = getCalendarDays(2026, 1) // 2026年2月
      expect(days).toHaveLength(42)
    })

    it('should start on Sunday', () => {
      const days = getCalendarDays(2026, 1) // 2026年2月
      // 2026-02-01 is Sunday, so first day should be Feb 1
      expect(days[0]!.date.getDay()).toBe(0)
    })

    it('should mark current month days correctly', () => {
      const days = getCalendarDays(2026, 1) // 2026年2月
      const currentMonthDays = days.filter((d) => d.isCurrentMonth)
      expect(currentMonthDays).toHaveLength(28) // Feb 2026 has 28 days
    })

    it('should include days from adjacent months', () => {
      const days = getCalendarDays(2026, 0) // 2026年1月
      // Jan 1, 2026 is Thursday, so start offset is 4
      const outsideDays = days.filter((d) => !d.isCurrentMonth)
      expect(outsideDays.length).toBeGreaterThan(0)
    })

    it('should mark today correctly', () => {
      const today = new Date()
      const days = getCalendarDays(today.getFullYear(), today.getMonth())
      const todayDays = days.filter((d) => d.isToday)
      expect(todayDays).toHaveLength(1)
    })

    it('should not mark today in a different month', () => {
      // Use a month that is definitely not the current month
      const farFuture = new Date(2030, 5) // June 2030
      const days = getCalendarDays(farFuture.getFullYear(), farFuture.getMonth())
      const todayDays = days.filter((d) => d.isToday)
      expect(todayDays).toHaveLength(0)
    })
  })

  describe('getCalendarDateRange', () => {
    it('should return start and end dates covering the grid', () => {
      const range = getCalendarDateRange(2026, 1) // 2026年2月
      expect(range.start_date).toBe('2026-02-01')
      // Feb 2026: starts Sun, 28 days + 14 extra = 42 total
      expect(range.end_date).toBe('2026-03-14')
    })

    it('should cover adjacent month days', () => {
      const range = getCalendarDateRange(2026, 0) // 2026年1月
      // Jan 1, 2026 is Thursday, offset=4, so starts Dec 28, 2025
      expect(range.start_date).toBe('2025-12-28')
    })
  })

  describe('formatMonthLabel', () => {
    it('should format month label correctly', () => {
      expect(formatMonthLabel(2026, 0)).toBe('2026年1月')
      expect(formatMonthLabel(2026, 11)).toBe('2026年12月')
    })
  })

  describe('formatDayHeader', () => {
    it('should format day header with weekday', () => {
      const date = new Date(2026, 1, 8) // 2026-02-08 is Sunday
      expect(formatDayHeader(date)).toBe('2月8日（日）')
    })

    it('should show correct weekday', () => {
      const date = new Date(2026, 1, 9) // Monday
      expect(formatDayHeader(date)).toBe('2月9日（月）')
    })
  })

  describe('formatDateKey', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2026, 0, 5) // Jan 5, 2026
      expect(formatDateKey(date)).toBe('2026-01-05')
    })

    it('should pad month and day with zeros', () => {
      const date = new Date(2026, 2, 1) // March 1
      expect(formatDateKey(date)).toBe('2026-03-01')
    })
  })

  describe('groupRecordsByDate', () => {
    const records: ExerciseRecordWithExercise[] = [
      {
        id: '1',
        exercise_id: 'ex1',
        user_id: 'u1',
        completed_at: '2026-01-24T10:00:00+09:00',
        completed_sets: 3,
        completed_reps: 10,
        exercise_name: 'スクワット',
        exercise_category: 'lower_body',
      },
      {
        id: '2',
        exercise_id: 'ex2',
        user_id: 'u1',
        completed_at: '2026-01-24T11:00:00+09:00',
        completed_sets: 2,
        completed_reps: 15,
        exercise_name: '腕上げ運動',
        exercise_category: 'upper_body',
      },
      {
        id: '3',
        exercise_id: 'ex1',
        user_id: 'u1',
        completed_at: '2026-01-23T09:00:00+09:00',
        completed_sets: 3,
        completed_reps: 10,
        exercise_name: 'スクワット',
        exercise_category: 'lower_body',
      },
    ]

    it('should group records by date', () => {
      const grouped = groupRecordsByDate(records)
      expect(Object.keys(grouped)).toHaveLength(2)
      expect(grouped['2026-01-24']).toHaveLength(2)
      expect(grouped['2026-01-23']).toHaveLength(1)
    })

    it('should return empty object for empty records', () => {
      const grouped = groupRecordsByDate([])
      expect(Object.keys(grouped)).toHaveLength(0)
    })
  })

  describe('getCompletionStatus', () => {
    const makeRecord = (exerciseId: string): ExerciseRecordWithExercise => ({
      id: Math.random().toString(),
      exercise_id: exerciseId,
      user_id: 'u1',
      completed_at: '2026-01-24T10:00:00Z',
      completed_sets: 3,
      completed_reps: 10,
      exercise_name: 'test',
      exercise_category: 'test',
    })

    it('should return "none" when no records', () => {
      expect(getCompletionStatus(undefined, 3)).toBe('none')
      expect(getCompletionStatus([], 3)).toBe('none')
    })

    it('should return "full" when all exercises completed', () => {
      const records = [makeRecord('ex1'), makeRecord('ex2'), makeRecord('ex3')]
      expect(getCompletionStatus(records, 3)).toBe('full')
    })

    it('should return "full" when more exercises than assigned', () => {
      const records = [makeRecord('ex1'), makeRecord('ex2'), makeRecord('ex3'), makeRecord('ex4')]
      expect(getCompletionStatus(records, 3)).toBe('full')
    })

    it('should return "partial" when some exercises completed', () => {
      const records = [makeRecord('ex1')]
      expect(getCompletionStatus(records, 3)).toBe('partial')
    })

    it('should count unique exercise IDs', () => {
      // Same exercise done twice should count as 1
      const records = [makeRecord('ex1'), makeRecord('ex1')]
      expect(getCompletionStatus(records, 2)).toBe('partial')
    })

    it('should return "full" when assignedCount is 0 and there are records', () => {
      const records = [makeRecord('ex1')]
      expect(getCompletionStatus(records, 0)).toBe('full')
    })
  })
})
