import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, ChevronDown, ChevronUp, LogIn, Home as HomeIcon, Dumbbell, ClipboardEdit, Heart, History, TrendingUp } from 'lucide-react'

interface GuideSection {
  id: string
  title: string
  icon: React.ReactNode
  steps: string[]
  note?: string
}

const guideSections: GuideSection[] = [
  {
    id: 'login',
    title: 'ログイン画面',
    icon: <LogIn size={20} className="text-[#1E40AF]" />,
    steps: [
      '管理者から通知された初期ID・パスワードでログインします。',
      'パスワード変更画面が自動的に表示されます。',
      '新しいパスワードを入力し「変更」をクリックしてください。',
      '変更完了後、新しいパスワードで再度ログインしてください。',
    ],
  },
  {
    id: 'home',
    title: 'ホーム画面',
    icon: <HomeIcon size={20} className="text-[#1E40AF]" />,
    steps: [
      '今日の運動一覧 — 運動実施画面へ',
      '「運動する」ボタン — 運動画面へ',
      '「記録する」ボタン — 運動記録画面へ',
      '「履歴を見る」ボタン — 運動履歴画面へ',
      '「体調を入力」ボタン — 体調入力画面へ',
      '「測定値を見る」ボタン — 測定値履歴画面へ',
    ],
  },
  {
    id: 'exercise',
    title: '運動画面',
    icon: <Dumbbell size={20} className="text-[#1E40AF]" />,
    steps: [
      'ホーム画面で「運動する」をタップします。',
      '青色の再生ボタンをタップします。',
      '運動動画画面に移動できます。',
    ],
  },
  {
    id: 'record',
    title: '運動記録',
    icon: <ClipboardEdit size={20} className="text-[#1E40AF]" />,
    steps: [
      'ホーム画面で「記録する」をタップします。',
      '実施した運動のチェックボックスにチェックを入れます。',
      '画面下部の記録するボタンを押すことで記録することができます。',
    ],
  },
  {
    id: 'condition',
    title: '体調入力',
    icon: <Heart size={20} className="text-[#1E40AF]" />,
    steps: [
      '痛みレベル（0〜10）— スライダーで今の痛みの程度を選びます。0：痛みなし / 10：最大の痛み',
      '体の調子（0〜10）— スライダーで今日の体調を選びます。0：とても悪い / 10：とても良い',
      'メモ（任意）— 気になったことを自由に入力できます。',
    ],
    note: '入力をスキップすることも可能です。',
  },
  {
    id: 'history',
    title: '運動履歴の確認',
    icon: <History size={20} className="text-[#1E40AF]" />,
    steps: [
      'ホーム画面で「履歴を見る」をタップします。',
      'カレンダー形式で運動を実施した日にマークが表示されます。',
      '日付をタップすると、その日に実施した運動の詳細を確認できます。',
    ],
    note: '1日に1回以上運動を記録すると「継続」とカウントされます。1日でも記録が途切れると継続日数は0日にリセットされます。',
  },
  {
    id: 'measurements',
    title: '測定値の推移確認',
    icon: <TrendingUp size={20} className="text-[#1E40AF]" />,
    steps: [
      'ホーム画面で「測定値を見る」をタップします。',
      '測定値履歴画面にグラフが表示されます。職員が入力した測定値（筋力・体重等）と、ご自身が入力した痛みレベルの推移を確認できます。',
      'グラフ上部のタブで表示項目を切り替えられます。',
    ],
  },
]

interface AccordionItemProps {
  section: GuideSection
  isOpen: boolean
  onToggle: () => void
}

function AccordionItem({ section, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] min-h-[56px]"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-3 shrink-0">
            {section.icon}
          </div>
          <span className="text-gray-900 font-medium text-left">{section.title}</span>
        </div>
        {isOpen
          ? <ChevronUp size={20} className="text-gray-400 shrink-0" />
          : <ChevronDown size={20} className="text-gray-400 shrink-0" />
        }
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 bg-gray-50">
          <ol className="space-y-3 pl-1">
            {section.steps.map((step, index) => (
              <li key={index} className="flex gap-3 text-gray-700 text-base leading-relaxed">
                <span className="w-6 h-6 bg-[#1E40AF] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {section.note && (
            <div className="mt-3 ml-1 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 leading-relaxed">
              {section.note}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function UserGuide() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()
  const [openSection, setOpenSection] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  const handleToggle = (sectionId: string) => {
    setOpenSection(prev => prev === sectionId ? null : sectionId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <div role="status" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
      <header className="bg-white px-4 pt-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF]"
            aria-label="戻る"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">使い方</h1>
        </div>
      </header>

      <main className="flex-1 bg-white mt-1">
        <div className="px-4 py-3">
          <p className="text-sm text-gray-500">各項目をタップして操作方法を確認できます</p>
        </div>
        {guideSections.map(section => (
          <AccordionItem
            key={section.id}
            section={section}
            isOpen={openSection === section.id}
            onToggle={() => handleToggle(section.id)}
          />
        ))}
      </main>
    </div>
  )
}

export default UserGuide
