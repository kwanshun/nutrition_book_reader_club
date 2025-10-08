'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

const LAST_READ_KEY = 'chat_last_read_timestamp';

export function useUnreadMessages(groupId: string | null) {
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!groupId || !user) return;

    // Get last read timestamp from localStorage
    const lastRead = localStorage.getItem(LAST_READ_KEY);
    const lastReadTime = lastRead ? new Date(lastRead) : new Date(0);

    // Count unread messages
    const countUnread = async () => {
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .neq('user_id', user.id) // Don't count own messages
        .gt('created_at', lastReadTime.toISOString());

      setUnreadCount(count || 0);
    };

    countUnread();

    // Subscribe to new messages
    const channel = supabase
      .channel(`unread:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload: any) => {
          // Only count messages from others
          if (payload.new.user_id !== user.id) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, user]);

  // Function to mark as read
  const markAsRead = () => {
    localStorage.setItem(LAST_READ_KEY, new Date().toISOString());
    setUnreadCount(0);
  };

  return { unreadCount, markAsRead };
}

