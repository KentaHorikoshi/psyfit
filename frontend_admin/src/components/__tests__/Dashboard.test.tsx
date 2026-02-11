import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Dashboard } from '../Dashboard'
import type { Staff, Patient, DashboardStats } from '../../lib/api-types'
import { api } from '../../lib/api'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../lib/api', () => ({
  api: {
    getTodayAppointments: vi.fn(),
  },
}))

const mockStaff: Staff = {
  id: '1',
  staff_id: 'ST001',
  name: '山田 太郎',
  role: 'manager',
  department: 'リハビリテーション科',
}

const mockPatients: Patient[] = [
  {
    id: 'p1',
    name: '伊藤 正男',
    name_kana: 'イトウ マサオ',
    age: 78,
    gender: '男性',
    condition: '大腿骨頸部骨折術後',
    status: '回復期',
    staff_id: 'ST001',
    staff_name: '山田 太郎',
    last_exercise_at: '2026-01-23',
  },
  {
    id: 'p2',
    name: '加藤 武',
    name_kana: 'カトウ タケシ',
    age: 72,
    gender: '男性',
    condition: '脊柱管狭窄症',
    status: '維持期',
    staff_id: 'ST001',
    staff_name: '山田 太郎',
    last_exercise_at: '2026-01-22',
  },
  {
    id: 'p3',
    name: '佐藤 健二',
    name_kana: 'サトウ ケンジ',
    age: 58,
    gender: '男性',
    condition: '腰椎椎間板ヘルニア',
    status: '急性期',
    staff_id: 'ST001',
    staff_name: '山田 太郎',
    last_exercise_at: '2026-01-24',
  },
]

const mockStats: DashboardStats = {
  my_patients_count: 3,
  today_appointments_count: 5,
  weekly_exercises_count: 32,
  total_patients_count: 8,
}

function renderDashboard() {
  return render(
    <BrowserRouter>
      <Dashboard
        staff={mockStaff}
        patients={mockPatients}
        stats={mockStats}
        onNavigate={mockNavigate}
      />
    </BrowserRouter>
  )
}

describe('S-02 Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getTodayAppointments).mockResolvedValue({
      status: 'success',
      data: { patients: [] },
    })
  })

  describe('rendering', () => {
    it('should render page title', () => {
      renderDashboard()

      expect(screen.getByRole('heading', { name: 'ダッシュボード' })).toBeInTheDocument()
    })

    it('should render page description', () => {
      renderDashboard()

      expect(screen.getByText('システム全体の概要を確認できます')).toBeInTheDocument()
    })
  })

  describe('KPI cards', () => {
    it('should render my patients count', () => {
      renderDashboard()

      expect(screen.getByText('担当患者数')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should render today appointments count', () => {
      renderDashboard()

      expect(screen.getByText('本日の来院予定')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should render weekly exercises count', () => {
      renderDashboard()

      expect(screen.getByText('今週の運動実施')).toBeInTheDocument()
      expect(screen.getByText('32')).toBeInTheDocument()
    })

    it('should render total patients count', () => {
      renderDashboard()

      expect(screen.getByText('全患者数')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
    })
  })

  describe('my patients list', () => {
    it('should render my patients section title', () => {
      renderDashboard()

      expect(screen.getByText('本日の担当患者')).toBeInTheDocument()
    })

    it('should render staff name in section description', () => {
      renderDashboard()

      expect(screen.getByText(/山田 太郎さんが担当している患者一覧/)).toBeInTheDocument()
    })

    it('should render patient names', () => {
      renderDashboard()

      expect(screen.getByText('伊藤 正男')).toBeInTheDocument()
      expect(screen.getByText('加藤 武')).toBeInTheDocument()
      expect(screen.getByText('佐藤 健二')).toBeInTheDocument()
    })

    it('should render patient conditions', () => {
      renderDashboard()

      expect(screen.getByText('大腿骨頸部骨折術後')).toBeInTheDocument()
      expect(screen.getByText('脊柱管狭窄症')).toBeInTheDocument()
      expect(screen.getByText('腰椎椎間板ヘルニア')).toBeInTheDocument()
    })

    it('should render measurement input buttons', () => {
      renderDashboard()

      const measurementButtons = screen.getAllByLabelText(/の測定値入力/)
      expect(measurementButtons).toHaveLength(3)
    })

    it('should render exercise menu buttons', () => {
      renderDashboard()

      const menuButtons = screen.getAllByLabelText(/のメニュー設定/)
      expect(menuButtons).toHaveLength(3)
    })
  })

  describe('status badges', () => {
    it('should render 急性期 badge with red styling', () => {
      renderDashboard()

      const badge = screen.getByText('急性期')
      expect(badge).toHaveClass('bg-red-100', 'text-red-700')
    })

    it('should render 回復期 badge with yellow styling', () => {
      renderDashboard()

      const badges = screen.getAllByText('回復期')
      const badge = badges[0]
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-700')
    })

    it('should render 維持期 badge with green styling', () => {
      renderDashboard()

      const badges = screen.getAllByText('維持期')
      const badge = badges[0]
      expect(badge).toHaveClass('bg-green-100', 'text-green-700')
    })
  })

  describe('navigation', () => {
    it('should navigate to measurement page when measurement button is clicked', async () => {
      const user = userEvent.setup()
      renderDashboard()

      const measurementButtons = screen.getAllByLabelText(/の測定値入力/)
      await user.click(measurementButtons[0]!)

      expect(mockNavigate).toHaveBeenCalledWith('/patients/p1/measurements/new')
    })

    it('should navigate to exercise menu page when menu button is clicked', async () => {
      const user = userEvent.setup()
      renderDashboard()

      const menuButtons = screen.getAllByLabelText(/のメニュー設定/)
      await user.click(menuButtons[0]!)

      expect(mockNavigate).toHaveBeenCalledWith('/patients/p1/exercise-menu')
    })

    it('should render view all patients link', () => {
      renderDashboard()

      expect(screen.getByRole('button', { name: /患者一覧を見る/ })).toBeInTheDocument()
    })

    it('should navigate to patients list when view all is clicked', async () => {
      const user = userEvent.setup()
      renderDashboard()

      await user.click(screen.getByRole('button', { name: /患者一覧を見る/ }))

      expect(mockNavigate).toHaveBeenCalledWith('/patients')
    })
  })

  describe('empty state', () => {
    it('should show empty message when no patients', () => {
      render(
        <BrowserRouter>
          <Dashboard
            staff={mockStaff}
            patients={[]}
            stats={{ ...mockStats, my_patients_count: 0 }}
            onNavigate={mockNavigate}
          />
        </BrowserRouter>
      )

      expect(screen.getByText('担当患者がいません')).toBeInTheDocument()
    })
  })

  describe('today appointments KPI card', () => {
    it('should render today appointments KPI as a clickable button', () => {
      renderDashboard()

      const button = screen.getByRole('button', { name: '本日の来院予定の詳細を表示' })
      expect(button).toBeInTheDocument()
    })

    it('should open dialog when today appointments KPI card is clicked', async () => {
      const user = userEvent.setup()
      renderDashboard()

      await user.click(screen.getByRole('button', { name: '本日の来院予定の詳細を表示' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('should not render other KPI cards as buttons', () => {
      renderDashboard()

      expect(screen.queryByRole('button', { name: '担当患者数の詳細を表示' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '今週の運動実施の詳細を表示' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '全患者数の詳細を表示' })).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderDashboard()

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('ダッシュボード')
    })

    it('should have accessible button labels', () => {
      renderDashboard()

      const measurementButtons = screen.getAllByRole('button', { name: /測定値入力/ })
      measurementButtons.forEach((btn) => {
        expect(btn).toHaveAccessibleName()
      })
    })
  })
})
