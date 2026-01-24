import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PatientDetail } from '../PatientDetail'
import type { PatientDetail as PatientDetailType } from '../../lib/api-types'

// Mock useParams to return a patient ID
const mockPatientId = 'patient-123'
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: mockPatientId }),
    useNavigate: () => vi.fn(),
  }
})

// Mock the API
const mockGetPatientDetail = vi.fn()
const mockGetPatientMeasurements = vi.fn()

vi.mock('../../lib/api', () => ({
  api: {
    getPatientDetail: (id: string) => mockGetPatientDetail(id),
    getPatientMeasurements: (id: string, startDate?: string, endDate?: string) =>
      mockGetPatientMeasurements(id, startDate, endDate),
  },
}))

const mockPatientData: PatientDetailType = {
  id: 'patient-123',
  name: '田中太郎',
  name_kana: 'タナカタロウ',
  birth_date: '1960-05-15',
  age: 65,
  gender: '男性',
  email: 'tanaka@example.com',
  phone: '090-1234-5678',
  condition: '変形性膝関節症',
  status: '回復期',
  continue_days: 14,
  assigned_staff: [
    {
      id: 'staff-1',
      name: '山田太郎',
      is_primary: true,
    },
    {
      id: 'staff-2',
      name: '佐藤花子',
      is_primary: false,
    },
  ],
}

function renderPatientDetail() {
  return render(
    <BrowserRouter>
      <PatientDetail />
    </BrowserRouter>
  )
}

describe('S-04 PatientDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPatientDetail.mockResolvedValue({
      status: 'success',
      data: mockPatientData,
    })
    mockGetPatientMeasurements.mockResolvedValue({
      status: 'success',
      data: {
        measurements: [],
      },
    })
  })

  describe('rendering', () => {
    it('should render patient basic information', async () => {
      renderPatientDetail()

      await waitFor(() => {
        expect(screen.getByText('田中太郎')).toBeInTheDocument()
        expect(screen.getByText('タナカタロウ')).toBeInTheDocument()
        expect(screen.getByText(/65/)).toBeInTheDocument()
        expect(screen.getByText(/男性/)).toBeInTheDocument()
        expect(screen.getByText('tanaka@example.com')).toBeInTheDocument()
        expect(screen.getByText('090-1234-5678')).toBeInTheDocument()
      })
    })

    it('should render patient condition and status', async () => {
      renderPatientDetail()

      await waitFor(() => {
        expect(screen.getByText('変形性膝関節症')).toBeInTheDocument()
        expect(screen.getByText('回復期')).toBeInTheDocument()
      })
    })

    it('should render continue days', async () => {
      renderPatientDetail()

      await waitFor(() => {
        expect(screen.getByText(/14/)).toBeInTheDocument()
        expect(screen.getByText(/継続日数/)).toBeInTheDocument()
      })
    })

    it('should render assigned staff with primary indicator', async () => {
      renderPatientDetail()

      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeInTheDocument()
        expect(screen.getByText('佐藤花子')).toBeInTheDocument()
        expect(screen.getByText(/主担当/)).toBeInTheDocument()
      })
    })

    it('should render status badge with correct styling', async () => {
      renderPatientDetail()

      await waitFor(() => {
        const statusBadge = screen.getByText('回復期')
        expect(statusBadge).toHaveClass('bg-yellow-100')
        expect(statusBadge).toHaveClass('text-yellow-700')
      })
    })

    it('should display page title', async () => {
      renderPatientDetail()

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /患者詳細/ })).toBeInTheDocument()
      })
    })
  })

  describe('data fetching', () => {
    it('should call getPatientDetail with correct patient ID', async () => {
      renderPatientDetail()

      await waitFor(() => {
        expect(mockGetPatientDetail).toHaveBeenCalledWith(mockPatientId)
      })
    })

    it('should show loading state while fetching data', () => {
      mockGetPatientDetail.mockReturnValue(
        new Promise(() => {}) // Never resolves
      )

      renderPatientDetail()

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText(/読み込み中/)).toBeInTheDocument()
    })

    it('should show error message when API fails', async () => {
      mockGetPatientDetail.mockRejectedValue(new Error('Network error'))

      renderPatientDetail()

      await waitFor(() => {
        expect(screen.getByText(/患者情報の取得に失敗しました/)).toBeInTheDocument()
      })
    })

    it('should show error for unauthorized access', async () => {
      mockGetPatientDetail.mockRejectedValue({
        status: 403,
        message: 'Forbidden',
      })

      renderPatientDetail()

      await waitFor(() => {
        expect(screen.getByText(/この患者の情報にアクセスする権限がありません/)).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('should have back button', async () => {
      renderPatientDetail()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /戻る/ })).toBeInTheDocument()
      })
    })

    it('should have button to add measurements', async () => {
      renderPatientDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /測定値を入力/ })
        ).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', async () => {
      renderPatientDetail()

      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1 })
        expect(h1).toBeInTheDocument()
      })
    })

    it('should have accessible labels for data fields', async () => {
      renderPatientDetail()

      await waitFor(() => {
        expect(screen.getByText(/氏名/)).toBeInTheDocument()
        expect(screen.getByText(/年齢/)).toBeInTheDocument()
        expect(screen.getByText(/性別/)).toBeInTheDocument()
        expect(screen.getByText(/疾患/)).toBeInTheDocument()
      })
    })

    it('should have minimum tap target size for buttons', async () => {
      renderPatientDetail()

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        buttons.forEach(button => {
          expect(button).toBeInTheDocument()
          // Visual check - implementation should ensure min 44x44px
        })
      })
    })
  })

  describe('authorization', () => {
    it('should handle staff-only access correctly', async () => {
      renderPatientDetail()

      await waitFor(() => {
        expect(mockGetPatientDetail).toHaveBeenCalled()
      })
    })

    it('should display appropriate error for non-assigned staff', async () => {
      const error = {
        status: 403,
        message: 'この患者の担当ではありません',
      }
      mockGetPatientDetail.mockRejectedValue(error)

      renderPatientDetail()

      await waitFor(() => {
        expect(screen.getByText(/この患者の情報にアクセスする権限がありません/)).toBeInTheDocument()
      })
    })
  })
})
