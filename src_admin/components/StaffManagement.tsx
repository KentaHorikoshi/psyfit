import { useState } from 'react';
import { UserPlus, Edit, Users, UserCog, CheckCircle } from 'lucide-react';

const staffData = [
  {
    id: 's1',
    name: '山田 太郎',
    email: 'yamada@satoyama-clinic.jp',
    department: 'リハビリテーション科',
    role: 'マネージャー' as const,
    registeredDate: '2024-01-15',
    assignedPatients: ['伊藤 正男', '加藤 武', '佐藤 健二']
  },
  {
    id: 's2',
    name: '佐藤 美香',
    email: 'sato@satoyama-clinic.jp',
    department: 'リハビリテーション科',
    role: '一般職員' as const,
    registeredDate: '2024-03-10',
    assignedPatients: ['田中 花子', '鈴木 美咲', '高橋 誠']
  },
  {
    id: 's3',
    name: '田中 健太',
    email: 'tanaka@satoyama-clinic.jp',
    department: 'リハビリテーション科',
    role: '一般職員' as const,
    registeredDate: '2024-05-22',
    assignedPatients: ['山本 一郎', '渡辺 愛子']
  },
  {
    id: 's4',
    name: '鈴木 花子',
    email: 'suzuki@satoyama-clinic.jp',
    department: 'リハビリテーション科',
    role: '一般職員' as const,
    registeredDate: '2024-07-08',
    assignedPatients: []
  }
];

const allPatients = [
  '伊藤 正男',
  '加藤 武',
  '佐藤 健二',
  '田中 花子',
  '鈴木 美咲',
  '高橋 誠',
  '山本 一郎',
  '渡辺 愛子'
];

type ModalMode = 'add' | 'edit' | 'addConfirm' | 'editConfirm' | null;

export function StaffManagement() {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingStaff, setEditingStaff] = useState<typeof staffData[0] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'リハビリテーション科',
    role: '一般職員' as '一般職員' | 'マネージャー',
    password: '',
    assignedPatients: [] as string[]
  });

  const managerCount = staffData.filter((s) => s.role === 'マネージャー').length;
  const staffCount = staffData.filter((s) => s.role === '一般職員').length;

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      department: 'リハビリテーション科',
      role: '一般職員',
      password: '',
      assignedPatients: []
    });
    setModalMode('add');
  };

  const openEditModal = (staff: typeof staffData[0]) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      department: staff.department,
      role: staff.role,
      password: '',
      assignedPatients: staff.assignedPatients
    });
    setModalMode('edit');
  };

  const togglePatientAssignment = (patientName: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedPatients: prev.assignedPatients.includes(patientName)
        ? prev.assignedPatients.filter((p) => p !== patientName)
        : [...prev.assignedPatients, patientName]
    }));
  };

  const handleAddSubmit = () => {
    setModalMode('addConfirm');
  };

  const handleEditSubmit = () => {
    setModalMode('editConfirm');
  };

  const confirmAdd = () => {
    alert('新規職員を追加しました');
    setModalMode(null);
  };

  const confirmEdit = () => {
    alert('職員情報を更新しました');
    setModalMode(null);
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">職員管理</h1>
        <p className="text-gray-600">職員の情報を管理できます（マネージャー権限）</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          icon={<Users className="w-6 h-6" />}
          label="総職員数"
          value={staffData.length.toString()}
          color="blue"
        />
        <SummaryCard
          icon={<UserCog className="w-6 h-6" />}
          label="マネージャー"
          value={managerCount.toString()}
          color="purple"
        />
        <SummaryCard
          icon={<Users className="w-6 h-6" />}
          label="一般職員"
          value={staffCount.toString()}
          color="green"
        />
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Table Header with Add Button */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">職員一覧</h2>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
          >
            <UserPlus className="w-5 h-5" />
            新規職員を追加
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">職員名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">メールアドレス</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">所属部署</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">役職</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">登録日</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staffData.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {staff.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{staff.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{staff.email}</td>
                  <td className="px-6 py-4 text-gray-700">{staff.department}</td>
                  <td className="px-6 py-4">
                    <RoleBadge role={staff.role} />
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {new Date(staff.registeredDate).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openEditModal(staff)}
                      className="flex items-center gap-1 text-[#3B82F6] hover:text-[#1E40AF] font-medium text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      編集
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {modalMode === 'add' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">新規職員を追加</h2>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      氏名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="山田 次郎"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="yamada.jiro@satoyama-clinic.jp"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      所属部署 <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none bg-white"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option>リハビリテーション科</option>
                      <option>整形外科</option>
                      <option>内科</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      役職 <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none bg-white"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as '一般職員' | 'マネージャー' })}
                    >
                      <option>一般職員</option>
                      <option>マネージャー</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    初期パスワード <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="8文字以上"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    担当患者
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allPatients.map((patient) => (
                      <div key={patient} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={formData.assignedPatients.includes(patient)}
                          onChange={() => togglePatientAssignment(patient)}
                        />
                        <span className="text-gray-700">{patient}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setModalMode(null)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddSubmit}
                className="flex-1 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
              >
                追加する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Confirm Modal */}
      {modalMode === 'addConfirm' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">確認</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700">以下の職員情報を追加しますか？</p>
              <div className="mt-4">
                <p className="text-gray-700 font-medium">氏名: {formData.name}</p>
                <p className="text-gray-700 font-medium">メールアドレス: {formData.email}</p>
                <p className="text-gray-700 font-medium">所属部署: {formData.department}</p>
                <p className="text-gray-700 font-medium">役職: {formData.role}</p>
                <p className="text-gray-700 font-medium">担当患者: {formData.assignedPatients.join(', ')}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setModalMode(null)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={confirmAdd}
                className="flex-1 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {modalMode === 'edit' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">職員情報を編集</h2>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      氏名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="山田 次郎"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="yamada.jiro@satoyama-clinic.jp"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      所属部署 <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none bg-white"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option>リハビリテーション科</option>
                      <option>整形外科</option>
                      <option>内科</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      役職 <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none bg-white"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as '一般職員' | 'マネージャー' })}
                    >
                      <option>一般職員</option>
                      <option>マネージャー</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    初期パスワード <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="8文字以上"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    担当患者
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allPatients.map((patient) => (
                      <div key={patient} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={formData.assignedPatients.includes(patient)}
                          onChange={() => togglePatientAssignment(patient)}
                        />
                        <span className="text-gray-700">{patient}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setModalMode(null)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleEditSubmit}
                className="flex-1 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
              >
                更新する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Confirm Modal */}
      {modalMode === 'editConfirm' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">確認</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700">以下の職員情報を更新しますか？</p>
              <div className="mt-4">
                <p className="text-gray-700 font-medium">氏名: {formData.name}</p>
                <p className="text-gray-700 font-medium">メールアドレス: {formData.email}</p>
                <p className="text-gray-700 font-medium">所属部署: {formData.department}</p>
                <p className="text-gray-700 font-medium">役職: {formData.role}</p>
                <p className="text-gray-700 font-medium">担当患者: {formData.assignedPatients.join(', ')}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setModalMode(null)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={confirmEdit}
                className="flex-1 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Summary Card Component
interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'purple' | 'green';
}

function SummaryCard({ icon, label, value, color }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600'
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

// Role Badge Component
function RoleBadge({ role }: { role: 'マネージャー' | '一般職員' }) {
  const roleStyles = {
    'マネージャー': 'bg-blue-100 text-blue-700 border-blue-200',
    '一般職員': 'bg-gray-100 text-gray-700 border-gray-200'
  };

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${roleStyles[role]}`}>
      {role}
    </span>
  );
}