'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTextShares } from '@/lib/hooks/useTextShares';
import ShareForm from '@/components/share/ShareForm';
import TextShareCard from '@/components/share/TextShareCard';

export default function SharePage() {
  const { user } = useAuth();
  const [currentDay, setCurrentDay] = useState(1);
  const { shares, loading, error, hasSharedToday, createShare, refreshShares } = useTextShares(user?.id);

  // Get current day based on date (for demo, using day 1)
  useEffect(() => {
    const today = new Date();
    const startDate = new Date('2024-01-01'); // Adjust based on program start
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    setCurrentDay(Math.min(Math.max(daysDiff + 1, 1), 21));
  }, []);

  const handleShareSubmit = async (content: string): Promise<boolean> => {
    if (!user) return false;
    
    const success = await createShare(content);
    if (success) {
      await refreshShares(); // Refresh the list
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <h1 className="text-xl font-bold">第 {currentDay} 天 - 分享心得</h1>
          <p className="text-blue-100 text-sm mt-1">
            {hasSharedToday ? '✅ 今天已分享' : '分享你的學習心得'}
          </p>
        </div>

        <div className="p-4 space-y-6">
          {/* Share Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {hasSharedToday ? '今天的心得' : '寫下你的心得'}
            </h2>
            
            <ShareForm
              onSubmit={handleShareSubmit}
              disabled={hasSharedToday}
              loading={loading}
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

          {/* Recent Shares */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              最近的分享
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">載入中...</p>
              </div>
            ) : shares.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💭</div>
                <p>還沒有分享內容</p>
                <p className="text-sm">成為第一個分享心得的人吧！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shares.map((share) => (
                  <TextShareCard key={share.id} share={share} />
                ))}
              </div>
            )}
          </div>

          {/* Daily Reminder */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">💡</div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">每日分享提醒</h4>
                <p className="text-blue-700 text-sm">
                  每天分享你的學習心得，與其他成員一起成長！
                  分享內容可以是：
                </p>
                <ul className="text-blue-700 text-sm mt-2 space-y-1">
                  <li>• 今天學到的新知識</li>
                  <li>• 對營養觀念的新理解</li>
                  <li>• 實際應用的心得</li>
                  <li>• 想問的問題或疑惑</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
