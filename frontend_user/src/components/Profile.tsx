import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { User, LogOut, Lock, BookOpen, Home as HomeIcon, ChevronRight } from 'lucide-react'

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] min-h-[56px]"
      aria-label={label}
    >
      <div className="flex items-center">
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-3">
          {icon}
        </div>
        <span className="text-gray-900">{label}</span>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  )
}

export function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      // Logout failed, but still redirect to login
      navigate('/login', { replace: true })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <div role="status" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* Header */}
      <header className="bg-white px-6 pt-8 pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">マイページ</h1>

        {/* User info card */}
        <div className="flex items-center p-4 bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] rounded-xl text-white">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mr-4">
            <User size={28} className="text-white" />
          </div>
          <div>
            <p className="font-medium text-lg">{user.name}さん</p>
            <p className="text-blue-200 text-sm">{user.email}</p>
          </div>
        </div>
      </header>

      {/* Menu items */}
      <main className="flex-1 bg-white mt-4">
        <MenuItem
          icon={<Lock size={20} className="text-[#1E40AF]" />}
          label="パスワード変更"
          onClick={() => navigate('/password-reset')}
        />
        <MenuItem
          icon={<BookOpen size={20} className="text-[#1E40AF]" />}
          label="使い方"
          onClick={() => navigate('/guide')}
        />
        <MenuItem
          icon={<LogOut size={20} className="text-red-500" />}
          label="ログアウト"
          onClick={handleLogout}
        />
      </main>

      {/* Footer navigation */}
      <nav aria-label="メインナビゲーション" className="border-t border-gray-200 bg-white px-6 py-2 pb-6">
        <div className="flex justify-around">
          <Link
            to="/home"
            className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-gray-700 min-h-[44px]"
          >
            <HomeIcon size={24} />
            <span className="text-xs mt-1">ホーム</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center py-2 px-4 text-[#1E40AF] min-h-[44px]"
            aria-current="page"
          >
            <User size={24} />
            <span className="text-xs mt-1">マイページ</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

export default Profile
