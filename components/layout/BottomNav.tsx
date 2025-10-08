'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';

interface NavItem {
  href: string;
  icon: string;
  label: string;
  showBadge?: boolean;
}

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  
  const navItems: NavItem[] = [
    { href: '/', icon: '/icon/home.svg', label: '首頁' },
    { href: '/announcements', icon: '/icon/Announcement.svg', label: '最新消息' },
    { href: '/buddyshare', icon: '/icon/group-chat.svg', label: '同學分享' },
    { href: '/chat', icon: '/icon/chat.svg', label: '聊天', showBadge: true },
    { href: '/menu', icon: '/icon/settig.svg', label: '選單' },
  ];

  // Track unread messages
  useEffect(() => {
    if (!user) return;

    const checkUnread = async () => {
      // Get user's group
      const { data: membership } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!membership) return;

      const lastRead = localStorage.getItem('chat_last_read_timestamp');
      const lastReadTime = lastRead ? new Date(lastRead) : new Date(0);

      // Count unread messages
      const { count, error: countError } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', membership.group_id)
        .neq('user_id', user.id)
        .gt('created_at', lastReadTime.toISOString());

      console.log('🔔 Unread messages check:', {
        groupId: membership.group_id,
        userId: user.id,
        lastRead: lastReadTime.toISOString(),
        count: count,
        error: countError
      });

      setUnreadCount(count || 0);

      // Subscribe to new messages
      const channel = supabase
        .channel(`nav_unread:${membership.group_id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `group_id=eq.${membership.group_id}`,
          },
          (payload: any) => {
            if (payload.new.user_id !== user.id) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    checkUnread();
  }, [user]);

  // Clear unread count when visiting chat page
  useEffect(() => {
    if (pathname === '/chat') {
      localStorage.setItem('chat_last_read_timestamp', new Date().toISOString());
      setUnreadCount(0);
    }
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const showBadge = item.showBadge && unreadCount > 0;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <div className="relative">
                {item.icon.endsWith('.jpg') || item.icon.endsWith('.svg') ? (
                  <img 
                    src={item.icon} 
                    alt={item.label} 
                    className="w-6 h-6 mb-1" 
                    style={{ display: 'block' }}
                  />
                ) : (
                  <span className="text-2xl mb-1">{item.icon}</span>
                )}
                
                {/* Notification Badge */}
                {showBadge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

