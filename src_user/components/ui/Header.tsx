import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function Header({ title, onBack, showBack = true }: HeaderProps) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/home');
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center sticky top-0 z-10">
      {showBack && (
        <button
          onClick={handleBack}
          className="mr-3 p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="戻る"
        >
          <ArrowLeft size={24} className="text-[#334155]" />
        </button>
      )}
      <h1 className="text-xl text-[#0B1220]">{title}</h1>
    </header>
  );
}