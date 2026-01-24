import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { StaffManagement } from '../StaffManagement'
import { AuthContext, type AuthContextType } from '../../contexts/AuthContext'
import type { Staff, StaffMember } from '../../lib/api-types'
import { api } from '../../lib/api'

// Mock API
vi.mock('../../lib/api', () => ({
  api: {
    getStaffList: vi.fn(),
    createStaff: vi.fn(),
  },
}))

const mockStaffList: StaffMember[] = [
  {
    id: 's1',
    staff_id: 'ST001',
    name: '山田 太郎',
    name_kana: 'ヤマダ タロウ',
    email: 'yamada@example.com',
    role: 'manager',
    department: 'リハビリテーション科',
    created_at: '2026-01-01',
  },
  {
    id: 's2',
    staff_id: 'ST002',
    name: '佐藤 花子',
    name_kana: 'サトウ ハナコ',
    email: 'sato@example.com',
    role: 'staff',
    department: 'リハビリテーション科',
    created_at: '2026-01-02',
  },
  {
    id: 's3',
    staff_id: 'ST003',
    name: '田中 一郎',
    name_kana: 'タナカ イチロウ',
    email: 'tanaka@example.com',
    role: 'staff',
    department: '外来',
    created_at: '2026-01-03',
  },
]

const mockManagerUser: Staff = {
  id: 'manager1',
  staff_id: 'MGR001',
  name: 'テスト マネージャー',
  role: 'manager',
  department: 'リハビリテーション科',
}

const mockStaffUser: Staff = {
  id: 'staff1',
  staff_id: 'STF001',
  name: 'テスト スタッフ',
  role: 'staff',
  department: 'リハビリテーション科',
}

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

function renderWithAuth(staff: Staff | null) {
  const authContext = createMockAuthContext(staff)

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authContext}>
        <StaffManagement />
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

describe('S-08 StaffManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getStaffList).mockResolvedValue({
      status: 'success',
      data: {
        staff: mockStaffList,
        meta: { total: 3, page: 1, per_page: 10, total_pages: 1 },
      },
    })
  })

  describe('access control', () => {
    it('should show access denied for non-manager users', () => {
      renderWithAuth(mockStaffUser)

      expect(screen.getByText('アクセス権限がありません')).toBeInTheDocument()
      expect(screen.getByText(/マネージャー権限が必要です/)).toBeInTheDocument()
    })

    it('should render content for manager users', async () => {
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '職員管理' })).toBeInTheDocument()
      })
    })
  })

  describe('rendering', () => {
    it('should render page title', async () => {
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '職員管理' })).toBeInTheDocument()
      })
    })

    it('should render total staff count', async () => {
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByText(/全3名/)).toBeInTheDocument()
      })
    })

    it('should render create staff button', async () => {
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規職員登録/ })).toBeInTheDocument()
      })
    })
  })

  describe('staff table', () => {
    it('should render table headers', async () => {
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('columnheader', { name: '職員ID' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: '職員名' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: 'メールアドレス' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: '権限' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: '部署' })).toBeInTheDocument()
      })
    })

    it('should render staff rows', async () => {
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByText('山田 太郎')).toBeInTheDocument()
        expect(screen.getByText('佐藤 花子')).toBeInTheDocument()
        expect(screen.getByText('田中 一郎')).toBeInTheDocument()
      })
    })

    it('should render staff details', async () => {
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByText('ST001')).toBeInTheDocument()
        expect(screen.getByText('yamada@example.com')).toBeInTheDocument()
        expect(screen.getAllByText('リハビリテーション科').length).toBeGreaterThan(0)
      })
    })
  })

  describe('role badges', () => {
    it('should render manager badge with primary styling', async () => {
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        const managerBadges = screen.getAllByText('マネージャー')
        const tableBadge = managerBadges.find((badge) =>
          badge.classList.contains('bg-blue-100')
        )
        expect(tableBadge).toBeDefined()
        expect(tableBadge!).toHaveClass('bg-blue-100', 'text-blue-700')
      })
    })

    it('should render staff badge with gray styling', async () => {
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        const staffBadges = screen.getAllByText('スタッフ')
        const tableBadge = staffBadges.find((badge) =>
          badge.classList.contains('bg-gray-100')
        )
        expect(tableBadge).toBeDefined()
        expect(tableBadge!).toHaveClass('bg-gray-100', 'text-gray-700')
      })
    })
  })

  describe('create staff dialog', () => {
    it('should open dialog when create button is clicked', async () => {
      const user = userEvent.setup()
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規職員登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規職員登録/ }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: '新規職員登録' })).toBeInTheDocument()
      })
    })

    it('should render all input fields', async () => {
      const user = userEvent.setup()
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規職員登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規職員登録/ }))

      await waitFor(() => {
        expect(screen.getByLabelText(/職員ID/)).toBeInTheDocument()
        expect(screen.getByLabelText(/^氏名/)).toBeInTheDocument()
        expect(screen.getByLabelText(/フリガナ/)).toBeInTheDocument()
        expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
        expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument()
        expect(screen.getByLabelText(/権限/)).toBeInTheDocument()
        expect(screen.getByLabelText(/部署/)).toBeInTheDocument()
      })
    })

    it('should close dialog when cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規職員登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規職員登録/ }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'キャンセル' }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('password complexity', () => {
    it('should show password requirements', async () => {
      const user = userEvent.setup()
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規職員登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規職員登録/ }))

      await waitFor(() => {
        expect(screen.getByText('8文字以上')).toBeInTheDocument()
        expect(screen.getByText('2種類以上の文字')).toBeInTheDocument()
      })
    })

    it('should update length indicator when password length is met', async () => {
      const user = userEvent.setup()
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規職員登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規職員登録/ }))

      const passwordInput = screen.getByLabelText(/パスワード/)
      await user.type(passwordInput, '12345678')

      await waitFor(() => {
        const lengthIndicator = screen.getByTestId('password-length-check')
        expect(lengthIndicator).toHaveClass('text-green-600')
      })
    })

    it('should update complexity indicator when 2+ character types are used', async () => {
      const user = userEvent.setup()
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規職員登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規職員登録/ }))

      const passwordInput = screen.getByLabelText(/パスワード/)
      await user.type(passwordInput, 'abc123')

      await waitFor(() => {
        const complexityIndicator = screen.getByTestId('password-complexity-check')
        expect(complexityIndicator).toHaveClass('text-green-600')
      })
    })
  })

  describe('form validation', () => {
    it('should show error when required fields are empty', async () => {
      const user = userEvent.setup()
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規職員登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規職員登録/ }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText('職員IDを入力してください')).toBeInTheDocument()
      })
    })

    it('should show error for empty email', async () => {
      const user = userEvent.setup()

      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規職員登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規職員登録/ }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Fill required fields except email
      await user.type(screen.getByLabelText(/職員ID/), 'ST004')
      await user.type(screen.getByLabelText(/^氏名/), '新規 職員')
      await user.type(screen.getByLabelText(/フリガナ/), 'シンキ ショクイン')
      // Skip email input
      await user.type(screen.getByLabelText(/パスワード/), 'Password123')
      await user.type(screen.getByLabelText(/部署/), 'リハビリテーション科')

      const dialog = screen.getByRole('dialog')
      const submitButton = within(dialog).getByRole('button', { name: '登録' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument()
      })
    })

    it('should show error when password does not meet requirements', async () => {
      const user = userEvent.setup()
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規職員登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規職員登録/ }))

      const passwordInput = screen.getByLabelText(/パスワード/)
      await user.type(passwordInput, 'short')

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText('パスワードは8文字以上、2種類以上の文字を含めてください')).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('should submit form and show success message', async () => {
      const user = userEvent.setup()
      vi.mocked(api.createStaff).mockResolvedValue({
        status: 'success',
        data: {
          staff: {
            id: 's4',
            staff_id: 'ST004',
            name: '新規 職員',
            name_kana: 'シンキ ショクイン',
            email: 'new@example.com',
            role: 'staff',
            department: 'リハビリテーション科',
            created_at: '2026-01-24',
          },
        },
      })

      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規職員登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規職員登録/ }))

      await user.type(screen.getByLabelText(/職員ID/), 'ST004')
      await user.type(screen.getByLabelText(/^氏名/), '新規 職員')
      await user.type(screen.getByLabelText(/フリガナ/), 'シンキ ショクイン')
      await user.type(screen.getByLabelText(/メールアドレス/), 'new@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'Password123')
      await user.selectOptions(screen.getByLabelText(/権限/), 'staff')
      await user.type(screen.getByLabelText(/部署/), 'リハビリテーション科')

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText('職員を登録しました')).toBeInTheDocument()
      })

      expect(api.createStaff).toHaveBeenCalledWith({
        staff_id: 'ST004',
        name: '新規 職員',
        name_kana: 'シンキ ショクイン',
        email: 'new@example.com',
        password: 'Password123',
        role: 'staff',
        department: 'リハビリテーション科',
      })
    })

    it('should show error message on API failure', async () => {
      const user = userEvent.setup()
      vi.mocked(api.createStaff).mockRejectedValue(new Error('登録に失敗しました'))

      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規職員登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規職員登録/ }))

      await user.type(screen.getByLabelText(/職員ID/), 'ST004')
      await user.type(screen.getByLabelText(/^氏名/), '新規 職員')
      await user.type(screen.getByLabelText(/フリガナ/), 'シンキ ショクイン')
      await user.type(screen.getByLabelText(/メールアドレス/), 'new@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'Password123')
      await user.selectOptions(screen.getByLabelText(/権限/), 'staff')
      await user.type(screen.getByLabelText(/部署/), 'リハビリテーション科')

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText('登録に失敗しました')).toBeInTheDocument()
      })
    })
  })

  describe('loading state', () => {
    it('should show loading indicator while fetching staff', async () => {
      vi.mocked(api.getStaffList).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          status: 'success',
          data: { staff: [], meta: { total: 0, page: 1, per_page: 10, total_pages: 0 } },
        }), 100))
      )

      renderWithAuth(mockManagerUser)

      expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('should show empty message when no staff exist', async () => {
      vi.mocked(api.getStaffList).mockResolvedValue({
        status: 'success',
        data: { staff: [], meta: { total: 0, page: 1, per_page: 10, total_pages: 0 } },
      })

      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByText('職員が登録されていません')).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper table structure', async () => {
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        const table = screen.getByRole('table')
        expect(table).toBeInTheDocument()
        expect(within(table).getAllByRole('columnheader')).toHaveLength(5)
      })
    })

    it('should have minimum tap target size for buttons', async () => {
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /新規職員登録/ })
        expect(createButton).toHaveClass('min-h-[44px]')
      })
    })

    it('should have accessible form labels', async () => {
      const user = userEvent.setup()
      renderWithAuth(mockManagerUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規職員登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規職員登録/ }))

      await waitFor(() => {
        const staffIdInput = screen.getByLabelText(/職員ID/)
        expect(staffIdInput).toHaveAccessibleName()
      })
    })
  })
})
