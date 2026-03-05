import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteMeasurementConfirmDialog } from '../DeleteMeasurementConfirmDialog'
import type { Measurement } from '../../lib/api-types'

const mockDeleteMeasurement = vi.fn()

vi.mock('../../lib/api', () => ({
  api: {
    deleteMeasurement: (...args: unknown[]) => mockDeleteMeasurement(...args),
  },
}))

const mockMeasurement: Measurement = {
  id: 'm1',
  measured_date: '2026-02-20',
  weight_kg: 65.5,
  nrs_pain_score: 3,
  mmt_score: 4,
  notes: '状態良好',
}

describe('DeleteMeasurementConfirmDialog', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteMeasurement.mockResolvedValue({ status: 'success', data: {} })
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <DeleteMeasurementConfirmDialog
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
      <DeleteMeasurementConfirmDialog
        isOpen={true}
        patientId="p1"
        measurement={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders confirmation dialog with measurement summary', () => {
    render(
      <DeleteMeasurementConfirmDialog
        isOpen={true}
        patientId="p1"
        measurement={mockMeasurement}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByText('測定値データ削除の確認')).toBeInTheDocument()
    expect(screen.getByText('この操作は取り消せません。この測定値データを削除してもよろしいですか？')).toBeInTheDocument()
    expect(screen.getByText('2026-02-20')).toBeInTheDocument()
    expect(screen.getByText('65.5kg')).toBeInTheDocument()
    expect(screen.getByText('3/10')).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <DeleteMeasurementConfirmDialog
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

  it('calls API and callbacks on delete confirmation', async () => {
    const user = userEvent.setup()
    render(
      <DeleteMeasurementConfirmDialog
        isOpen={true}
        patientId="p1"
        measurement={mockMeasurement}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await user.click(screen.getByText('削除する'))

    await waitFor(() => {
      expect(mockDeleteMeasurement).toHaveBeenCalledWith('p1', 'm1')
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('shows error message on API failure', async () => {
    mockDeleteMeasurement.mockRejectedValue(new Error('削除に失敗しました'))
    const user = userEvent.setup()

    render(
      <DeleteMeasurementConfirmDialog
        isOpen={true}
        patientId="p1"
        measurement={mockMeasurement}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await user.click(screen.getByText('削除する'))

    await waitFor(() => {
      expect(screen.getByText('削除に失敗しました')).toBeInTheDocument()
    })
  })

  it('disables buttons while deleting', async () => {
    mockDeleteMeasurement.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()

    render(
      <DeleteMeasurementConfirmDialog
        isOpen={true}
        patientId="p1"
        measurement={mockMeasurement}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await user.click(screen.getByText('削除する'))

    await waitFor(() => {
      expect(screen.getByText('削除中...')).toBeInTheDocument()
    })
  })
})
