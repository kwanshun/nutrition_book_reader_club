import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TextShare } from '@/lib/types/database';

interface UseTextSharesReturn {
  shares: TextShare[];
  loading: boolean;
  error: string | null;
  hasSharedToday: boolean;
  createShare: (content: string, groupId?: string) => Promise<boolean>;
  refreshShares: () => Promise<void>;
}

export function useTextShares(userId?: string, groupId?: string): UseTextSharesReturn {
  const [shares, setShares] = useState<TextShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSharedToday, setHasSharedToday] = useState(false);

  const supabase = createClient();

  // Check if user has shared today
  const checkTodayShare = async () => {
    if (!userId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('text_shares')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .limit(1);

      if (error) {
        console.error('Error checking today share:', error);
        return;
      }

      setHasSharedToday(data && data.length > 0);
    } catch (error) {
      console.error('Error checking today share:', error);
    }
  };

  // Fetch shares
  const fetchShares = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Use API route instead of direct Supabase client
      const params = new URLSearchParams();
      if (groupId) {
        params.append('group_id', groupId);
      }
      params.append('limit', '20');

      const response = await fetch(`/api/shares?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shares');
      }

      const data = await response.json();
      setShares(data || []);
    } catch (error) {
      console.error('Error fetching shares:', error);
      setError('無法載入分享內容');
    } finally {
      setLoading(false);
    }
  };

  // Create a new share
  const createShare = async (content: string, targetGroupId?: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      setLoading(true);
      setError(null);

      // Use API route instead of direct Supabase client
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          group_id: targetGroupId || groupId || userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create share');
      }

      const data = await response.json();

      // Add to local state
      setShares(prev => [data, ...prev]);
      setHasSharedToday(true);
      return true;
    } catch (error) {
      console.error('Error creating share:', error);
      setError('分享失敗，請稍後再試');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Refresh shares
  const refreshShares = async () => {
    await fetchShares();
    await checkTodayShare();
  };

  // Initial load
  useEffect(() => {
    if (userId) {
      fetchShares();
      checkTodayShare();
    }
  }, [userId, groupId]);

  return {
    shares,
    loading,
    error,
    hasSharedToday,
    createShare,
    refreshShares
  };
}
