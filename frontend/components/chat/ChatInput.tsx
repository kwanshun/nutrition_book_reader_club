'use client';

import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || sending || disabled) return;

    setSending(true);
    try {
      await onSend(message);
      setMessage(''); // Clear input after successful send
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error instanceof Error ? error.message : '發送訊息失敗');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4 fixed bottom-16 left-0 right-0 z-40">
      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="輸入訊息..."
          disabled={sending || disabled}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={!message.trim() || sending || disabled}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            !message.trim() || sending || disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {sending ? '發送中...' : '發送'}
        </button>
      </div>
    </form>
  );
}

