import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Welcome } from './components/Welcome'
import { Login } from './components/Login'
import { PasswordReset } from './components/PasswordReset'
import { Home } from './components/Home'
import { ExerciseMenu } from './components/ExerciseMenu'
import { ExercisePlayer } from './components/ExercisePlayer'
import { Celebration } from './components/Celebration'
import { ExerciseHistory } from './components/ExerciseHistory'
import { Measurements } from './components/Measurements'
import { ConditionInput } from './components/ConditionInput'
import { BatchRecord } from './components/BatchRecord'
import { Profile } from './components/Profile'
import { UserGuide } from './components/UserGuide'

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/password-reset/:token" element={<PasswordReset />} />
            <Route path="/home" element={<Home />} />
            <Route path="/exercise-menu" element={<ExerciseMenu />} />
            <Route path="/exercise/:id" element={<ExercisePlayer />} />
            <Route path="/celebration" element={<Celebration />} />
            <Route path="/history" element={<ExerciseHistory />} />
            <Route path="/measurements" element={<Measurements />} />
            <Route path="/condition-input" element={<ConditionInput />} />
            <Route path="/record" element={<BatchRecord />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/guide" element={<UserGuide />} />
            <Route path="/welcome" element={<Welcome />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}
