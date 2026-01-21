import { useState } from 'react';
import { ArrowLeft, Download, FileText, Table } from 'lucide-react';
import type { Page } from '../App';

interface ReportGenerationProps {
  onNavigate: (page: Page, patientId?: string) => void;
  patientId?: string;
}

export function ReportGeneration({ onNavigate, patientId }: ReportGenerationProps) {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-19');
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [includeNotes, setIncludeNotes] = useState(true);

  const handleGenerate = () => {
    console.log('Generating report:', { startDate, endDate, format, includeNotes });
    alert(`${format.toUpperCase()}形式でレポートをダウンロードします${includeNotes ? '（備考欄を含む）' : '（備考欄を除く）'}`);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => patientId ? onNavigate('patient-detail', patientId) : onNavigate('dashboard')}
          className="flex items-center gap-2 text-[#3B82F6] hover:text-[#1E40AF] mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          {patientId ? '患者詳細に戻る' : 'ダッシュボードに戻る'}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">レポート生成・出力</h1>
        <p className="text-gray-600">期間を指定して患者データのレポートを出力できます</p>
      </div>

      {/* Main Card */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Date Range Selection */}
          <div className="mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">期間を選択</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始日
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  終了日
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">出力形式を選択</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  format === 'pdf'
                    ? 'border-[#3B82F6] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      format === 'pdf' ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">PDF</p>
                    <p className="text-sm text-gray-600 mt-1">詳細な分析レポート</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  format === 'csv'
                    ? 'border-[#3B82F6] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      format === 'csv' ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Table className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">CSV</p>
                    <p className="text-sm text-gray-600 mt-1">データ分析用</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Include Notes Checkbox */}
          <div className="mb-8">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="form-checkbox h-5 w-5 text-[#3B82F6] border-gray-300 rounded focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none"
              />
              <span className="ml-2 text-sm text-gray-700">備考欄を含む</span>
            </label>
          </div>

          {/* Report Preview Info */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">レポート内容</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>患者基本情報（氏名、年齢、性別、疾患名）</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>指定期間内の運動実施履歴</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>各種測定値（体重、筋力、TUG、片脚立位など）</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>痛みスコア（NRS）と筋力評価（MMT）の推移</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>統計データと改善率</span>
              </li>
            </ul>
          </div>

          {/* Download Button */}
          <button
            onClick={handleGenerate}
            className="w-full bg-[#1E40AF] hover:bg-[#1E3A8A] text-white py-4 px-6 rounded-lg font-medium transition-colors shadow-md flex items-center justify-center gap-3 text-lg"
          >
            <Download className="w-6 h-6" />
            レポートをダウンロード ({format.toUpperCase()})
          </button>

          {/* Additional Info */}
          <p className="text-sm text-gray-500 text-center mt-4">
            期間: {new Date(startDate).toLocaleDateString('ja-JP')} 〜{' '}
            {new Date(endDate).toLocaleDateString('ja-JP')}
          </p>
        </div>

        {/* Quick Period Buttons */}
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => {
              const today = new Date();
              const weekAgo = new Date(today);
              weekAgo.setDate(today.getDate() - 7);
              setStartDate(weekAgo.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
            }}
            className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            過去1週間
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const monthAgo = new Date(today);
              monthAgo.setMonth(today.getMonth() - 1);
              setStartDate(monthAgo.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
            }}
            className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            過去1ヶ月
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const threeMonthsAgo = new Date(today);
              threeMonthsAgo.setMonth(today.getMonth() - 3);
              setStartDate(threeMonthsAgo.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
            }}
            className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            過去3ヶ月
          </button>
        </div>
      </div>
    </div>
  );
}