import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodayAppointmentsDialog } from '../TodayAppointmentsDialog'
import { api } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  api: {
    getTodayAppointments: vi.fn(),
  },
}))

const mockPatients = [
  {
    id: 'p1',
    name: '田中 太郎',
    age: 65,
    gender: '男性' as const,
    status: '回復期' as const,
    condition: '変形性膝関節症',
  },
  {
    id: 'p2',
    name: '佐藤 花子',
    age: 72,
    gender: '女性' as const,
    status: '維持期' as const,
    condition: '腰椎椎間板ヘルニア',
  },
]

const mockOnOpenChange = vi.fn()
const mockOnPatientClick = vi.fn()

function renderDialog(isOpen = true) {
  return render(
    <TodayAppointmentsDialog
      isOpen={isOpen}
      onOpenChange={mockOnOpenChange}
      onPatientClick={mockOnPatientClick}
    />
  )
}

describe('TodayAppointmentsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getTodayAppointments).mockResolvedValue({
      status: 'success',
      data: { patients: mockPatients },
    })
  })

  describe('visibility', () => {
    it('should not render when isOpen is false', () => {
      renderDialog(false)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', async () => {
      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })
  })

  describe('API call', () => {
    it('should call getTodayAppointments when opened', async () => {
      renderDialog(true)

      await waitFor(() => {
        expect(api.getTodayAppointments).toHaveBeenCalledTimes(1)
      })
    })

    it('should not call API when closed', () => {
      renderDialog(false)

      expect(api.getTodayAppointments).not.toHaveBeenCalled()
    })

    it('should show loading state', () => {
      vi.mocked(api.getTodayAppointments).mockReturnValue(new Promise(() => {}))

      renderDialog(true)

      expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    })
  })

  describe('patient list', () => {
    it('should display patient names', async () => {
      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByText('田中 太郎')).toBeInTheDocument()
        expect(screen.getByText('佐藤 花子')).toBeInTheDocument()
      })
    })

    it('should display patient age and gender', async () => {
      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByText(/65歳/)).toBeInTheDocument()
        expect(screen.getByText(/72歳/)).toBeInTheDocument()
      })
    })

    it('should display patient conditions', async () => {
      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByText('変形性膝関節症')).toBeInTheDocument()
        expect(screen.getByText('腰椎椎間板ヘルニア')).toBeInTheDocument()
      })
    })

    it('should display status badges', async () => {
      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByText('回復期')).toBeInTheDocument()
        expect(screen.getByText('維持期')).toBeInTheDocument()
      })
    })

    it('should display count message', async () => {
      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByText('2名の来院予定があります')).toBeInTheDocument()
      })
    })
  })

  describe('empty state', () => {
    it('should show empty message when no patients', async () => {
      vi.mocked(api.getTodayAppointments).mockResolvedValue({
        status: 'success',
        data: { patients: [] },
      })

      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByText('本日の来院予定はありません')).toBeInTheDocument()
      })
    })
  })

  describe('error state', () => {
    it('should show error message on API failure', async () => {
      vi.mocked(api.getTodayAppointments).mockRejectedValue(new Error('Network error'))

      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByText('来院予定の取得に失敗しました')).toBeInTheDocument()
      })
    })
  })

  describe('interactions', () => {
    it('should call onPatientClick when patient row is clicked', async () => {
      const user = userEvent.setup()
      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByText('田中 太郎')).toBeInTheDocument()
      })

      await user.click(screen.getByText('田中 太郎'))

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      expect(mockOnPatientClick).toHaveBeenCalledWith('p1')
    })

    it('should call onOpenChange(false) when close button is clicked', async () => {
      const user = userEvent.setup()
      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByLabelText('閉じる')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText('閉じる'))

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should close when Escape key is pressed', async () => {
      const user = userEvent.setup()
      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.keyboard('{Escape}')

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should close when background overlay is clicked', async () => {
      const user = userEvent.setup()
      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('dialog'))

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should call onOpenChange(false) when footer close button is clicked', async () => {
      const user = userEvent.setup()
      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByText('田中 太郎')).toBeInTheDocument()
      })

      const closeButtons = screen.getAllByRole('button', { name: /閉じる/ })
      const footerCloseButton = closeButtons[closeButtons.length - 1]!
      await user.click(footerCloseButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('accessibility', () => {
    it('should have role="dialog"', async () => {
      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('should have aria-modal="true"', async () => {
      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
      })
    })

    it('should have aria-labelledby pointing to title', async () => {
      renderDialog(true)

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveAttribute('aria-labelledby', 'today-appointments-dialog-title')
        expect(screen.getByText('本日の来院予定')).toHaveAttribute('id', 'today-appointments-dialog-title')
      })
    })

    it('should have aria-label on close button', async () => {
      renderDialog(true)

      await waitFor(() => {
        expect(screen.getByLabelText('閉じる')).toBeInTheDocument()
      })
    })
  })
})
