import { useState, useEffect, useCallback } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { api } from './lib/api'
import type { PatientsListResponse, PatientStatus, DashboardStats, Patient } from './lib/api-types'

// Components
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { PatientList } from './components/PatientList'
import { PatientCreateDialog } from './components/PatientCreateDialog'
import { PatientDetail } from './components/PatientDetail'
import { MeasurementInput } from './components/MeasurementInput'
import { ExerciseMenu } from './components/ExerciseMenu'
import { ReportGeneration } from './components/ReportGeneration'
import { StaffManagement } from './components/StaffManagement'
import { ExerciseMenuManagement } from './components/ExerciseMenuManagement'
import { PasswordReset } from './components/PasswordReset'
import { Sidebar } from './components/Sidebar'
import { ConnectionTest } from './components/ConnectionTest'

/**
 * Redirects unauthenticated users to login.
 * Shows a loading spinner while session is being checked.
 */
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div role="status" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

/**
 * Layout for authenticated pages: Sidebar + main content area.
 */
function AuthenticatedLayout() {
  const { staff, logout } = useAuth()
  const location = useLocation()

  if (!staff) return null

  return (
    <div className="flex h-screen">
      <Sidebar staff={staff} onLogout={logout} currentPath={location.pathname} />
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <Outlet />
      </main>
    </div>
  )
}

/**
 * Dashboard page wrapper - fetches patient data and stats, passes as props.
 */
function DashboardPage() {
  const { staff } = useAuth()
  const navigate = useNavigate()
  const [patients, setPatients] = useState<Patient[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    my_patients_count: 0,
    today_appointments_count: 0,
    weekly_exercises_count: 0,
    total_patients_count: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [patientsResponse, statsResponse] = await Promise.all([
          api.getPatients({ per_page: '10' }),
          api.getDashboardStats().catch(() => null),
        ])

        if (patientsResponse.status === 'success' && patientsResponse.data) {
          const patientsData = patientsResponse.data.patients || []
          setPatients(patientsData)
          setStats({
            my_patients_count: patientsData.length,
            today_appointments_count:
              statsResponse?.data?.today_appointments_count ?? 0,
            weekly_exercises_count:
              statsResponse?.data?.weekly_exercises_count ?? 0,
            total_patients_count: patientsResponse.data.meta.total,
          })
        }
      } catch {
        // Dashboard data fetch failed - show empty state
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path)
    },
    [navigate]
  )

  if (!staff) return null

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div role="status" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <Dashboard
      staff={staff}
      patients={patients}
      stats={stats}
      onNavigate={handleNavigate}
    />
  )
}

/**
 * Patient list page wrapper - manages search, filter, pagination state and fetches data.
 */
function PatientListPage() {
  const { staff } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<PatientsListResponse>({
    patients: [],
    meta: { total: 0, page: 1, per_page: 20, total_pages: 0 },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const isManager = staff?.role === 'manager'

  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true)
      const params: Record<string, string> = { page: String(page) }
      if (searchQuery) params.search = searchQuery
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await api.getPatients(params)
      if (response.status === 'success' && response.data) {
        setData(response.data)
      }
    } catch {
      // Patient list fetch failed
    } finally {
      setIsLoading(false)
    }
  }, [page, searchQuery, statusFilter])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setPage(1)
  }, [])

  const handleFilterStatus = useCallback((status: PatientStatus | 'all') => {
    setStatusFilter(status)
    setPage(1)
  }, [])

  const handleCreateSuccess = useCallback(() => {
    // Refresh patient list after successful creation
    fetchPatients()
  }, [fetchPatients])

  return (
    <>
      <PatientList
        data={data}
        isLoading={isLoading}
        onSearch={handleSearch}
        onFilterStatus={handleFilterStatus}
        onPageChange={setPage}
        onPatientClick={(path) => navigate(path)}
        isManager={isManager}
        onCreatePatient={() => setIsCreateDialogOpen(true)}
      />
      <PatientCreateDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background-secondary">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/connection-test" element={<ConnectionTest />} />

            {/* Authenticated routes with sidebar layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AuthenticatedLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/patients" element={<PatientListPage />} />
                <Route path="/patients/:id" element={<PatientDetail />} />
                <Route path="/patients/:id/measurements/new" element={<MeasurementInput />} />
                <Route path="/patients/:id/exercise-menu" element={<ExerciseMenu />} />
                <Route path="/patients/:id/report" element={<ReportGeneration />} />
                <Route path="/exercise-masters" element={<ExerciseMenuManagement />} />
                <Route path="/staff" element={<StaffManagement />} />
                <Route path="/password-reset" element={<PasswordReset />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}
