import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { api } from '../lib/api'
import type { PatientDetail as PatientDetailType, PatientStatus } from '../lib/api-types'

function StatusBadge({ status }: { status: PatientStatus }) {
  const statusStyles = {
    '急性期': 'bg-red-100 text-red-700 border-red-200',
    '回復期': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    '維持期': 'bg-green-100 text-green-700 border-green-200',
  }

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}

export function PatientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<PatientDetailType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatientDetail = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        setError(null)
        const response = await api.getPatientDetail(id)
        setPatient(response.data!)
      } catch (err: any) {
        if (err?.status === 403) {
          setError('この患者の情報にアクセスする権限がありません')
        } else {
          setError('患者情報の取得に失敗しました')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatientDetail()
  }, [id])

  const handleBack = () => {
    navigate('/patients')
  }

  const handleAddMeasurement = () => {
    navigate(`/patients/${id}/measurements/new`)
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div role="status" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="p-8">
        <button
          onClick={handleBack}
          className="mb-4 text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded p-2 min-h-[44px] min-w-[44px] flex items-center"
          aria-label="戻る"
        >
          <ArrowLeft size={24} className="mr-2" />
          戻る
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center" role="alert">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  const primaryStaff = patient.assigned_staff.find(s => s.is_primary)
  const otherStaff = patient.assigned_staff.filter(s => !s.is_primary)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="mb-4 text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded p-2 min-h-[44px] min-w-[44px] flex items-center"
          aria-label="戻る"
        >
          <ArrowLeft size={24} className="mr-2" />
          戻る
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">患者詳細</h1>
          <button
            onClick={handleAddMeasurement}
            className="flex items-center gap-2 bg-[#1E40AF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1E3A8A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[44px]"
            aria-label="測定値を入力"
          >
            <Plus size={20} />
            測定値を入力
          </button>
        </div>
      </div>

      {/* Patient Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>

            <div className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500 mb-1">氏名</dt>
                <dd className="text-base font-medium text-gray-900">{patient.name}</dd>
                <dd className="text-sm text-gray-500">{patient.name_kana}</dd>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500 mb-1">年齢</dt>
                  <dd className="text-base text-gray-900">{patient.age}歳</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 mb-1">性別</dt>
                  <dd className="text-base text-gray-900">{patient.gender}</dd>
                </div>
              </div>

              <div>
                <dt className="text-sm text-gray-500 mb-1">メールアドレス</dt>
                <dd className="text-base text-gray-900">{patient.email}</dd>
              </div>

              {patient.phone && (
                <div>
                  <dt className="text-sm text-gray-500 mb-1">電話番号</dt>
                  <dd className="text-base text-gray-900">{patient.phone}</dd>
                </div>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">医療情報</h2>

            <div className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500 mb-1">疾患・身体状態</dt>
                <dd className="text-base text-gray-900">{patient.condition}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500 mb-1">病期ステータス</dt>
                <dd className="mt-1">
                  <StatusBadge status={patient.status} />
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500 mb-1">継続日数</dt>
                <dd className="text-2xl font-bold text-[#10B981]">{patient.continue_days}日</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Staff Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">担当職員</h2>

        <div className="space-y-3">
          {primaryStaff && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{primaryStaff.name}</p>
                <p className="text-sm text-gray-600">主担当</p>
              </div>
            </div>
          )}

          {otherStaff.map(staff => (
            <div key={staff.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <p className="font-medium text-gray-900">{staff.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PatientDetail
