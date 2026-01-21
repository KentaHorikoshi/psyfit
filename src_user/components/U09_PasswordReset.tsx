import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './ui/Header';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { CheckCircle, Mail } from 'lucide-react';

type Step = 'email' | 'sent' | 'reset' | 'complete';

export default function PasswordReset() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('正しいメールアドレスを入力してください');
      return;
    }
    
    setError('');
    setStep('sent');
  };
  
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('すべての項目を入力してください');
      return;
    }
    
    if (password.length < 8) {
      setError('パスワード��8文字以上で入力してください');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    
    setError('');
    setStep('complete');
  };
  
  return (
    <div className="min-h-screen bg-white" style={{ maxWidth: '390px', margin: '0 auto' }}>
      <Header 
        title="パスワードリセット" 
        onBack={step === 'email' ? () => navigate('/login') : undefined}
        showBack={step === 'email'} 
      />
      
      <div className="px-6 py-6">
        {/* ステップ1: メールアドレス入力 */}
        {step === 'email' && (
          <div>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-[#EAF2FF] rounded-full flex items-center justify-center">
                <Mail size={32} className="text-[#1E66F5]" />
              </div>
            </div>
            
            <h2 className="text-center text-[#0B1220] mb-2">
              パスワードをリセット
            </h2>
            <p className="text-center text-[#334155] mb-8">
              登録されているメールアドレスにリセットリンクを送信します
            </p>
            
            <form onSubmit={handleSendEmail} className="space-y-4">
              <Input
                type="email"
                label="メールアドレス"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                error={error}
              />
              
              <Button type="submit" variant="primary" size="large" fullWidth>
                リセットリンクを送信
              </Button>
            </form>
          </div>
        )}
        
        {/* ステップ2: 送信完了 */}
        {step === 'sent' && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-[#16A34A]" />
              </div>
            </div>
            
            <h2 className="text-[#0B1220] mb-2">
              メールを送信しました
            </h2>
            <p className="text-[#334155] mb-2">
              {email} にパスワードリセット用のリンクを送信しました。
            </p>
            <p className="text-sm text-[#334155] mb-8">
              メールが届かない場合は、迷惑メールフォルダをご確認ください。
            </p>
            
            <div className="space-y-3">
              <Button 
                variant="primary" 
                fullWidth 
                onClick={() => setStep('reset')}
              >
                新しいパスワードを設定
              </Button>
              
              <Button 
                variant="text" 
                fullWidth 
                onClick={() => setStep('email')}
              >
                メールアドレスを変更
              </Button>
            </div>
          </div>
        )}
        
        {/* ステップ3: 新パスワード入力 */}
        {step === 'reset' && (
          <div>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-[#EAF2FF] rounded-full flex items-center justify-center">
                <Mail size={32} className="text-[#1E66F5]" />
              </div>
            </div>
            
            <h2 className="text-center text-[#0B1220] mb-2">
              新しいパスワードを設定
            </h2>
            <p className="text-center text-[#334155] mb-8">
              8文字以上で設定してください
            </p>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                type="password"
                label="新しいパスワード"
                placeholder="8文字以上"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
              />
              
              <Input
                type="password"
                label="新しいパスワード（確認）"
                placeholder="もう一度入力"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
              />
              
              {error && (
                <div className="bg-[#FEE2E2] border border-[#EF4444] text-[#EF4444] px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              <Button type="submit" variant="primary" size="large" fullWidth>
                パスワードを変更
              </Button>
            </form>
          </div>
        )}
        
        {/* ステップ4: 完了 */}
        {step === 'complete' && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-[#16A34A]" />
              </div>
            </div>
            
            <h2 className="text-[#0B1220] mb-2">
              パスワードを変更しました
            </h2>
            <p className="text-[#334155] mb-8">
              新しいパスワードでログインしてください
            </p>
            
            <Button 
              variant="primary" 
              size="large"
              fullWidth 
              onClick={() => navigate('/login')}
            >
              ログイン画面へ
            </Button>
          </div>
        )}
      </div>
      
      {/* 進捗インジケーター */}
      {(step === 'email' || step === 'sent' || step === 'reset') && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          <div className={`w-2 h-2 rounded-full transition-colors ${
            step === 'email' ? 'bg-[#1E66F5]' : 'bg-gray-300'
          }`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${
            step === 'sent' ? 'bg-[#1E66F5]' : 'bg-gray-300'
          }`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${
            step === 'reset' ? 'bg-[#1E66F5]' : 'bg-gray-300'
          }`} />
        </div>
      )}
    </div>
  );
}