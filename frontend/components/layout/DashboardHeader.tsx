'use client';

import { useCurrentDay } from '@/lib/hooks/useCurrentDay';

interface DashboardHeaderProps {
  period?: number;
  organizationName?: string;
  programName?: string;
}

export default function DashboardHeader({
  period = 21,
  organizationName = '營養交流協會',
  programName = '營養人生讀書會',
}: DashboardHeaderProps) {
  const { currentDay } = useCurrentDay();
  
  // Calculate progress
  const progressDay = currentDay || 1;
  const progressPercentage = Math.round((progressDay / period) * 100);
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="p-4 text-gray-800">
        <div className="max-w-md mx-auto">
          {/* Progress indicator only */}
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>學習進度</span>
            <span>{progressDay}/{period} 天</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </header>
  );
}

