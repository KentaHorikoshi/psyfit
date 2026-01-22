import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Placeholder components - to be implemented
function Login() {
  return <div className="p-4">S-01: ログイン画面</div>
}

function Dashboard() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar p-4">
        <h2 className="text-xl font-bold mb-4">PsyFit</h2>
        <nav>
          <ul className="space-y-2">
            <li><a href="/dashboard" className="block p-2 hover:bg-sidebar-hover rounded">ダッシュボード</a></li>
            <li><a href="/patients" className="block p-2 hover:bg-sidebar-hover rounded">患者一覧</a></li>
            <li><a href="/reports" className="block p-2 hover:bg-sidebar-hover rounded">レポート</a></li>
          </ul>
        </nav>
      </aside>
      <main className="admin-main p-6">
        <h1 className="text-2xl font-bold mb-4">S-02: ダッシュボード</h1>
        <p>ダッシュボード内容</p>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background-secondary">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* TODO: Add remaining routes
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/measurements/:patientId" element={<MeasurementInput />} />
          <Route path="/exercise-menu/:patientId" element={<ExerciseMenuSettings />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          */}
        </Routes>
      </div>
    </Router>
  )
}
