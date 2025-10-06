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
        supabase.from('text_shares').select('created_at').eq('user_id', user.id),
        supabase.from('food_logs').select('created_at').eq('user_id', user.id),
      ]);

      if (quizResponsesError) throw new Error(`Quiz Responses Error: ${quizResponsesError.message}`);
      if (textSharesError) throw new Error(`Text Shares Error: ${textSharesError.message}`);
      if (foodLogsError) throw new Error(`Food Logs Error: ${foodLogsError.message}`);

      const activityMap = new Map<string, DayActivity>();

      // Helper to get the calendar date from a timestamp
      const getCalendarDate = (timestamp: string) => new Date(timestamp).toISOString().split('T')[0];

      // Process quiz responses
      quizResponses?.forEach(item => {
        const date = getCalendarDate(item.answered_at);
        if (!activityMap.has(date)) {
          activityMap.set(date, { date, share: false, foodLog: false, quiz: true });
        } else {
          activityMap.get(date)!.quiz = true;
        }
      });

      // Process text shares
      textShares?.forEach(item => {
        const date = getCalendarDate(item.created_at);
        if (!activityMap.has(date)) {
          activityMap.set(date, { date, share: true, foodLog: false, quiz: false });
        } else {
          activityMap.get(date)!.share = true;
        }
      });

      // Process food logs
      foodLogs?.forEach(item => {
        const date = getCalendarDate(item.created_at);
        if (!activityMap.has(date)) {
          activityMap.set(date, { date, share: false, foodLog: true, quiz: false });
        } else {
          activityMap.get(date)!.foodLog = true;
        }
      });

      const activities = Array.from(activityMap.values());
      
      // Calculate stats based on unique days
      const shareDays = new Set(textShares?.map(item => getCalendarDate(item.created_at))).size;
      const foodLogDays = new Set(foodLogs?.map(item => getCalendarDate(item.created_at))).size;
      const quizDays = new Set(quizResponses?.map(item => item.day_number)).size; // Count unique day_number for quizzes

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

