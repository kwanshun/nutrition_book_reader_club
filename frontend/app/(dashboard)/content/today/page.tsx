'use client';

import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { useContent } from '@/lib/hooks/useContent';
import Link from 'next/link';

export default function TodayContentPage() {
  const [currentDay, setCurrentDay] = useState(1);
  const { content, loading, error } = useContent(currentDay);

  useEffect(() => {
    // For demo purposes, we'll start with day 1
    // In production, this would be calculated based on the program start date
    setCurrentDay(1);
  }, []);

  const handleDayChange = (day: number) => {
    if (day >= 1 && day <= 21) {
      setCurrentDay(day);
    }
  };

  if (loading) {
    return (
      <div>
        <DashboardHeader period={21} />
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">載入內容中...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <DashboardHeader period={21} />
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">載入內容時發生錯誤</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 text-blue-600 hover:text-blue-500"
            >
              重新載入
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!content || Array.isArray(content)) {
    return (
      <div>
        <DashboardHeader period={21} />
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-gray-600">找不到內容</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader period={21} />
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Day Navigation */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => handleDayChange(currentDay - 1)}
              disabled={currentDay <= 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>←</span>
              <span>前一天</span>
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">第 {currentDay} 天</h2>
              <p className="text-sm text-gray-500">共 21 天</p>
            </div>
            
            <button
              onClick={() => handleDayChange(currentDay + 1)}
              disabled={currentDay >= 21}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>後一天</span>
              <span>→</span>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentDay / 21) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {content.title}
          </h1>
          
          <div className="prose prose-gray max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {content.content}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href={`/quiz?day=${currentDay}`}
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-blue-700 transition-colors"
          >
            📝 做測驗
          </Link>
          
          <Link
            href={`/share?day=${currentDay}`}
            className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-green-700 transition-colors"
          >
            ✍️ 分享心得
          </Link>
          
          <Link
            href={`/food?day=${currentDay}`}
            className="block w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-orange-700 transition-colors"
          >
            🍴 記錄飲食
          </Link>
        </div>

        {/* Quick Navigation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快速導航</h3>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 21 }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                onClick={() => handleDayChange(day)}
                className={`p-2 rounded text-sm font-medium transition-colors ${
                  day === currentDay
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
