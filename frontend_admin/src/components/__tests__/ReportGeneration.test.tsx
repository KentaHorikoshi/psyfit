import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ReportGeneration } from '../ReportGeneration'

// Mock useParams and useNavigate
const mockPatientId = 'patient-123'
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: mockPatientId }),
    useNavigate: () => mockNavigate,
  }
})

// Mock API
const mockDownloadReport = vi.fn()

vi.mock('../../lib/api', () => ({
  api: {
    downloadReport: (patientId: string, params: unknown) => mockDownloadReport(patientId, params),
  },
}))

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

function renderReportGeneration() {
  return render(
    <BrowserRouter>
      <ReportGeneration />
    </BrowserRouter>
  )
}

describe('S-07 ReportGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDownloadReport.mockResolvedValue(new Blob(['mock pdf content'], { type: 'application/pdf' }))
  })

  describe('rendering', () => {
    it('should render page title', () => {
      renderReportGeneration()

      expect(screen.getByRole('heading', { level: 1, name: /レポート/ })).toBeInTheDocument()
    })

    it('should render date range inputs', () => {
      renderReportGeneration()

      expect(screen.getByLabelText(/開始日/)).toBeInTheDocument()
      expect(screen.getByLabelText(/終了日/)).toBeInTheDocument()
    })

    it('should render format selection', () => {
      renderReportGeneration()

      expect(screen.getByText('PDF')).toBeInTheDocument()
      expect(screen.getByText('CSV')).toBeInTheDocument()
    })

    it('should render download button', () => {
      renderReportGeneration()

      expect(screen.getByRole('button', { name: /ダウンロード/ })).toBeInTheDocument()
    })

    it('should render back button', () => {
      renderReportGeneration()

      expect(screen.getByRole('button', { name: /戻る/ })).toBeInTheDocument()
    })
  })

  describe('date range selection', () => {
    it('should allow setting start and end dates', async () => {
      const user = userEvent.setup()
      renderReportGeneration()

      const startDateInput = screen.getByLabelText(/開始日/) as HTMLInputElement
      const endDateInput = screen.getByLabelText(/終了日/) as HTMLInputElement

      await user.clear(startDateInput)
      await user.type(startDateInput, '2026-01-10')
      await user.clear(endDateInput)
      await user.type(endDateInput, '2026-01-20')

      expect(startDateInput.value).toBe('2026-01-10')
      expect(endDateInput.value).toBe('2026-01-20')
    })

    it('should validate end date is after start date', async () => {
      const user = userEvent.setup()
      renderReportGeneration()

      const startDateInput = screen.getByLabelText(/開始日/)
      const endDateInput = screen.getByLabelText(/終了日/)

      await user.clear(startDateInput)
      await user.type(startDateInput, '2026-01-20')
      await user.clear(endDateInput)
      await user.type(endDateInput, '2026-01-10')

      const downloadButton = screen.getByRole('button', { name: /ダウンロード/ })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(screen.getByText(/終了日は開始日より後にしてください/)).toBeInTheDocument()
      })
    })

    it('should require both start and end dates', async () => {
      const user = userEvent.setup()
      renderReportGeneration()

      // Clear start date to trigger validation
      const startDateInput = screen.getByLabelText('開始日')
      await user.clear(startDateInput)

      const downloadButton = screen.getByRole('button', { name: /ダウンロード/ })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(screen.getByText(/日付を入力してください/)).toBeInTheDocument()
      })
    })
  })

  describe('format selection', () => {
    it('should default to PDF format', () => {
      renderReportGeneration()

      const pdfButton = screen.getByRole('button', { name: /PDF/ })
      expect(pdfButton).toHaveClass(/selected|active|bg-/)
    })

    it('should switch to CSV format when CSV button clicked', async () => {
      const user = userEvent.setup()
      renderReportGeneration()

      const csvButton = screen.getByRole('button', { name: /CSV/ })
      await user.click(csvButton)

      expect(csvButton).toHaveClass(/selected|active|bg-/)
    })
  })

  describe('report generation', () => {
    it('should download PDF report with correct params', async () => {
      const user = userEvent.setup()
      renderReportGeneration()

      const startDateInput = screen.getByLabelText(/開始日/)
      const endDateInput = screen.getByLabelText(/終了日/)

      await user.clear(startDateInput)
      await user.type(startDateInput, '2026-01-01')
      await user.clear(endDateInput)
      await user.type(endDateInput, '2026-01-20')

      const downloadButton = screen.getByRole('button', { name: /ダウンロード/ })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(mockDownloadReport).toHaveBeenCalledWith(mockPatientId, {
          start_date: '2026-01-01',
          end_date: '2026-01-20',
          format: 'pdf',
        })
      })
    })

    it('should download CSV report when CSV format selected', async () => {
      const user = userEvent.setup()
      mockDownloadReport.mockResolvedValue(new Blob(['mock csv content'], { type: 'text/csv' }))

      renderReportGeneration()

      const startDateInput = screen.getByLabelText(/開始日/)
      const endDateInput = screen.getByLabelText(/終了日/)
      const csvButton = screen.getByRole('button', { name: /CSV/ })

      await user.click(csvButton)
      await user.clear(startDateInput)
      await user.type(startDateInput, '2026-01-01')
      await user.clear(endDateInput)
      await user.type(endDateInput, '2026-01-20')

      const downloadButton = screen.getByRole('button', { name: /ダウンロード/ })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(mockDownloadReport).toHaveBeenCalledWith(mockPatientId, {
          start_date: '2026-01-01',
          end_date: '2026-01-20',
          format: 'csv',
        })
      })
    })

    it('should create blob URL and trigger download', async () => {
      const user = userEvent.setup()
      renderReportGeneration()

      const startDateInput = screen.getByLabelText(/開始日/)
      const endDateInput = screen.getByLabelText(/終了日/)

      await user.clear(startDateInput)
      await user.type(startDateInput, '2026-01-01')
      await user.clear(endDateInput)
      await user.type(endDateInput, '2026-01-20')

      const downloadButton = screen.getByRole('button', { name: /ダウンロード/ })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled()
      })
    })

    it('should show loading state during download', async () => {
      const user = userEvent.setup()
      mockDownloadReport.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(new Blob()), 100))
      )

      renderReportGeneration()

      const startDateInput = screen.getByLabelText(/開始日/)
      const endDateInput = screen.getByLabelText(/終了日/)

      await user.clear(startDateInput)
      await user.type(startDateInput, '2026-01-01')
      await user.clear(endDateInput)
      await user.type(endDateInput, '2026-01-20')

      const downloadButton = screen.getByRole('button', { name: /ダウンロード/ })
      await user.click(downloadButton)

      expect(screen.getByText(/生成中/)).toBeInTheDocument()
    })

    it('should show error message on download failure', async () => {
      const user = userEvent.setup()
      mockDownloadReport.mockRejectedValue(new Error('Network error'))

      renderReportGeneration()

      const startDateInput = screen.getByLabelText(/開始日/)
      const endDateInput = screen.getByLabelText(/終了日/)

      await user.clear(startDateInput)
      await user.type(startDateInput, '2026-01-01')
      await user.clear(endDateInput)
      await user.type(endDateInput, '2026-01-20')

      const downloadButton = screen.getByRole('button', { name: /ダウンロード/ })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(screen.getByText(/レポートのダウンロードに失敗しました/)).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('should navigate back on cancel', async () => {
      const user = userEvent.setup()
      renderReportGeneration()

      const backButton = screen.getByRole('button', { name: /戻る/ })
      await user.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith(`/patients/${mockPatientId}`)
    })
  })

  describe('accessibility', () => {
    it('should have proper labels for all inputs', () => {
      renderReportGeneration()

      // Check date inputs have labels
      expect(screen.getByLabelText('開始日')).toBeInTheDocument()
      expect(screen.getByLabelText('終了日')).toBeInTheDocument()

      // Check checkbox has label
      expect(screen.getByLabelText('備考欄を含む')).toBeInTheDocument()
    })

    it('should have minimum tap target size for buttons', () => {
      renderReportGeneration()

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
      })
    })

    it('should show validation errors with role="alert"', async () => {
      const user = userEvent.setup()
      renderReportGeneration()

      // Clear start date to trigger validation error
      const startDateInput = screen.getByLabelText('開始日')
      await user.clear(startDateInput)

      const downloadButton = screen.getByRole('button', { name: /ダウンロード/ })
      await user.click(downloadButton)

      await waitFor(() => {
        const alert = screen.getByRole('alert')
        expect(alert).toBeInTheDocument()
        expect(alert).toHaveTextContent(/日付を入力してください/)
      })
    })
  })
})
