import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PatientDataTabs } from '../PatientDataTabs'

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}))

const mockGetPatientDailyConditions = vi.fn()
const mockGetPatientMeasurements = vi.fn()
const mockGetPatientExerciseRecords = vi.fn()

vi.mock('../../lib/api', () => ({
  api: {
    getPatientDailyConditions: (...args: unknown[]) => mockGetPatientDailyConditions(...args),
    getPatientMeasurements: (...args: unknown[]) => mockGetPatientMeasurements(...args),
    getPatientExerciseRecords: (...args: unknown[]) => mockGetPatientExerciseRecords(...args),
  },
}))

describe('PatientDataTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPatientDailyConditions.mockResolvedValue({
      status: 'success',
      data: { conditions: [] },
    })
    mockGetPatientMeasurements.mockResolvedValue({
      status: 'success',
      data: { measurements: [] },
    })
    mockGetPatientExerciseRecords.mockResolvedValue({
      status: 'success',
      data: { records: [], summary: { total_records: 0, total_minutes: 0 } },
    })
  })

  it('renders three tabs', () => {
    render(<PatientDataTabs patientId="patient-123" />)

    expect(screen.getByRole('tab', { name: /体調記録/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /測定値/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /運動記録/ })).toBeInTheDocument()
  })

  it('shows conditions tab as active by default', () => {
    render(<PatientDataTabs patientId="patient-123" />)

    const conditionsTab = screen.getByRole('tab', { name: /体調記録/ })
    expect(conditionsTab).toHaveAttribute('aria-selected', 'true')
  })

  it('switches to measurements tab on click', async () => {
    const user = userEvent.setup()
    render(<PatientDataTabs patientId="patient-123" />)

    const measurementsTab = screen.getByRole('tab', { name: /測定値/ })
    await user.click(measurementsTab)

    expect(measurementsTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /体調記録/ })).toHaveAttribute('aria-selected', 'false')
  })

  it('switches to exercise records tab on click', async () => {
    const user = userEvent.setup()
    render(<PatientDataTabs patientId="patient-123" />)

    const exercisesTab = screen.getByRole('tab', { name: /運動記録/ })
    await user.click(exercisesTab)

    expect(exercisesTab).toHaveAttribute('aria-selected', 'true')
  })

  it('has proper tablist role', () => {
    render(<PatientDataTabs patientId="patient-123" />)

    expect(screen.getByRole('tablist', { name: /データタブ/ })).toBeInTheDocument()
  })

  it('has tabpanel elements with proper aria attributes', () => {
    render(<PatientDataTabs patientId="patient-123" />)

    const panels = screen.getAllByRole('tabpanel', { hidden: true })
    expect(panels.length).toBeGreaterThanOrEqual(1)
  })

  it('loads conditions tab content on initial render', async () => {
    render(<PatientDataTabs patientId="patient-123" />)

    await waitFor(() => {
      expect(mockGetPatientDailyConditions).toHaveBeenCalled()
    })
  })

  it('loads measurements data when switching to measurements tab', async () => {
    const user = userEvent.setup()
    render(<PatientDataTabs patientId="patient-123" />)

    const measurementsTab = screen.getByRole('tab', { name: /測定値/ })
    await user.click(measurementsTab)

    await waitFor(() => {
      expect(mockGetPatientMeasurements).toHaveBeenCalled()
    })
  })

  it('loads exercise records when switching to exercises tab', async () => {
    const user = userEvent.setup()
    render(<PatientDataTabs patientId="patient-123" />)

    const exercisesTab = screen.getByRole('tab', { name: /運動記録/ })
    await user.click(exercisesTab)

    await waitFor(() => {
      expect(mockGetPatientExerciseRecords).toHaveBeenCalled()
    })
  })
})
