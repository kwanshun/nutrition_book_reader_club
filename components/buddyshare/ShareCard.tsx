'use client';

import { useState } from 'react';
import { ShareItem, ShareComment } from '@/lib/types/buddyshare';
import CommentSection from './CommentSection';

interface ShareCardProps {
  share: ShareItem;
  onCommentSubmit: (content: string) => void;
  onReactionToggle: () => void;
  currentUserId?: string;
}

export default function ShareCard({ share, onCommentSubmit, onReactionToggle, currentUserId }: ShareCardProps) {
  const [comments, setComments] = useState<ShareComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const fetchComments = async () => {
    if (commentsLoading) return;
    
    try {
      setCommentsLoading(true);
      const response = await fetch(`/api/buddyshare/comments?share_id=${share.id}&share_type=${share.type}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleShowComments = () => {
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getAvatarText = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Only render food log cards in the new format
  if (share.type !== 'food_log') {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-lg font-bold text-green-600">Day {share.day_number || 1}</span>
        <span className="text-sm text-gray-500">{formatDate(share.created_at)}</span>
      </div>

      {/* Card Content */}
      <div className="flex gap-3 mb-3">
        {/* Food Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          {share.food_image_url ? (
            <img 
              src={share.food_image_url} 
              alt="食物照片"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">食物照片</div>';
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
              食物照片
            </div>
          )}
        </div>

        {/* Food Details */}
        <div className="flex-1">
          {share.detected_foods && share.detected_foods.length > 0 ? (
            <div className="space-y-1">
              {share.detected_foods.map((food, index) => (
                <div key={index} className="text-sm text-gray-700">
                  <span className="font-medium">{food.name}</span>
                  <span className="text-gray-500"> - {food.portion}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {share.food_name || '食物記錄'}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        {/* Social Stats */}
        <div className="flex gap-4">
          <button
            onClick={onReactionToggle}
            className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
          >
            <span className="text-sm">👍</span>
            <span className="text-sm">{share.like_count}</span>
          </button>
          
          <button
            onClick={handleShowComments}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <span className="text-sm">💬</span>
            <span className="text-sm">{share.comment_count}</span>
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {getAvatarText(share.user_name)}
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">{share.user_name}</div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection
          shareId={share.id}
          shareType={share.type}
          comments={comments}
          loading={commentsLoading}
          onSubmit={onCommentSubmit}
          onCommentAdded={fetchComments}
        />
      )}
    </div>
  );
}
