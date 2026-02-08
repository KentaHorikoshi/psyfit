import { UserCheck, Calendar, Activity, Users, ArrowRight, ClipboardList, Dumbbell } from 'lucide-react'
import type { Staff, Patient, DashboardStats, PatientStatus } from '../lib/api-types'

interface DashboardProps {
  staff: Staff
  patients: Patient[]
  stats: DashboardStats
  onNavigate: (path: string) => void
}

interface KPICardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: 'blue' | 'green' | 'purple' | 'orange'
}

function KPICard({ icon, label, value, color }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div
        className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}
      >
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: PatientStatus }) {
  const statusStyles = {
    '急性期': 'bg-red-100 text-red-700 border-red-200',
    '回復期': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    '維持期': 'bg-green-100 text-green-700 border-green-200',
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}

export function Dashboard({ staff, patients, stats, onNavigate }: DashboardProps) {
  const handlePatientClick = (patientId: string) => {
    onNavigate(`/patients/${patientId}`)
  }

  const handleMeasurementClick = (patientId: string) => {
    onNavigate(`/patients/${patientId}/measurements/new`)
  }

  const handleExerciseMenuClick = (patientId: string) => {
    onNavigate(`/patients/${patientId}/exercise-menu`)
  }

  const handleViewAllPatients = () => {
    onNavigate('/patients')
  }

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
          value={stats.my_patients_count}
          color="blue"
        />
        <KPICard
          icon={<Calendar className="w-6 h-6" />}
          label="本日の来院予定"
          value={stats.today_appointments_count}
          color="green"
        />
        <KPICard
          icon={<Activity className="w-6 h-6" />}
          label="今週の運動実施"
          value={stats.weekly_exercises_count}
          color="purple"
        />
        <KPICard
          icon={<Users className="w-6 h-6" />}
          label="全患者数"
          value={stats.total_patients_count}
          color="orange"
        />
      </div>

      {/* My Patients Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">本日の担当患者</h2>
          <p className="text-sm text-gray-600 mt-1">
            {staff.name}さんが担当している患者一覧
          </p>
        </div>

        <div className="p-6">
          {patients.length > 0 ? (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handlePatientClick(patient.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePatientClick(patient.id)}
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

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMeasurementClick(patient.id)
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#3B82F6] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors min-h-[44px]"
                      aria-label={`${patient.name}の測定値入力`}
                    >
                      <ClipboardList className="w-4 h-4" />
                      測定値入力
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExerciseMenuClick(patient.id)
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#3B82F6] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors min-h-[44px]"
                      aria-label={`${patient.name}のメニュー設定`}
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

      {/* View All Link */}
      <button
        onClick={handleViewAllPatients}
        className="w-full flex items-center justify-center gap-2 py-3 text-[#3B82F6] hover:text-[#1E40AF] font-medium transition-colors min-h-[44px]"
      >
        患者一覧を見る
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export default Dashboard
