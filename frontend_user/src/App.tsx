import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConnectionTest } from './components/ConnectionTest'

// Placeholder components - to be implemented
function Login() {
  return <div className="p-4">U-01: ログイン画面</div>
}

function Home() {
  return <div className="p-4">U-02: ホーム画面</div>
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/connection-test" element={<ConnectionTest />} />
          {/* TODO: Add remaining routes
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/exercise-menu" element={<ExerciseMenu />} />
          <Route path="/exercise/:id" element={<ExerciseSession />} />
          <Route path="/history" element={<History />} />
          <Route path="/measurements" element={<Measurements />} />
          <Route path="/condition" element={<ConditionInput />} />
          <Route path="/bulk-record" element={<BulkRecord />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          */}
        </Routes>
      </div>
    </Router>
  )
}
