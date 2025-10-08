'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

export interface DayActivity {
  date: string;
  share: boolean;
  foodLog: boolean;
  quiz: boolean;
}

export interface ProgressStats {
  shareDays: number;
  foodLogDays: number;
  foodLogTotal: number;
  quizDays: number;
  quizTotal: number;
}

export function useUserProgress() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<DayActivity[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    shareDays: 0,
    foodLogDays: 0,
    foodLogTotal: 0,
    quizDays: 0,
    quizTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      
      const [
        { data: quizResponses, error: quizResponsesError },
        { data: textShares, error: textSharesError },
        { data: foodLogs, error: foodLogsError },
      ] = await Promise.all([
        supabase.from('quiz_responses').select('answered_at, day_number').eq('user_id', user.id),
        supabase.from('text_shares').select('created_at, day_number').eq('user_id', user.id),
        supabase.from('food_logs').select('created_at').eq('user_id', user.id),
      ]);

      if (quizResponsesError) throw new Error(`Quiz Responses Error: ${quizResponsesError.message}`);
      if (textSharesError) throw new Error(`Text Shares Error: ${textSharesError.message}`);
      if (foodLogsError) throw new Error(`Food Logs Error: ${foodLogsError.message}`);

      const activityMap = new Map<string, DayActivity>();

      // Helper to get the calendar date from a timestamp
      const getCalendarDate = (timestamp: string) => new Date(timestamp).toISOString().split('T')[0];

      // Process quiz responses - map Program Day to calendar date
      quizResponses?.forEach(item => {
        try {
          // Calculate calendar date from Program Day
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          const programDay = item.day_number;
          
          if (!programDay || programDay < 1 || programDay > 31) {
            console.warn('Invalid program day:', programDay);
            return;
          }
          
          const calendarDate = new Date(currentYear, currentMonth, programDay);
          const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(programDay).padStart(2, '0')}`;
          
          console.log(`Quiz response: Day ${programDay} -> Calendar Date ${date}`);
          
          if (!activityMap.has(date)) {
            activityMap.set(date, { date, share: false, foodLog: false, quiz: true });
          } else {
            activityMap.get(date)!.quiz = true;
          }
        } catch (error) {
          console.error('Error processing quiz response:', error, item);
        }
      });

      // Process text shares - map Program Day to calendar date
      textShares?.forEach(item => {
        try {
          // Calculate calendar date from Program Day
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          const programDay = item.day_number;
          
          if (!programDay || programDay < 1 || programDay > 31) {
            console.warn('Invalid program day:', programDay);
            return;
          }
          
          const calendarDate = new Date(currentYear, currentMonth, programDay);
          const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(programDay).padStart(2, '0')}`;
          
          console.log(`Text share: Day ${programDay} -> Calendar Date ${date}`);
          
          if (!activityMap.has(date)) {
            activityMap.set(date, { date, share: true, foodLog: false, quiz: false });
          } else {
            activityMap.get(date)!.share = true;
          }
        } catch (error) {
          console.error('Error processing text share:', error, item);
        }
      });

      // Process food logs - map Program Day to calendar date (same as text shares)
      foodLogs?.forEach(item => {
        try {
          // Calculate calendar date from Program Day using created_at timestamp
          const logDate = new Date(item.created_at);
          const currentMonth = logDate.getMonth();
          const currentYear = logDate.getFullYear();
          const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
          const daysSinceStart = Math.floor((logDate.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24));
          const programDay = Math.min(daysSinceStart + 1, 21);
          
          if (!programDay || programDay < 1 || programDay > 31) {
            console.warn('Invalid program day for food log:', programDay);
            return;
          }
          
          const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(programDay).padStart(2, '0')}`;
          
          console.log(`Food log: ${item.created_at} -> Program Day ${programDay} -> Calendar Date ${date}`);
          
          if (!activityMap.has(date)) {
            activityMap.set(date, { date, share: false, foodLog: true, quiz: false });
          } else {
            activityMap.get(date)!.foodLog = true;
          }
        } catch (error) {
          console.error('Error processing food log:', error, item);
        }
      });

      const activities = Array.from(activityMap.values());
      
      // Calculate stats based on unique days
      const shareDays = new Set(textShares?.map(item => {
        try {
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          const programDay = item.day_number;
          
          if (!programDay || programDay < 1 || programDay > 31) {
            return null;
          }
          
          const calendarDate = new Date(currentYear, currentMonth, programDay);
          return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(programDay).padStart(2, '0')}`;
        } catch (error) {
          console.error('Error calculating share day:', error, item);
          return null;
        }
      }).filter(Boolean)).size;
      
      const foodLogDays = new Set(foodLogs?.map(item => {
        try {
          // Calculate calendar date from Program Day using created_at timestamp
          const logDate = new Date(item.created_at);
          const currentMonth = logDate.getMonth();
          const currentYear = logDate.getFullYear();
          const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
          const daysSinceStart = Math.floor((logDate.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24));
          const programDay = Math.min(daysSinceStart + 1, 21);
          
          if (!programDay || programDay < 1 || programDay > 31) {
            return null;
          }
          
          return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(programDay).padStart(2, '0')}`;
        } catch (error) {
          console.error('Error calculating food log day:', error, item);
          return null;
        }
      }).filter(Boolean)).size;
      
      const quizDays = new Set(quizResponses?.map(item => {
        try {
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          const programDay = item.day_number;
          
          if (!programDay || programDay < 1 || programDay > 31) {
            return null;
          }
          
          const calendarDate = new Date(currentYear, currentMonth, programDay);
          return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(programDay).padStart(2, '0')}`;
        } catch (error) {
          console.error('Error calculating quiz day:', error, item);
          return null;
        }
      }).filter(Boolean)).size;

      setStats({
        shareDays,
        foodLogDays,
        foodLogTotal: foodLogs?.length || 0, // foodLogTotal can remain
        quizDays,
        quizTotal: quizResponses?.length || 0, // quizTotal can remain
      });
      
      setActivities(activities);
    } catch (err: any) {
      const errorMsg = err.message;
      console.error('Error fetching user progress:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { activities, stats, loading, error, refreshProgress: fetchProgress };
}

