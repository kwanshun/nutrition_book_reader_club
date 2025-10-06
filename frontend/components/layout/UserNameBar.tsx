'use client';

import { useUserProfile } from '@/lib/hooks/useUserProfile';

export default function UserNameBar() {
  const { profile, loading } = useUserProfile();

  return (
    <div className="fixed top-0 left-0 right-0 h-12 bg-black text-white flex items-center justify-between px-4 z-50 max-w-md mx-auto">
      {/* Left side - Logo and Organization */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs">
          🏠
        </div>
        <span className="text-sm font-semibold">營養交流協會</span>
      </div>
      
      {/* Right side - User Name */}
      <div className="flex items-center">
        {!loading && profile && (
          <span className="text-sm text-gray-300">
            {profile.display_name}
          </span>
        )}
        {loading && (
          <div className="w-16 h-4 bg-gray-600 rounded animate-pulse"></div>
        )}
        {!loading && !profile && (
          <span className="text-sm text-gray-400">未登入</span>
        )}
      </div>
    </div>
  );
}
