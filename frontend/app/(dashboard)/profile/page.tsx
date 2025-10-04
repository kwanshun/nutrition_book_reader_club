'use client';

import DashboardHeader from '@/components/layout/DashboardHeader';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const { profile, loading, error, updateProfile } = useUserProfile();
  const { user } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) return;
    
    setUpdateLoading(true);
    const success = await updateProfile(displayName);
    if (success) {
      setIsEditing(false);
    }
    setUpdateLoading(false);
  };

  const handleCancel = () => {
    setDisplayName(profile?.display_name || '');
    setIsEditing(false);
  };

  const handleEdit = () => {
    setDisplayName(profile?.display_name || '');
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div>
        <DashboardHeader period={21} />
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader period={21} />
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <span className="text-xl mr-2">←</span>
              個人資料
            </button>
          </div>

          {/* Profile Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">個人資訊</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📧 電子郵件
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">電子郵件無法修改</p>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 顯示名稱
                </label>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="請輸入您的顯示名稱"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={50}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={updateLoading || !displayName.trim()}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updateLoading ? '儲存中...' : '儲存'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={updateLoading}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      {profile?.display_name || '未設定'}
                    </div>
                    <button
                      onClick={handleEdit}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      編輯顯示名稱
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  此名稱會顯示在聊天室和分享中，最多50個字符
                </p>
              </div>

              {/* Profile Status */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">個人資料狀態</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    profile?.profile_exists 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile?.profile_exists ? '已完善' : '待完善'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 提示</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 顯示名稱會出現在聊天室和分享心得中</li>
              <li>• 其他用戶可以看到您的顯示名稱</li>
              <li>• 可以隨時修改顯示名稱</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
