import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './ui/Header';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export default function ConditionInput() {
  const navigate = useNavigate();
  const [pain, setPain] = useState(5);
  const [body, setBody] = useState(5);
  const [comment, setComment] = useState('');
  
  const handleSave = () => {
    // 体調を保存（実際にはバックエンドに送信）
    const conditionData = {
      pain,
      body,
      comment,
      date: new Date().toISOString().split('T')[0]
    };
    console.log('体調記録:', conditionData);
    
    // ホーム画面に遷移
    navigate('/home');
  };
  
  const handleSkip = () => {
    // スキップしてホーム画面へ
    navigate('/home');
  };
  
  return (
    <div className="min-h-screen bg-white" style={{ maxWidth: '390px', margin: '0 auto' }}>
      <Header title="体調を記録" showBack={false} />
      
      <div className="px-6 py-6">
        <p className="text-[#334155] mb-6 text-center">
          今日の運動、お疲れさまでした！<br />
          体調を記録しましょう
        </p>
        
        <div className="space-y-6">
          {/* 痛みレベル */}
          <Card>
            <label className="block text-[#0B1220] mb-4">
              痛みのレベル
            </label>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="range"
                min="0"
                max="10"
                value={pain}
                onChange={(e) => setPain(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1E66F5]"
              />
              <span className="text-2xl text-[#0B1220] font-semibold w-12 text-center">{pain}</span>
            </div>
            <div className="flex justify-between text-sm text-[#334155]">
              <span>痛みなし</span>
              <span>激痛</span>
            </div>
          </Card>
          
          {/* 身体の変化 */}
          <Card>
            <label className="block text-[#0B1220] mb-4">
              身体の調子
            </label>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="range"
                min="0"
                max="10"
                value={body}
                onChange={(e) => setBody(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1E66F5]"
              />
              <span className="text-2xl text-[#0B1220] font-semibold w-12 text-center">{body}</span>
            </div>
            <div className="flex justify-between text-sm text-[#334155]">
              <span>悪い</span>
              <span>とても良い</span>
            </div>
          </Card>
          
          {/* メモ */}
          <Card>
            <label className="block text-[#0B1220] mb-3">
              メモ（任意）
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="今日の調子や気づいたことを記録しましょう"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[#0B1220] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1E66F5] transition-colors resize-none"
              rows={4}
            />
          </Card>
        </div>
        
        {/* ボタン */}
        <div className="mt-8 space-y-3">
          <Button variant="primary" size="large" fullWidth onClick={handleSave}>
            記録して完了
          </Button>
          <Button variant="secondary" size="large" fullWidth onClick={handleSkip}>
            スキップ
          </Button>
        </div>
      </div>
    </div>
  );
}
