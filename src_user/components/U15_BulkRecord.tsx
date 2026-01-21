import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './ui/Header';
import { Footer } from './ui/Footer';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Plus, Minus, X } from 'lucide-react';

interface ExerciseRecord {
  id: string;
  name: string;
  reps: number;
  sets: number;
}

const exerciseOptions = [
  '膝の曲げ伸ばし運動',
  'スクワット',
  '肩の回旋運動',
  '片脚立位バランス',
  '腕の上げ下ろし',
];

// 今日の運動リスト（運動カード画面と同じ）
const todayExercises = [
  { id: '1', name: '膝の曲げ伸ばし運動' },
  { id: '2', name: 'スクワット' },
  { id: '3', name: '肩の回旋運動' },
];

const TOTAL_EXERCISES = 3; // 今日の運動総数

export default function BulkRecord() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // すべての運動が完了しているかチェック
  const completedExercises = JSON.parse(sessionStorage.getItem('completedExercises') || '[]');
  const isAllCompleted = completedExercises.length >= TOTAL_EXERCISES;
  
  // 運動カード画面に残っているカードの運動を取得
  useEffect(() => {
    const remainingExercises = todayExercises.filter(ex => !completedExercises.includes(ex.id));
    const initialExercises = remainingExercises.map((ex, index) => ({
      id: (index + 1).toString(),
      name: ex.name,
      reps: 10,
      sets: 3
    }));
    setExercises(initialExercises);
  }, []);
  
  // 戻るボタンの遷移先を決定
  const handleBack = () => {
    if (isAllCompleted) {
      navigate('/home');
    } else {
      navigate('/exercise-cards');
    }
  };
  
  const addExercise = () => {
    const newId = (exercises.length + 1).toString();
    setExercises([
      ...exercises,
      { id: newId, name: exerciseOptions[0], reps: 10, sets: 3 }
    ]);
  };
  
  const removeExercise = (id: string) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter(ex => ex.id !== id));
    }
  };
  
  const updateExercise = (id: string, field: keyof ExerciseRecord, value: string | number) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };
  
  const adjustValue = (current: number, delta: number, min: number, max: number) => {
    const newValue = current + delta;
    return Math.max(min, Math.min(max, newValue));
  };
  
  const handleSave = () => {
    setShowConfirm(true);
  };
  
  const handleConfirmSave = () => {
    // 記録を保存（実際にはバックエンドに送信）
    console.log('まとめて記録:', exercises);
    
    setShowConfirm(false);
    setShowSuccessToast(true);
    setTimeout(() => {
      navigate('/condition-input');
    }, 1500);
  };
  
  const handleCancelSave = () => {
    setShowConfirm(false);
  };
  
  return (
    <div className="min-h-screen bg-white pb-24" style={{ maxWidth: '390px', margin: '0 auto' }}>
      <Header title="まとめて記録" onBack={handleBack} />
      
      <div className="px-6 py-4">
        {/* 運動リスト */}
        <div className="space-y-4 mb-4">
          {exercises.map((exercise, index) => (
            <Card key={exercise.id} className="relative">
              {exercises.length > 1 && (
                <button
                  onClick={() => removeExercise(exercise.id)}
                  className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="削除"
                >
                  <X size={20} className="text-[#334155]" />
                </button>
              )}
              
              <div className="space-y-4">
                {/* 運動名 */}
                <div>
                  <label className="block text-sm text-[#334155] mb-2">
                    運動 {index + 1}
                  </label>
                  <select
                    value={exercise.name}
                    onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[#0B1220] focus:outline-none focus:border-[#1E66F5] transition-colors bg-white"
                  >
                    {exerciseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* 回数 */}
                <div>
                  <label className="block text-sm text-[#334155] mb-2">回数</label>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => updateExercise(exercise.id, 'reps', adjustValue(exercise.reps, -1, 1, 100))}
                      className="w-12 h-12 bg-[#EAF2FF] hover:bg-[#D8E6FF] rounded-xl flex items-center justify-center transition-colors"
                      aria-label="回数を減らす"
                    >
                      <Minus size={20} className="text-[#1E66F5]" />
                    </button>
                    <span className="text-3xl text-[#0B1220] font-semibold">{exercise.reps}</span>
                    <button
                      onClick={() => updateExercise(exercise.id, 'reps', adjustValue(exercise.reps, 1, 1, 100))}
                      className="w-12 h-12 bg-[#EAF2FF] hover:bg-[#D8E6FF] rounded-xl flex items-center justify-center transition-colors"
                      aria-label="回数を増やす"
                    >
                      <Plus size={20} className="text-[#1E66F5]" />
                    </button>
                  </div>
                </div>
                
                {/* セット数 */}
                <div>
                  <label className="block text-sm text-[#334155] mb-2">セット数</label>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => updateExercise(exercise.id, 'sets', adjustValue(exercise.sets, -1, 1, 10))}
                      className="w-12 h-12 bg-[#EAF2FF] hover:bg-[#D8E6FF] rounded-xl flex items-center justify-center transition-colors"
                      aria-label="セット数を減らす"
                    >
                      <Minus size={20} className="text-[#1E66F5]" />
                    </button>
                    <span className="text-3xl text-[#0B1220] font-semibold">{exercise.sets}</span>
                    <button
                      onClick={() => updateExercise(exercise.id, 'sets', adjustValue(exercise.sets, 1, 1, 10))}
                      className="w-12 h-12 bg-[#EAF2FF] hover:bg-[#D8E6FF] rounded-xl flex items-center justify-center transition-colors"
                      aria-label="セット数を増やす"
                    >
                      <Plus size={20} className="text-[#1E66F5]" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* 保存ボタン */}
        <Button variant="primary" size="large" fullWidth onClick={handleSave}>
          すべて記録する
        </Button>
      </div>
      
      {/* フッターは運動完了後のみ表示 */}
      {isAllCompleted && <Footer />}
      
      {/* 成功トースト */}
      {showSuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#16A34A] text-white px-6 py-3 rounded-xl shadow-lg z-50">
          ✓ 記録しました
        </div>
      )}
      
      {/* 確認ダイアログ */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full" style={{ maxWidth: '342px' }}>
            <p className="text-[#0B1220] text-lg mb-6">記録を保存しますか?</p>
            <div className="flex gap-3">
              <Button variant="secondary" size="large" fullWidth onClick={handleCancelSave}>
                キャンセル
              </Button>
              <Button variant="primary" size="large" fullWidth onClick={handleConfirmSave}>
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}