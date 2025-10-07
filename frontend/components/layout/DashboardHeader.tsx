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
      <div className="p-6 text-gray-800">
        <div className="max-w-md mx-auto">
          {/* Main content */}
          <div className="flex items-center gap-4">
            {/* Book Cover - Clean */}
            <div className="flex-shrink-0 w-16 h-20 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <img 
                src="/book-cover.jpg" 
                alt="吃的營養 科學觀 - 書籍封面"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">書籍封面</div>';
                  }
                }}
              />
            </div>

            {/* Text Content - Clean */}
            <div className="flex-1">
              <div className="mb-1">
                <h1 className="text-2xl font-bold text-gray-900">第{period}期</h1>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {organizationName}
                <br />
                {programName}
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-4 pt-4 border-t border-gray-200">
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
      </div>
    </header>
  );
}

