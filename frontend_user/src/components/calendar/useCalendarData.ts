import { useState, useEffect, useMemo } from 'react'
import apiClient from '../../lib/api-client'
import type { Exercise, ExerciseRecordWithExercise } from '../../lib/api-types'
import { getCalendarDateRange, groupRecordsByDate } from './calendar-utils'

interface CalendarData {
  records: ExerciseRecordWithExercise[]
  recordsByDate: Record<string, ExerciseRecordWithExercise[]>
  exercises: Exercise[]
  assignedCount: number
  isLoading: boolean
  error: string | null
  retry: () => void
}

export function useCalendarData(year: number, month: number): CalendarData {
  const [records, setRecords] = useState<ExerciseRecordWithExercise[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const dateRange = getCalendarDateRange(year, month)
        const [recordsRes, exercisesRes] = await Promise.all([
          apiClient.getExerciseRecords(dateRange),
          apiClient.getUserExercises(),
        ])

        if (cancelled) return

        setRecords(recordsRes.data?.records || [])
        setExercises(exercisesRes.data?.exercises || [])
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました')
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [year, month, fetchKey])

  const recordsByDate = useMemo(() => groupRecordsByDate(records), [records])

  const assignedCount = exercises.length

  const retry = () => setFetchKey((k) => k + 1)

  return {
    records,
    recordsByDate,
    exercises,
    assignedCount,
    isLoading,
    error,
    retry,
  }
}
