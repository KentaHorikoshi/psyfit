import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User, Calendar, Activity, MessageSquare, AlertCircle } from 'lucide-react';
import type { Page, User as UserType } from '../App';

interface PatientDetailProps {
  patientId: string;
  currentUser: UserType;
  onNavigate: (page: Page, patientId?: string) => void;
}

const patientData = {
  p1: {
    name: '伊藤 正男',
    kana: 'イトウ マサオ',
    age: 78,
    gender: '男性',
    condition: '大腿骨頸部骨折術後',
    status: '回復期' as const,
    admissionDate: '2025-11-15',
    nextVisit: '2026-01-21',
    notes: '術後3ヶ月経過。歩行訓練順調。',
    staff: '山田 太郎',
    staffId: 'yamada'
  },
  p2: {
    name: '加藤 武',
    kana: 'カトウ タケシ',
    age: 72,
    gender: '男性',
    condition: '脊柱管狭窄症',
    status: '維持期' as const,
    admissionDate: '2025-10-20',
    nextVisit: '2026-01-25',
    notes: '症状安定。週2回の運動療法継続中。',
    staff: '山田 太郎',
    staffId: 'yamada'
  },
  p3: {
    name: '田中 花子',
    kana: 'タナカ ハナコ',
    age: 65,
    gender: '女性',
    condition: '変形性膝関節症',
    status: '回復期' as const,
    admissionDate: '2025-12-01',
    nextVisit: '2026-01-22',
    notes: '膝の可動域改善中。',
    staff: '佐藤 花子',
    staffId: 'sato'
  }
};

const measurementData = [
  { date: '11/15', kneeStrength: 180, tug: 18.5 },
  { date: '11/22', kneeStrength: 195, tug: 16.8 },
  { date: '11/29', kneeStrength: 210, tug: 15.2 },
  { date: '12/06', kneeStrength: 225, tug: 14.1 },
  { date: '12/13', kneeStrength: 240, tug: 13.5 },
  { date: '12/20', kneeStrength: 255, tug: 12.8 },
  { date: '12/27', kneeStrength: 268, tug: 12.2 },
  { date: '01/03', kneeStrength: 280, tug: 11.5 },
  { date: '01/10', kneeStrength: 292, tug: 10.9 },
  { date: '01/17', kneeStrength: 305, tug: 10.3 }
];

export function PatientDetail({ patientId, currentUser, onNavigate }: PatientDetailProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'graph'>('info');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('術後3ヶ月経過。歩行訓練順調。');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const patient = patientData[patientId as keyof typeof patientData] || patientData.p1;

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    console.log('Saved notes:', notes);
  };

  const checkPermissionAndNavigate = (page: Page) => {
    // 担当職員またはマネージャーのみ編集可能
    if (patient.staffId === currentUser.id || currentUser.role === 'マネージャー') {
      onNavigate(page, patientId);
    } else {
      setShowPermissionModal(true);
    }
  };

  return (
    <div className="p-8">
      {/* Patient Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-3xl font-semibold flex-shrink-0">
            {patient.name.charAt(0)}
          </div>

          {/* Patient Info */}
          <div className="flex-1 min-w-0">
            <div className="mb-3">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {patient.name}
              </h1>
              <p className="text-sm text-gray-500">{patient.kana}</p>
            </div>

            {/* Info Row */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{patient.age}歳 / {patient.gender}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{patient.condition}</span>
              </div>
              <StatusBadge status={patient.status} />
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm">次回来院: {new Date(patient.nextVisit).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>

            {/* Notes */}
            {!isEditingNotes ? (
              <div
                onClick={() => setIsEditingNotes(true)}
                className="flex items-start gap-2 text-gray-600 bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{notes}</p>
              </div>
            ) : (
              <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1 bg-[#1E40AF] text-white text-sm rounded hover:bg-[#1E3A8A] transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingNotes(false);
                        setNotes(patient.notes);
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-5 pt-5 border-t border-gray-200">
          <button
            onClick={() => checkPermissionAndNavigate('measurement')}
            className="flex-1 bg-white hover:bg-[#1E40AF] text-gray-700 hover:text-white border-2 border-[#3B82F6] hover:border-[#1E40AF] py-2.5 px-5 rounded-lg font-medium transition-colors"
          >
            測定値を入力
          </button>
          <button
            onClick={() => checkPermissionAndNavigate('exercise-menu')}
            className="flex-1 bg-white hover:bg-[#1E40AF] text-gray-700 hover:text-white border-2 border-[#3B82F6] hover:border-[#1E40AF] py-2.5 px-5 rounded-lg font-medium transition-colors"
          >
            運動メニュー設定
          </button>
          <button
            onClick={() => onNavigate('report', patientId)}
            className="flex-1 bg-white hover:bg-[#1E40AF] text-gray-700 hover:text-white border-2 border-[#3B82F6] hover:border-[#1E40AF] py-2.5 px-5 rounded-lg font-medium transition-colors"
          >
            レポート出力
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex">
            <TabButton
              active={activeTab === 'info'}
              onClick={() => setActiveTab('info')}
              label="基本情報"
            />
            <TabButton
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              label="運動履歴"
            />
            <TabButton
              active={activeTab === 'graph'}
              onClick={() => setActiveTab('graph')}
              label="測定値グラフ"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <InfoRow label="フリガナ" value={patient.kana} />
              <InfoRow label="担当職員" value={patient.staff} />
              <InfoRow label="生年月日" value="1947年3月15日 (78歳)" />
              <InfoRow label="入院日" value={new Date(patient.admissionDate).toLocaleDateString('ja-JP')} />
              <InfoRow label="性別" value={patient.gender} />
              <InfoRow label="次回来院" value={new Date(patient.nextVisit).toLocaleDateString('ja-JP')} />
              <InfoRow label="疾患名" value={patient.condition} />
              <InfoRow label="状態" value={patient.status} />
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">運動実施履歴</h3>
              <div className="space-y-3">
                {[
                  { date: '2026-01-18', exercises: 5, duration: 45 },
                  { date: '2026-01-17', exercises: 4, duration: 40 },
                  { date: '2026-01-15', exercises: 5, duration: 45 },
                  { date: '2026-01-13', exercises: 4, duration: 35 },
                  { date: '2026-01-11', exercises: 5, duration: 50 }
                ].map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[#3B82F6]" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('ja-JP')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {record.exercises}種目 / {record.duration}分
                        </p>
                      </div>
                    </div>
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'graph' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">測定値の推移</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={measurementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis yAxisId="left" stroke="#3B82F6" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="kneeStrength"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="膝伸展筋力 (N)"
                      dot={{ fill: '#3B82F6', r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="tug"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="TUG (秒)"
                      dot={{ fill: '#10B981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">膝伸展筋力 (最新)</p>
                  <p className="text-2xl font-bold text-blue-900">305 N</p>
                  <p className="text-sm text-blue-600 mt-1">↑ 69% 改善 (初回: 180 N)</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-1">TUG (最新)</p>
                  <p className="text-2xl font-bold text-green-900">10.3 秒</p>
                  <p className="text-sm text-green-600 mt-1">↓ 44% 改善 (初回: 18.5 秒)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-md mx-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">編集できません</h3>
            </div>
            <p className="text-gray-600 mb-6">
              この患者の測定値入力や運動メニュー設定は、担当職員（{patient.staff}）またはマネージャーのみが行えます。
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-5 py-2.5 bg-[#1E40AF] text-white rounded-lg hover:bg-[#1E3A8A] transition-colors font-medium"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium transition-colors ${
        active
          ? 'text-[#1E40AF] border-b-2 border-[#1E40AF]'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <div className="text-gray-400 mt-1">{icon}</div>}
      <div className="flex-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: '急性期' | '回復期' | '維持期' }) {
  const statusStyles = {
    '急性期': 'bg-red-100 text-red-700 border-red-200',
    '回復期': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    '維持期': 'bg-green-100 text-green-700 border-green-200'
  };

  return (
    <span className={`px-4 py-2 rounded-full font-medium border ${statusStyles[status]}`}>
      {status}
    </span>
  );
}