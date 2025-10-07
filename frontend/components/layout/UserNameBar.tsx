'use client';

import { useUserProfile } from '@/lib/hooks/useUserProfile';

export default function UserNameBar() {
  const { profile, loading } = useUserProfile();

  return (
    <div className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 text-gray-900 flex items-center justify-between px-4 z-50 max-w-md mx-auto">
      {/* Left side - Logo and Organization */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-gray-100 border border-gray-200 rounded flex items-center justify-center overflow-hidden">
          <img 
            src="/book-cover.jpg" 
            alt="營養交流協會"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<span class="text-xs">🏠</span>';
              }
            }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-900">營養交流協會</span>
      </div>
      
      {/* Right side - User Name */}
      <div className="flex items-center">
        {!loading && profile && (
          <span className="text-sm text-gray-600">
            {profile.display_name}
          </span>
        )}
        {loading && (
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
        )}
        {!loading && !profile && (
          <span className="text-sm text-gray-400">未登入</span>
        )}
      </div>
    </div>
  );
}
