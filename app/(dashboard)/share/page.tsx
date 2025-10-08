'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTextShares } from '@/lib/hooks/useTextShares';
import ShareForm from '@/components/share/ShareForm';
import TextShareCard from '@/components/share/TextShareCard';

export default function SharePage() {
  const { user } = useAuth();
  const [currentDay, setCurrentDay] = useState(1);
  const [todayDay, setTodayDay] = useState(1);
  const { shares, loading, error, hasSharedToday, hasSharedForDay, getExistingShareForDay, createShare, refreshShares } = useTextShares(user?.id);
  const { shares: otherUsersShares, loading: otherUsersLoading, error: otherUsersError, refreshShares: refreshOtherUsersShares } = useTextShares(user?.id, undefined, true);

  // Get current day based on date (same logic as content/today page)
  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    
    // Calculate days since first day of month
    const daysSinceStart = Math.floor((today.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24));
    
    // Current day is days since start + 1 (1-based indexing)
    // Cap at 21 days maximum
    const calculatedDay = Math.min(daysSinceStart + 1, 21);
    
    setCurrentDay(calculatedDay);
    setTodayDay(calculatedDay);
  }, []);

  const handleShareSubmit = async (content: string): Promise<boolean> => {
    if (!user) return false;
    
    const success = await createShare(content, currentDay);
    if (success) {
      await refreshShares(currentDay); // Refresh the list
      await refreshOtherUsersShares(currentDay);
    }
    return success;
  };

  const handleDayChange = async (newDay: number) => {
    setCurrentDay(newDay);
    await refreshShares(newDay);
    await refreshOtherUsersShares(newDay);
  };

  // Auto-save draft functionality
  const saveDraft = (content: string) => {
    if (typeof window !== 'undefined' && user) {
      const key = `share_draft_${user.id}_${currentDay}`;
      localStorage.setItem(key, content);
    }
  };

  // Load draft functionality
  const loadDraft = (): string => {
    if (typeof window !== 'undefined' && user) {
      const key = `share_draft_${user.id}_${currentDay}`;
      return localStorage.getItem(key) || '';
    }
    return '';
  };

  // Get existing share for current day
  const existingShare = getExistingShareForDay(currentDay);
  const isEditing = !!existingShare;
  const initialContent = existingShare?.content || loadDraft();
  const lastModified = existingShare?.updated_at || existingShare?.created_at;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">第 {currentDay} 天 - 分享心得</h1>
            <select
              value={currentDay}
              onChange={(e) => handleDayChange(parseInt(e.target.value))}
              className="bg-gray-100 text-gray-900 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {Array.from({ length: todayDay }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>
                  第 {day} 天
                </option>
              ))}
            </select>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            {hasSharedForDay(currentDay) ? `✅ 第${currentDay}天已分享` : '分享你的學習心得'}
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Share Form */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">
              {hasSharedForDay(currentDay) ? `第${currentDay}天的心得` : '寫下你的心得'}
            </h2>
            
            <ShareForm
              onSubmit={handleShareSubmit}
              disabled={false} // Never disable - allow editing
              loading={loading}
              initialContent={initialContent}
              isEditing={isEditing}
              lastModified={lastModified}
              onDraftSave={saveDraft}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="text-red-600">⚠️</div>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Other Users' Shares */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              第 {currentDay} 天的分享
            </h3>
            
            {otherUsersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">載入中...</p>
              </div>
            ) : otherUsersError ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">⚠️</div>
                <p>載入分享內容時發生錯誤</p>
              </div>
            ) : otherUsersShares.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💭</div>
                <p>第 {currentDay} 天還沒有其他用戶的分享</p>
                <p className="text-sm">成為第一個分享心得的人吧！</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {otherUsersShares
                  .filter(share => share.day_number === currentDay && share.user_id !== user?.id)
                  .map((share) => (
                    <TextShareCard key={share.id} share={share} />
                  ))}
              </div>
            )}
          </div>

        </div>
    </div>
  );
}
