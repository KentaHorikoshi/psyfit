import React from 'react';
import { Home, Dumbbell, ClipboardList, History, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { icon: Dumbbell, label: '運動', path: '/exercise-menu' },
    { icon: ClipboardList, label: '記録', path: '/bulk-record2' },
    { icon: Home, label: 'ホーム', path: '/home' },
    { icon: History, label: '運動履歴', path: '/history' },
    { icon: BarChart3, label: '測定値', path: '/measurements' },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/exercise-menu' && location.pathname.startsWith('/exercise-session')) ||
           (path === '/bulk-record2' && location.pathname === '/condition-record');
  };
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg" style={{ maxWidth: '390px', margin: '0 auto' }}>
      <nav className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-2 px-1 transition-colors"
              aria-label={item.label}
            >
              <Icon 
                size={24} 
                className={active ? 'text-[#1E66F5]' : 'text-[#1E66F5]/60'}
                strokeWidth={active ? 2.5 : 2}
              />
            </button>
          );
        })}
      </nav>
    </footer>
  );
}