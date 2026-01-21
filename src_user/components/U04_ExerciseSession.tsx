import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Header } from './ui/Header';
import { Footer } from './ui/Footer';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Play, Plus, Minus } from 'lucide-react';

const exercises = {
  '1': { name: '膝の曲げ伸ばし運動', videoUrl: 'video1.mp4' },
  '2': { name: 'スクワット', videoUrl: 'video2.mp4' },
  '3': { name: '肩の回旋運動', videoUrl: 'video3.mp4' },
  '4': { name: '片脚立位バランス', videoUrl: 'video4.mp4' },
  '5': { name: '腕の上げ下ろし', videoUrl: 'video5.mp4' },
};

export default function ExerciseSession() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { fromCards } = location.state || {};
  const [reps, setReps] = useState(10);
  const [sets, setSets] = useState(3);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  const exercise = exercises[id as keyof typeof exercises] || { name: '運動', videoUrl: '' };
  
  const adjustValue = (current: number, delta: number, min: number, max: number) => {
    const newValue = current + delta;
    return Math.max(min, Math.min(max, newValue));
  };
  
  const handleComplete = () => {
    // 完了した運動を記録
    const completed = JSON.parse(sessionStorage.getItem('completedExercises') || '[]');
    if (!completed.includes(id)) {
      completed.push(id);
      sessionStorage.setItem('completedExercises', JSON.stringify(completed));
    }
    
    // 残りの運動数を計算
    const totalExercises = 3;
    const remaining = totalExercises - completed.length;
    
    // 祝福画面に遷移
    navigate('/celebration', { state: { remaining } });
  };
  
  const handleSave = () => {
    setShowConfirmModal(false);
    setShowSuccessToast(true);
    
    setTimeout(() => {
      navigate('/history');
    }, 1500);
  };
  
  const handleBack = () => {
    if (fromCards) {
      const completed = JSON.parse(sessionStorage.getItem('completedExercises') || '[]');
      const totalExercises = 3;
      if (completed.length < totalExercises) {
        // まだ完了していない場合は運動カード画面へ
        navigate('/exercise-cards');
      } else {
        // 全て完了している場合はホーム画面へ
        navigate('/home');
      }
    } else {
      navigate('/home');
    }
  };
  
  return (
    <div className="min-h-screen bg-white pb-24" style={{ maxWidth: '390px', margin: '0 auto' }}>
      <Header title={exercise.name} onBack={handleBack} />
      
      <div className="px-6 py-4">
        {/* ビデオプレーヤー */}
        <div className="mb-6">
          <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all">
                <Play size={28} className="text-[#1E66F5] ml-1" fill="currentColor" />
              </button>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80" 
              alt="運動動画"
              className="w-full h-full object-cover opacity-60"
            />
          </div>
          <p className="text-sm text-[#334155] mt-2 text-center">
            動画を見ながら正しいフォームで行いましょう
          </p>
        </div>
        
        {/* 回数入力 */}
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <label className="text-[#0B1220]">回数</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setReps(adjustValue(reps, -1, 1, 100))}
                className="w-12 h-12 bg-[#EAF2FF] hover:bg-[#D8E6FF] rounded-xl flex items-center justify-center transition-colors"
                aria-label="回数を減らす"
              >
                <Minus size={20} className="text-[#1E66F5]" />
              </button>
              <span className="text-3xl text-[#0B1220] font-semibold w-16 text-center">
                {reps}
              </span>
              <button
                onClick={() => setReps(adjustValue(reps, 1, 1, 100))}
                className="w-12 h-12 bg-[#EAF2FF] hover:bg-[#D8E6FF] rounded-xl flex items-center justify-center transition-colors"
                aria-label="回数を増やす"
              >
                <Plus size={20} className="text-[#1E66F5]" />
              </button>
            </div>
          </div>
        </Card>
        
        {/* セット数入力 */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <label className="text-[#0B1220]">セット数</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSets(adjustValue(sets, -1, 1, 10))}
                className="w-12 h-12 bg-[#EAF2FF] hover:bg-[#D8E6FF] rounded-xl flex items-center justify-center transition-colors"
                aria-label="セット数を減らす"
              >
                <Minus size={20} className="text-[#1E66F5]" />
              </button>
              <span className="text-3xl text-[#0B1220] font-semibold w-16 text-center">
                {sets}
              </span>
              <button
                onClick={() => setSets(adjustValue(sets, 1, 1, 10))}
                className="w-12 h-12 bg-[#EAF2FF] hover:bg-[#D8E6FF] rounded-xl flex items-center justify-center transition-colors"
                aria-label="セット数を増やす"
              >
                <Plus size={20} className="text-[#1E66F5]" />
              </button>
            </div>
          </div>
        </Card>
        
        {/* ヒント */}
        <div className="bg-[#EAF2FF] p-4 rounded-xl">
          <p className="text-sm text-[#334155]">
            💡 無理のない範囲で行いましょう。痛みを感じた場合は中止してください。
          </p>
        </div>
      </div>
      
      {/* 完了ボタン（固定） */}
      <div 
        className={`fixed left-0 right-0 bg-white border-t border-gray-100 p-4 ${fromCards ? 'bottom-0' : 'bottom-20'}`}
        style={{ maxWidth: '390px', margin: '0 auto' }}
      >
        <Button variant="primary" size="large" fullWidth onClick={handleComplete}>
          完了
        </Button>
      </div>
      
      {!fromCards && <Footer />}
      
      {/* 確認モーダル */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl text-[#0B1220] mb-2">記録を保存</h3>
            <p className="text-[#334155] mb-6">
              {exercise.name}を{reps}回×{sets}セット実施しました。<br />
              記録を保存しますか？
            </p>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                fullWidth 
                onClick={() => setShowConfirmModal(false)}
              >
                キャンセル
              </Button>
              <Button 
                variant="primary" 
                fullWidth 
                onClick={handleSave}
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* 成功トースト */}
      {showSuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#16A34A] text-white px-6 py-3 rounded-xl shadow-lg z-50">
          ✓ 記録しました
        </div>
      )}
    </div>
  );
}