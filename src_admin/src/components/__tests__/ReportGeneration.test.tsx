import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReportGeneration } from '../ReportGeneration'

// Mock API client
const mockDownloadReport = vi.fn()

vi.mock('../../lib/api-client', () => ({
  default: {
    downloadReport: (patientId: string, params: any) => mockDownloadReport(patientId, params),
  },
}))

const mockNavigate = vi.fn()

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('S-07 ReportGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDownloadReport.mockResolvedValue(new Blob(['mock pdf content'], { type: 'application/pdf' }))
  })

  describe('rendering', () => {
    it('should render page title', () => {
      render(<ReportGeneration onNavigate={mockNavigate} />)

      expect(screen.getByText('レポート生成・出力')).toBeInTheDocument()
    })

    it('should render date range inputs', () => {
      render(<ReportGeneration onNavigate={mockNavigate} />)

      expect(screen.getByLabelText('開始日')).toBeInTheDocument()
      expect(screen.getByLabelText('終了日')).toBeInTheDocument()
    })

    it('should render format selection buttons', () => {
      render(<ReportGeneration onNavigate={mockNavigate} />)

      expect(screen.getByText('PDF')).toBeInTheDocument()
      expect(screen.getByText('CSV')).toBeInTheDocument()
    })

    it('should render download button', () => {
      render(<ReportGeneration onNavigate={mockNavigate} />)

      expect(screen.getByRole('button', { name: /レポートをダウンロード/ })).toBeInTheDocument()
    })

    it('should render include notes checkbox', () => {
      render(<ReportGeneration onNavigate={mockNavigate} />)

      expect(screen.getByRole('checkbox', { name: /備考欄を含む/ })).toBeInTheDocument()
    })

    it('should render report content preview', () => {
      render(<ReportGeneration onNavigate={mockNavigate} />)

      expect(screen.getByText('レポート内容')).toBeInTheDocument()
      expect(screen.getByText(/患者基本情報/)).toBeInTheDocument()
      expect(screen.getByText(/運動実施履歴/)).toBeInTheDocument()
    })

    it('should render quick period buttons', () => {
      render(<ReportGeneration onNavigate={mockNavigate} />)

      expect(screen.getByRole('button', { name: '過去1週間' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '過去1ヶ月' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '過去3ヶ月' })).toBeInTheDocument()
    })
  })

  describe('date range selection', () => {
    it('should allow setting start date', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const startDateInput = screen.getByLabelText('開始日') as HTMLInputElement

      await user.clear(startDateInput)
      await user.type(startDateInput, '2026-01-10')

      expect(startDateInput.value).toBe('2026-01-10')
    })

    it('should allow setting end date', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const endDateInput = screen.getByLabelText('終了日') as HTMLInputElement

      await user.clear(endDateInput)
      await user.type(endDateInput, '2026-01-20')

      expect(endDateInput.value).toBe('2026-01-20')
    })

    it('should set past 1 week when quick button clicked', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const quickButton = screen.getByRole('button', { name: '過去1週間' })
      await user.click(quickButton)

      const startDateInput = screen.getByLabelText('開始日') as HTMLInputElement
      const endDateInput = screen.getByLabelText('終了日') as HTMLInputElement

      // Should have dates set (exact values depend on current date)
      expect(startDateInput.value).toBeTruthy()
      expect(endDateInput.value).toBeTruthy()
    })

    it('should set past 1 month when quick button clicked', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const quickButton = screen.getByRole('button', { name: '過去1ヶ月' })
      await user.click(quickButton)

      const startDateInput = screen.getByLabelText('開始日') as HTMLInputElement
      const endDateInput = screen.getByLabelText('終了日') as HTMLInputElement

      expect(startDateInput.value).toBeTruthy()
      expect(endDateInput.value).toBeTruthy()
    })

    it('should set past 3 months when quick button clicked', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const quickButton = screen.getByRole('button', { name: '過去3ヶ月' })
      await user.click(quickButton)

      const startDateInput = screen.getByLabelText('開始日') as HTMLInputElement
      const endDateInput = screen.getByLabelText('終了日') as HTMLInputElement

      expect(startDateInput.value).toBeTruthy()
      expect(endDateInput.value).toBeTruthy()
    })
  })

  describe('format selection', () => {
    it('should default to PDF format', () => {
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const downloadButton = screen.getByRole('button', { name: /レポートをダウンロード/ })
      expect(downloadButton).toHaveTextContent('PDF')
    })

    it('should switch to CSV format when CSV button clicked', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const csvButton = screen.getByText('CSV').closest('button')!
      await user.click(csvButton)

      const downloadButton = screen.getByRole('button', { name: /レポートをダウンロード/ })
      expect(downloadButton).toHaveTextContent('CSV')
    })

    it('should highlight selected format', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const pdfButton = screen.getByText('PDF').closest('button')!
      const csvButton = screen.getByText('CSV').closest('button')!

      // PDF should be selected by default
      expect(pdfButton).toHaveClass('border-[#3B82F6]')
      expect(csvButton).not.toHaveClass('border-[#3B82F6]')

      // Click CSV
      await user.click(csvButton)

      // CSV should be selected
      expect(csvButton).toHaveClass('border-[#3B82F6]')
      expect(pdfButton).not.toHaveClass('border-[#3B82F6]')
    })
  })

  describe('include notes checkbox', () => {
    it('should default to checked', () => {
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const checkbox = screen.getByRole('checkbox', { name: /備考欄を含む/ })
      expect(checkbox).toBeChecked()
    })

    it('should toggle when clicked', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const checkbox = screen.getByRole('checkbox', { name: /備考欄を含む/ })

      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })

  describe('report generation', () => {
    it('should download PDF report with correct params', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} patientId="patient-1" />)

      // Set dates
      const startDateInput = screen.getByLabelText('開始日')
      const endDateInput = screen.getByLabelText('終了日')

      await user.clear(startDateInput)
      await user.type(startDateInput, '2026-01-01')
      await user.clear(endDateInput)
      await user.type(endDateInput, '2026-01-20')

      // Click download
      const downloadButton = screen.getByRole('button', { name: /レポートをダウンロード/ })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(mockDownloadReport).toHaveBeenCalledWith('patient-1', {
          start_date: '2026-01-01',
          end_date: '2026-01-20',
          format: 'pdf',
        })
      })
    })

    it('should download CSV report when CSV format selected', async () => {
      const user = userEvent.setup()
      mockDownloadReport.mockResolvedValue(new Blob(['mock csv content'], { type: 'text/csv' }))

      render(<ReportGeneration onNavigate={mockNavigate} patientId="patient-1" />)

      // Select CSV format
      const csvButton = screen.getByText('CSV').closest('button')!
      await user.click(csvButton)

      // Set dates
      const startDateInput = screen.getByLabelText('開始日')
      const endDateInput = screen.getByLabelText('終了日')

      await user.clear(startDateInput)
      await user.type(startDateInput, '2026-01-01')
      await user.clear(endDateInput)
      await user.type(endDateInput, '2026-01-20')

      // Click download
      const downloadButton = screen.getByRole('button', { name: /レポートをダウンロード/ })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(mockDownloadReport).toHaveBeenCalledWith('patient-1', {
          start_date: '2026-01-01',
          end_date: '2026-01-20',
          format: 'csv',
        })
      })
    })

    it('should trigger file download', async () => {
      const user = userEvent.setup()
      const mockBlob = new Blob(['mock pdf content'], { type: 'application/pdf' })
      mockDownloadReport.mockResolvedValue(mockBlob)

      // Mock document.createElement and click
      const mockLink = document.createElement('a')
      const mockClick = vi.fn()
      mockLink.click = mockClick
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink)

      render(<ReportGeneration onNavigate={mockNavigate} patientId="patient-1" />)

      const downloadButton = screen.getByRole('button', { name: /レポートをダウンロード/ })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(mockClick).toHaveBeenCalled()
      })
    })

    it('should show error message on download failure', async () => {
      const user = userEvent.setup()
      mockDownloadReport.mockRejectedValue(new Error('Network error'))

      render(<ReportGeneration onNavigate={mockNavigate} patientId="patient-1" />)

      const downloadButton = screen.getByRole('button', { name: /レポートをダウンロード/ })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(screen.getByText(/ダウンロードに失敗しました/)).toBeInTheDocument()
      })
    })

    it('should show loading state during download', async () => {
      const user = userEvent.setup()
      mockDownloadReport.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(new Blob()), 100))
      )

      render(<ReportGeneration onNavigate={mockNavigate} patientId="patient-1" />)

      const downloadButton = screen.getByRole('button', { name: /レポートをダウンロード/ })
      await user.click(downloadButton)

      expect(screen.getByText(/生成中/)).toBeInTheDocument()
    })

    it('should disable download button during generation', async () => {
      const user = userEvent.setup()
      mockDownloadReport.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(new Blob()), 100))
      )

      render(<ReportGeneration onNavigate={mockNavigate} patientId="patient-1" />)

      const downloadButton = screen.getByRole('button', { name: /レポートをダウンロード/ })
      await user.click(downloadButton)

      expect(downloadButton).toBeDisabled()
    })
  })

  describe('navigation', () => {
    it('should navigate to dashboard when no patient ID and back button clicked', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const backButton = screen.getByText(/ダッシュボードに戻る/)
      await user.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith('dashboard')
    })

    it('should navigate to patient detail when patient ID provided and back button clicked', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} patientId="patient-1" />)

      const backButton = screen.getByText(/患者詳細に戻る/)
      await user.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith('patient-detail', 'patient-1')
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('レポート生成・出力')
    })

    it('should have accessible date inputs', () => {
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const startDate = screen.getByLabelText('開始日')
      const endDate = screen.getByLabelText('終了日')

      expect(startDate).toHaveAccessibleName()
      expect(endDate).toHaveAccessibleName()
    })

    it('should have accessible download button', () => {
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const button = screen.getByRole('button', { name: /レポートをダウンロード/ })
      expect(button).toHaveAccessibleName()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} />)

      // Tab through elements
      await user.tab()

      // Should have some element focused (not body)
      expect(document.activeElement).not.toBe(document.body)
    })
  })

  describe('date display', () => {
    it('should display formatted date range', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const startDateInput = screen.getByLabelText('開始日')
      const endDateInput = screen.getByLabelText('終了日')

      await user.clear(startDateInput)
      await user.type(startDateInput, '2026-01-01')
      await user.clear(endDateInput)
      await user.type(endDateInput, '2026-01-20')

      // Should show formatted dates in Japanese format
      expect(screen.getByText(/2026\/1\/1/)).toBeInTheDocument()
      expect(screen.getByText(/2026\/1\/20/)).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('should require patient ID for download', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} />)

      const downloadButton = screen.getByRole('button', { name: /レポートをダウンロード/ })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(screen.getByText(/患者が選択されていません/)).toBeInTheDocument()
      })

      // Should not call API
      expect(mockDownloadReport).not.toHaveBeenCalled()
    })

    it('should validate start date is before end date', async () => {
      const user = userEvent.setup()
      render(<ReportGeneration onNavigate={mockNavigate} patientId="patient-1" />)

      const startDateInput = screen.getByLabelText('開始日')
      const endDateInput = screen.getByLabelText('終了日')

      // Set end date before start date
      await user.clear(startDateInput)
      await user.type(startDateInput, '2026-01-20')
      await user.clear(endDateInput)
      await user.type(endDateInput, '2026-01-10')

      const downloadButton = screen.getByRole('button', { name: /レポートをダウンロード/ })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(screen.getByText(/開始日は終了日より前である必要があります/)).toBeInTheDocument()
      })

      // Should not call API
      expect(mockDownloadReport).not.toHaveBeenCalled()
    })
  })
})
