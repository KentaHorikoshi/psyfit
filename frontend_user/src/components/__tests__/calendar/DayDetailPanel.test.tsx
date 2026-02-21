import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DayDetailPanel } from '../../calendar/DayDetailPanel'
import type { Exercise, ExerciseRecordWithExercise } from '../../../lib/api-types'

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

const makeExercise = (id: string, name: string): Exercise => ({
  id,
  name,
  description: '',
  video_url: '/videos/test.mp4',
  sets: 3,
  reps: 10,
  daily_frequency: 1,
  exercise_type: 'training',
})

const makeRecord = (
  exerciseId: string,
  exerciseName: string,
  assignedCount?: number
): ExerciseRecordWithExercise => ({
  id: Math.random().toString(),
  exercise_id: exerciseId,
  user_id: 'u1',
  completed_at: '2026-02-05T10:00:00+09:00',
  completed_sets: 3,
  completed_reps: 10,
  exercise_name: exerciseName,
  exercise_category: 'training',
  assigned_count: assignedCount,
})

describe('DayDetailPanel - スナップショット割当数による表示制御', () => {
  const date = new Date(2026, 1, 5) // 2026-02-05

  it('スナップショットがない場合、全現在種目を表示する', () => {
    const exercises = [
      makeExercise('ex1', 'スクワット'),
      makeExercise('ex2', '腕上げ運動'),
      makeExercise('ex3', 'バランス運動'),
    ]
    const records = [
      makeRecord('ex1', 'スクワット'),
      makeRecord('ex2', '腕上げ運動'),
    ]

    render(<DayDetailPanel date={date} records={records} exercises={exercises} />)

    // 全3種目が表示される（スナップショットなしのためフォールバック）
    expect(screen.getByText('スクワット')).toBeInTheDocument()
    expect(screen.getByText('腕上げ運動')).toBeInTheDocument()
    expect(screen.getByText('バランス運動')).toBeInTheDocument()
    expect(screen.getByText('2/3 完了')).toBeInTheDocument()
  })

  it('スナップショットあり・種目増加時、当時の割当数分だけ表示する', () => {
    // 過去: 3種目割当で全完了、現在: 5種目に増加
    const exercises = [
      makeExercise('ex1', 'スクワット'),
      makeExercise('ex2', '腕上げ運動'),
      makeExercise('ex3', 'バランス運動'),
      makeExercise('ex4', '新種目A'),
      makeExercise('ex5', '新種目B'),
    ]
    const records = [
      makeRecord('ex1', 'スクワット', 3),
      makeRecord('ex2', '腕上げ運動', 3),
      makeRecord('ex3', 'バランス運動', 3),
    ]

    render(<DayDetailPanel date={date} records={records} exercises={exercises} />)

    // バッジ: 3/3 完了
    expect(screen.getByText('3/3 完了')).toBeInTheDocument()

    // 当時の3種目のみ表示、後から追加された種目は非表示
    expect(screen.getByText('スクワット')).toBeInTheDocument()
    expect(screen.getByText('腕上げ運動')).toBeInTheDocument()
    expect(screen.getByText('バランス運動')).toBeInTheDocument()
    expect(screen.queryByText('新種目A')).not.toBeInTheDocument()
    expect(screen.queryByText('新種目B')).not.toBeInTheDocument()
  })

  it('スナップショットあり・一部未完了時、未完了枠も表示する', () => {
    // 過去: 3種目割当で2つ完了、現在: 5種目に増加
    const exercises = [
      makeExercise('ex1', 'スクワット'),
      makeExercise('ex2', '腕上げ運動'),
      makeExercise('ex3', 'バランス運動'),
      makeExercise('ex4', '新種目A'),
      makeExercise('ex5', '新種目B'),
    ]
    const records = [
      makeRecord('ex1', 'スクワット', 3),
      makeRecord('ex2', '腕上げ運動', 3),
    ]

    render(<DayDetailPanel date={date} records={records} exercises={exercises} />)

    // バッジ: 2/3 完了
    expect(screen.getByText('2/3 完了')).toBeInTheDocument()

    // 完了2種目 + 未完了1種目 = 3種目表示
    expect(screen.getByText('スクワット')).toBeInTheDocument()
    expect(screen.getByText('腕上げ運動')).toBeInTheDocument()
    expect(screen.getByText('バランス運動')).toBeInTheDocument()
    // 残り2種目は当時未割当なので非表示
    expect(screen.queryByText('新種目A')).not.toBeInTheDocument()
    expect(screen.queryByText('新種目B')).not.toBeInTheDocument()
  })

  it('スナップショットが現在種目数以上の場合、全種目を表示する', () => {
    // 過去: 5種目割当、現在: 3種目に減少
    const exercises = [
      makeExercise('ex1', 'スクワット'),
      makeExercise('ex2', '腕上げ運動'),
      makeExercise('ex3', 'バランス運動'),
    ]
    const records = [
      makeRecord('ex1', 'スクワット', 5),
      makeRecord('ex2', '腕上げ運動', 5),
      makeRecord('ex3', 'バランス運動', 5),
      makeRecord('ex4', '削除済み種目A', 5),
      makeRecord('ex5', '削除済み種目B', 5),
    ]

    render(<DayDetailPanel date={date} records={records} exercises={exercises} />)

    // バッジ: 5/5 完了（スナップショット使用）
    expect(screen.getByText('5/5 完了')).toBeInTheDocument()

    // 現在の3種目は全て表示
    expect(screen.getByText('スクワット')).toBeInTheDocument()
    expect(screen.getByText('腕上げ運動')).toBeInTheDocument()
    expect(screen.getByText('バランス運動')).toBeInTheDocument()

    // 割当外の記録として削除済み種目も表示
    expect(screen.getByText('削除済み種目A')).toBeInTheDocument()
    expect(screen.getByText('削除済み種目B')).toBeInTheDocument()
  })

  it('記録がない日は全現在種目を表示する', () => {
    const exercises = [
      makeExercise('ex1', 'スクワット'),
      makeExercise('ex2', '腕上げ運動'),
    ]

    render(<DayDetailPanel date={date} records={[]} exercises={exercises} />)

    expect(screen.getByText('スクワット')).toBeInTheDocument()
    expect(screen.getByText('腕上げ運動')).toBeInTheDocument()
  })

  it('記録も種目もない日は「記録なし」メッセージを表示する', () => {
    render(<DayDetailPanel date={date} records={[]} exercises={[]} />)

    expect(screen.getByText('この日の記録はありません')).toBeInTheDocument()
  })
})
