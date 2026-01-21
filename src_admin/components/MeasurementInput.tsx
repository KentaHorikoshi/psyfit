import { useState } from 'react';
import { X, Save, ArrowLeft, Settings, Dumbbell } from 'lucide-react';
import type { Page } from '../App';

interface MeasurementInputProps {
  patientId: string;
  onClose: () => void;
  onNavigate: (page: Page, patientId?: string) => void;
}

export function MeasurementInput({ patientId, onClose, onNavigate }: MeasurementInputProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    kneeStrength: '',
    tug: '',
    singleLegStance: '',
    pain: 0,
    mmt: '5',
    notes: ''
  });

  const [visibleFields, setVisibleFields] = useState({
    weight: true,
    kneeStrength: true,
    tug: true,
    singleLegStance: true,
    pain: true,
    mmt: true
  });

  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show confirmation modal
    setShowConfirmation(true);
  };

  const confirmSave = () => {
    // Mock save
    console.log('Saving measurement:', formData);
    alert('測定値を保存しました');
    setShowConfirmation(false);
    onClose();
  };

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFieldVisibility = (field: keyof typeof visibleFields) => {
    setVisibleFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[#3B82F6] hover:text-[#1E40AF] mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            患者詳細に戻る
          </button>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">測定値入力</h1>
              <p className="text-gray-600">伊藤 正男</p>
            </div>
            <button
              onClick={() => setShowFieldSelector(true)}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              表示項目
            </button>
            <button
              onClick={() => onNavigate('exercise-menu', patientId)}
              className="bg-[#3B82F6] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <Dumbbell className="w-5 h-5" />
              メニュー設定へ
            </button>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Date */}
            <div className="md:col-span-2">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                測定日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                required
                className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
                style={{
                  colorScheme: 'light',
                }}
              />
              <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                  font-size: 24px;
                  padding: 8px;
                  cursor: pointer;
                }
                input[type="date"] {
                  min-height: 56px;
                }
              `}</style>
            </div>

            {/* Weight */}
            {visibleFields.weight && (
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  体重 (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => updateField('weight', e.target.value)}
                  placeholder="65.5"
                  className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
                />
              </div>
            )}

            {/* Knee Strength */}
            {visibleFields.kneeStrength && (
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  膝伸展筋力 (N)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.kneeStrength}
                  onChange={(e) => updateField('kneeStrength', e.target.value)}
                  placeholder="305"
                  className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
                />
              </div>
            )}

            {/* TUG */}
            {visibleFields.tug && (
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  TUG (秒)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.tug}
                  onChange={(e) => updateField('tug', e.target.value)}
                  placeholder="10.3"
                  className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
                />
              </div>
            )}

            {/* Single Leg Stance */}
            {visibleFields.singleLegStance && (
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  片脚立位 (秒)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.singleLegStance}
                  onChange={(e) => updateField('singleLegStance', e.target.value)}
                  placeholder="15.0"
                  className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
                />
              </div>
            )}

            {/* Pain (NRS) */}
            {visibleFields.pain && (
              <div className="md:col-span-2">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  痛み (NRS): <span className="text-4xl font-bold text-[#1E40AF] ml-3">{formData.pain}</span>
                </label>
                <div className="flex items-center gap-6">
                  <span className="text-base font-medium text-gray-600">0</span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={formData.pain}
                      onChange={(e) => updateField('pain', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${formData.pain * 10}%, #E5E7EB ${formData.pain * 10}%, #E5E7EB 100%)`
                      }}
                    />
                    <style>{`
                      input[type="range"]::-webkit-slider-thumb {
                        appearance: none;
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        background: #1E40AF;
                        cursor: pointer;
                        border: 3px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                      }
                      input[type="range"]::-moz-range-thumb {
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        background: #1E40AF;
                        cursor: pointer;
                        border: 3px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                      }
                    `}</style>
                  </div>
                  <span className="text-base font-medium text-gray-600">10</span>
                </div>
                <div className="flex justify-between mt-3 px-1">
                  <span className="text-sm text-gray-500">痛みなし</span>
                  <span className="text-sm text-gray-500">最悪の痛み</span>
                </div>
              </div>
            )}

            {/* MMT */}
            {visibleFields.mmt && (
              <div className="md:col-span-2">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  筋力 (MMT)
                </label>
                <select
                  value={formData.mmt}
                  onChange={(e) => updateField('mmt', e.target.value)}
                  className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none bg-white"
                >
                  <option value="0">0 - 筋収縮なし</option>
                  <option value="1">1 - ずかな筋収縮</option>
                  <option value="2">2 - 重力を除いた運動可能</option>
                  <option value="3">3 - 重力に抗した運動可能</option>
                  <option value="4">4 - 抵抗に抗した運動可能</option>
                  <option value="5">5 - 正常筋力</option>
                </select>
              </div>
            )}

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                備考
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="気になったことや追加の情報を記載してください"
                rows={4}
                className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 text-lg border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white px-6 py-4 text-lg rounded-lg font-medium transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Save className="w-6 h-6" />
              保存する
            </button>
          </div>
        </form>
      </div>

      {/* Field Selector */}
      {showFieldSelector && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">表示フィールドを選択</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={visibleFields.weight}
                  onChange={() => toggleFieldVisibility('weight')}
                  className="mr-2"
                />
                <label className="text-lg font-medium text-gray-700">体重</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={visibleFields.kneeStrength}
                  onChange={() => toggleFieldVisibility('kneeStrength')}
                  className="mr-2"
                />
                <label className="text-lg font-medium text-gray-700">膝伸展筋力</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={visibleFields.tug}
                  onChange={() => toggleFieldVisibility('tug')}
                  className="mr-2"
                />
                <label className="text-lg font-medium text-gray-700">TUG</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={visibleFields.singleLegStance}
                  onChange={() => toggleFieldVisibility('singleLegStance')}
                  className="mr-2"
                />
                <label className="text-lg font-medium text-gray-700">片脚立位</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={visibleFields.pain}
                  onChange={() => toggleFieldVisibility('pain')}
                  className="mr-2"
                />
                <label className="text-lg font-medium text-gray-700">痛み (NRS)</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={visibleFields.mmt}
                  onChange={() => toggleFieldVisibility('mmt')}
                  className="mr-2"
                />
                <label className="text-lg font-medium text-gray-700">筋力 (MMT)</label>
              </div>
            </div>
            <button
              className="mt-6 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white px-6 py-4 text-lg rounded-lg font-medium transition-colors shadow-md flex items-center justify-center gap-2"
              onClick={() => setShowFieldSelector(false)}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">保存確認</h2>
            <p className="text-gray-600">測定値を保存しますか？</p>
            <div className="flex gap-4 mt-6">
              <button
                className="flex-1 px-6 py-4 text-lg border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                onClick={() => setShowConfirmation(false)}
              >
                キャンセル
              </button>
              <button
                className="flex-1 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white px-6 py-4 text-lg rounded-lg font-medium transition-colors shadow-md flex items-center justify-center gap-2"
                onClick={confirmSave}
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}