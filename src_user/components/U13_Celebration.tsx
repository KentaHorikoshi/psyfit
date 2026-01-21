import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Celebration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { remaining } = location.state || { remaining: 0 };
  
  useEffect(() => {
    // 2秒後に次の画面へ遷移
    const timer = setTimeout(() => {
      if (remaining === 0) {
        // 全て完了している場合は体調入力画面へ
        navigate('/condition-input');
      } else {
        // まだ残っている場合は運動カード画面へ
        navigate('/exercise-cards');
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate, remaining]);
  
  const message = remaining === 0 ? 'お疲れさまでした！' : remaining === 1 ? 'あと少し！' : 'その調子！';
  
  return (
    <div 
      className="min-h-screen bg-[#1E66F5] flex items-center justify-center relative overflow-hidden"
      style={{ maxWidth: '390px', margin: '0 auto' }}
    >
      {/* クラッカー演出 */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10px',
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][i % 5],
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${1.5 + Math.random()}s`,
            }}
          />
        ))}
      </div>
      
      <h1 className="text-6xl text-white font-bold z-10 animate-bounce">
        {message}
      </h1>
      
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}