import { useState } from 'react'
import { Activity, Ruler, Dumbbell } from 'lucide-react'
import { PatientConditionChart } from './PatientConditionChart'
import { PatientMeasurementsTab } from './PatientMeasurementsTab'
import { PatientExerciseRecordsTab } from './PatientExerciseRecordsTab'

interface PatientDataTabsProps {
  patientId: string
}

type TabKey = 'conditions' | 'measurements' | 'exercises'

interface TabDef {
  key: TabKey
  label: string
  icon: typeof Activity
}

const tabs: TabDef[] = [
  { key: 'conditions', label: '体調記録', icon: Activity },
  { key: 'measurements', label: '測定値', icon: Ruler },
  { key: 'exercises', label: '運動記録', icon: Dumbbell },
]

export function PatientDataTabs({ patientId }: PatientDataTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('conditions')

  return (
    <section className="bg-white rounded-xl shadow-sm" aria-label="患者データ">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200" role="tablist" aria-label="データタブ">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-base font-medium border-b-2 transition-colors min-h-[44px] ${
                  isActive
                    ? 'border-[#1E40AF] text-[#1E40AF]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="p-6">
        <div
          role="tabpanel"
          id="tabpanel-conditions"
          aria-labelledby="tab-conditions"
          hidden={activeTab !== 'conditions'}
        >
          {activeTab === 'conditions' && (
            <PatientConditionChart patientId={patientId} />
          )}
        </div>

        <div
          role="tabpanel"
          id="tabpanel-measurements"
          aria-labelledby="tab-measurements"
          hidden={activeTab !== 'measurements'}
        >
          {activeTab === 'measurements' && (
            <PatientMeasurementsTab patientId={patientId} />
          )}
        </div>

        <div
          role="tabpanel"
          id="tabpanel-exercises"
          aria-labelledby="tab-exercises"
          hidden={activeTab !== 'exercises'}
        >
          {activeTab === 'exercises' && (
            <PatientExerciseRecordsTab patientId={patientId} />
          )}
        </div>
      </div>
    </section>
  )
}
