import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Play, Clock } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  difficulty: string;
  duration: string;
}

const todayExercises: Exercise[] = [
  { id: '1', name: '膝の曲げ伸ばし運動', bodyPart: '下半身', difficulty: '初級', duration: '5分' },
  { id: '2', name: 'スクワット', bodyPart: '下半身', difficulty: '中級', duration: '10分' },
  { id: '3', name: '肩の回旋運動', bodyPart: '上半身', difficulty: '初級', duration: '5分' },
];

export default function ExerciseCards() {
  const navigate = useNavigate();
  const location = useLocation();
  const [completedExercises, setCompletedExercises] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('completedExercises');
    return saved ? JSON.parse(saved) : [];
  });
  
  const remainingExercises = todayExercises.filter(ex => !completedExercises.includes(ex.id));
  
  // 状態に応じたメッセージ
  const getMessage = () => {
    if (completedExercises.length === 0) {
      return '運動を開始！';
    } else if (remainingExercises.length === 1) {
      return 'あとつ、頑張ろう！';
    } else {
      return 'いい感じ、続けて運動しよう！';
    }
  };
  
  useEffect(() => {
    // すべて完了したらホーム画面へ
    if (remainingExercises.length === 0 && completedExercises.length > 0) {
      navigate('/home');
    }
  }, [remainingExercises.length, completedExercises.length]);
  
  const handleVideoClick = (exerciseId: string) => {
    navigate(`/exercise-session/${exerciseId}`, { state: { fromCards: true } });
  };
  
  const handleBulkRecord = () => {
    navigate('/bulk-record');
  };
  
  return (
    <div className="min-h-screen bg-white px-6 py-8 pb-32" style={{ maxWidth: '390px', margin: '0 auto' }}>
      <h1 className="text-2xl text-[#0B1220] text-center mb-8">
        {getMessage()}
      </h1>
      
      <div className="space-y-4 mb-6">
        {remainingExercises.map((exercise) => (
          <Card key={exercise.id} className="p-3">
            <div className="flex items-center gap-3">
              {/* 左側: 運動名とチップ */}
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl text-[#0B1220] mb-2 font-light">{exercise.name}</h3>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-[#EAF2FF] text-[#1E66F5] rounded-full text-sm">
                    {exercise.bodyPart}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-white text-sm ${
                    exercise.difficulty === '初級' ? 'bg-green-500' :
                    exercise.difficulty === '中級' ? 'bg-[#1E66F5]' : 'bg-red-500'
                  }`}>
                    {exercise.difficulty}
                  </span>
                  <span className="px-2.5 py-1 bg-gray-100 text-[#334155] rounded-full text-sm flex items-center gap-1">
                    <Clock size={14} />
                    {exercise.duration}
                  </span>
                </div>
              </div>
              
              {/* 右側: 動画ボタン */}
              <button
                onClick={() => handleVideoClick(exercise.id)}
                className="flex items-center justify-center bg-[#1E66F5] text-white rounded-xl p-3 hover:bg-[#1557D3] transition-colors min-h-[60px] min-w-[60px]"
                aria-label="動画を見る"
              >
                <Play size={32} />
              </button>
            </div>
          </Card>
        ))}
      </div>
      
      {/* まとめて記録ボタン */}
      <div className="fixed bottom-6 left-0 right-0 px-6" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <Button 
          variant="secondary" 
          size="large"
          fullWidth 
          onClick={handleBulkRecord}
        >
          まとめて記録
        </Button>
      </div>
    </div>
  );
}