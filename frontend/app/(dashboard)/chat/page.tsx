'use client';

import { useEffect, useRef, useState } from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { useChat } from '@/lib/hooks/useChat';
import { createClient } from '@/lib/supabase/client';

export default function ChatPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const { messages, loading, error, sendMessage } = useChat(currentGroupId);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get current user and their group
  useEffect(() => {
    const fetchUserAndGroup = async () => {
      try {
        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('Error getting user:', userError);
          setLoadingUser(false);
          return;
        }

        setCurrentUserId(user.id);

        // Get user's first group (for MVP, assume one group per user)
        const { data: membership, error: memberError } = await supabase
          .from('group_members')
          .select('group_id, groups(id, name)')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (memberError) {
          console.error('Error getting group:', memberError);
          setLoadingUser(false);
          return;
        }

        if (membership && membership.groups) {
          const group = membership.groups as { id: string; name: string };
          setCurrentGroupId(group.id);
          setGroupName(group.name);
        }

        setLoadingUser(false);
      } catch (err) {
        console.error('Error:', err);
        setLoadingUser(false);
      }
    };

    fetchUserAndGroup();
  }, []);

  if (loadingUser) {
    return (
      <div>
        <DashboardHeader period={21} />
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-600">載入中...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!currentGroupId) {
    return (
      <div>
        <DashboardHeader period={21} />
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 text-lg font-semibold mb-2">📢 尚未加入群組</p>
            <p className="text-yellow-700 text-sm">
              您需要加入一個群組才能使用聊天功能。請聯絡管理員獲取邀請碼。
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <DashboardHeader period={21} />
      
      <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-white shadow-sm">
        {/* Chat Header */}
        <div className="bg-blue-600 text-white px-4 py-3 border-b border-blue-700">
          <h1 className="text-xl font-bold">💬 {groupName || '群組聊天'}</h1>
          <p className="text-blue-100 text-sm">即時聊天室</p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">載入訊息中...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 rounded-lg p-4 text-center">
              <p>錯誤: {error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-4xl mb-2">💬</p>
                <p>尚無訊息，開始聊天吧！</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isOwnMessage={msg.user_id === currentUserId}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <ChatInput onSend={sendMessage} disabled={loading} />
      </main>
    </div>
  );
}
