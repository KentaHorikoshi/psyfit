import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ConditionGraph } from '../calendar/ConditionGraph'

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ name }: { name: string }) => <div data-testid={`line-${name}`} />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

const mockGetMyDailyConditions = vi.fn()

vi.mock('../../lib/api-client', () => ({
  apiClient: {
    getMyDailyConditions: (...args: unknown[]) => mockGetMyDailyConditions(...args),
  },
}))

const mockConditions = [
  { id: '1', recorded_date: '2026-02-10', pain_level: 3, body_condition: 7 },
  { id: '2', recorded_date: '2026-02-09', pain_level: 4, body_condition: 6 },
  { id: '3', recorded_date: '2026-02-08', pain_level: 5, body_condition: 5 },
]

describe('ConditionGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetMyDailyConditions.mockResolvedValue({
      status: 'success',
      data: { conditions: mockConditions },
    })
  })

  it('renders loading state initially', () => {
    mockGetMyDailyConditions.mockReturnValue(new Promise(() => {}))
    render(<ConditionGraph year={2026} month={1} />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('renders chart with condition data', async () => {
    render(<ConditionGraph year={2026} month={1} />)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
    expect(screen.getByText('体調の推移')).toBeInTheDocument()
  })

  it('shows empty state when no conditions exist', async () => {
    mockGetMyDailyConditions.mockResolvedValue({
      status: 'success',
      data: { conditions: [] },
    })

    render(<ConditionGraph year={2026} month={1} />)

    await waitFor(() => {
      expect(screen.getByText('この月の体調データはありません')).toBeInTheDocument()
    })
  })

  it('shows error state on API failure', async () => {
    mockGetMyDailyConditions.mockRejectedValue(new Error('API Error'))

    render(<ConditionGraph year={2026} month={1} />)

    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument()
    })
  })

  it('calls API with correct date range for the given month', async () => {
    render(<ConditionGraph year={2026} month={1} />)

    await waitFor(() => {
      expect(mockGetMyDailyConditions).toHaveBeenCalledWith(
        expect.objectContaining({
          start_date: expect.any(String),
          end_date: expect.any(String),
        })
      )
    })
  })

  it('rerenders when year/month props change', async () => {
    const { rerender } = render(<ConditionGraph year={2026} month={1} />)

    await waitFor(() => {
      expect(mockGetMyDailyConditions).toHaveBeenCalledTimes(1)
    })

    rerender(<ConditionGraph year={2026} month={2} />)

    await waitFor(() => {
      expect(mockGetMyDailyConditions).toHaveBeenCalledTimes(2)
    })
  })

  it('has proper section label for accessibility', async () => {
    render(<ConditionGraph year={2026} month={1} />)

    await waitFor(() => {
      expect(screen.getByRole('region', { name: '体調の推移' })).toBeInTheDocument()
    })
  })
})
