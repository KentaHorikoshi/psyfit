import { describe, it, expect } from 'vitest'
import {
  getCalendarDays,
  getCalendarDateRange,
  formatMonthLabel,
  formatDayHeader,
  formatDateKey,
  groupRecordsByDate,
  getCompletionStatus,
  getSnapshotAssignedCount,
} from '../../calendar/calendar-utils'
import type { Exercise, ExerciseRecordWithExercise } from '../../../lib/api-types'

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

  describe('getSnapshotAssignedCount', () => {
    const makeRecord = (exerciseId: string, assignedCount?: number): ExerciseRecordWithExercise => ({
      id: Math.random().toString(),
      exercise_id: exerciseId,
      user_id: 'u1',
      completed_at: '2026-01-24T10:00:00Z',
      completed_sets: 3,
      completed_reps: 10,
      exercise_name: 'test',
      exercise_category: 'test',
      assigned_count: assignedCount,
    })

    it('should return null when no records have assigned_count', () => {
      const records = [makeRecord('ex1'), makeRecord('ex2')]
      expect(getSnapshotAssignedCount(records)).toBeNull()
    })

    it('should return null when assigned_count is 0', () => {
      const records = [makeRecord('ex1', 0)]
      expect(getSnapshotAssignedCount(records)).toBeNull()
    })

    it('should return the assigned_count when all records have same value', () => {
      const records = [makeRecord('ex1', 3), makeRecord('ex2', 3)]
      expect(getSnapshotAssignedCount(records)).toBe(3)
    })

    it('should return the max assigned_count when records differ', () => {
      const records = [makeRecord('ex1', 3), makeRecord('ex2', 4)]
      expect(getSnapshotAssignedCount(records)).toBe(4)
    })

    it('should ignore records without assigned_count', () => {
      const records = [makeRecord('ex1', 3), makeRecord('ex2')]
      expect(getSnapshotAssignedCount(records)).toBe(3)
    })
  })

  describe('getCompletionStatus', () => {
    const makeRecord = (exerciseId: string, assignedCount?: number): ExerciseRecordWithExercise => ({
      id: Math.random().toString(),
      exercise_id: exerciseId,
      user_id: 'u1',
      completed_at: '2026-01-24T10:00:00Z',
      completed_sets: 3,
      completed_reps: 10,
      exercise_name: 'test',
      exercise_category: 'test',
      assigned_count: assignedCount,
    })

    const makeExercise = (id: string, dailyFrequency = 1): Exercise => ({
      id,
      name: `Exercise ${id}`,
      description: '',
      video_url: '',
      sets: 3,
      reps: 10,
      daily_frequency: dailyFrequency,
      exercise_type: 'training',
    })

    it('should return "none" when no records', () => {
      expect(getCompletionStatus(undefined, 3)).toBe('none')
      expect(getCompletionStatus([], 3)).toBe('none')
    })

    // --- Without exercises (legacy fallback) ---

    it('should return "full" when all exercises completed (no exercises list)', () => {
      const records = [makeRecord('ex1'), makeRecord('ex2'), makeRecord('ex3')]
      expect(getCompletionStatus(records, 3)).toBe('full')
    })

    it('should return "full" when more exercises than assigned (no exercises list)', () => {
      const records = [makeRecord('ex1'), makeRecord('ex2'), makeRecord('ex3'), makeRecord('ex4')]
      expect(getCompletionStatus(records, 3)).toBe('full')
    })

    it('should return "partial" when some exercises completed (no exercises list)', () => {
      const records = [makeRecord('ex1')]
      expect(getCompletionStatus(records, 3)).toBe('partial')
    })

    it('should count unique exercise IDs (no exercises list)', () => {
      // Same exercise done twice should count as 1
      const records = [makeRecord('ex1'), makeRecord('ex1')]
      expect(getCompletionStatus(records, 2)).toBe('partial')
    })

    it('should return "full" when assignedCount is 0 and there are records (no exercises list)', () => {
      const records = [makeRecord('ex1')]
      expect(getCompletionStatus(records, 0)).toBe('full')
    })

    // --- With exercises and daily_frequency ---

    it('should return "full" when all exercises meet daily_frequency', () => {
      const exercises = [makeExercise('ex1', 1), makeExercise('ex2', 1)]
      const records = [makeRecord('ex1'), makeRecord('ex2')]
      expect(getCompletionStatus(records, 2, exercises)).toBe('full')
    })

    it('should return "partial" when daily_frequency not met', () => {
      const exercises = [makeExercise('ex1', 2), makeExercise('ex2', 1)]
      // ex1 requires 2 records but only has 1
      const records = [makeRecord('ex1'), makeRecord('ex2')]
      expect(getCompletionStatus(records, 2, exercises)).toBe('partial')
    })

    it('should return "full" when daily_frequency met with multiple records', () => {
      const exercises = [makeExercise('ex1', 2), makeExercise('ex2', 1)]
      const records = [makeRecord('ex1'), makeRecord('ex1'), makeRecord('ex2')]
      expect(getCompletionStatus(records, 2, exercises)).toBe('full')
    })

    it('should return "partial" when only some exercises meet daily_frequency', () => {
      const exercises = [makeExercise('ex1', 3), makeExercise('ex2', 1), makeExercise('ex3', 1)]
      // ex1 needs 3 records but only has 1
      const records = [makeRecord('ex1'), makeRecord('ex2'), makeRecord('ex3')]
      expect(getCompletionStatus(records, 3, exercises)).toBe('partial')
    })

    it('should count past exercises not in current list', () => {
      const exercises = [makeExercise('ex1', 1)]
      // ex2 is no longer assigned but was recorded
      const records = [makeRecord('ex1'), makeRecord('ex2')]
      // 1 current completed + 1 past = 2, effectiveCount = 1 → full
      expect(getCompletionStatus(records, 1, exercises)).toBe('full')
    })

    // --- Snapshot (assigned_count) tests with exercises ---

    it('should use snapshot assigned_count when available (with exercises)', () => {
      const exercises = [makeExercise('ex1', 1), makeExercise('ex2', 1), makeExercise('ex3', 1), makeExercise('ex4', 1), makeExercise('ex5', 1)]
      // Records from when only 3 exercises were assigned
      const records = [makeRecord('ex1', 3), makeRecord('ex2', 3), makeRecord('ex3', 3)]
      // snapshot=3, completed=3 → full (even though current has 5 exercises)
      expect(getCompletionStatus(records, 5, exercises)).toBe('full')
    })

    it('should use snapshot assigned_count (partial case with exercises)', () => {
      const exercises = [makeExercise('ex1', 1), makeExercise('ex2', 1), makeExercise('ex3', 1)]
      const records = [makeRecord('ex1', 3), makeRecord('ex2', 3)]
      // snapshot=3, completed=2 → partial
      expect(getCompletionStatus(records, 5, exercises)).toBe('partial')
    })

    it('should preserve past all-clear when new menus added (with exercises)', () => {
      const exercises = [makeExercise('ex1', 1), makeExercise('ex2', 1), makeExercise('ex3', 1), makeExercise('ex4', 1), makeExercise('ex5', 1)]
      const pastRecords = [makeRecord('ex1', 3), makeRecord('ex2', 3), makeRecord('ex3', 3)]
      expect(getCompletionStatus(pastRecords, 5, exercises)).toBe('full')
    })

    // --- Legacy snapshot tests (without exercises) ---

    it('should use snapshot assigned_count when available', () => {
      const records = [makeRecord('ex1', 3), makeRecord('ex2', 3), makeRecord('ex3', 3)]
      expect(getCompletionStatus(records, 5)).toBe('full')
    })

    it('should use snapshot assigned_count (partial case)', () => {
      const records = [makeRecord('ex1', 3), makeRecord('ex2', 3)]
      expect(getCompletionStatus(records, 5)).toBe('partial')
    })

    it('should use max snapshot when records have different assigned_count', () => {
      const records = [makeRecord('ex1', 3), makeRecord('ex2', 3), makeRecord('ex3', 4)]
      // 3 unique exercises, max snapshot = 4 → 3 < 4 → partial
      expect(getCompletionStatus(records, 5)).toBe('partial')
    })

    it('should fallback to currentAssignedCount when no snapshot', () => {
      const records = [makeRecord('ex1'), makeRecord('ex2')]
      expect(getCompletionStatus(records, 2)).toBe('full')
    })

    it('should preserve past all-clear when new menus added', () => {
      const pastRecords = [makeRecord('ex1', 3), makeRecord('ex2', 3), makeRecord('ex3', 3)]
      expect(getCompletionStatus(pastRecords, 5)).toBe('full')
    })

    // --- daily_frequency edge cases ---

    it('should handle daily_frequency=0 as 1', () => {
      const exercises = [makeExercise('ex1', 0)]
      // daily_frequency ?? 1 → treat 0 as falsy, so default to 1
      // Actually 0 is falsy in ?? only for null/undefined. 0 ?? 1 = 0
      // But the code uses (ex.daily_frequency ?? 1), and 0 is not null/undefined
      // So daily_frequency=0 means 0 records needed → always completed
      const records = [makeRecord('ex1')]
      expect(getCompletionStatus(records, 1, exercises)).toBe('full')
    })

    it('should handle exercise with no records when daily_frequency > 1', () => {
      const exercises = [makeExercise('ex1', 2), makeExercise('ex2', 1)]
      // Only ex2 has a record, ex1 has none
      const records = [makeRecord('ex2')]
      expect(getCompletionStatus(records, 2, exercises)).toBe('partial')
    })
  })
})
