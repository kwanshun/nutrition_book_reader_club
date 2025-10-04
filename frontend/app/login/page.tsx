'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const { signIn, resendConfirmation } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await signIn(email, password);
    
    if (error) {
      console.error('Login error details:', error);
      
      // Handle specific login errors
      if (error.message.includes('Invalid login credentials')) {
        setError('電子郵件或密碼錯誤');
      } else if (error.message.includes('Email not confirmed')) {
        setError('請先確認您的電子郵件地址');
      } else if (error.message.includes('Too many requests')) {
        setError('登入嘗試過於頻繁，請稍後再試');
      } else {
        setError(`登入失敗: ${error.message}`);
      }
    } else if (data?.user) {
      // Login successful
      router.push('/');
    } else {
      setError('登入失敗，請重試');
    }
    
    setLoading(false);
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setResendMessage('請先輸入電子郵件地址');
      return;
    }

    setResendLoading(true);
    setResendMessage('');

    const { error } = await resendConfirmation(email);
    
    if (error) {
      setResendMessage(`發送失敗: ${error.message}`);
    } else {
      setResendMessage('確認郵件已重新發送，請檢查您的郵箱');
    }
    
    setResendLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">歡迎回來</h1>
          <p className="text-gray-600">登入您的帳戶</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                電子郵件
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="請輸入電子郵件"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密碼
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="請輸入密碼"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
                {error.includes('確認您的電子郵件地址') && (
                  <button
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                    className="block mt-2 text-blue-600 hover:text-blue-500 underline text-sm disabled:opacity-50"
                  >
                    {resendLoading ? '發送中...' : '重新發送確認郵件'}
                  </button>
                )}
              </div>
            )}

            {resendMessage && (
              <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md">
                {resendMessage}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '登入中...' : '登入'}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                還沒有帳號？立即註冊
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
