import { useState } from 'react';
import { Heart } from 'lucide-react';

interface LoginProps {
  onLogin: (userId: string) => void;
  onNavigateToReset: () => void;
}

export function Login({ onLogin, onNavigateToReset }: LoginProps) {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (staffId && password) {
      onLogin(staffId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-8 h-8 text-[#1E40AF]" fill="#1E40AF" />
              <h1 className="text-xl font-bold text-gray-900">サイテック病院</h1>
            </div>
            <p className="text-gray-600 text-sm">リハビリ支援システム</p>
            <h2 className="text-[#1E40AF] font-semibold mt-3">職員ログイン</h2>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-2">
                職員ID
              </label>
              <input
                type="text"
                id="staffId"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="例: yamada"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                テスト用ID: yamada (マネージャー) / sato, tanaka (一般職員)
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#1E40AF] hover:bg-[#1E3A8A] text-white py-3 rounded-lg font-medium transition-colors shadow-md"
            >
              ログイン
            </button>
          </form>

          {/* Password Reset Link */}
          <div className="mt-6 text-center">
            <button
              onClick={onNavigateToReset}
              className="text-sm text-[#3B82F6] hover:text-[#1E40AF] hover:underline"
            >
              パスワードをお忘れの方はこちら
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2026 サイテック病院. All rights reserved.
        </p>
      </div>
    </div>
  );
}