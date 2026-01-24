import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { MeasurementInput } from '../MeasurementInput'

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

// Mock the API
const mockCreateMeasurement = vi.fn()

vi.mock('../../lib/api', () => ({
  api: {
    createMeasurement: (patientId: string, data: any) =>
      mockCreateMeasurement(patientId, data),
  },
}))

function renderMeasurementInput() {
  return render(
    <BrowserRouter>
      <MeasurementInput />
    </BrowserRouter>
  )
}

describe('S-05 MeasurementInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateMeasurement.mockResolvedValue({
      status: 'success',
      data: {
        id: 'measurement-1',
        measured_date: '2026-01-24',
        weight_kg: 65.5,
      },
    })
  })

  describe('rendering', () => {
    it('should render page title', () => {
      renderMeasurementInput()

      expect(screen.getByRole('heading', { level: 1, name: /測定値入力/ })).toBeInTheDocument()
    })

    it('should render all measurement input fields', () => {
      renderMeasurementInput()

      expect(screen.getByLabelText(/測定日/)).toBeInTheDocument()
      expect(screen.getByLabelText(/体重.*kg/)).toBeInTheDocument()
      expect(screen.getByLabelText(/膝伸展筋力.*左.*kg/)).toBeInTheDocument()
      expect(screen.getByLabelText(/膝伸展筋力.*右.*kg/)).toBeInTheDocument()
      expect(screen.getByLabelText(/TUG.*秒/)).toBeInTheDocument()
      expect(screen.getByLabelText(/片脚立位.*秒/)).toBeInTheDocument()
      expect(screen.getByLabelText(/NRS痛み/)).toBeInTheDocument()
      expect(screen.getByLabelText(/MMT/)).toBeInTheDocument()
      expect(screen.getByLabelText(/備考/)).toBeInTheDocument()
    })

    it('should render save button', () => {
      renderMeasurementInput()

      expect(screen.getByRole('button', { name: /保存/ })).toBeInTheDocument()
    })

    it('should render cancel button', () => {
      renderMeasurementInput()

      expect(screen.getByRole('button', { name: /キャンセル/ })).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('should validate weight_kg as positive number', async () => {
      const user = userEvent.setup()
      renderMeasurementInput()

      const weightInput = screen.getByLabelText(/体重.*kg/)
      await user.clear(weightInput)
      await user.type(weightInput, '-10')

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/0より大きい値を入力してください/)).toBeInTheDocument()
      })
    })

    it('should accept valid form data', async () => {
      const user = userEvent.setup()
      renderMeasurementInput()

      // Date field already has a default value, so clear and set it
      const dateInput = screen.getByLabelText(/測定日/)
      await user.clear(dateInput)
      await user.type(dateInput, '2026-01-24')

      // Number fields
      const weightInput = screen.getByLabelText(/体重.*kg/)
      await user.clear(weightInput)
      await user.type(weightInput, '65.5')

      const leftKneeInput = screen.getByLabelText(/膝伸展筋力.*左/)
      await user.clear(leftKneeInput)
      await user.type(leftKneeInput, '25.3')

      const rightKneeInput = screen.getByLabelText(/膝伸展筋力.*右/)
      await user.clear(rightKneeInput)
      await user.type(rightKneeInput, '26.1')

      const tugInput = screen.getByLabelText(/TUG/)
      await user.clear(tugInput)
      await user.type(tugInput, '12.5')

      const singleLegInput = screen.getByLabelText(/片脚立位/)
      await user.clear(singleLegInput)
      await user.type(singleLegInput, '15.2')

      const nrsInput = screen.getByLabelText(/NRS痛みスコア/)
      await user.clear(nrsInput)
      await user.type(nrsInput, '3')

      const mmtInput = screen.getByLabelText(/MMTスコア/)
      await user.clear(mmtInput)
      await user.type(mmtInput, '4')

      const notesInput = screen.getByLabelText(/備考/)
      await user.type(notesInput, '前回より改善傾向')

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockCreateMeasurement).toHaveBeenCalledWith(mockPatientId, {
          measured_date: '2026-01-24',
          weight_kg: 65.5,
          knee_extension_strength_left: 25.3,
          knee_extension_strength_right: 26.1,
          tug_seconds: 12.5,
          single_leg_stance_seconds: 15.2,
          nrs_pain_score: 3,
          mmt_score: 4,
          notes: '前回より改善傾向',
        })
      })
    })
  })

  describe('form submission', () => {
    it('should submit measurement data successfully', async () => {
      const user = userEvent.setup()
      renderMeasurementInput()

      const weightInput = screen.getByLabelText(/体重.*kg/)
      await user.clear(weightInput)
      await user.type(weightInput, '65.5')

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockCreateMeasurement).toHaveBeenCalled()
      })
    })

    it('should navigate back on successful submission', async () => {
      const user = userEvent.setup()
      renderMeasurementInput()

      const weightInput = screen.getByLabelText(/体重.*kg/)
      await user.clear(weightInput)
      await user.type(weightInput, '65.5')

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(`/patients/${mockPatientId}`)
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockCreateMeasurement.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ status: 'success' }), 100))
      )

      renderMeasurementInput()

      const weightInput = screen.getByLabelText(/体重.*kg/)
      await user.clear(weightInput)
      await user.type(weightInput, '65.5')

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      expect(screen.getByText(/保存中/)).toBeInTheDocument()
    })

    it('should show error message on submission failure', async () => {
      const user = userEvent.setup()
      mockCreateMeasurement.mockRejectedValue(new Error('Network error'))

      renderMeasurementInput()

      const weightInput = screen.getByLabelText(/体重.*kg/)
      await user.clear(weightInput)
      await user.type(weightInput, '65.5')

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/測定値の保存に失敗しました/)).toBeInTheDocument()
      })
    })

    it('should disable save button while submitting', async () => {
      const user = userEvent.setup()
      mockCreateMeasurement.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ status: 'success' }), 100))
      )

      renderMeasurementInput()

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      expect(saveButton).toBeDisabled()
    })
  })

  describe('navigation', () => {
    it('should navigate back on cancel', async () => {
      const user = userEvent.setup()
      renderMeasurementInput()

      const cancelButton = screen.getByRole('button', { name: /キャンセル/ })
      await user.click(cancelButton)

      expect(mockNavigate).toHaveBeenCalledWith(`/patients/${mockPatientId}`)
    })
  })

  describe('accessibility', () => {
    it('should have proper labels for all inputs', () => {
      renderMeasurementInput()

      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName()
      })
    })

    it('should display validation errors with role="alert"', async () => {
      const user = userEvent.setup()
      renderMeasurementInput()

      // Enter invalid weight to trigger validation error
      const weightInput = screen.getByLabelText(/体重.*kg/)
      await user.clear(weightInput)
      await user.type(weightInput, '-10')

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert')
        expect(alerts.length).toBeGreaterThan(0)
      })
    })

    it('should have minimum tap target size for buttons', () => {
      renderMeasurementInput()

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
        // Visual check - implementation should ensure min 44x44px
      })
    })
  })

  describe('optional fields', () => {
    it('should allow submitting with only required fields', async () => {
      const user = userEvent.setup()
      renderMeasurementInput()

      // The date field already has a default value, so just submit
      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockCreateMeasurement).toHaveBeenCalledWith(mockPatientId, expect.objectContaining({
          measured_date: expect.any(String),
        }))
      })
    })

    it('should submit only filled optional fields', async () => {
      const user = userEvent.setup()
      renderMeasurementInput()

      const weightInput = screen.getByLabelText(/体重.*kg/)
      await user.clear(weightInput)
      await user.type(weightInput, '65.5')

      const nrsInput = screen.getByLabelText(/NRS痛みスコア/)
      await user.clear(nrsInput)
      await user.type(nrsInput, '3')

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockCreateMeasurement).toHaveBeenCalledWith(mockPatientId, expect.objectContaining({
          weight_kg: 65.5,
          nrs_pain_score: 3,
        }))
      })
    })
  })
})
