import { useState, useEffect, useRef } from 'react';

interface ShareFormProps {
  onSubmit: (content: string) => Promise<boolean>;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  initialContent?: string;
  isEditing?: boolean;
  lastModified?: string;
  onDraftSave?: (content: string) => void;
}

export default function ShareForm({ 
  onSubmit, 
  disabled = false, 
  loading = false,
  placeholder = "今天學到了什麼？有什麼感想？想和大家分享什麼？",
  initialContent = '',
  isEditing = false,
  lastModified,
  onDraftSave
}: ShareFormProps) {
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [hasBeenUpdated, setHasBeenUpdated] = useState(false);
  const autoSaveRef = useRef<NodeJS.Timeout>();
  const lastSavedContentRef = useRef(initialContent);

  // Update content when initialContent changes
  useEffect(() => {
    setContent(initialContent);
    lastSavedContentRef.current = initialContent;
    setHasBeenUpdated(false);
  }, [initialContent]);

  // Auto-save logic
  useEffect(() => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }

    if (content && content !== lastSavedContentRef.current && onDraftSave) {
      autoSaveRef.current = setTimeout(() => {
        onDraftSave(content);
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }, 30000); // 30 seconds
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [content, onDraftSave]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled || isSubmitting) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const success = await onSubmit(content.trim());
      if (success) {
        lastSavedContentRef.current = content.trim();
        setMessage(isEditing ? '更新成功！' : '分享成功！');
        setTimeout(() => setMessage(''), 3000);
        
        // Set updated flag for editing mode
        if (isEditing) {
          setHasBeenUpdated(true);
        }
        
        // Clear content only if it's a new share
        if (!isEditing) {
          setContent('');
          lastSavedContentRef.current = '';
        }
      } else {
        setMessage(isEditing ? '更新失敗，請稍後再試' : '分享失敗，請稍後再試');
      }
    } catch (error) {
      console.error('Error submitting share:', error);
      setMessage(isEditing ? '更新失敗，請稍後再試' : '分享失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = disabled || loading || isSubmitting || !content.trim();

  // Format last modified time
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Status indicators */}
      {isEditing && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {hasBeenUpdated ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                ✓ 已修改
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                ✓ 已分享
              </span>
            )}
            {draftSaved && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                💾 草稿已保存
              </span>
            )}
          </div>
          {lastModified && (
            <div className="text-gray-500">
              最後更新: {formatDateTime(lastModified)}
            </div>
          )}
        </div>
      )}

      <div>
        <label htmlFor="share-content" className="block text-sm font-medium text-gray-700 mb-2">
          分享內容
        </label>
        <textarea
          id="share-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={6}
          maxLength={500}
          required
          disabled={disabled}
        />
        <div className="flex justify-between items-center mt-1">
          <div className="text-sm text-gray-500">
            {content.length}/500
          </div>
          {content.length > 450 && (
            <div className="text-sm text-orange-600">
              即將達到字數限制
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('成功') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isFormDisabled}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting 
          ? (isEditing ? '更新中...' : '分享中...') 
          : (isEditing ? '更新' : '分享')
        }
      </button>

      {disabled && (
        <div className="text-center py-4">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-gray-600">
            你今天已經分享了心得！<br />
            你可以隨時回來修改和更新你的想法。
          </p>
        </div>
      )}
    </form>
  );
}
