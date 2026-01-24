import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, UserCog, LogOut, Heart } from 'lucide-react'
import type { Staff } from '../lib/api-types'

interface SidebarProps {
  staff: Staff
  onLogout: () => void
  currentPath: string
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      to={href}
      className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors min-h-[44px] ${
        isActive ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  )
}

export function Sidebar({ staff, onLogout, currentPath }: SidebarProps) {
  const isManager = staff.role === 'manager'
  const displayRole = isManager ? 'マネージャー' : '一般職員'

  return (
    <aside className="w-64 bg-[#1E40AF] text-white flex flex-col h-full">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-6 h-6" fill="currentColor" />
          <h1 className="font-semibold text-sm">サイテック病院</h1>
        </div>
        <p className="text-xs text-blue-200">リハビリ支援システム</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4" role="navigation">
        <NavItem
          href="/dashboard"
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="ダッシュボード"
          isActive={currentPath === '/dashboard'}
        />
        <NavItem
          href="/patients"
          icon={<Users className="w-5 h-5" />}
          label="患者一覧"
          isActive={currentPath === '/patients' || currentPath.startsWith('/patients/')}
        />
        {isManager && (
          <NavItem
            href="/staff"
            icon={<UserCog className="w-5 h-5" />}
            label="職員管理"
            isActive={currentPath === '/staff'}
          />
        )}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
            {staff.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{staff.name}</p>
            <p className="text-xs text-blue-200">{displayRole}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-blue-800 transition-colors min-h-[44px]"
          aria-label="ログアウト"
        >
          <LogOut className="w-4 h-4" />
          ログアウト
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
