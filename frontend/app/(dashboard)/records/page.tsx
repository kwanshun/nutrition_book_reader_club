'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { useUserProgress } from '@/lib/hooks/useUserProgress';
import { createClient } from '@/lib/supabase/client';

interface DayDetail {
  date: string;
  foodLogs: any[];
  textShares: any[];
}

export default function RecordsPage() {
  const { activities, stats, loading, error } = useUserProgress();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Get calendar data for current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Create array of day numbers
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Check if a date has activity
  const getActivityForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return activities.find(a => a.date === dateStr);
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Fetch day details
  const fetchDayDetails = async (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setLoadingDetail(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Fetch food logs for this day
      const { data: foodLogs } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${dateStr}T00:00:00`)
        .lt('created_at', `${dateStr}T23:59:59`)
        .order('created_at', { ascending: false });

      // Fetch text shares for this day
      const { data: textShares } = await supabase
        .from('text_shares')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${dateStr}T00:00:00`)
        .lt('created_at', `${dateStr}T23:59:59`)
        .order('created_at', { ascending: false });

      setSelectedDay({
        date: dateStr,
        foodLogs: foodLogs || [],
        textShares: textShares || [],
      });
    } catch (err) {
      console.error('Error fetching day details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDayDetail = () => {
    setSelectedDay(null);
  };

  if (loading) {
    return (
      <div>
        <DashboardHeader period={21} />
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader period={21} />
      
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Calendar Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {/* Month Header with Navigation */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{monthName}</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">21天記錄</span>
              <button 
                onClick={previousMonth}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ‹
              </button>
              <button 
                onClick={nextMonth}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ›
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
              <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const activity = getActivityForDate(day);
              const hasAnyActivity = activity && (activity.hasQuiz || activity.hasShare || activity.hasFoodLog);

              return (
                <button
                  key={day}
                  onClick={() => hasAnyActivity && fetchDayDetails(day)}
                  className={`aspect-square relative ${hasAnyActivity ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  disabled={!hasAnyActivity}
                >
                  {/* Day number */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm">{day}</span>
                  </div>

                  {/* Activity indicators */}
                  {hasAnyActivity && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                      {/* Filled gray circle = Food logging */}
                      {activity.hasFoodLog && (
                        <div className="absolute inset-1 bg-gray-300 rounded-full" />
                      )}
                      {/* Empty circle with border = Text share (學習打咭) */}
                      {activity.hasShare && (
                        <div className="absolute inset-1 border-2 border-gray-800 rounded-full" />
                      )}
                      {/* Computer icon = Quiz (測一測) */}
                      {activity.hasQuiz && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="text-xs">🖥️</div>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="space-y-3">
            {/* Share Stats (Empty circle) */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-2 border-gray-800 rounded-full flex items-center justify-center flex-shrink-0"></div>
              <span className="text-gray-700">學習打咭</span>
              <span className="text-gray-900 font-medium ml-auto">{stats.shareDays} 天</span>
            </div>

            {/* Food Log Stats (Filled gray circle) */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">記錄食物</span>
              <span className="text-gray-900 font-medium ml-auto">
                {stats.foodLogDays} 天 / {stats.foodLogTotal} 次
              </span>
            </div>

            {/* Quiz Stats (Computer icon) */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🖥️</span>
              </div>
              <span className="text-gray-700">測一測</span>
              <span className="text-gray-900 font-medium ml-auto">
                {stats.quizDays} 天 / {stats.quizTotal} 次
              </span>
            </div>
          </div>
        </div>

        {/* Day Detail Modal */}
        {selectedDay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  {new Date(selectedDay.date).toLocaleDateString('zh-TW', { 
                    month: 'long', 
                    day: 'numeric' 
                  })} 記錄
                </h2>
                <button
                  onClick={closeDayDetail}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4">
                {loadingDetail ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {/* Text Shares Section */}
                    {selectedDay.textShares.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <div className="w-6 h-6 border-2 border-gray-800 rounded-full mr-2"></div>
                          學習打咭 ({selectedDay.textShares.length})
                        </h3>
                        <div className="space-y-3">
                          {selectedDay.textShares.map((share: any) => (
                            <div key={share.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <p className="text-gray-700 whitespace-pre-wrap">{share.content}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(share.created_at).toLocaleTimeString('zh-TW', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Food Logs Section */}
                    {selectedDay.foodLogs.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
                          記錄食物 ({selectedDay.foodLogs.length})
                        </h3>
                        <div className="space-y-4">
                          {selectedDay.foodLogs.map((log: any) => (
                            <div key={log.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              {/* Food Image */}
                              {log.image_url && (
                                <img
                                  src={log.image_url}
                                  alt="Food"
                                  className="w-full h-32 object-cover rounded-lg mb-3"
                                />
                              )}
                              
                              {/* Food Items */}
                              {log.detected_foods && Array.isArray(log.detected_foods) && (
                                <div className="space-y-2">
                                  {log.detected_foods.map((food: any, idx: number) => (
                                    <div key={idx} className="text-sm">
                                      <span className="font-medium text-gray-900">{food.name}</span>
                                      <span className="text-gray-600"> - {food.portion}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(log.created_at).toLocaleTimeString('zh-TW', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No data message */}
                    {selectedDay.textShares.length === 0 && selectedDay.foodLogs.length === 0 && (
                      <p className="text-gray-500 text-center py-8">此日期沒有記錄</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

