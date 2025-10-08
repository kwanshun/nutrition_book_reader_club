import { TextShare } from '@/lib/types/database';

interface TextShareCardProps {
  share: TextShare;
  showDate?: boolean;
}

export default function TextShareCard({ share, showDate = true }: TextShareCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return '剛剛';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小時前`;
    } else if (diffInHours < 48) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getUserInitial = (name?: string) => {
    return (name || '用戶').charAt(0).toUpperCase();
  };

  const getDisplayName = (share: TextShare) => {
    // Use display_name from API response, fallback to user ID suffix
    return share.display_name || `用戶${share.user_id.slice(-4)}`;
  };

  const getUserColor = (userId: string) => {
    // Generate a consistent color based on user ID
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-yellow-100 text-yellow-600',
      'bg-indigo-100 text-indigo-600',
      'bg-red-100 text-red-600',
      'bg-teal-100 text-teal-600'
    ];
    
    // Simple hash function to get consistent color
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start space-x-3">
        {/* User Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${getUserColor(share.user_id)}`}>
          {getUserInitial(getDisplayName(share))}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {getDisplayName(share)}
              </span>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                第{share.day_number}天
              </span>
            </div>
            {showDate && (
              <span className="text-xs text-gray-500">
                {formatDate(share.created_at)}
              </span>
            )}
          </div>
          
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {share.content}
          </p>
        </div>
      </div>
    </div>
  );
}
