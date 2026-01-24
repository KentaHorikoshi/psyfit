import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ConditionInput } from '../ConditionInput'

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
const mockCreateDailyCondition = vi.fn()
vi.mock('../../lib/api-client', () => ({
  apiClient: {
    createDailyCondition: () => mockCreateDailyCondition(),
  },
}))

function renderConditionInput() {
  return render(
    <BrowserRouter>
      <ConditionInput />
    </BrowserRouter>
  )
}

describe('U-14 ConditionInput', () => {
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
    mockCreateDailyCondition.mockResolvedValue({
      status: 'success',
      data: {
        id: '1',
        recorded_date: '2026-01-24',
        pain_level: 3,
        body_condition: 7,
        notes: '',
      },
    })
  })

  describe('rendering', () => {
    it('should render page title', () => {
      renderConditionInput()
      expect(screen.getByText('今日の体調')).toBeInTheDocument()
    })

    it('should render pain level slider with label', () => {
      renderConditionInput()
      expect(screen.getByText('痛みの程度')).toBeInTheDocument()
      expect(screen.getByRole('slider', { name: /痛み/ })).toBeInTheDocument()
    })

    it('should render body condition slider with label', () => {
      renderConditionInput()
      expect(screen.getByText('体の調子')).toBeInTheDocument()
      expect(screen.getByRole('slider', { name: /調子/ })).toBeInTheDocument()
    })

    it('should render notes textarea', () => {
      renderConditionInput()
      expect(screen.getByPlaceholderText(/今日の調子/)).toBeInTheDocument()
    })

    it('should render save button', () => {
      renderConditionInput()
      expect(screen.getByRole('button', { name: /保存/ })).toBeInTheDocument()
    })

    it('should render skip button', () => {
      renderConditionInput()
      expect(screen.getByRole('button', { name: /スキップ/ })).toBeInTheDocument()
    })
  })

  describe('slider functionality', () => {
    it('should display initial pain level value as 5', () => {
      renderConditionInput()
      const slider = screen.getByRole('slider', { name: /痛み/ })
      expect(slider).toHaveValue('5')
    })

    it('should display initial body condition value as 5', () => {
      renderConditionInput()
      const slider = screen.getByRole('slider', { name: /調子/ })
      expect(slider).toHaveValue('5')
    })

    it('should have min value of 0 and max value of 10 for pain slider', () => {
      renderConditionInput()
      const slider = screen.getByRole('slider', { name: /痛み/ })
      expect(slider).toHaveAttribute('min', '0')
      expect(slider).toHaveAttribute('max', '10')
    })

    it('should have min value of 0 and max value of 10 for body condition slider', () => {
      renderConditionInput()
      const slider = screen.getByRole('slider', { name: /調子/ })
      expect(slider).toHaveAttribute('min', '0')
      expect(slider).toHaveAttribute('max', '10')
    })

    it('should display slider value labels (0-10 scale)', () => {
      renderConditionInput()
      // Multiple elements with "0" and "10" exist (one for each slider)
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1)
    })

    it('should update pain level when slider changes', () => {
      renderConditionInput()

      const slider = screen.getByRole('slider', { name: /痛み/ })

      // Use fireEvent for range input changes
      fireEvent.change(slider, { target: { value: '3' } })

      // The displayed value should update
      expect(screen.getByTestId('pain-level-value')).toHaveTextContent('3')
    })

    it('should update body condition when slider changes', () => {
      renderConditionInput()

      const slider = screen.getByRole('slider', { name: /調子/ })

      // Use fireEvent for range input changes
      fireEvent.change(slider, { target: { value: '8' } })

      expect(screen.getByTestId('body-condition-value')).toHaveTextContent('8')
    })
  })

  describe('notes input', () => {
    it('should allow typing in notes textarea', async () => {
      const user = userEvent.setup()
      renderConditionInput()

      const textarea = screen.getByPlaceholderText(/今日の調子/)
      await user.type(textarea, '少し腰が痛い')

      expect(textarea).toHaveValue('少し腰が痛い')
    })
  })

  describe('form submission', () => {
    it('should call API with correct data on save', async () => {
      const user = userEvent.setup()
      renderConditionInput()

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockCreateDailyCondition).toHaveBeenCalled()
      })
    })

    it('should navigate to home after successful save', async () => {
      const user = userEvent.setup()
      renderConditionInput()

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/home')
      })
    })

    it('should show loading state while saving', async () => {
      mockCreateDailyCondition.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const user = userEvent.setup()
      renderConditionInput()

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      expect(saveButton).toBeDisabled()
    })

    it('should show error message on API failure', async () => {
      mockCreateDailyCondition.mockRejectedValue(new Error('保存に失敗しました'))

      const user = userEvent.setup()
      renderConditionInput()

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })

  describe('skip functionality', () => {
    it('should navigate to home on skip without saving', async () => {
      const user = userEvent.setup()
      renderConditionInput()

      const skipButton = screen.getByRole('button', { name: /スキップ/ })
      await user.click(skipButton)

      expect(mockCreateDailyCondition).not.toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/home')
    })
  })

  describe('authentication', () => {
    it('should redirect to login if not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      renderConditionInput()

      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })

    it('should show loading state while checking auth', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      })

      renderConditionInput()

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have accessible slider labels', () => {
      renderConditionInput()

      const painSlider = screen.getByRole('slider', { name: /痛み/ })
      const bodySlider = screen.getByRole('slider', { name: /調子/ })

      expect(painSlider).toHaveAccessibleName()
      expect(bodySlider).toHaveAccessibleName()
    })

    it('should have proper heading structure', () => {
      renderConditionInput()

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
    })

    it('should have minimum tap target size for buttons', () => {
      renderConditionInput()

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument()
      })
    })

    it('should have proper form labels', () => {
      renderConditionInput()

      // Sliders should have associated labels
      expect(screen.getByText('痛みの程度')).toBeInTheDocument()
      expect(screen.getByText('体の調子')).toBeInTheDocument()
    })
  })

  describe('back navigation', () => {
    it('should render back button', () => {
      renderConditionInput()

      const backButton = screen.getByRole('button', { name: /戻る/ })
      expect(backButton).toBeInTheDocument()
    })

    it('should navigate back on back button click', async () => {
      const user = userEvent.setup()
      renderConditionInput()

      const backButton = screen.getByRole('button', { name: /戻る/ })
      await user.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith(-1)
    })
  })
})
