'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { useUserProgress } from '@/lib/hooks/useUserProgress';
import { createClient } from '@/lib/supabase/client';


export default function RecordsPage() {
  const { activities, stats, loading, error } = useUserProgress();
  const [currentDate, setCurrentDate] = useState(new Date());

  // New state for "All Shares" modal
  const [showAllSharesModal, setShowAllSharesModal] = useState(false);
  const [allShares, setAllShares] = useState<any[]>([]);
  const [loadingAllShares, setLoadingAllShares] = useState(false);

  // New state for "All Food Logs" modal
  const [showFoodLogsModal, setShowFoodLogsModal] = useState(false);
  const [allFoodLogs, setAllFoodLogs] = useState<any[]>([]);
  const [loadingFoodLogs, setLoadingFoodLogs] = useState(false);

  // New state for "All Quiz Results" modal
  const [showQuizResultsModal, setShowQuizResultsModal] = useState(false);
  const [allQuizResponses, setAllQuizResponses] = useState<any[]>([]);
  const [loadingQuizResponses, setLoadingQuizResponses] = useState(false);

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


  const fetchAllShares = async () => {
    setLoadingAllShares(true);
    setShowAllSharesModal(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: textShares, error } = await supabase
        .from('text_shares')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllShares(textShares || []);
    } catch (err) {
      console.error('Error fetching all shares:', err);
      // You might want to show an error in the modal
    } finally {
      setLoadingAllShares(false);
    }
  };

  const fetchAllFoodLogs = async () => {
    setLoadingFoodLogs(true);
    setShowFoodLogsModal(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: foodLogs, error } = await supabase
        .from('food_logs')
        .select('*, food_log_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllFoodLogs(foodLogs || []);
    } catch (err) {
      console.error('Error fetching all food logs:', err);
    } finally {
      setLoadingFoodLogs(false);
    }
  };

  const fetchAllQuizResponses = async () => {
    setLoadingQuizResponses(true);
    setShowQuizResultsModal(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: responses, error } = await supabase
        .from('quiz_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('answered_at', { ascending: false });

      if (error) throw error;

      setAllQuizResponses(responses || []);
    } catch (err) {
      console.error('Error fetching all quiz responses:', err);
    } finally {
      setLoadingQuizResponses(false);
    }
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
                <div
                  key={day}
                  className="aspect-square relative"
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="space-y-3">
            {/* Share Stats Button */}
            <button
              onClick={fetchAllShares}
              className="flex items-center space-x-3 w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 border-2 border-gray-800 rounded-full flex items-center justify-center flex-shrink-0"></div>
              <span className="text-gray-700">學習打咭</span>
              <span className="text-gray-900 font-medium ml-auto">{stats.shareDays} 天</span>
              <svg className="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>

            {/* Food Log Stats Button */}
            <button
              onClick={fetchAllFoodLogs}
              className="flex items-center space-x-3 w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">記錄食物</span>
              <span className="text-gray-900 font-medium ml-auto">
                {stats.foodLogDays} 天 / {stats.foodLogTotal} 次
              </span>
              <svg className="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>

            {/* Quiz Stats Button */}
            <button
              onClick={fetchAllQuizResponses}
              className="flex items-center space-x-3 w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🖥️</span>
              </div>
              <span className="text-gray-700">測一測</span>
              <span className="text-gray-900 font-medium ml-auto">
                {stats.quizDays} 天 / {stats.quizTotal} 次
              </span>
              <svg className="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>


        {/* All Shares Modal */}
        {showAllSharesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  所有學習打咭
                </h2>
                <button
                  onClick={() => setShowAllSharesModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4">
                {loadingAllShares ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {allShares.length > 0 ? (
                      <div className="space-y-3">
                        {allShares.map((share: any) => (
                          <div key={share.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                             <div className="flex justify-between items-baseline mb-2">
                               <p className="font-semibold text-sm">第 {share.day_number} 天</p>
                               <p className="text-xs text-gray-500">
                                {new Date(share.created_at).toLocaleDateString('zh-TW')}
                              </p>
                             </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{share.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">沒有學習打咭記錄</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Food Logs Modal */}
        {showFoodLogsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  所有食物記錄
                </h2>
                <button
                  onClick={() => setShowFoodLogsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4">
                {loadingFoodLogs ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {allFoodLogs.length > 0 ? (
                      <div className="space-y-4">
                        {allFoodLogs.map((log: any) => (
                          <div key={log.id} className="flex items-start space-x-4 p-3 border border-gray-200 rounded-lg">
                            <img 
                              src={log.image_url} 
                              alt="Food log" 
                              className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                            />
                            <div className="flex-grow">
                              <p className="text-xs text-gray-500 mb-2">
                                {new Date(log.created_at).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                              <ul className="space-y-1">
                                {log.food_log_items.map((item: any) => (
                                  <li key={item.id} className="text-sm text-gray-800">
                                    <span className="font-semibold">{item.name}</span>
                                    {item.portion && <span className="text-gray-600"> - {item.portion}</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">沒有食物記錄</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Quiz Results Modal */}
        {showQuizResultsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  所有測驗結果
                </h2>
                <button
                  onClick={() => setShowQuizResultsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4">
                {loadingQuizResponses ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {allQuizResponses.length > 0 ? (
                      <div className="space-y-3">
                        {allQuizResponses.map((response: any) => (
                          <div key={response.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <span className="font-semibold text-gray-800">
                              分數: {response.score}/{response.total_questions}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(response.answered_at).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">沒有測驗結果</p>
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

