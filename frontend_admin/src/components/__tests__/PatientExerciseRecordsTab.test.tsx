import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PatientExerciseRecordsTab } from '../PatientExerciseRecordsTab'
import type { PatientExerciseRecord } from '../../lib/api-types'

const mockGetPatientExerciseRecords = vi.fn()

vi.mock('../../lib/api', () => ({
  api: {
    getPatientExerciseRecords: (...args: unknown[]) => mockGetPatientExerciseRecords(...args),
  },
}))

const mockRecords: PatientExerciseRecord[] = [
  {
    id: 'r1',
    exercise_name: 'スクワット',
    exercise_type: 'トレーニング',
    completed_at: '2026-02-25T14:30:00+09:00',
    completed_reps: 10,
    completed_sets: 3,
    duration_seconds: 300,
  },
  {
    id: 'r2',
    exercise_name: 'ストレッチA',
    exercise_type: 'ストレッチ',
    completed_at: '2026-02-25T10:00:00+09:00',
    completed_reps: null,
    completed_sets: null,
    duration_seconds: 180,
  },
]

describe('PatientExerciseRecordsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPatientExerciseRecords.mockResolvedValue({
      status: 'success',
      data: {
        records: mockRecords,
        summary: { total_records: 2, total_minutes: 8 },
      },
    })
  })

  it('renders loading state initially', () => {
    mockGetPatientExerciseRecords.mockReturnValue(new Promise(() => {}))
    render(<PatientExerciseRecordsTab patientId="patient-123" />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('renders exercise records in table', async () => {
    render(<PatientExerciseRecordsTab patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('スクワット')).toBeInTheDocument()
      expect(screen.getByText('ストレッチA')).toBeInTheDocument()
    })
  })

  it('renders summary cards', async () => {
    render(<PatientExerciseRecordsTab patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('2回')).toBeInTheDocument()
      expect(screen.getByText('8分')).toBeInTheDocument()
    })
  })

  it('renders exercise type badges', async () => {
    render(<PatientExerciseRecordsTab patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('トレーニング')).toBeInTheDocument()
      expect(screen.getByText('ストレッチ')).toBeInTheDocument()
    })
  })

  it('renders reps and sets correctly', async () => {
    render(<PatientExerciseRecordsTab patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('10回')).toBeInTheDocument()
      expect(screen.getByText('3セット')).toBeInTheDocument()
    })
  })

  it('renders duration correctly', async () => {
    render(<PatientExerciseRecordsTab patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('5分')).toBeInTheDocument()
      expect(screen.getByText('3分')).toBeInTheDocument()
    })
  })

  it('shows empty state when no records exist', async () => {
    mockGetPatientExerciseRecords.mockResolvedValue({
      status: 'success',
      data: { records: [], summary: { total_records: 0, total_minutes: 0 } },
    })

    render(<PatientExerciseRecordsTab patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('運動記録がありません')).toBeInTheDocument()
    })
  })

  it('shows error state on API failure', async () => {
    mockGetPatientExerciseRecords.mockRejectedValue(new Error('API Error'))

    render(<PatientExerciseRecordsTab patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('運動記録の取得に失敗しました')).toBeInTheDocument()
    })
  })

  it('calls API with correct patient ID', async () => {
    render(<PatientExerciseRecordsTab patientId="patient-456" />)

    await waitFor(() => {
      expect(mockGetPatientExerciseRecords).toHaveBeenCalledWith(
        'patient-456',
        expect.any(String),
        expect.any(String)
      )
    })
  })

  it('renders date filter inputs', async () => {
    render(<PatientExerciseRecordsTab patientId="patient-123" />)

    expect(screen.getByLabelText('開始日')).toBeInTheDocument()
    expect(screen.getByLabelText('終了日')).toBeInTheDocument()
  })

  it('renders null reps/sets as dash', async () => {
    render(<PatientExerciseRecordsTab patientId="patient-123" />)

    await waitFor(() => {
      // ストレッチA has null reps and sets
      const dashCells = screen.getAllByText('-')
      expect(dashCells.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('has proper table header structure', async () => {
    render(<PatientExerciseRecordsTab patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('実施日時')).toBeInTheDocument()
      expect(screen.getByText('運動名')).toBeInTheDocument()
      expect(screen.getByText('種類')).toBeInTheDocument()
      expect(screen.getByText('所要時間')).toBeInTheDocument()
    })
  })
})
