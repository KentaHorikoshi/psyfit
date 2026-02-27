import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PatientMeasurementsTab } from '../PatientMeasurementsTab'
import type { Measurement } from '../../lib/api-types'

const mockGetPatientMeasurements = vi.fn()

vi.mock('../../lib/api', () => ({
  api: {
    getPatientMeasurements: (...args: unknown[]) => mockGetPatientMeasurements(...args),
  },
}))

const mockMeasurements: Measurement[] = [
  {
    id: 'm1',
    measured_date: '2026-02-20',
    weight_kg: 65.5,
    knee_extension_strength_left: 20,
    knee_extension_strength_right: 22,
    wbi_left: 45,
    wbi_right: 48,
    tug_seconds: 8.5,
    single_leg_stance_seconds: 15.2,
    nrs_pain_score: 3,
    mmt_score: 4,
    percent_mv: 85,
    notes: '状態良好',
  },
  {
    id: 'm2',
    measured_date: '2026-02-10',
    weight_kg: 66.0,
    notes: undefined,
  },
]

describe('PatientMeasurementsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPatientMeasurements.mockResolvedValue({
      status: 'success',
      data: { measurements: mockMeasurements },
    })
  })

  it('renders loading state initially', () => {
    mockGetPatientMeasurements.mockReturnValue(new Promise(() => {}))
    render(<PatientMeasurementsTab patientId="patient-123" />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('renders measurement data in table', async () => {
    render(<PatientMeasurementsTab patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('2026-02-20')).toBeInTheDocument()
      expect(screen.getByText('2026-02-10')).toBeInTheDocument()
    })
  })

  it('renders table header columns', async () => {
    render(<PatientMeasurementsTab patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('測定日')).toBeInTheDocument()
      expect(screen.getByText('体重')).toBeInTheDocument()
      expect(screen.getByText('TUG')).toBeInTheDocument()
      expect(screen.getByText('NRS')).toBeInTheDocument()
    })
  })

  it('shows data count', async () => {
    render(<PatientMeasurementsTab patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('2件')).toBeInTheDocument()
    })
  })

  it('shows empty state when no measurements exist', async () => {
    mockGetPatientMeasurements.mockResolvedValue({
      status: 'success',
      data: { measurements: [] },
    })

    render(<PatientMeasurementsTab patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('測定値データがありません')).toBeInTheDocument()
    })
  })

  it('shows error state on API failure', async () => {
    mockGetPatientMeasurements.mockRejectedValue(new Error('API Error'))

    render(<PatientMeasurementsTab patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('測定値の取得に失敗しました')).toBeInTheDocument()
    })
  })

  it('calls API with correct patient ID', async () => {
    render(<PatientMeasurementsTab patientId="patient-456" />)

    await waitFor(() => {
      expect(mockGetPatientMeasurements).toHaveBeenCalledWith(
        'patient-456',
        expect.any(String),
        expect.any(String)
      )
    })
  })

  it('renders date filter inputs', async () => {
    render(<PatientMeasurementsTab patientId="patient-123" />)

    expect(screen.getByLabelText('開始日')).toBeInTheDocument()
    expect(screen.getByLabelText('終了日')).toBeInTheDocument()
  })

  it('formats missing values as dash', async () => {
    mockGetPatientMeasurements.mockResolvedValue({
      status: 'success',
      data: {
        measurements: [{
          id: 'm3',
          measured_date: '2026-02-15',
          weight_kg: 70,
        }],
      },
    })

    render(<PatientMeasurementsTab patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('2026-02-15')).toBeInTheDocument()
      // Check that dashes exist for missing values
      const cells = screen.getAllByText('-')
      expect(cells.length).toBeGreaterThan(0)
    })
  })
})
