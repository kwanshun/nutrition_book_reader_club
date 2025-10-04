'use client';

import { useEffect, useState } from 'react';

interface UserProfile {
  user_id: string;
  email: string;
  display_name: string;
  profile_exists: boolean;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (displayName: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('無法載入個人資料');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (displayName: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const data = await response.json();
      setProfile(data);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('更新個人資料失敗，請稍後再試');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    await fetchProfile();
  };

  // Initial load
  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, updateProfile, refreshProfile };
}
