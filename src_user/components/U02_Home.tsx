import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Footer } from './ui/Footer';
import { Dumbbell, Edit, History, TrendingUp, Flame, Sun, Moon, CloudSun } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const userName = '田中太郎';
  const continueDays = 14;
  const lastExerciseDay = 0;
  
  // ホーム画面に到達した時点で記録をリセット
  React.useEffect(() => {
    sessionStorage.removeItem('completedExercises');
  }, []);
  
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;
  const hour = today.getHours();
  const greeting = hour < 12 ? 'おはようございます！' : hour < 18 ? 'こんにちは！' : 'こんばんは！';
  const greetingIcon = hour < 12 ? Sun : hour < 18 ? CloudSun : Moon;
  const GreetingIcon = greetingIcon;
  
  return (
    <div className="h-screen overflow-hidden bg-white" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* ヘッダー */}
      <div className="px-6 pt-8 pb-6 bg-gradient-to-b from-[#EAF2FF] to-white">
        <h1 className="text-2xl text-[#0B1220] flex items-center gap-2">
          <GreetingIcon size={28} className="text-[#1E66F5]" />
          <span>{greeting}<br />{userName}さん</span>
        </h1>
      </div>
      
      {/* 継続状況カード */}
      <div className="px-6 -mt-2 mb-6">
        <Card className="bg-gradient-to-br from-[#1E66F5] to-[#1557D8] text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#A5D8FF] mb-1">{lastExerciseDay === 0 ? '継続日数' : '最後の運動'}</p>
              <div className="flex items-baseline">
                <span className="text-5xl font-bold text-white">{lastExerciseDay === 0 ? continueDays : lastExerciseDay}</span>
                <span className="text-xl ml-2 text-white">{lastExerciseDay === 0 ? '日' : '日前'}</span>
              </div>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Flame size={40} className="text-white" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* メインメニュー */}
      <div className="px-6 mb-6">
        <div className="space-y-3">
          <Card 
            onClick={() => navigate('/exercise-menu')}
            className="hover:border-[#1E66F5] transition-colors"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#EAF2FF] rounded-xl flex items-center justify-center mr-4">
                <Dumbbell size={24} className="text-[#1E66F5]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#0B1220] mb-1">運動する</h3>
              </div>
            </div>
          </Card>
          
          <Card 
            onClick={() => navigate('/bulk-record2')}
            className="hover:border-[#1E66F5] transition-colors"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#EAF2FF] rounded-xl flex items-center justify-center mr-4">
                <Edit size={24} className="text-[#1E66F5]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#0B1220] mb-1">記録する</h3>
              </div>
            </div>
          </Card>
          
          <Card 
            onClick={() => navigate('/history')}
            className="hover:border-[#1E66F5] transition-colors"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#EAF2FF] rounded-xl flex items-center justify-center mr-4">
                <History size={24} className="text-[#1E66F5]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#0B1220] mb-1">履歴を見る</h3>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* その他のリンク */}
      <div className="px-6 mb-24 pb-4">
        <button
          onClick={() => navigate('/measurements')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <div className="flex items-center">
            <TrendingUp size={20} className="text-[#1E66F5] mr-3" />
            <span className="text-[#334155]">測定値を見る</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <Footer />
    </div>
  );
}