import { useState } from 'react';
import { Login } from './components/Login';
import { PasswordReset } from './components/PasswordReset';
import { Dashboard } from './components/Dashboard';
import { PatientList } from './components/PatientList';
import { PatientDetail } from './components/PatientDetail';
import { StaffManagement } from './components/StaffManagement';
import { MeasurementInput } from './components/MeasurementInput';
import { ExerciseMenu } from './components/ExerciseMenu';
import { ReportGeneration } from './components/ReportGeneration';

export type Page = 'login' | 'password-reset' | 'dashboard' | 'patients' | 'patient-detail' | 'staff' | 'measurement' | 'exercise-menu' | 'report';

export interface User {
  id: string;
  name: string;
  role: 'マネージャー' | '一般職員';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handleLogin = (userId: string) => {
    // Mock login - 職員IDに基づいてロールを判定
    const mockUsers: Record<string, User> = {
      'yamada': {
        id: 'yamada',
        name: '山田 太郎',
        role: 'マネージャー'
      },
      'sato': {
        id: 'sato',
        name: '佐藤 花子',
        role: '一般職員'
      },
      'tanaka': {
        id: 'tanaka',
        name: '田中 次郎',
        role: '一般職員'
      }
    };

    const user = mockUsers[userId] || {
      id: userId,
      name: '山田 太郎',
      role: 'マネージャー'
    };

    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  const navigateTo = (page: Page, patientId?: string) => {
    setCurrentPage(page);
    if (patientId) {
      setSelectedPatientId(patientId);
    }
  };

  if (currentPage === 'login') {
    return <Login onLogin={handleLogin} onNavigateToReset={() => setCurrentPage('password-reset')} />;
  }

  if (currentPage === 'password-reset') {
    return <PasswordReset onNavigateToLogin={() => setCurrentPage('login')} />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E40AF] text-white flex flex-col">
        {/* Logo & Brand */}
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <h1 className="font-semibold text-sm">さとやま整形外科内科</h1>
          </div>
          <p className="text-xs text-blue-200">リハビリ支援システム</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <NavItem
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="ダッシュボード"
            active={currentPage === 'dashboard'}
            onClick={() => navigateTo('dashboard')}
          />
          <NavItem
            icon={<Users className="w-5 h-5" />}
            label="患者一覧"
            active={currentPage === 'patients' || currentPage === 'patient-detail'}
            onClick={() => navigateTo('patients')}
          />
          {currentUser?.role === 'マネージャー' && (
            <NavItem
              icon={<UserCog className="w-5 h-5" />}
              label="職員管理"
              active={currentPage === 'staff'}
              onClick={() => navigateTo('staff')}
            />
          )}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{currentUser?.name}</p>
              <p className="text-xs text-blue-200">{currentUser?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-blue-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && (
          <Dashboard currentUser={currentUser!} onNavigate={navigateTo} />
        )}
        {currentPage === 'patients' && <PatientList onNavigate={navigateTo} />}
        {currentPage === 'patient-detail' && selectedPatientId && (
          <PatientDetail patientId={selectedPatientId} currentUser={currentUser!} onNavigate={navigateTo} />
        )}
        {currentPage === 'staff' && <StaffManagement />}
        {currentPage === 'measurement' && selectedPatientId && (
          <MeasurementInput
            patientId={selectedPatientId}
            onClose={() => setCurrentPage('patient-detail')}
            onNavigate={navigateTo}
          />
        )}
        {currentPage === 'report' && (
          <ReportGeneration onNavigate={navigateTo} patientId={selectedPatientId || undefined} />
        )}
        {currentPage === 'exercise-menu' && selectedPatientId && (
          <ExerciseMenu patientId={selectedPatientId} onNavigate={navigateTo} />
        )}
      </main>
    </div>
  );
}

// Navigation Item Component
import { LayoutDashboard, Users, UserCog, LogOut } from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
        active ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}