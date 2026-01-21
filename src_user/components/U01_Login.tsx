import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Eye, EyeOff, Heart } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    // 簡易認証（本番環境では適切な認証を実装）
    if (email === 'demo@example.com' && password === 'demo') {
      // セッションストレージをクリアして最初からのフローを体験できるようにする
      sessionStorage.removeItem('completedExercises');
      navigate('/welcome');
    } else {
      setError('メールアドレスまたはパスワードが正しくありません');
    }
  };
  
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* ロゴエリア */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-[#1E66F5] rounded-3xl flex items-center justify-center mb-6">
          <Heart size={40} className="text-white" fill="white" />
        </div>
        
        <h1 className="text-2xl text-[#0B1220] mb-2">サイテック フィットネス</h1>
        <p className="text-[#334155] mb-12 font-bold text-[15px]">毎日の運動をサポート</p>
        
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <Input
            type="email"
            label="メールアドレス"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            error={error && !email ? 'メールアドレスを入力してください' : ''}
          />
          
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="パスワード"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              error={error && !password ? 'パスワードを入力してください' : ''}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[42px] p-2 text-[#334155] hover:text-[#0B1220]"
              aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {error && (
            <div className="bg-[#FEE2E2] border border-[#EF4444] text-[#EF4444] px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          
          <Button type="submit" variant="primary" size="large" fullWidth>
            ログイン
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/password-reset')}
              className="text-[#1E66F5] hover:underline text-base"
            >
              パスワードをお忘れですか？
            </button>
          </div>
        </form>
      </div>
      
      {/* ヒント（デモ用） */}
      <div className="px-6 pb-8">
        <div className="bg-[#EAF2FF] p-4 rounded-xl">
          <p className="text-sm text-[#334155] text-center">
            <strong>デモ用:</strong> demo@example.com / demo
          </p>
        </div>
      </div>
    </div>
  );
}