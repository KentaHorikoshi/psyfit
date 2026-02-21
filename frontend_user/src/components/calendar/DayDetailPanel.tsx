import { useEffect, useRef } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import type { Exercise, ExerciseRecordWithExercise } from '../../lib/api-types'
import { formatDayHeader, getSnapshotAssignedCount } from './calendar-utils'

interface DayDetailPanelProps {
  date: Date
  records: ExerciseRecordWithExercise[]
  exercises: Exercise[]
  isNextVisit?: boolean
  isPreviousVisit?: boolean
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

export function DayDetailPanel({ date, records, exercises, isNextVisit, isPreviousVisit }: DayDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [date])

  // 完了した exercise_id のセット
  const completedMap = new Map<string, ExerciseRecordWithExercise[]>()
  for (const record of records) {
    const existing = completedMap.get(record.exercise_id) || []
    completedMap.set(record.exercise_id, [...existing, record])
  }

  const completedCount = (() => {
    const exerciseIds = new Set(exercises.map(ex => ex.id))
    // Count current exercises that meet their daily_frequency target
    let count = exercises.filter(ex => {
      const recs = completedMap.get(ex.id)
      return recs != null && recs.length >= (ex.daily_frequency ?? 1)
    }).length
    // Also count records for exercises no longer in the current list
    // (removed exercises — no daily_frequency available, treat any record as completed)
    for (const exerciseId of completedMap.keys()) {
      if (!exerciseIds.has(exerciseId)) {
        count++
      }
    }
    return count
  })()
  const snapshotCount = records.length > 0 ? getSnapshotAssignedCount(records) : null
  const totalCount = snapshotCount ?? exercises.length

  // スナップショット割当数が現在の種目数より少ない場合、
  // 当時割り当てられていなかった種目を非表示にする
  const exercisesToShow = (() => {
    if (snapshotCount == null || snapshotCount >= exercises.length) {
      return exercises
    }
    const completed = exercises.filter((ex) => completedMap.has(ex.id))
    const uncompleted = exercises.filter((ex) => !completedMap.has(ex.id))
    const remainingSlots = Math.max(0, snapshotCount - completed.length)
    return [...completed, ...uncompleted.slice(0, remainingSlots)]
  })()

  return (
    <div ref={panelRef} className="bg-white rounded-xl p-4 shadow-sm" data-testid="day-detail-panel">
      {/* 来院日バナー */}
      {isNextVisit && (
        <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-blue-50 border border-blue-200">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium text-[#1E40AF]">次回来院日</span>
        </div>
      )}
      {isPreviousVisit && (
        <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-green-50 border border-green-200">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium text-[#10B981]">前回来院日</span>
        </div>
      )}

      {/* 日付ヘッダー + サマリー */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {formatDayHeader(date)}
        </h2>
        {totalCount > 0 && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              completedCount >= totalCount
                ? 'bg-green-100 text-green-700'
                : completedCount > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {completedCount}/{totalCount} 完了
          </span>
        )}
      </div>

      {/* 運動一覧 */}
      {exercisesToShow.length === 0 && records.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">この日の記録はありません</p>
      ) : (
        <div className="space-y-3">
          {exercisesToShow.map((exercise) => {
            const exerciseRecords = completedMap.get(exercise.id)
            const recordCount = exerciseRecords?.length ?? 0
            const freq = exercise.daily_frequency ?? 1
            const isCompleted = recordCount >= freq
            const isPartial = recordCount > 0 && !isCompleted

            return (
              <div
                key={exercise.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  isCompleted
                    ? 'border-green-200 bg-green-50'
                    : isPartial
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200'
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 size={20} className="text-green-600" />
                  ) : isPartial ? (
                    <CheckCircle2 size={20} className="text-blue-500" />
                  ) : (
                    <Circle size={20} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium ${isCompleted ? 'text-green-700' : isPartial ? 'text-blue-700' : 'text-gray-900'}`}>
                    {exercise.name}
                  </h3>
                  {exerciseRecords && exerciseRecords.length > 0 ? (
                    <>
                      {exerciseRecords.length > 1 ? (
                        <div className="mt-1 space-y-0.5">
                          {exerciseRecords.map((rec, idx) => (
                            <p key={idx} className={`text-sm ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                              {idx + 1}回目: {rec.completed_sets}セット × {rec.completed_reps}回
                              <span className="ml-2 text-gray-400">
                                {formatTime(rec.completed_at)}
                              </span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-sm mt-1 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                          {exerciseRecords[0]!.completed_sets}セット × {exerciseRecords[0]!.completed_reps}回
                          <span className="ml-2 text-gray-400">
                            {formatTime(exerciseRecords[0]!.completed_at)}
                          </span>
                        </p>
                      )}
                      {freq > 1 && (
                        <p className={`text-xs font-medium mt-1 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                          {recordCount}/{freq}回{isCompleted ? ' 達成' : ''}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">未実施</p>
                  )}
                </div>
              </div>
            )
          })}

          {/* 割当外の記録（過去の割当で実施された運動） */}
          {records
            .filter((r) => !exercisesToShow.some((e) => e.id === r.exercise_id))
            .reduce<ExerciseRecordWithExercise[]>((unique, record) => {
              if (!unique.some((u) => u.exercise_id === record.exercise_id)) {
                unique.push(record)
              }
              return unique
            }, [])
            .map((record) => (
              <div
                key={record.exercise_id}
                className="flex items-start gap-3 p-3 rounded-lg border border-green-200 bg-green-50"
              >
                <div className="mt-0.5">
                  <CheckCircle2 size={20} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-green-700">{record.exercise_name}</h3>
                  <p className="text-sm text-green-600 mt-1">
                    {record.completed_sets}セット × {record.completed_reps}回
                    <span className="ml-2 text-gray-400">
                      {formatTime(record.completed_at)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
