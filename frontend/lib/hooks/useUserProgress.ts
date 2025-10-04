'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface DayActivity {
  date: string; // YYYY-MM-DD format
  hasQuiz: boolean;
  quizCount: number;
  hasShare: boolean;
  shareCount: number;
  hasFoodLog: boolean;
  foodLogCount: number;
}

export interface ProgressStats {
  quizDays: number;
  quizTotal: number;
  shareDays: number;
  shareTotal: number;
  foodLogDays: number;
  foodLogTotal: number;
}

export function useUserProgress() {
  const [activities, setActivities] = useState<DayActivity[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    quizDays: 0,
    quizTotal: 0,
    shareDays: 0,
    shareTotal: 0,
    foodLogDays: 0,
    foodLogTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Fetch quiz responses
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_responses')
        .select('answered_at')
        .eq('user_id', user.id);

      if (quizError) throw quizError;

      // Fetch text shares
      const { data: shareData, error: shareError } = await supabase
        .from('text_shares')
        .select('created_at, day_number')
        .eq('user_id', user.id);

      if (shareError) throw shareError;

      // Fetch food logs
      const { data: foodData, error: foodError } = await supabase
        .from('food_logs')
        .select('created_at')
        .eq('user_id', user.id);

      if (foodError) throw foodError;

      // Process data into daily activities
      const activityMap = new Map<string, DayActivity>();

      // Process quiz responses
      quizData?.forEach((item) => {
        const date = new Date(item.answered_at).toISOString().split('T')[0];
        const existing = activityMap.get(date) || {
          date,
          hasQuiz: false,
          quizCount: 0,
          hasShare: false,
          shareCount: 0,
          hasFoodLog: false,
          foodLogCount: 0,
        };
        existing.hasQuiz = true;
        existing.quizCount++;
        activityMap.set(date, existing);
      });

      // Process text shares - map to lesson day numbers instead of calendar dates
      shareData?.forEach((item) => {
        // For shares, use day_number to determine which calendar day to show the indicator
        // This assumes the program starts on the 1st of the current month
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        // Map lesson day_number to calendar date (e.g., Day 1 -> Oct 1, Day 3 -> Oct 3)
        // Format date string manually to avoid timezone issues
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(item.day_number).padStart(2, '0')}`;
        
        const existing = activityMap.get(date) || {
          date,
          hasQuiz: false,
          quizCount: 0,
          hasShare: false,
          shareCount: 0,
          hasFoodLog: false,
          foodLogCount: 0,
        };
        existing.hasShare = true;
        existing.shareCount++;
        activityMap.set(date, existing);
      });

      // Process food logs
      foodData?.forEach((item) => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        const existing = activityMap.get(date) || {
          date,
          hasQuiz: false,
          quizCount: 0,
          hasShare: false,
          shareCount: 0,
          hasFoodLog: false,
          foodLogCount: 0,
        };
        existing.hasFoodLog = true;
        existing.foodLogCount++;
        activityMap.set(date, existing);
      });

      const activitiesArray = Array.from(activityMap.values());
      setActivities(activitiesArray);

      // Calculate stats
      const quizDays = new Set(quizData?.map(q => new Date(q.answered_at).toISOString().split('T')[0])).size;
      const shareDays = new Set(shareData?.map(s => s.day_number)).size; // Count unique day_numbers instead of dates
      const foodLogDays = new Set(foodData?.map(f => new Date(f.created_at).toISOString().split('T')[0])).size;

      setStats({
        quizDays,
        quizTotal: quizData?.length || 0,
        shareDays,
        shareTotal: shareData?.length || 0,
        foodLogDays,
        foodLogTotal: foodData?.length || 0,
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err instanceof Error ? err.message : '載入進度失敗');
    } finally {
      setLoading(false);
    }
  };

  return { activities, stats, loading, error, refetch: fetchUserProgress };
}

