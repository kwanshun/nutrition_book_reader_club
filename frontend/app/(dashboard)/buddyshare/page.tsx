'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import ShareCard from '@/components/buddyshare/ShareCard';
import { ShareItem, ShareComment } from '@/lib/types/buddyshare';

export default function BuddySharePage() {
  const { user } = useAuth();
  const [shares, setShares] = useState<ShareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchShares();
    }
  }, [user]);

  const fetchShares = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/buddyshare', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('請先登入');
        }
        throw new Error('Failed to fetch shares');
      }
      
      const data = await response.json();
      setShares(data);
    } catch (err) {
      console.error('Error fetching shares:', err);
      setError('載入分享內容時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (shareId: string, shareType: string, content: string): Promise<void> => {
    try {
      const response = await fetch('/api/buddyshare/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          share_id: shareId,
          share_type: shareType,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      // Update the comment count in the shares list
      const updatedShares = shares.map(share => {
        if (share.id === shareId && share.type === shareType) {
          return { ...share, comment_count: share.comment_count + 1 };
        }
        return share;
      });
      setShares(updatedShares);
    } catch (err) {
      console.error('Error submitting comment:', err);
      throw err; // Re-throw to let the calling component handle the error
    }
  };

  const handleReactionToggle = async (shareId: string, shareType: string, reactionType: string = 'like') => {
    try {
      const response = await fetch('/api/buddyshare/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          share_id: shareId,
          share_type: shareType,
          reaction_type: reactionType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle reaction');
      }

      const result = await response.json();
      
      // Update local state based on the result
      const updatedShares = shares.map(share => {
        if (share.id === shareId && share.type === shareType) {
          const currentLikes = share.like_count || 0;
          return { ...share, like_count: Math.max(0, currentLikes + result.count) };
        }
        return share;
      });
      setShares(updatedShares);
    } catch (err) {
      console.error('Error toggling reaction:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="bg-blue-600 text-white p-4">
          <h1 className="text-xl font-bold">👥 同學分享</h1>
          <p className="text-blue-100 text-sm mt-1">看看夥伴們的分享，一起交流學習心得</p>
        </div>
        
        <div className="p-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="bg-blue-600 text-white p-4">
          <h1 className="text-xl font-bold">👥 同學分享</h1>
          <p className="text-blue-100 text-sm mt-1">看看夥伴們的分享，一起交流學習心得</p>
        </div>
        
        <div className="p-4">
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">⚠️</div>
            <p>{error}</p>
            {error === '請先登入' && (
              <div className="mt-4">
                <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  前往登入
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">👥 同學分享</h1>
        <p className="text-blue-100 text-sm mt-1">看看夥伴們的分享，一起交流學習心得</p>
      </div>
      
      <div className="p-4">
        {shares.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💭</div>
            <h3 className="text-lg font-medium mb-2">還沒有分享內容</h3>
            <p className="text-sm">成為第一個分享心得的人吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shares.map((share) => (
              <ShareCard
                key={`${share.type}-${share.id}`}
                share={share}
                onCommentSubmit={(content) => handleCommentSubmit(share.id, share.type, content)}
                onReactionToggle={() => handleReactionToggle(share.id, share.type)}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
        
        {shares.length > 0 && (
          <div className="text-center mt-6">
            <button className="bg-white border-2 border-gray-200 text-gray-600 px-6 py-2 rounded-full text-sm hover:border-blue-500 hover:text-blue-500 transition-colors">
              載入更多分享
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
