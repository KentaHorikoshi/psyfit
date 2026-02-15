import { useState } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';

interface PasswordResetProps {
  onNavigateToLogin: () => void;
}

export function PasswordReset({ onNavigateToLogin }: PasswordResetProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Reset Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-8 h-8 text-[#1E40AF]" fill="#1E40AF" />
              <h1 className="text-xl font-bold text-gray-900">さとやま整形外科内科</h1>
            </div>
            <p className="text-gray-600 text-sm">リハビリ支援システム</p>
            <h2 className="text-[#1E40AF] font-semibold mt-3">パスワードリセット</h2>
          </div>

          {!submitted ? (
            <>
              <p className="text-gray-600 text-sm mb-6">
                登録されているメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
              </p>

              {/* Reset Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="例: yamada@satoyama-clinic.jp"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1E40AF] hover:bg-[#1E3A8A] text-white py-3 rounded-lg font-medium transition-colors shadow-md"
                >
                  リセット用リンクを送信
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">送信完了</h3>
              <p className="text-gray-600 text-sm mb-6">
                {email} にパスワードリセット用のリンクを送信しました。メールをご確認ください。
              </p>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="mt-6">
            <button
              onClick={onNavigateToLogin}
              className="w-full flex items-center justify-center gap-2 text-sm text-[#3B82F6] hover:text-[#1E40AF] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              ログイン画面に戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}