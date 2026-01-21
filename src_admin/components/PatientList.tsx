import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Page } from '../App';

interface PatientListProps {
  onNavigate: (page: Page, patientId?: string) => void;
}

const patientsData = [
  {
    id: 'p1',
    name: '伊藤 正男',
    kana: 'イトウ マサオ',
    age: 78,
    gender: '男性',
    condition: '大腿骨頸部骨折術後',
    status: '回復期' as const,
    lastExercise: '2026-01-18',
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
    lastExercise: '2026-01-17',
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
    lastExercise: '2026-01-18',
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
    lastExercise: '2026-01-19',
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
    lastExercise: '2026-01-16',
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
    lastExercise: '2026-01-18',
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
    lastExercise: '2026-01-17',
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
    lastExercise: '2026-01-19',
    staff: '佐藤 花子',
    staffId: 'sato'
  }
];

export function PatientList({ onNavigate }: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');

  // Get unique staff members
  const staffMembers = Array.from(new Set(patientsData.map(p => p.staff)));

  const filteredPatients = patientsData.filter((patient) => {
    const matchesSearch =
      patient.name.includes(searchQuery) ||
      patient.kana.includes(searchQuery) ||
      patient.condition.includes(searchQuery);
    
    const matchesCondition = conditionFilter === 'all' || patient.condition === conditionFilter;
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    const matchesStaff = staffFilter === 'all' || patient.staff === staffFilter;

    return matchesSearch && matchesCondition && matchesStatus && matchesStaff;
  });

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">患者一覧</h1>
        <p className="text-gray-600">登録されている患者の情報を確認・検索できます</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="患者名、フリガナ、疾患名で検索..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
            />
          </div>

          {/* Condition Filter */}
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none bg-white"
          >
            <option value="all">すべての疾患</option>
            <option value="大腿骨頸部骨折術後">大腿骨頸部骨折術後</option>
            <option value="脊柱管狭窄症">脊柱管狭窄症</option>
            <option value="変形性膝関節症">変形性膝関節症</option>
            <option value="腰椎椎間板ヘルニア">腰椎椎間板ヘルニア</option>
            <option value="肩関節周囲炎">肩関節周囲炎</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none bg-white"
          >
            <option value="all">すべての状態</option>
            <option value="急性期">急性期</option>
            <option value="回復期">回復期</option>
            <option value="維持期">維持期</option>
          </select>

          {/* Staff Filter */}
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none bg-white"
          >
            <option value="all">すべての担当者</option>
            {staffMembers.map(staff => (
              <option key={staff} value={staff}>{staff}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">患者名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">年齢/性別</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">疾患</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">状態</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">最終運動日</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">担当</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => onNavigate('patient-detail', patient.id)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-500">{patient.kana}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {patient.age}歳 / {patient.gender}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{patient.condition}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={patient.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {new Date(patient.lastExercise).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{patient.staff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">該当する患者が見つかりませんでした</p>
          </div>
        )}
      </div>
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
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}>
      {status}
    </span>
  );
}