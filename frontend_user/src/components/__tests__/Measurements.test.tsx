import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Measurements } from '../Measurements'

// Mock Recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}))

// Mock the AuthContext
const mockUseAuth = vi.fn()
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock API client
const mockGetMeasurements = vi.fn()
vi.mock('../../lib/api-client', () => ({
  apiClient: {
    getMeasurements: () => mockGetMeasurements(),
  },
}))

const mockMeasurements = [
  {
    id: '1',
    user_id: 'user1',
    measured_date: '2026-01-24',
    weight_kg: 65.5,
    body_fat_percentage: 18.5,
    muscle_mass_kg: 52.3,
    nrs_pain: 3,
    created_at: '2026-01-24T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'user1',
    measured_date: '2026-01-23',
    weight_kg: 66.0,
    body_fat_percentage: 19.0,
    muscle_mass_kg: 52.0,
    nrs_pain: 4,
    created_at: '2026-01-23T10:00:00Z',
  },
  {
    id: '3',
    user_id: 'user1',
    measured_date: '2026-01-22',
    weight_kg: 66.5,
    body_fat_percentage: 19.5,
    muscle_mass_kg: 51.8,
    nrs_pain: 5,
    created_at: '2026-01-22T10:00:00Z',
  },
]

function renderMeasurements() {
  return render(
    <BrowserRouter>
      <Measurements />
    </BrowserRouter>
  )
}

describe('U-08 Measurements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        name: '田中太郎',
        email: 'tanaka@example.com',
        continue_days: 14,
      },
      isAuthenticated: true,
      isLoading: false,
    })
    mockGetMeasurements.mockResolvedValue({
      status: 'success',
      data: { measurements: mockMeasurements },
    })
  })

  describe('rendering', () => {
    it('should render page title', async () => {
      renderMeasurements()

      await waitFor(() => {
        expect(screen.getByText('測定値グラフ')).toBeInTheDocument()
      })
    })

    it('should render back button', async () => {
      renderMeasurements()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /戻る/ })).toBeInTheDocument()
      })
    })

    it('should render date filter controls', async () => {
      renderMeasurements()

      await waitFor(() => {
        expect(screen.getByLabelText(/開始日/)).toBeInTheDocument()
        expect(screen.getByLabelText(/終了日/)).toBeInTheDocument()
      })
    })
  })

  describe('loading state', () => {
    it('should show loading state while fetching data', () => {
      mockGetMeasurements.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      renderMeasurements()

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('chart display', () => {
    it('should display chart after loading data', async () => {
      renderMeasurements()

      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      })
    })

    it('should display responsive container for chart', async () => {
      renderMeasurements()

      await waitFor(() => {
        expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      })
    })
  })

  describe('measurement selection', () => {
    it('should render measurement type selector', async () => {
      renderMeasurements()

      await waitFor(() => {
        // Check for measurement label text
        expect(screen.getByText(/表示する項目/)).toBeInTheDocument()
      })
    })

    it('should have checkboxes for each measurement type', async () => {
      renderMeasurements()

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('should toggle measurement visibility on checkbox click', async () => {
      const user = userEvent.setup()
      renderMeasurements()

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /体重/ })).toBeInTheDocument()
      })

      const weightCheckbox = screen.getByRole('checkbox', { name: /体重/ })
      await user.click(weightCheckbox)

      // Checkbox state should toggle
      expect(weightCheckbox).not.toBeChecked()
    })
  })

  describe('data display', () => {
    it('should show empty state when no measurements', async () => {
      mockGetMeasurements.mockResolvedValue({
        status: 'success',
        data: { measurements: [] },
      })

      renderMeasurements()

      await waitFor(() => {
        expect(screen.getByText(/測定データがありません/)).toBeInTheDocument()
      })
    })

    it('should display measurement count', async () => {
      renderMeasurements()

      await waitFor(() => {
        expect(screen.getByText(/3件/)).toBeInTheDocument()
      })
    })
  })

  describe('date filtering', () => {
    it('should show current month by default', async () => {
      renderMeasurements()

      await waitFor(() => {
        const startDateInput = screen.getByLabelText(/開始日/) as HTMLInputElement
        expect(startDateInput.value).toBeTruthy()
      })
    })
  })

  describe('error handling', () => {
    it('should show error message on API failure', async () => {
      mockGetMeasurements.mockRejectedValue(new Error('データの取得に失敗しました'))

      renderMeasurements()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('should allow retry on error', async () => {
      mockGetMeasurements
        .mockRejectedValueOnce(new Error('エラー'))
        .mockResolvedValueOnce({
          status: 'success',
          data: { measurements: mockMeasurements },
        })

      const user = userEvent.setup()
      renderMeasurements()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      const retryButton = screen.getByRole('button', { name: /再試行/ })
      await user.click(retryButton)

      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('should navigate back on back button click', async () => {
      const user = userEvent.setup()
      renderMeasurements()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /戻る/ })).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /戻る/ })
      await user.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith(-1)
    })
  })

  describe('authentication', () => {
    it('should redirect to login if not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      renderMeasurements()

      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })

    it('should show loading state while checking auth', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      })

      renderMeasurements()

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', async () => {
      renderMeasurements()

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()
      })
    })

    it('should have accessible date inputs', async () => {
      renderMeasurements()

      await waitFor(() => {
        const startDateInput = screen.getByLabelText(/開始日/)
        const endDateInput = screen.getByLabelText(/終了日/)

        expect(startDateInput).toHaveAccessibleName()
        expect(endDateInput).toHaveAccessibleName()
      })
    })

    it('should have accessible checkboxes', async () => {
      renderMeasurements()

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox')
        checkboxes.forEach((checkbox) => {
          expect(checkbox).toHaveAccessibleName()
        })
      })
    })
  })
})
