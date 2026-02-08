import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { PatientList } from '../PatientList'
import type { Patient, PatientsListResponse } from '../../lib/api-types'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

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
    staff_id: 'ST002',
    staff_name: '佐藤 花子',
    last_exercise_at: '2026-01-24',
  },
]

const mockResponse: PatientsListResponse = {
  patients: mockPatients,
  meta: {
    total: 25,
    page: 1,
    per_page: 10,
    total_pages: 3,
  },
}

function renderPatientList(props = {}) {
  const defaultProps = {
    data: mockResponse,
    isLoading: false,
    onSearch: vi.fn(),
    onFilterStatus: vi.fn(),
    onPageChange: vi.fn(),
    onPatientClick: mockNavigate,
  }

  return render(
    <BrowserRouter>
      <PatientList {...defaultProps} {...props} />
    </BrowserRouter>
  )
}

describe('S-03 PatientList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render page title', () => {
      renderPatientList()

      expect(screen.getByRole('heading', { name: '患者一覧' })).toBeInTheDocument()
    })

    it('should render total count', () => {
      renderPatientList()

      expect(screen.getByText(/全25件/)).toBeInTheDocument()
    })

    it('should render search input', () => {
      renderPatientList()

      expect(screen.getByPlaceholderText('患者名、カナで検索')).toBeInTheDocument()
    })

    it('should render status filter dropdown', () => {
      renderPatientList()

      expect(screen.getByRole('combobox', { name: /ステータスで絞り込み/ })).toBeInTheDocument()
    })
  })

  describe('patient table', () => {
    it('should render table headers', () => {
      renderPatientList()

      expect(screen.getByRole('columnheader', { name: '患者名' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: '年齢' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: '性別' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: '疾患名' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'ステータス' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: '担当職員' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: '最終運動日' })).toBeInTheDocument()
    })

    it('should render patient rows', () => {
      renderPatientList()

      expect(screen.getByText('伊藤 正男')).toBeInTheDocument()
      expect(screen.getByText('加藤 武')).toBeInTheDocument()
      expect(screen.getByText('佐藤 健二')).toBeInTheDocument()
    })

    it('should render patient details', () => {
      renderPatientList()

      expect(screen.getByText('78')).toBeInTheDocument()
      expect(screen.getByText('大腿骨頸部骨折術後')).toBeInTheDocument()
      expect(screen.getAllByText('山田 太郎').length).toBeGreaterThan(0)
    })

    it('should format dates correctly', () => {
      renderPatientList()

      expect(screen.getByText('2026-01-23')).toBeInTheDocument()
      expect(screen.getByText('2026-01-22')).toBeInTheDocument()
    })

    it('should render clickable rows', () => {
      renderPatientList()

      const rows = screen.getAllByRole('row')
      // Skip header row
      const firstDataRow = rows[1]
      expect(firstDataRow).toHaveClass('cursor-pointer')
    })
  })

  describe('status badges', () => {
    it('should render 急性期 badge with red styling', () => {
      renderPatientList()

      const badges = screen.getAllByText('急性期')
      const tableBadge = badges.find((badge) =>
        badge.classList.contains('bg-red-100')
      )
      expect(tableBadge).toBeDefined()
      expect(tableBadge!).toHaveClass('bg-red-100', 'text-red-700')
    })

    it('should render 回復期 badge with yellow styling', () => {
      renderPatientList()

      const badges = screen.getAllByText('回復期')
      const tableBadge = badges.find((badge) =>
        badge.classList.contains('bg-yellow-100')
      )
      expect(tableBadge).toBeDefined()
      expect(tableBadge!).toHaveClass('bg-yellow-100', 'text-yellow-700')
    })

    it('should render 維持期 badge with green styling', () => {
      renderPatientList()

      const badges = screen.getAllByText('維持期')
      const tableBadge = badges.find((badge) =>
        badge.classList.contains('bg-green-100')
      )
      expect(tableBadge).toBeDefined()
      expect(tableBadge!).toHaveClass('bg-green-100', 'text-green-700')
    })
  })

  describe('search functionality', () => {
    it('should call onSearch when typing in search box', async () => {
      const user = userEvent.setup()
      const onSearch = vi.fn()
      renderPatientList({ onSearch })

      const searchInput = screen.getByPlaceholderText('患者名、カナで検索')
      await user.type(searchInput, '伊藤')

      await waitFor(() => {
        expect(onSearch).toHaveBeenCalled()
      })
    })

    it('should debounce search input', async () => {
      const user = userEvent.setup()
      const onSearch = vi.fn()
      renderPatientList({ onSearch })

      const searchInput = screen.getByPlaceholderText('患者名、カナで検索')
      await user.type(searchInput, 'abc')

      // Should not call immediately for every keystroke
      expect(onSearch.mock.calls.length).toBeLessThan(3)
    })
  })

  describe('status filter', () => {
    it('should call onFilterStatus when selecting a status', async () => {
      const user = userEvent.setup()
      const onFilterStatus = vi.fn()
      renderPatientList({ onFilterStatus })

      const filterSelect = screen.getByRole('combobox', { name: /ステータスで絞り込み/ })
      await user.selectOptions(filterSelect, '急性期')

      expect(onFilterStatus).toHaveBeenCalledWith('急性期')
    })

    it('should show all statuses in filter dropdown', async () => {
      renderPatientList()

      const filterSelect = screen.getByRole('combobox', { name: /ステータスで絞り込み/ })
      const options = within(filterSelect).getAllByRole('option')

      expect(options).toHaveLength(4) // All + 3 statuses
      expect(within(filterSelect).getByRole('option', { name: 'すべて' })).toBeInTheDocument()
      expect(within(filterSelect).getByRole('option', { name: '急性期' })).toBeInTheDocument()
      expect(within(filterSelect).getByRole('option', { name: '回復期' })).toBeInTheDocument()
      expect(within(filterSelect).getByRole('option', { name: '維持期' })).toBeInTheDocument()
    })
  })

  describe('pagination', () => {
    it('should render pagination controls', () => {
      renderPatientList()

      expect(screen.getByText('ページ 1 / 3')).toBeInTheDocument()
    })

    it('should render previous and next buttons', () => {
      renderPatientList()

      expect(screen.getByRole('button', { name: /前へ/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /次へ/ })).toBeInTheDocument()
    })

    it('should disable previous button on first page', () => {
      renderPatientList()

      const prevButton = screen.getByRole('button', { name: /前へ/ })
      expect(prevButton).toBeDisabled()
    })

    it('should enable next button when not on last page', () => {
      renderPatientList()

      const nextButton = screen.getByRole('button', { name: /次へ/ })
      expect(nextButton).not.toBeDisabled()
    })

    it('should call onPageChange when clicking next', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      renderPatientList({ onPageChange })

      await user.click(screen.getByRole('button', { name: /次へ/ }))

      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('should disable next button on last page', () => {
      const lastPageResponse = {
        ...mockResponse,
        meta: { ...mockResponse.meta, page: 3 },
      }
      renderPatientList({ data: lastPageResponse })

      const nextButton = screen.getByRole('button', { name: /次へ/ })
      expect(nextButton).toBeDisabled()
    })
  })

  describe('navigation', () => {
    it('should navigate to patient detail when row is clicked', async () => {
      const user = userEvent.setup()
      const onPatientClick = vi.fn()
      renderPatientList({ onPatientClick })

      const rows = screen.getAllByRole('row')
      const firstDataRow = rows[1]! // Skip header

      await user.click(firstDataRow)

      expect(onPatientClick).toHaveBeenCalledWith('/patients/p1')
    })
  })

  describe('loading state', () => {
    it('should show loading indicator when loading', () => {
      renderPatientList({ isLoading: true })

      expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    })

    it('should not show patient table when loading', () => {
      renderPatientList({ isLoading: true })

      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('should show empty message when no patients', () => {
      const emptyResponse = {
        patients: [],
        meta: { total: 0, page: 1, per_page: 10, total_pages: 0 },
      }
      renderPatientList({ data: emptyResponse, isLoading: false })

      expect(screen.getByText('患者が見つかりません')).toBeInTheDocument()
    })
  })

  describe('new patient registration button (all staff)', () => {
    it('should show 新規患者登録 button when onCreatePatient is provided', () => {
      const onCreatePatient = vi.fn()
      renderPatientList({ onCreatePatient })

      const createButton = screen.getByRole('button', { name: '新規患者登録' })
      expect(createButton).toBeInTheDocument()
    })

    it('should not show 新規患者登録 button when onCreatePatient is not provided', () => {
      renderPatientList()

      expect(screen.queryByRole('button', { name: '新規患者登録' })).not.toBeInTheDocument()
    })

    it('should call onCreatePatient when button is clicked', async () => {
      const user = userEvent.setup()
      const onCreatePatient = vi.fn()
      renderPatientList({ onCreatePatient })

      await user.click(screen.getByRole('button', { name: '新規患者登録' }))

      expect(onCreatePatient).toHaveBeenCalledTimes(1)
    })

    it('should have minimum tap target size', () => {
      const onCreatePatient = vi.fn()
      renderPatientList({ onCreatePatient })

      const createButton = screen.getByRole('button', { name: '新規患者登録' })
      expect(createButton).toHaveClass('min-h-[44px]')
    })
  })

  describe('accessibility', () => {
    it('should have proper table structure', () => {
      renderPatientList()

      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      expect(within(table).getAllByRole('columnheader')).toHaveLength(7)
    })

    it('should have accessible search input', () => {
      renderPatientList()

      const searchInput = screen.getByPlaceholderText('患者名、カナで検索')
      expect(searchInput).toHaveAccessibleName()
    })

    it('should have minimum tap target size for buttons', () => {
      renderPatientList()

      const buttons = screen.getAllByRole('button')
      buttons.forEach((btn) => {
        expect(btn).toHaveClass('min-h-[44px]')
      })
    })
  })
})
