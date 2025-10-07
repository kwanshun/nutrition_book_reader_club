'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/', icon: '/icon/home.svg', label: '首頁' },
    { href: '/announcements', icon: '/icon/Announcement.svg', label: '最新消息' },
    { href: '/buddyshare', icon: '/icon/group-chat.svg', label: '同學分享' },
    { href: '/chat', icon: '/icon/chat.svg', label: '聊天' },
    { href: '/menu', icon: '/icon/settig.svg', label: '選單' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'
              }`}
            >
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
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

