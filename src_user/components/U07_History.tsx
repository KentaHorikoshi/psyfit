import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './ui/Header';
import { Footer } from './ui/Footer';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { ChevronLeft, ChevronRight, TrendingUp, X } from 'lucide-react';

interface DayRecord {
  date: string;
  exercises: Array<{ name: string; reps: number; sets: number }>;
  condition?: { pain: number; body: number; comment: string };
}

interface EditingExercise {
  index: number;
  name: string;
  reps: number;
  sets: number;
}

interface EditingCondition {
  pain: number;
  body: number;
  comment: string;
}

const exerciseOptions = [
  '膝の曲げ伸ばし運動',
  'スクワット',
  '肩の回旋運動',
  '片脚立位バランス',
  '腕の上げ下ろし',
];

const mockRecords: Record<string, DayRecord> = {
  '2026-01-18': {
    date: '2026-01-18',
    exercises: [
      { name: '膝の曲げ伸ばし運動', reps: 10, sets: 3 },
      { name: 'スクワット', reps: 15, sets: 2 }
    ],
    condition: { pain: 3, body: 7, comment: '調子が良い' }
  },
  '2026-01-17': {
    date: '2026-01-17',
    exercises: [
      { name: '肩の回旋運動', reps: 12, sets: 3 }
    ]
  },
  '2026-01-16': {
    date: '2026-01-16',
    exercises: [
      { name: '膝の曲げ伸ばし運動', reps: 10, sets: 3 }
    ]
  },
  '2026-01-15': {
    date: '2026-01-15',
    exercises: [
      { name: 'スクワット', reps: 12, sets: 3 },
      { name: '片脚立位バランス', reps: 20, sets: 2 }
    ]
  },
  '2026-01-14': {
    date: '2026-01-14',
    exercises: [
      { name: '膝の曲げ伸ばし運動', reps: 10, sets: 3 }
    ]
  }
};

export default function History() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 18)); // 2026年1月18日
  const [selectedDate, setSelectedDate] = useState('2026-01-18'); // 今日の日付
  const todayDate = '2026-01-18'; // ログインしている日付
  const [editingExercise, setEditingExercise] = useState<EditingExercise | null>(null);
  const [editingCondition, setEditingCondition] = useState<EditingCondition | null>(null);
  const [records, setRecords] = useState(mockRecords);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const getDayRecords = (day: number): boolean => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return !!records[dateStr];
  };
  
  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };
  
  const goToPrevDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    const newDateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    setSelectedDate(newDateStr);
    setCurrentDate(new Date(current.getFullYear(), current.getMonth(), 1));
  };
  
  const goToNextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    const newDateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    setSelectedDate(newDateStr);
    setCurrentDate(new Date(current.getFullYear(), current.getMonth(), 1));
  };
  
  const handleExerciseClick = (index: number) => {
    if (selectedRecord) {
      const exercise = selectedRecord.exercises[index];
      setEditingExercise({
        index,
        name: exercise.name,
        reps: exercise.reps,
        sets: exercise.sets
      });
    }
  };
  
  const handleConditionClick = () => {
    if (selectedRecord?.condition) {
      setEditingCondition({ ...selectedRecord.condition });
    }
  };
  
  const saveExercise = () => {
    if (editingExercise && selectedRecord) {
      const updatedRecords = { ...records };
      updatedRecords[selectedDate].exercises[editingExercise.index] = {
        name: editingExercise.name,
        reps: editingExercise.reps,
        sets: editingExercise.sets
      };
      setRecords(updatedRecords);
      setEditingExercise(null);
    }
  };
  
  const saveCondition = () => {
    if (editingCondition && selectedRecord) {
      const updatedRecords = { ...records };
      updatedRecords[selectedDate].condition = { ...editingCondition };
      setRecords(updatedRecords);
      setEditingCondition(null);
    }
  };
  
  const selectedRecord = records[selectedDate];
  const todayRecord = records['2026-01-18']; // 今日の日付の記録
  
  const renderCalendar = () => {
    const days = [];
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    
    // 曜日ヘッダー
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={`header-${i}`} className="text-center text-sm text-[#334155] py-2">
          {weekDays[i]}
        </div>
      );
    }
    
    // 空白セル
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }
    
    // 日付セル
    for (let day = 1; day <= daysInMonth; day++) {
      const hasRecord = getDayRecords(day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = dateStr === selectedDate;
      const isToday = dateStr === '2026-01-18';
      
      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          className={`aspect-square flex items-center justify-center rounded-xl text-base relative transition-colors min-h-[44px] ${
            isSelected
              ? 'bg-[#1E66F5] text-white'
              : isToday
              ? 'bg-[#EAF2FF] text-[#1E66F5]'
              : 'hover:bg-gray-100 text-[#0B1220]'
          }`}
        >
          {day}
          {hasRecord && (
            <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
              isSelected ? 'bg-white' : 'bg-[#1E66F5]'
            }`} />
          )}
        </button>
      );
    }
    
    return days;
  };
  
  return (
    <div className="min-h-screen bg-white pb-24" style={{ maxWidth: '390px', margin: '0 auto' }}>
      <Header title="運動履歴" showBack={false} />
      
      <div className="px-6 py-4">
        {/* 月選択 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="前月"
          >
            <ChevronLeft size={24} className="text-[#334155]" />
          </button>
          <h2 className="text-xl text-[#0B1220]">
            {year}年{month + 1}月
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="次月"
          >
            <ChevronRight size={24} className="text-[#334155]" />
          </button>
        </div>
        
        {/* カレンダー */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {renderCalendar()}
        </div>
        
        {/* 選択日の詳細 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={goToPrevDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="前日"
            >
              <ChevronLeft size={24} className="text-[#334155]" />
            </button>
            <h3 className="text-xl text-[#0B1220]">
              {new Date(selectedDate).getMonth() + 1}月{new Date(selectedDate).getDate()}日の記録
            </h3>
            <button
              onClick={goToNextDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="翌日"
            >
              <ChevronRight size={24} className="text-[#334155]" />
            </button>
          </div>
          
          {selectedRecord ? (
            <div className="space-y-3">
              {selectedRecord.exercises.map((exercise, index) => (
                <Card 
                  key={index}
                  onClick={() => handleExerciseClick(index)}
                  className="cursor-pointer hover:border-[#1E66F5] transition-colors"
                >
                  <h4 className="text-[#0B1220] mb-2">{exercise.name}</h4>
                  <p className="text-[#334155]">
                    {exercise.reps}回 × {exercise.sets}セット
                  </p>
                </Card>
              ))}
              
              {selectedRecord.condition && (
                <Card 
                  className="bg-[#EAF2FF] border-[#1E66F5] cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={handleConditionClick}
                >
                  <h4 className="text-[#0B1220] mb-2">体調記録</h4>
                  <div className="space-y-1 text-sm text-[#334155]">
                    <p>痛み: {selectedRecord.condition.pain}/10</p>
                    <p>身体の変化: {selectedRecord.condition.body}/10</p>
                    {selectedRecord.condition.comment && (
                      <p className="mt-2">メモ: {selectedRecord.condition.comment}</p>
                    )}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card className="text-center py-8">
              <p className="text-[#334155]">この日の記録はありません</p>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
      
      {/* 運動記録編集モーダル */}
      {editingExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" style={{ maxWidth: '390px', margin: '0 auto' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg text-[#0B1220]">運動記録を編集</h3>
              <button
                onClick={() => setEditingExercise(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-[#334155]" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#334155] mb-2">運動名</label>
                <select
                  value={editingExercise.name}
                  onChange={(e) => setEditingExercise({ ...editingExercise, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[#0B1220] focus:outline-none focus:border-[#1E66F5] transition-colors bg-white"
                >
                  {exerciseOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-[#334155] mb-2">回数</label>
                <Input
                  type="number"
                  value={editingExercise.reps}
                  onChange={(e) => setEditingExercise({ ...editingExercise, reps: parseInt(e.target.value) || 0 })}
                  placeholder="回数"
                />
              </div>
              
              <div>
                <label className="block text-sm text-[#334155] mb-2">セット数</label>
                <Input
                  type="number"
                  value={editingExercise.sets}
                  onChange={(e) => setEditingExercise({ ...editingExercise, sets: parseInt(e.target.value) || 0 })}
                  placeholder="セット数"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setEditingExercise(null)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={saveExercise}
                >
                  保存
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 体調記録編集モーダル */}
      {editingCondition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" style={{ maxWidth: '390px', margin: '0 auto' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg text-[#0B1220]">体調記録を編集</h3>
              <button
                onClick={() => setEditingCondition(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-[#334155]" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#334155] mb-2">痛み (0-10)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={editingCondition.pain}
                    onChange={(e) => setEditingCondition({ ...editingCondition, pain: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1E66F5]"
                  />
                  <span className="text-lg text-[#0B1220] font-medium w-8 text-center">{editingCondition.pain}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-[#334155] mb-2">身体の変化 (0-10)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={editingCondition.body}
                    onChange={(e) => setEditingCondition({ ...editingCondition, body: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1E66F5]"
                  />
                  <span className="text-lg text-[#0B1220] font-medium w-8 text-center">{editingCondition.body}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-[#334155] mb-2">メモ</label>
                <textarea
                  value={editingCondition.comment}
                  onChange={(e) => setEditingCondition({ ...editingCondition, comment: e.target.value })}
                  placeholder="今日の調子や気づいたこと"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[#0B1220] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1E66F5] transition-colors resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setEditingCondition(null)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={saveCondition}
                >
                  保存
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}