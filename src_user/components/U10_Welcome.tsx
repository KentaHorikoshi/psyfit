import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, Award } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();
  const [userName] = useState('田中太郎');
  const [continuousDays] = useState(5); // 継続日数
  const [isContinuing] = useState(true); // 継続しているかどうか
  
  // 時間帯による挨拶
  const getGreeting = () => {
    return 'お疲れさまでした';
  };
  
  const handleTransition = () => {
    // 運動カード画面に遷移し、記録をリセット
    sessionStorage.removeItem('completedExercises');
    navigate('/exercise-cards');
  };
  
  useEffect(() => {
    // 3秒後に自動遷移
    const timer = setTimeout(() => {
      handleTransition();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#EAF2FF] via-white to-[#F0F9FF] flex items-center justify-center px-6 cursor-pointer overflow-hidden relative"
      style={{ maxWidth: '390px', margin: '0 auto' }}
      onClick={handleTransition}
    >
      <div className="w-full space-y-8 text-center relative z-10">
        {isContinuing ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-block mb-4"
              >
                <Award size={48} className="text-[#FFB800]" />
              </motion.div>
              
              <h1 className="text-3xl text-[#0B1220] leading-relaxed">
                {getGreeting()}！<br />
                <span className="text-[#1E66F5] font-semibold">{userName}</span>さん
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-[#1E66F5] to-[#3B82F6] border-none p-8 shadow-2xl">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <TrendingUp size={24} className="text-white" />
                    <p className="text-white text-lg">継続日数</p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <motion.p 
                      className="text-7xl text-white font-bold"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {continuousDays}
                    </motion.p>
                    <p className="text-white text-2xl font-semibold">日</p>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Sparkles size={20} className="text-[#FFB800]" />
                    <p className="text-white text-lg font-semibold">素晴らしい継続力！</p>
                    <Sparkles size={20} className="text-[#FFB800]" />
                  </div>
                </motion.div>
              </Card>
            </motion.div>
            
            <motion.p
              className="text-[#334155] text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              今日も一緒に頑張ろう！ 💪
            </motion.p>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block mb-4"
            >
              <Sparkles size={48} className="text-[#1E66F5]" />
            </motion.div>
            
            <h1 className="text-3xl text-[#0B1220] leading-relaxed">
              おかえりなさい！<br />
              <span className="text-[#1E66F5] font-semibold">{userName}</span>さん
            </h1>
            
            <motion.p
              className="text-[#334155] text-lg mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              今日から一緒に頑張ろう！ 🌟
            </motion.p>
          </motion.div>
        )}
      </div>
    </div>
  );
}