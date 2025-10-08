'use client';

import { useState } from 'react';
import { ShareComment } from '@/lib/types/buddyshare';

interface CommentSectionProps {
  shareId: string;
  shareType: string;
  comments: ShareComment[];
  loading: boolean;
  onSubmit: (content: string) => Promise<void>;
  onCommentAdded?: () => void;
}

export default function CommentSection({ shareId, shareType, comments, loading, onSubmit, onCommentAdded }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(commentText);
      setCommentText('');
      // Call the callback to refresh comments
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return '剛剛';
    } else if (diffHours < 24) {
      return `${diffHours} 小時前`;
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return date.toLocaleDateString('zh-TW', {
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  const getAvatarText = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50">
      {loading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-xs text-gray-500 mt-1">載入評論中...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p className="text-xs">還沒有評論，成為第一個評論的人吧！</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                {getAvatarText(comment.user_name)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-900">{comment.user_name}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(comment.created_at)}</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="寫下你的想法..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '發送中...' : '發送'}
          </button>
        </form>
      </div>
    </div>
  );
}
