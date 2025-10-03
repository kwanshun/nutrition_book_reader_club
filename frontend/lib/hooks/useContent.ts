// Content Fetching Hook
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DailyContent } from '@/lib/types/database';

export const useContent = (dayNumber?: number) => {
  const [content, setContent] = useState<DailyContent | DailyContent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        if (dayNumber) {
          // Fetch specific day
          const { data, error } = await supabase
            .from('daily_content')
            .select('*')
            .eq('day_number', dayNumber)
            .single();
          
          if (error) throw error;
          setContent(data);
        } else {
          // Fetch all days
          const { data, error } = await supabase
            .from('daily_content')
            .select('*')
            .order('day_number');
          
          if (error) throw error;
          setContent(data);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [dayNumber, supabase]);

  return { content, loading, error };
};


