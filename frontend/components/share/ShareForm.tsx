import { useState } from 'react';

interface ShareFormProps {
  onSubmit: (content: string) => Promise<boolean>;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export default function ShareForm({ 
  onSubmit, 
  disabled = false, 
  loading = false,
  placeholder = "今天學到了什麼？有什麼感想？想和大家分享什麼？"
}: ShareFormProps) {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled || isSubmitting) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const success = await onSubmit(content.trim());
      if (success) {
        setContent('');
        setMessage('分享成功！');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('分享失敗，請稍後再試');
      }
    } catch (error) {
      console.error('Error submitting share:', error);
      setMessage('分享失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = disabled || loading || isSubmitting || !content.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        {isSubmitting ? '分享中...' : '分享心得'}
      </button>

      {disabled && (
        <div className="text-center py-4">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-gray-600">
            你今天已經分享了心得！<br />
            明天再來分享新的學習心得吧。
          </p>
        </div>
      )}
    </form>
  );
}
