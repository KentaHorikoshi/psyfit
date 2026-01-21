import { useState } from 'react';
import { ArrowLeft, Save, ChevronDown, ChevronRight, ClipboardList } from 'lucide-react';
import type { Page } from '../App';

interface ExerciseMenuProps {
  patientId: string;
  onNavigate: (page: Page, patientId?: string) => void;
}

interface Exercise {
  id: string;
  name: string;
  category: '膝' | '腰' | '全身' | '上肢';
  description: string;
}

const exercises: Exercise[] = [
  { id: 'e1', name: '膝伸展運動（椅子座位）', category: '膝', description: '椅子に座った状態で膝を伸ばす' },
  { id: 'e2', name: 'スクワット（浅め）', category: '膝', description: '膝を軽く曲げる浅めのスクワット' },
  { id: 'e3', name: '立ち上がり練習', category: '膝', description: '椅子からの立ち上がり動作' },
  { id: 'e4', name: '腰椎ストレッチ', category: '腰', description: '腰部の柔軟性向上' },
  { id: 'e5', name: '骨盤傾斜運動', category: '腰', description: '骨盤の前後傾斜運動' },
  { id: 'e6', name: 'ウォーキング（平地）', category: '全身', description: '平地での歩行練習' },
  { id: 'e7', name: 'バランス訓練', category: '全身', description: '片脚立位などのバランス練習' },
  { id: 'e8', name: '肩関節可動域訓練', category: '上肢', description: '肩の可動域改善' },
  { id: 'e9', name: '上肢筋力訓練', category: '上肢', description: 'ダンベルを用いた筋力訓練' }
];

export function ExerciseMenu({ patientId, onNavigate }: ExerciseMenuProps) {
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(
    new Set(['e1', 'e2', 'e6', 'e7'])
  );
  const [painFlag, setPainFlag] = useState(false);
  const [reason, setReason] = useState('大腿骨頸部骨折術後のため、膝関節周囲筋の筋力強化と全身バランス能力の向上を目的としています。');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Selected exercises:', Array.from(selectedExercises));
    console.log('Pain flag:', painFlag);
    console.log('Reason:', reason);
    alert('運動メニューを更新しました');
    onNavigate('patient-detail', patientId);
  };

  const groupedExercises = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.category]) {
      acc[exercise.category] = [];
    }
    acc[exercise.category].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate('patient-detail', patientId)}
          className="flex items-center gap-2 text-[#3B82F6] hover:text-[#1E40AF] mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          患者詳細に戻る
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">運動メニュー設定</h1>
            <p className="text-gray-600">伊藤 正男 - 大腿骨頸部骨折術後</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('measurement', patientId)}
              className="bg-white hover:bg-gray-50 border-2 border-[#3B82F6] text-[#3B82F6] py-3 px-6 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <ClipboardList className="w-5 h-5" />
              測定値入力へ
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white py-3 px-6 rounded-lg font-medium transition-colors shadow-md flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              メニューを更新する
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exercise Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">運動項目を選択</h2>
              
              <div className="space-y-6">
                {Object.entries(groupedExercises).map(([category, categoryExercises]) => (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-[#3B82F6] rounded"></div>
                        <h3 className="text-xl font-bold text-gray-900">{category}</h3>
                        <span className="text-sm text-gray-500">
                          ({categoryExercises.filter(e => selectedExercises.has(e.id)).length}/{categoryExercises.length})
                        </span>
                      </div>
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="w-6 h-6 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-gray-600" />
                      )}
                    </button>
                    {expandedCategories.has(category) && (
                      <div className="space-y-2 p-4 bg-white">
                        {categoryExercises.map((exercise) => (
                          <label
                            key={exercise.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                          >
                            <input
                              type="checkbox"
                              checked={selectedExercises.has(exercise.id)}
                              onChange={() => toggleExercise(exercise.id)}
                              className="mt-1 w-5 h-5 text-[#3B82F6] border-gray-300 rounded focus:ring-[#3B82F6] cursor-pointer"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{exercise.name}</p>
                              <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Selected Count */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">選択中の運動</h3>
              <p className="text-3xl font-bold text-[#3B82F6]">{selectedExercises.size} 種目</p>
            </div>

            {/* Pain Flag */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">痛みの状態</h3>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">痛みがある場合ON</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={painFlag}
                    onChange={(e) => setPainFlag(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#3B82F6] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
                </div>
              </label>
              {painFlag && (
                <p className="text-sm text-amber-600 mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  ⚠️ 痛みに配慮したメニューになります
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">設定理由</h3>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={6}
                placeholder="運動メニューの設定理由や臨床的根拠を記入してください"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}