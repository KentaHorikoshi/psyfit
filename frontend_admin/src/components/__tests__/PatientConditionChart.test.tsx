import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PatientConditionChart } from '../PatientConditionChart'
import type { DailyCondition } from '../../lib/api-types'

// Mock Recharts to avoid canvas rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ name }: { name: string }) => <div data-testid={`line-${name}`} />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

const mockGetPatientDailyConditions = vi.fn()

vi.mock('../../lib/api', () => ({
  api: {
    getPatientDailyConditions: (...args: unknown[]) => mockGetPatientDailyConditions(...args),
  },
}))

const mockConditions: DailyCondition[] = [
  { id: '1', recorded_date: '2026-02-10', pain_level: 3, body_condition: 7, notes: null as unknown as string },
  { id: '2', recorded_date: '2026-02-09', pain_level: 4, body_condition: 6 },
  { id: '3', recorded_date: '2026-02-08', pain_level: 5, body_condition: 5 },
]

describe('PatientConditionChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPatientDailyConditions.mockResolvedValue({
      status: 'success',
      data: { conditions: mockConditions },
    })
  })

  it('renders loading state initially', () => {
    mockGetPatientDailyConditions.mockReturnValue(new Promise(() => {}))
    render(<PatientConditionChart patientId="patient-123" />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('renders chart with condition data', async () => {
    render(<PatientConditionChart patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
    expect(screen.getByText('体調の推移')).toBeInTheDocument()
  })

  it('shows empty state when no conditions exist', async () => {
    mockGetPatientDailyConditions.mockResolvedValue({
      status: 'success',
      data: { conditions: [] },
    })

    render(<PatientConditionChart patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('体調データがありません')).toBeInTheDocument()
    })
  })

  it('shows error state on API failure', async () => {
    mockGetPatientDailyConditions.mockRejectedValue(new Error('API Error'))

    render(<PatientConditionChart patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument()
    })
  })

  it('calls API with correct patient ID', async () => {
    render(<PatientConditionChart patientId="patient-456" />)

    await waitFor(() => {
      expect(mockGetPatientDailyConditions).toHaveBeenCalledWith(
        'patient-456',
        expect.any(String),
        expect.any(String)
      )
    })
  })

  it('has proper heading structure', async () => {
    render(<PatientConditionChart patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('体調の推移')).toBeInTheDocument()
    })
  })

  it('renders date filter inputs', async () => {
    render(<PatientConditionChart patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByLabelText('開始日')).toBeInTheDocument()
      expect(screen.getByLabelText('終了日')).toBeInTheDocument()
    })
  })

  it('displays data count', async () => {
    render(<PatientConditionChart patientId="patient-123" />)

    await waitFor(() => {
      expect(screen.getByText('3件')).toBeInTheDocument()
    })
  })
})
