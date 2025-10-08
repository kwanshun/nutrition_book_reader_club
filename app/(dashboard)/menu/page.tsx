'use client';

import DashboardHeader from '@/components/layout/DashboardHeader';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MenuPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await signOut();
    router.push('/login');
  };

  return (
    <div>
      <DashboardHeader period={21} />
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">用戶資訊</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">姓名：</span>
                {user?.user_metadata?.display_name || user?.user_metadata?.full_name || '未設定'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">電子郵件：</span>
                {user?.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">註冊時間：</span>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-TW', { timeZone: 'Asia/Hong_Kong' }) : '未知'}
              </p>
            </div>
          </div>

          {/* Menu Options */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">設定</h2>
            <div className="space-y-4">
              <button 
                onClick={() => router.push('/profile')}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="font-medium text-gray-900">個人資料</p>
                    <p className="text-sm text-gray-500">編輯個人資訊</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登出中...' : '登出'}
          </button>
        </div>
      </main>
    </div>
  );
}

