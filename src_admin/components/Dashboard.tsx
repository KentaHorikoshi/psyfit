import { Users, Calendar, Activity, UserCheck, ArrowRight, ClipboardList, Dumbbell } from 'lucide-react';
import type { Page, User } from '../App';

interface DashboardProps {
  currentUser: User;
  onNavigate: (page: Page, patientId?: string) => void;
}

// 全患者データ
const allPatientsData = [
  {
    id: 'p1',
    name: '伊藤 正男',
    kana: 'イトウ マサオ',
    age: 78,
    gender: '男性',
    condition: '大腿骨頸部骨折術後',
    status: '回復期' as const,
    staff: '山田 太郎',
    staffId: 'yamada'
  },
  {
    id: 'p2',
    name: '加藤 武',
    kana: 'カトウ タケシ',
    age: 72,
    gender: '男性',
    condition: '脊柱管狭窄症',
    status: '維持期' as const,
    staff: '山田 太郎',
    staffId: 'yamada'
  },
  {
    id: 'p3',
    name: '田中 花子',
    kana: 'タナカ ハナコ',
    age: 65,
    gender: '女性',
    condition: '変形性膝関節症',
    status: '回復期' as const,
    staff: '佐藤 花子',
    staffId: 'sato'
  },
  {
    id: 'p4',
    name: '佐藤 健二',
    kana: 'サトウ ケンジ',
    age: 58,
    gender: '男性',
    condition: '腰椎椎間板ヘルニア',
    status: '急性期' as const,
    staff: '山田 太郎',
    staffId: 'yamada'
  },
  {
    id: 'p5',
    name: '鈴木 美咲',
    kana: 'スズキ ミサキ',
    age: 54,
    gender: '女性',
    condition: '肩関節周囲炎',
    status: '回復期' as const,
    staff: '佐藤 花子',
    staffId: 'sato'
  },
  {
    id: 'p6',
    name: '山本 一郎',
    kana: 'ヤマモト イチロウ',
    age: 70,
    gender: '男性',
    condition: '脊柱管狭窄症',
    status: '維持期' as const,
    staff: '田中 次郎',
    staffId: 'tanaka'
  },
  {
    id: 'p7',
    name: '渡辺 愛子',
    kana: 'ワタナベ アイコ',
    age: 68,
    gender: '女性',
    condition: '変形性股関節症',
    status: '回復期' as const,
    staff: '田中 次郎',
    staffId: 'tanaka'
  },
  {
    id: 'p8',
    name: '高橋 誠',
    kana: 'タカハシ マコト',
    age: 62,
    gender: '男性',
    condition: '腰部脊柱管狭窄症',
    status: '維持期' as const,
    staff: '佐藤 花子',
    staffId: 'sato'
  }
];

const todayPatients = [
  {
    id: 'p1',
    name: '加藤 武',
    kana: 'カトウ タケシ',
    condition: '脊柱管狭窄症',
    status: '維持期' as const,
    age: 72,
    gender: '男性' as const
  },
  {
    id: 'p2',
    name: '田中 花子',
    kana: 'タナカ ハナコ',
    condition: '変形性膝関節症',
    status: '回復期' as const,
    age: 65,
    gender: '女性' as const
  },
  {
    id: 'p3',
    name: '佐藤 健二',
    kana: 'サトウ ケンジ',
    condition: '腰椎椎間板ヘルニア',
    status: '急性期' as const,
    age: 58,
    gender: '男性' as const
  },
  {
    id: 'p4',
    name: '鈴木 美咲',
    kana: 'スズキ ミサキ',
    condition: '肩関節周囲炎',
    status: '回復期' as const,
    age: 54,
    gender: '女性' as const
  },
  {
    id: 'p5',
    name: '山本 一郎',
    kana: 'ヤマモト イチロウ',
    condition: '脊柱管狭窄症',
    status: '維持期' as const,
    age: 70,
    gender: '男性' as const
  }
];

export function Dashboard({ currentUser, onNavigate }: DashboardProps) {
  // 現在のユーザーの担当患者をフィルタリング
  const myPatients = allPatientsData.filter(patient => patient.staffId === currentUser.id);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">ダッシュボード</h1>
        <p className="text-gray-600">システム全体の概要を確認できます</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          icon={<UserCheck className="w-6 h-6" />}
          label="担当患者数"
          value={myPatients.length.toString()}
          color="blue"
        />
        <KPICard
          icon={<Calendar className="w-6 h-6" />}
          label="本日の来院予定"
          value="5"
          color="green"
        />
        <KPICard
          icon={<Activity className="w-6 h-6" />}
          label="今週の運動実施"
          value="32"
          color="purple"
        />
        <KPICard
          icon={<Users className="w-6 h-6" />}
          label="全患者数"
          value="8"
          color="orange"
        />
      </div>

      {/* My Patients Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            本日の担当患者
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {currentUser.name}さんが担当している患者一覧
          </p>
        </div>

        <div className="p-6">
          {myPatients.length > 0 ? (
            <div className="space-y-4">
              {myPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#3B82F6] hover:shadow-md transition-all"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {patient.name.charAt(0)}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {patient.name}
                      <span className="text-sm text-gray-500 ml-2 font-normal">
                        ({patient.age}歳 / {patient.gender})
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600">{patient.condition}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('measurement', patient.id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#3B82F6] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      title="測定値入力"
                    >
                      <ClipboardList className="w-4 h-4" />
                      測定値入力
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('exercise-menu', patient.id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#3B82F6] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      title="メニュー設定"
                    >
                      <Dumbbell className="w-4 h-4" />
                      メニュー設定
                    </button>
                  </div>

                  {/* Status Badge */}
                  <StatusBadge status={patient.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">担当患者がいません</p>
          )}
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            本日の来院予定 (2026年1月19日)
          </h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {todayPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => onNavigate('patient-detail', patient.id)}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#3B82F6] hover:shadow-md transition-all cursor-pointer"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {patient.name.charAt(0)}
                </div>

                {/* Patient Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {patient.name}
                    <span className="text-sm text-gray-500 ml-2 font-normal">
                      ({patient.age}歳 / {patient.gender})
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600">{patient.condition}</p>
                </div>

                {/* Status Badge */}
                <StatusBadge status={patient.status} />
              </div>
            ))}
          </div>

          {/* View All Link */}
          <button
            onClick={() => onNavigate('patients')}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 text-[#3B82F6] hover:text-[#1E40AF] font-medium transition-colors"
          >
            患者一覧を見る
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function KPICard({ icon, label, value, color }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: '急性期' | '回復期' | '維持期' }) {
  const statusStyles = {
    '急性期': 'bg-red-100 text-red-700 border-red-200',
    '回復期': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    '維持期': 'bg-green-100 text-green-700 border-green-200'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}>
      {status}
    </span>
  );
}