import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Sidebar } from '../Sidebar'
import type { Staff } from '../../lib/api-types'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }),
  }
})

// Mock AuthContext
const mockLogout = vi.fn()
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    staff: mockStaff,
    logout: mockLogout,
  }),
}))

let mockStaff: Staff | null = null

function renderSidebar(staff: Staff) {
  mockStaff = staff
  return render(
    <BrowserRouter>
      <Sidebar staff={staff} onLogout={mockLogout} currentPath="/dashboard" />
    </BrowserRouter>
  )
}

describe('Sidebar', () => {
  const managerStaff: Staff = {
    id: '1',
    staff_id: 'ST001',
    name: '山田 太郎',
    role: 'manager',
    department: 'リハビリテーション科',
  }

  const regularStaff: Staff = {
    id: '2',
    staff_id: 'ST002',
    name: '佐藤 花子',
    role: 'staff',
    department: 'リハビリテーション科',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render hospital name and system title', () => {
      renderSidebar(managerStaff)

      expect(screen.getByText('サイテック病院')).toBeInTheDocument()
      expect(screen.getByText('リハビリ支援システム')).toBeInTheDocument()
    })

    it('should render navigation items', () => {
      renderSidebar(managerStaff)

      expect(screen.getByRole('link', { name: /ダッシュボード/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /患者一覧/ })).toBeInTheDocument()
    })

    it('should render staff name and role', () => {
      renderSidebar(managerStaff)

      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
      expect(screen.getByText('マネージャー')).toBeInTheDocument()
    })

    it('should render logout button', () => {
      renderSidebar(managerStaff)

      expect(screen.getByRole('button', { name: /ログアウト/ })).toBeInTheDocument()
    })

    it('should have sidebar background color #1E40AF', () => {
      const { container } = renderSidebar(managerStaff)

      const sidebar = container.querySelector('aside')
      expect(sidebar).toHaveClass('bg-[#1E40AF]')
    })
  })

  describe('role-based navigation', () => {
    it('should show staff management link for managers', () => {
      renderSidebar(managerStaff)

      expect(screen.getByRole('link', { name: /職員管理/ })).toBeInTheDocument()
    })

    it('should NOT show staff management link for regular staff', () => {
      renderSidebar(regularStaff)

      expect(screen.queryByRole('link', { name: /職員管理/ })).not.toBeInTheDocument()
    })
  })

  describe('active state', () => {
    it('should highlight active navigation item', () => {
      render(
        <BrowserRouter>
          <Sidebar staff={managerStaff} onLogout={mockLogout} currentPath="/dashboard" />
        </BrowserRouter>
      )

      const dashboardLink = screen.getByRole('link', { name: /ダッシュボード/ })
      expect(dashboardLink).toHaveClass('bg-blue-800')
    })

    it('should not highlight inactive navigation items', () => {
      render(
        <BrowserRouter>
          <Sidebar staff={managerStaff} onLogout={mockLogout} currentPath="/dashboard" />
        </BrowserRouter>
      )

      const patientsLink = screen.getByRole('link', { name: /患者一覧/ })
      expect(patientsLink).not.toHaveClass('bg-blue-800')
    })
  })

  describe('logout functionality', () => {
    it('should call onLogout when logout button is clicked', async () => {
      const user = userEvent.setup()
      renderSidebar(managerStaff)

      await user.click(screen.getByRole('button', { name: /ログアウト/ }))

      expect(mockLogout).toHaveBeenCalledTimes(1)
    })
  })

  describe('navigation', () => {
    it('should have correct href for dashboard link', () => {
      renderSidebar(managerStaff)

      const link = screen.getByRole('link', { name: /ダッシュボード/ })
      expect(link).toHaveAttribute('href', '/dashboard')
    })

    it('should have correct href for patients link', () => {
      renderSidebar(managerStaff)

      const link = screen.getByRole('link', { name: /患者一覧/ })
      expect(link).toHaveAttribute('href', '/patients')
    })

    it('should have correct href for staff management link', () => {
      renderSidebar(managerStaff)

      const link = screen.getByRole('link', { name: /職員管理/ })
      expect(link).toHaveAttribute('href', '/staff')
    })
  })

  describe('accessibility', () => {
    it('should have accessible navigation landmark', () => {
      renderSidebar(managerStaff)

      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should have minimum tap target size for buttons', () => {
      renderSidebar(managerStaff)

      const logoutButton = screen.getByRole('button', { name: /ログアウト/ })
      expect(logoutButton).toHaveClass('min-h-[44px]')
    })
  })
})
