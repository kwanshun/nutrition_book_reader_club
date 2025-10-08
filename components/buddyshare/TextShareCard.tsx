'use client';

import { useState } from 'react';
import { ShareItem, ShareComment } from '@/lib/types/buddyshare';
import CommentSection from './CommentSection';

interface TextShareCardProps {
  share: ShareItem;
  onCommentSubmit: (content: string) => void;
  onReactionToggle: () => void;
  currentUserId?: string;
}

export default function TextShareCard({ share, onCommentSubmit, onReactionToggle, currentUserId }: TextShareCardProps) {
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

  const getShareDescription = () => {
    return `分享了第 ${share.day_number} 天的學習心得`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {getAvatarText(share.user_name)}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm">{share.user_name}</h3>
            <p className="text-xs text-gray-500">{getShareDescription()}</p>
          </div>
          <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            📝 文字分享
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-sm text-gray-700 leading-relaxed">
          {share.content}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={onReactionToggle}
            className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
          >
            <span className="text-sm">👍</span>
            <span className="text-xs">{share.like_count}</span>
          </button>
          
          <button
            onClick={handleShowComments}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <span className="text-sm">💬</span>
            <span className="text-xs">{share.comment_count}</span>
          </button>
          
          <div className="ml-auto text-xs text-gray-400">
            {formatDateTime(share.created_at)}
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
