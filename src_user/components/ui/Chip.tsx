import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary';
  className?: string;
}

export function Chip({ children, variant = 'default', className = '' }: ChipProps) {
  const variants = {
    default: 'bg-gray-100 text-[#334155]',
    primary: 'bg-[#EAF2FF] text-[#1E66F5]'
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
