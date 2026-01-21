import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './ui/Header';
import { Footer } from './ui/Footer';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Plus, Minus, X, Calendar } from 'lucide-react';

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

export default function BulkRecord2() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<ExerciseRecord[]>([
    { id: '1', name: '膝の曲げ伸ばし運動', reps: 10, sets: 3 }
  ]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
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
    // 記録を保存（実際にはバックエンドに送信）
    console.log('まとめて記録:', { date: selectedDate, exercises });
    
    setShowSuccessToast(true);
    setTimeout(() => {
      navigate('/history');
    }, 1500);
  };
  
  // 日付を表示用にフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };
  
  return (
    <div className="min-h-screen bg-white pb-24" style={{ maxWidth: '390px', margin: '0 auto' }}>
      <Header title="まとめて記録" showBack={false} />
      
      <div className="px-6 py-4">
        {/* 日付選択 */}
        <Card className="mb-4">
          <label className="block text-sm text-[#334155] mb-2">記録日</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[#0B1220] focus:outline-none focus:border-[#1E66F5] transition-colors bg-white"
          />
        </Card>
        
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
        
        {/* 運動を追加ボタン */}
        <button
          onClick={addExercise}
          className="w-full py-4 border-2 border-dashed border-[#1E66F5] text-[#1E66F5] rounded-xl flex items-center justify-center gap-2 hover:bg-[#EAF2FF] transition-colors mb-6"
        >
          <Plus size={20} />
          運動を追加
        </button>
        
        {/* 保存ボタン */}
        <Button variant="primary" size="large" fullWidth onClick={handleSave}>
          すべて記録する
        </Button>
      </div>
      
      {/* フッターは常に表示 */}
      <Footer />
      
      {/* 成功トースト */}
      {showSuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#16A34A] text-white px-6 py-3 rounded-xl shadow-lg z-50">
          ✓ 記録しました
        </div>
      )}
    </div>
  );
}