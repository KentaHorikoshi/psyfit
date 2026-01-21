import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './ui/Header';
import { Footer } from './ui/Footer';
import { Card } from './ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MeasurementData {
  date: string;
  value: number;
}

const mockData: Record<string, MeasurementData[]> = {
  '体重': [
    { date: '12/18', value: 68.5 },
    { date: '12/25', value: 68.2 },
    { date: '1/1', value: 68.0 },
    { date: '1/8', value: 67.8 },
    { date: '1/15', value: 67.5 },
  ],
  '体脂肪率': [
    { date: '12/18', value: 22.5 },
    { date: '12/25', value: 22.3 },
    { date: '1/1', value: 22.0 },
    { date: '1/8', value: 21.8 },
    { date: '1/15', value: 21.5 },
  ],
  '筋肉量': [
    { date: '12/18', value: 52.0 },
    { date: '12/25', value: 52.2 },
    { date: '1/1', value: 52.5 },
    { date: '1/8', value: 52.8 },
    { date: '1/15', value: 53.0 },
  ],
  '痛み(NRS)': [
    { date: '12/18', value: 6 },
    { date: '12/25', value: 5 },
    { date: '1/1', value: 4 },
    { date: '1/8', value: 4 },
    { date: '1/15', value: 3 },
  ],
};

const measurements = [
  { key: '体重', unit: 'kg', color: '#1E66F5' },
  { key: '体脂肪率', unit: '%', color: '#EF4444' },
  { key: '筋肉量', unit: 'kg', color: '#16A34A' },
  { key: '痛み(NRS)', unit: '点', color: '#F59E0B' },
];

export default function Measurements() {
  const navigate = useNavigate();
  const [selectedMeasurement, setSelectedMeasurement] = useState('体重');
  const [period, setPeriod] = useState('3ヶ月');
  
  const currentMeasurement = measurements.find(m => m.key === selectedMeasurement)!;
  const data = mockData[selectedMeasurement] || [];
  const latestValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || 0;
  const change = latestValue - previousValue;
  const changePercent = previousValue !== 0 ? ((change / previousValue) * 100).toFixed(1) : '0';
  
  return (
    <div className="min-h-screen bg-white pb-24" style={{ maxWidth: '390px', margin: '0 auto' }}>
      <Header title="測定値履歴" showBack={false} />
      
      <div className="px-6 py-4">
        {/* 測定項目選択 */}
        <div className="mb-6">
          <label className="block text-[#334155] mb-3">測定項目</label>
          <div className="flex flex-wrap gap-3">
            {measurements.map(m => (
              <button
                key={m.key}
                onClick={() => setSelectedMeasurement(m.key)}
                className={`px-6 py-3 rounded-xl text-base transition-colors ${
                  selectedMeasurement === m.key
                    ? 'bg-[#1E66F5] text-white'
                    : 'bg-gray-100 text-[#334155] hover:bg-gray-200'
                }`}
              >
                {m.key}
              </button>
            ))}
          </div>
        </div>
        
        {/* 最新値カード */}
        <Card className="mb-6 bg-gradient-to-br from-[#1E66F5] to-[#1557D8] text-white border-none">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 mb-1">最新値</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">{latestValue}</span>
                <span className="text-xl ml-2">{currentMeasurement.unit}</span>
              </div>
              <div className="flex items-center mt-3">
                {change !== 0 && (
                  <>
                    {change > 0 ? (
                      <TrendingUp size={16} className="mr-1" />
                    ) : (
                      <TrendingDown size={16} className="mr-1" />
                    )}
                    <span className="text-sm">
                      前回比 {change > 0 ? '+' : ''}{change.toFixed(1)}{currentMeasurement.unit}
                      {' '}({change > 0 ? '+' : ''}{changePercent}%)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
        
        {/* 期間選択 */}
        <div className="flex gap-2 mb-6">
          {['1ヶ月', '3ヶ月', '6ヶ月'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-xl text-sm transition-colors ${
                period === p
                  ? 'bg-[#1E66F5] text-white'
                  : 'bg-gray-100 text-[#334155] hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        
        {/* グラフ */}
        <Card className="mb-6">
          <h3 className="text-[#0B1220] mb-4">{selectedMeasurement}の推移</h3>
          <ResponsiveContainer width="100%" height={256}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="date" 
                stroke="#94A3B8"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#94A3B8"
                style={{ fontSize: '12px' }}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                formatter={(value: number) => [`${value}${currentMeasurement.unit}`, selectedMeasurement]}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={currentMeasurement.color}
                strokeWidth={3}
                dot={{ fill: currentMeasurement.color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        
        {/* データリスト */}
        <div>
          <h3 className="text-[#0B1220] mb-3">記録一覧</h3>
          <div className="space-y-2">
            {[...data].reverse().map((record, index) => (
              <Card key={index} className="flex items-center justify-between">
                <span className="text-[#334155]">{record.date}</span>
                <span className="text-[#0B1220] font-semibold">
                  {record.value}{currentMeasurement.unit}
                </span>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}