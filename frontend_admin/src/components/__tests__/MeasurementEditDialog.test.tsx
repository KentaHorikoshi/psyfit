import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MeasurementEditDialog } from '../MeasurementEditDialog'
import type { Measurement } from '../../lib/api-types'

const mockUpdateMeasurement = vi.fn()

vi.mock('../../lib/api', () => ({
  api: {
    updateMeasurement: (...args: unknown[]) => mockUpdateMeasurement(...args),
  },
}))

const mockMeasurement: Measurement = {
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
}

describe('MeasurementEditDialog', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateMeasurement.mockResolvedValue({ status: 'success', data: {} })
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <MeasurementEditDialog
        isOpen={false}
        patientId="p1"
        measurement={mockMeasurement}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when measurement is null', () => {
    const { container } = render(
      <MeasurementEditDialog
        isOpen={true}
        patientId="p1"
        measurement={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders dialog with form fields when open', () => {
    render(
      <MeasurementEditDialog
        isOpen={true}
        patientId="p1"
        measurement={mockMeasurement}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByText('測定値編集')).toBeInTheDocument()
    expect(screen.getByLabelText(/体重/)).toBeInTheDocument()
    expect(screen.getByLabelText(/NRS/)).toBeInTheDocument()
  })

  it('populates form with measurement values', () => {
    render(
      <MeasurementEditDialog
        isOpen={true}
        patientId="p1"
        measurement={mockMeasurement}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    const weightInput = screen.getByLabelText(/体重/) as HTMLInputElement
    expect(weightInput.value).toBe('65.5')
  })

  it('has measured_date as read-only', () => {
    render(
      <MeasurementEditDialog
        isOpen={true}
        patientId="p1"
        measurement={mockMeasurement}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    const dateInput = screen.getByLabelText(/測定日/) as HTMLInputElement
    expect(dateInput.disabled).toBe(true)
    expect(dateInput.value).toBe('2026-02-20')
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MeasurementEditDialog
        isOpen={true}
        patientId="p1"
        measurement={mockMeasurement}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await user.click(screen.getByText('キャンセル'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls API and onSuccess on successful submit', async () => {
    const user = userEvent.setup()
    render(
      <MeasurementEditDialog
        isOpen={true}
        patientId="p1"
        measurement={mockMeasurement}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await user.click(screen.getByText('更新'))

    await waitFor(() => {
      expect(mockUpdateMeasurement).toHaveBeenCalledWith(
        'p1',
        'm1',
        expect.objectContaining({ weight_kg: 65.5 })
      )
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('shows error message on API failure', async () => {
    mockUpdateMeasurement.mockRejectedValue(new Error('更新に失敗しました'))
    const user = userEvent.setup()

    render(
      <MeasurementEditDialog
        isOpen={true}
        patientId="p1"
        measurement={mockMeasurement}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await user.click(screen.getByText('更新'))

    await waitFor(() => {
      expect(screen.getByText('更新に失敗しました')).toBeInTheDocument()
    })
  })

  it('shows validation error for negative weight', async () => {
    const user = userEvent.setup()
    render(
      <MeasurementEditDialog
        isOpen={true}
        patientId="p1"
        measurement={mockMeasurement}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    const weightInput = screen.getByLabelText(/体重/)
    await user.clear(weightInput)
    await user.type(weightInput, '-1')
    await user.click(screen.getByText('更新'))

    await waitFor(() => {
      expect(mockUpdateMeasurement).not.toHaveBeenCalled()
    })
  })
})
