import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './ui/Header';
import { Footer } from './ui/Footer';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
import { Video, Clock } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  duration: string;
  hasVideo: boolean;
  difficulty: string;
}

const mockExercises: Exercise[] = [
  { id: '1', name: '膝の曲げ伸ばし運動', bodyPart: '下半身', duration: '約3分', hasVideo: true, difficulty: '初級' },
  { id: '2', name: 'スクワット', bodyPart: '下半身', duration: '約5分', hasVideo: true, difficulty: '中級' },
  { id: '3', name: '肩の回旋運動', bodyPart: '上半身', duration: '約2分', hasVideo: true, difficulty: '初級' },
  { id: '4', name: '片脚立位バランス', bodyPart: '下半身', duration: '約4分', hasVideo: true, difficulty: '中級' },
  { id: '5', name: '腕の上げ下ろし', bodyPart: '上半身', duration: '約3分', hasVideo: true, difficulty: '初級' },
];

export default function ExerciseMenu() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('すべて');
  
  const filters = ['すべて', '上半身', '下半身', '体幹'];
  
  const filteredExercises = selectedFilter === 'すべて' 
    ? mockExercises 
    : mockExercises.filter(ex => ex.bodyPart === selectedFilter);
  
  return (
    <div className="min-h-screen bg-white pb-24" style={{ maxWidth: '390px', margin: '0 auto' }}>
      <Header title="運動メニュー" showBack={false} />
      
      <div className="px-6 py-4">
        {/* フィルター */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedFilter === filter
                  ? 'bg-[#1E66F5] text-white'
                  : 'bg-gray-100 text-[#334155] hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        
        {/* 運動リスト */}
        {filteredExercises.length > 0 ? (
          <div className="space-y-3">
            {filteredExercises.map(exercise => {
              const difficultyColor = 
                exercise.difficulty === '初級' ? 'bg-green-500' :
                exercise.difficulty === '中級' ? 'bg-[#1E66F5]' :
                'bg-red-500';
              
              return (
                <Card 
                  key={exercise.id}
                  onClick={() => navigate(`/exercise-session/${exercise.id}`)}
                  className="hover:border-[#1E66F5] transition-colors"
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h3 className="text-[#0B1220] mb-3">{exercise.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-[#EAF2FF] text-[#1E66F5] rounded-full text-base">
                          {exercise.bodyPart}
                        </span>
                        <span className={`px-3 py-1.5 ${difficultyColor} text-white rounded-full text-base`}>
                          {exercise.difficulty}
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 text-[#334155] rounded-full text-base flex items-center gap-1">
                          <Clock size={16} />
                          {exercise.duration}
                        </span>
                      </div>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 ml-2">
                      <path d="M9 18L15 12L9 6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video size={32} className="text-gray-400" />
            </div>
            <p className="text-[#334155]">
              まだ運動メニューが設定されていません。<br />
              担当スタッフにお問い合わせください。
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}