import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { PatientCreateDialog } from '../PatientCreateDialog'
import { AuthContext, type AuthContextType } from '../../contexts/AuthContext'
import type { Staff } from '../../lib/api-types'
import { api } from '../../lib/api'

// Mock API
vi.mock('../../lib/api', () => ({
  api: {
    createPatient: vi.fn(),
    getStaffOptions: vi.fn(),
  },
}))

const mockManagerUser: Staff = {
  id: 'manager1',
  staff_id: 'MGR001',
  name: 'テスト マネージャー',
  role: 'manager',
  department: 'リハビリテーション科',
}

// mockStaffUser is available for future access control tests
const _mockStaffUser: Staff = {
  id: 'staff1',
  staff_id: 'STF001',
  name: 'テスト スタッフ',
  role: 'staff',
  department: 'リハビリテーション科',
}
void _mockStaffUser

function createMockAuthContext(staff: Staff | null): AuthContextType {
  return {
    staff,
    isAuthenticated: staff !== null,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
  }
}

interface RenderOptions {
  staff?: Staff | null
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

function renderPatientCreateDialog(options: RenderOptions = {}) {
  const {
    staff = mockManagerUser,
    isOpen = true,
    onOpenChange = vi.fn(),
    onSuccess = vi.fn(),
  } = options

  const authContext = createMockAuthContext(staff)

  return {
    ...render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <PatientCreateDialog
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
          />
        </AuthContext.Provider>
      </BrowserRouter>
    ),
    onOpenChange,
    onSuccess,
  }
}

const mockStaffOptions = [
  { id: 'staff-1', name: '山田 花子' },
  { id: 'staff-2', name: '鈴木 一郎' },
  { id: 'staff-3', name: '佐藤 太郎' },
]

describe('PatientCreateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getStaffOptions).mockResolvedValue({
      status: 'success',
      data: { staff_options: mockStaffOptions },
    })
  })

  describe('dialog visibility', () => {
    it('should render dialog when isOpen is true', () => {
      renderPatientCreateDialog({ isOpen: true })

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: '新規患者登録' })).toBeInTheDocument()
    })

    it('should not render dialog when isOpen is false', () => {
      renderPatientCreateDialog({ isOpen: false })

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should call onOpenChange when close button is clicked', async () => {
      const user = userEvent.setup()
      const { onOpenChange } = renderPatientCreateDialog()

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
      await user.click(cancelButton)

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('form fields', () => {
    it('should render all required input fields', () => {
      renderPatientCreateDialog()

      expect(screen.getByLabelText(/^氏名/)).toBeInTheDocument()
      expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
      expect(screen.getByLabelText(/生年月日/)).toBeInTheDocument()
      expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument()
    })

    it('should render optional input fields', () => {
      renderPatientCreateDialog()

      expect(screen.getByLabelText(/フリガナ/)).toBeInTheDocument()
      expect(screen.getByLabelText(/性別/)).toBeInTheDocument()
      expect(screen.getByLabelText(/電話番号/)).toBeInTheDocument()
      expect(screen.getByLabelText(/病期/)).toBeInTheDocument()
      expect(screen.getByLabelText(/疾患/)).toBeInTheDocument()
    })

    it('should have required indicators on required fields', () => {
      renderPatientCreateDialog()

      const nameLabel = screen.getByText(/^氏名/)
      const emailLabel = screen.getByText(/メールアドレス/)
      const birthDateLabel = screen.getByText(/生年月日/)
      const passwordLabel = screen.getByText(/パスワード/)

      // Required fields should have asterisk
      expect(nameLabel.closest('label')?.textContent).toContain('*')
      expect(emailLabel.closest('label')?.textContent).toContain('*')
      expect(birthDateLabel.closest('label')?.textContent).toContain('*')
      expect(passwordLabel.closest('label')?.textContent).toContain('*')
    })
  })

  describe('form validation', () => {
    it('should show error when submitting with empty required fields', async () => {
      const user = userEvent.setup()
      renderPatientCreateDialog()

      const submitButton = screen.getByRole('button', { name: '登録' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/氏名を入力してください/)).toBeInTheDocument()
      })
    })

    it('should show error for empty name', async () => {
      const user = userEvent.setup()
      renderPatientCreateDialog()

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText(/氏名を入力してください/)).toBeInTheDocument()
      })
    })

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup()
      renderPatientCreateDialog()

      // Fill only name, birth_date, password but NOT email
      // This tests that empty email validation works first
      await user.type(screen.getByLabelText(/^氏名/), 'テスト太郎')
      await user.type(screen.getByLabelText(/生年月日/), '1980-01-01')
      await user.type(screen.getByLabelText(/パスワード/), 'Password1!')

      await user.click(screen.getByRole('button', { name: '登録' }))

      // Should show email required error first
      await waitFor(() => {
        expect(screen.getByText(/メールアドレスを入力してください/)).toBeInTheDocument()
      })
    })

    it('should show error for empty birth date', async () => {
      const user = userEvent.setup()
      renderPatientCreateDialog()

      await user.type(screen.getByLabelText(/^氏名/), 'テスト太郎')
      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'Password1!')

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText(/生年月日を入力してください/)).toBeInTheDocument()
      })
    })
  })

  describe('password complexity check', () => {
    it('should show password requirements', () => {
      renderPatientCreateDialog()

      expect(screen.getByText('8文字以上')).toBeInTheDocument()
      expect(screen.getByText('2種類以上の文字')).toBeInTheDocument()
    })

    it('should update length indicator when password length is met', async () => {
      const user = userEvent.setup()
      renderPatientCreateDialog()

      const passwordInput = screen.getByLabelText(/パスワード/)
      await user.type(passwordInput, '12345678')

      await waitFor(() => {
        const lengthIndicator = screen.getByTestId('password-length-check')
        expect(lengthIndicator).toHaveClass('text-green-600')
      })
    })

    it('should show red indicator when password length is not met', async () => {
      const user = userEvent.setup()
      renderPatientCreateDialog()

      const passwordInput = screen.getByLabelText(/パスワード/)
      await user.type(passwordInput, '1234')

      await waitFor(() => {
        const lengthIndicator = screen.getByTestId('password-length-check')
        expect(lengthIndicator).toHaveClass('text-gray-400')
      })
    })

    it('should update complexity indicator when 2+ character types are used', async () => {
      const user = userEvent.setup()
      renderPatientCreateDialog()

      const passwordInput = screen.getByLabelText(/パスワード/)
      await user.type(passwordInput, 'abc123')

      await waitFor(() => {
        const complexityIndicator = screen.getByTestId('password-complexity-check')
        expect(complexityIndicator).toHaveClass('text-green-600')
      })
    })

    it('should show error when password does not meet requirements', async () => {
      const user = userEvent.setup()
      renderPatientCreateDialog()

      await user.type(screen.getByLabelText(/^氏名/), 'テスト太郎')
      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/生年月日/), '1980-01-01')
      await user.type(screen.getByLabelText(/パスワード/), 'weak')

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText('パスワードは8文字以上、2種類以上の文字を含めてください')).toBeInTheDocument()
      })
    })
  })

  describe('form submission success', () => {
    it('should submit form and show success message with initial password', async () => {
      const user = userEvent.setup()
      vi.mocked(api.createPatient).mockResolvedValue({
        status: 'success',
        data: {
          id: 'new-patient-id',
          user_code: 'USR001',
          name: 'テスト 太郎',
          email: 'test@example.com',
          status: '維持期',
          message: '患者を登録しました。初期パスワードは別途お知らせください。',
        },
      })

      const { onSuccess } = renderPatientCreateDialog()

      await user.type(screen.getByLabelText(/^氏名/), 'テスト 太郎')
      await user.type(screen.getByLabelText(/フリガナ/), 'テスト タロウ')
      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/生年月日/), '1980-01-01')
      await user.type(screen.getByLabelText(/パスワード/), 'Password1!')

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText('患者を登録しました')).toBeInTheDocument()
      })

      // Should display initial password for printing
      expect(screen.getByText(/初期パスワード/)).toBeInTheDocument()
      expect(screen.getByText('Password1!')).toBeInTheDocument()

      expect(api.createPatient).toHaveBeenCalledWith({
        name: 'テスト 太郎',
        name_kana: 'テスト タロウ',
        email: 'test@example.com',
        birth_date: '1980-01-01',
        password: 'Password1!',
        gender: '',
        phone: '',
        status: '維持期',
        condition: '',
        assigned_staff_ids: [],
      })

      expect(onSuccess).toHaveBeenCalled()
    })

    it('should call API with all optional fields', async () => {
      const user = userEvent.setup()
      vi.mocked(api.createPatient).mockResolvedValue({
        status: 'success',
        data: {
          id: 'new-patient-id',
          user_code: 'USR001',
          name: 'テスト 太郎',
          email: 'test@example.com',
          status: '回復期',
          message: '患者を登録しました。',
        },
      })

      renderPatientCreateDialog()

      await user.type(screen.getByLabelText(/^氏名/), 'テスト 太郎')
      await user.type(screen.getByLabelText(/フリガナ/), 'テスト タロウ')
      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/生年月日/), '1980-01-01')
      await user.type(screen.getByLabelText(/パスワード/), 'Password1!')
      await user.selectOptions(screen.getByLabelText(/性別/), 'male')
      await user.type(screen.getByLabelText(/電話番号/), '090-1234-5678')
      await user.selectOptions(screen.getByLabelText(/病期/), '回復期')
      await user.type(screen.getByLabelText(/疾患/), '変形性膝関節症')

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(api.createPatient).toHaveBeenCalledWith({
          name: 'テスト 太郎',
          name_kana: 'テスト タロウ',
          email: 'test@example.com',
          birth_date: '1980-01-01',
          password: 'Password1!',
          gender: 'male',
          phone: '090-1234-5678',
          status: '回復期',
          condition: '変形性膝関節症',
          assigned_staff_ids: [],
        })
      })
    })
  })

  describe('form submission error', () => {
    it('should show error message on API failure', async () => {
      const user = userEvent.setup()
      vi.mocked(api.createPatient).mockRejectedValue(new Error('登録に失敗しました'))

      renderPatientCreateDialog()

      await user.type(screen.getByLabelText(/^氏名/), 'テスト 太郎')
      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/生年月日/), '1980-01-01')
      await user.type(screen.getByLabelText(/パスワード/), 'Password1!')

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText('登録に失敗しました')).toBeInTheDocument()
      })
    })

    it('should show duplicate email error', async () => {
      const user = userEvent.setup()
      const error = new Error('バリデーションエラー')
      ;(error as Error & { errors?: Record<string, string[]> }).errors = {
        email_bidx: ['has already been taken'],
      }
      vi.mocked(api.createPatient).mockRejectedValue(error)

      renderPatientCreateDialog()

      await user.type(screen.getByLabelText(/^氏名/), 'テスト 太郎')
      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/生年月日/), '1980-01-01')
      await user.type(screen.getByLabelText(/パスワード/), 'Password1!')

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText(/このメールアドレスは既に使用されています/)).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should have accessible form labels', () => {
      renderPatientCreateDialog()

      const nameInput = screen.getByLabelText(/^氏名/)
      expect(nameInput).toHaveAccessibleName()
    })

    it('should have minimum tap target size for buttons', () => {
      renderPatientCreateDialog()

      const submitButton = screen.getByRole('button', { name: '登録' })
      expect(submitButton).toHaveClass('min-h-[44px]')

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
      expect(cancelButton).toHaveClass('min-h-[44px]')
    })

    it('should have dialog role', () => {
      renderPatientCreateDialog()

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('should have heading in dialog', () => {
      renderPatientCreateDialog()

      const heading = screen.getByRole('heading', { name: '新規患者登録' })
      expect(heading).toBeInTheDocument()
    })
  })

  describe('status options', () => {
    it('should have default status as 維持期', () => {
      renderPatientCreateDialog()

      const statusSelect = screen.getByLabelText(/病期/) as HTMLSelectElement
      expect(statusSelect.value).toBe('維持期')
    })

    it('should have all status options', () => {
      renderPatientCreateDialog()

      const statusSelect = screen.getByLabelText(/病期/)
      const options = within(statusSelect).getAllByRole('option')

      expect(options).toHaveLength(3)
      expect(options.map(o => o.textContent)).toEqual(['急性期', '回復期', '維持期'])
    })
  })

  describe('gender options', () => {
    it('should have all gender options', () => {
      renderPatientCreateDialog()

      const genderSelect = screen.getByLabelText(/性別/)
      const options = within(genderSelect).getAllByRole('option')

      expect(options.map(o => (o as HTMLOptionElement).value)).toContain('male')
      expect(options.map(o => (o as HTMLOptionElement).value)).toContain('female')
      expect(options.map(o => (o as HTMLOptionElement).value)).toContain('other')
    })
  })

  describe('loading state', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      vi.mocked(api.createPatient).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          status: 'success',
          data: {
            id: 'new-patient-id',
            user_code: 'USR001',
            name: 'テスト 太郎',
            email: 'test@example.com',
            status: '維持期',
            message: '患者を登録しました。',
          },
        }), 1000))
      )

      renderPatientCreateDialog()

      await user.type(screen.getByLabelText(/^氏名/), 'テスト 太郎')
      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/生年月日/), '1980-01-01')
      await user.type(screen.getByLabelText(/パスワード/), 'Password1!')

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText(/登録中/)).toBeInTheDocument()
      })
    })

    it('should disable submit button during submission', async () => {
      const user = userEvent.setup()
      vi.mocked(api.createPatient).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          status: 'success',
          data: {
            id: 'new-patient-id',
            user_code: 'USR001',
            name: 'テスト 太郎',
            email: 'test@example.com',
            status: '維持期',
            message: '患者を登録しました。',
          },
        }), 1000))
      )

      renderPatientCreateDialog()

      await user.type(screen.getByLabelText(/^氏名/), 'テスト 太郎')
      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/生年月日/), '1980-01-01')
      await user.type(screen.getByLabelText(/パスワード/), 'Password1!')

      const submitButton = screen.getByRole('button', { name: '登録' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /登録中/ })).toBeDisabled()
      })
    })
  })

  describe('assigned staff selection', () => {
    it('should fetch and display staff options as checkboxes', async () => {
      renderPatientCreateDialog()

      await waitFor(() => {
        expect(api.getStaffOptions).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(screen.getByText('担当職員')).toBeInTheDocument()
        expect(screen.getByLabelText('山田 花子')).toBeInTheDocument()
        expect(screen.getByLabelText('鈴木 一郎')).toBeInTheDocument()
        expect(screen.getByLabelText('佐藤 太郎')).toBeInTheDocument()
      })
    })

    it('should allow selecting multiple staff members', async () => {
      const user = userEvent.setup()
      renderPatientCreateDialog()

      await waitFor(() => {
        expect(screen.getByLabelText('山田 花子')).toBeInTheDocument()
      })

      const checkbox1 = screen.getByLabelText('山田 花子')
      const checkbox2 = screen.getByLabelText('鈴木 一郎')

      await user.click(checkbox1)
      await user.click(checkbox2)

      expect(checkbox1).toBeChecked()
      expect(checkbox2).toBeChecked()
    })

    it('should include assigned_staff_ids in API request when staff selected', async () => {
      const user = userEvent.setup()
      vi.mocked(api.createPatient).mockResolvedValue({
        status: 'success',
        data: {
          id: 'new-patient-id',
          user_code: 'USR001',
          name: 'テスト 太郎',
          email: 'test@example.com',
          status: '維持期',
          message: '患者を登録しました。',
        },
      })

      renderPatientCreateDialog()

      await waitFor(() => {
        expect(screen.getByLabelText('山田 花子')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^氏名/), 'テスト 太郎')
      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/生年月日/), '1980-01-01')
      await user.type(screen.getByLabelText(/パスワード/), 'Password1!')

      await user.click(screen.getByLabelText('山田 花子'))
      await user.click(screen.getByLabelText('佐藤 太郎'))

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(api.createPatient).toHaveBeenCalledWith(
          expect.objectContaining({
            assigned_staff_ids: ['staff-1', 'staff-3'],
          })
        )
      })
    })

    it('should submit without assigned_staff_ids when no staff selected', async () => {
      const user = userEvent.setup()
      vi.mocked(api.createPatient).mockResolvedValue({
        status: 'success',
        data: {
          id: 'new-patient-id',
          user_code: 'USR001',
          name: 'テスト 太郎',
          email: 'test@example.com',
          status: '維持期',
          message: '患者を登録しました。',
        },
      })

      renderPatientCreateDialog()

      await waitFor(() => {
        expect(screen.getByText('担当職員')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^氏名/), 'テスト 太郎')
      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/生年月日/), '1980-01-01')
      await user.type(screen.getByLabelText(/パスワード/), 'Password1!')

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(api.createPatient).toHaveBeenCalledWith(
          expect.objectContaining({
            assigned_staff_ids: [],
          })
        )
      })
    })
  })

  describe('form reset', () => {
    it('should reset form when dialog is closed and reopened', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()

      const { rerender } = renderPatientCreateDialog({ onOpenChange })

      await user.type(screen.getByLabelText(/^氏名/), 'テスト太郎')
      expect((screen.getByLabelText(/^氏名/) as HTMLInputElement).value).toBe('テスト太郎')

      // Close dialog
      await user.click(screen.getByRole('button', { name: 'キャンセル' }))

      // Rerender with isOpen = false, then isOpen = true
      rerender(
        <BrowserRouter>
          <AuthContext.Provider value={createMockAuthContext(mockManagerUser)}>
            <PatientCreateDialog
              isOpen={false}
              onOpenChange={onOpenChange}
              onSuccess={vi.fn()}
            />
          </AuthContext.Provider>
        </BrowserRouter>
      )

      rerender(
        <BrowserRouter>
          <AuthContext.Provider value={createMockAuthContext(mockManagerUser)}>
            <PatientCreateDialog
              isOpen={true}
              onOpenChange={onOpenChange}
              onSuccess={vi.fn()}
            />
          </AuthContext.Provider>
        </BrowserRouter>
      )

      await waitFor(() => {
        expect((screen.getByLabelText(/^氏名/) as HTMLInputElement).value).toBe('')
      })
    })
  })
})
