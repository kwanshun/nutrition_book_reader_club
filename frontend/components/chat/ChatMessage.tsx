'use client';

import { ChatMessage as ChatMessageType } from '@/lib/types/database';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
}

export default function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  const [userName, setUserName] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    // Fetch user display name from user_profiles
    const fetchUserName = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('user_id', message.user_id)
          .single();

        if (error || !data) {
          // Fallback to displaying user ID suffix
          setUserName(`用戶${message.user_id.slice(-4)}`);
        } else {
          setUserName(data.display_name);
        }
      } catch (err) {
        // Fallback to displaying user ID suffix
        setUserName(`用戶${message.user_id.slice(-4)}`);
      }
    };

    fetchUserName();
  }, [message.user_id, supabase]);

  return (
    <div className={`mb-4 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* User name */}
        {!isOwnMessage && (
          <span className="text-xs text-gray-500 mb-1 px-2">{userName}</span>
        )}
        
        {/* Message bubble */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.message}</p>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-400 mt-1 px-2">
          {new Date(message.created_at).toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}

