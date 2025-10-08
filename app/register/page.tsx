'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('TEST001'); // Default for testing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('密碼確認不一致');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('密碼至少需要6個字符');
      setLoading(false);
      return;
    }

    const { data, error } = await signUp(email, password);
    
    if (error) {
      console.error('Registration error details:', error);
      
      // Handle specific Supabase errors
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        setError('此電子郵件已經註冊過了');
      } else if (error.message.includes('Invalid email') || error.message.includes('invalid')) {
        setError('請使用有效的電子郵件地址，建議使用 Gmail、Yahoo 或其他常用郵箱');
      } else if (error.message.includes('Password')) {
        setError('密碼不符合要求');
      } else {
        setError(`註冊失敗: ${error.message}`);
      }
    } else {
      // Success - check if user was created
      if (data?.user) {
        // Try to join group with invite code
        if (inviteCode.trim()) {
          try {
            const joinResponse = await fetch('/api/groups/join', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                invite_code: inviteCode.trim(),
                user_id: data.user.id 
              }),
            });
            
            if (joinResponse.ok) {
              console.log('✅ Successfully joined group with invite code:', inviteCode);
            } else {
              const errorData = await joinResponse.json();
              console.warn('Failed to join group with invite code:', inviteCode, errorData);
              // Don't show error to user - they can join later
            }
          } catch (joinError) {
            console.warn('Error joining group:', joinError);
            // Don't show error to user - they can join later
          }
        }
        
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError('註冊請求已發送，請檢查您的電子郵件');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">註冊成功！</h2>
            <p className="text-gray-600 mb-4">
              請檢查您的電子郵件以確認帳號
            </p>
            <p className="text-sm text-gray-500">
              正在跳轉到登入頁面...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mb-6">
            <img 
              src="/book-cover.jpg" 
              alt="營養書封面" 
              className="h-24 w-auto mx-auto rounded-lg shadow-md"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">加入我們</h1>
          <p className="text-gray-600">開始您的學習之旅</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                姓名
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="請輸入您的姓名"
                />
              </div>
            </div>

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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="請輸入電子郵件"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                建議使用 Gmail、Yahoo、Hotmail 等常用郵箱
              </p>
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="請輸入密碼（至少6個字符）"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                確認密碼
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="請再次輸入密碼"
                />
              </div>
            </div>

            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">
                邀請碼
              </label>
              <div className="mt-1">
                <input
                  id="inviteCode"
                  name="inviteCode"
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="請輸入群組邀請碼"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                測試階段請使用：TEST001
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? '註冊中...' : '註冊'}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
              >
                已有帳號？立即登入
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
