import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ConnectionTest } from './components/ConnectionTest'
import { Login } from './components/Login'
import { Home } from './components/Home'
import { ExerciseMenu } from './components/ExerciseMenu'
import { ExercisePlayer } from './components/ExercisePlayer'
import { ExerciseHistory } from './components/ExerciseHistory'
import { Measurements } from './components/Measurements'
import { ConditionInput } from './components/ConditionInput'

// Placeholder components - to be implemented
function Celebration() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4" style={{ maxWidth: '390px', margin: '0 auto' }}>
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">お疲れ様でした！</h1>
        <p className="text-gray-600">運動を完了しました</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/exercise-menu" element={<ExerciseMenu />} />
            <Route path="/exercise/:id" element={<ExercisePlayer />} />
            <Route path="/celebration" element={<Celebration />} />
            <Route path="/history" element={<ExerciseHistory />} />
            <Route path="/measurements" element={<Measurements />} />
            <Route path="/condition-input" element={<ConditionInput />} />
            <Route path="/connection-test" element={<ConnectionTest />} />
            {/* TODO: Add remaining routes
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}
