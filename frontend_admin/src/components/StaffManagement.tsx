import { useState, useEffect } from 'react'
import { UserPlus, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import type { StaffMember } from '../lib/api-types'
import { CreateStaffDialog } from './CreateStaffDialog'
import { EditStaffDialog } from './EditStaffDialog'
import { DeleteStaffConfirmDialog } from './DeleteStaffConfirmDialog'

function RoleBadge({ role }: { role: 'manager' | 'staff' }) {
  const styles = {
    manager: 'bg-blue-100 text-blue-700 border-blue-200',
    staff: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const labels = {
    manager: 'マネージャー',
    staff: 'スタッフ',
  }

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${styles[role]}`}
    >
      {labels[role]}
    </span>
  )
}

export function StaffManagement() {
  const { staff: currentUser } = useAuth()
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null)

  const isManager = currentUser?.role === 'manager'

  useEffect(() => {
    if (isManager) {
      loadStaffList()
    } else {
      setIsLoading(false)
    }
  }, [isManager])

  const loadStaffList = async () => {
    try {
      setIsLoading(true)
      const response = await api.getStaffList()
      if (response.status === 'success' && response.data) {
        setStaffList(response.data.staff)
        setTotalCount(response.data.staff.length)
      }
    } catch (err) {
      console.error('Failed to load staff list:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isManager) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-yellow-800 mb-2">アクセス権限がありません</h1>
          <p className="text-yellow-700">この画面にアクセスするにはマネージャー権限が必要です。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">職員管理</h1>
          <p className="text-gray-600">全{totalCount}名の職員を管理できます</p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#1E40AF] text-white rounded-lg font-medium hover:bg-[#1E3A8A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[44px]"
          aria-label="新規職員登録"
        >
          <UserPlus className="w-5 h-5" />
          新規職員登録
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && staffList.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">職員が登録されていません</p>
        </div>
      )}

      {/* Staff Table */}
      {!isLoading && staffList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                  >
                    職員ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                  >
                    職員名
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                  >
                    メールアドレス
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                  >
                    権限
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                  >
                    部署
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staffList.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900">{member.staff_id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.name_kana}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{member.email}</td>
                    <td className="px-6 py-4">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-6 py-4 text-gray-900">{member.department}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditTarget(member)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2"
                          aria-label={`${member.name}を編集`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {member.id !== currentUser?.id && (
                          <button
                            onClick={() => setDeleteTarget(member)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                            aria-label={`${member.name}を削除`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Staff Dialog */}
      <CreateStaffDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={loadStaffList}
      />

      {/* Edit Staff Dialog */}
      <EditStaffDialog
        isOpen={editTarget !== null}
        staff={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={loadStaffList}
      />

      {/* Delete Staff Confirm Dialog */}
      <DeleteStaffConfirmDialog
        isOpen={deleteTarget !== null}
        staff={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={loadStaffList}
      />
    </div>
  )
}

export default StaffManagement
