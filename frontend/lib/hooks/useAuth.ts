// Authentication Hook
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email: email.trim().toLowerCase() });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      console.log('Login response:', { data, error });
      
      return { data, error };
    } catch (err) {
      console.error('Login error:', err);
      return { data: null, error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting signup with:', { email: email.trim().toLowerCase() });
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          // Temporarily disable email confirmation for development
          emailRedirectTo: undefined,
        }
      });
      
      console.log('Signup response:', { data, error });
      
      return { data, error };
    } catch (err) {
      console.error('Signup error:', err);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      return { error };
    } catch (err) {
      console.error('Resend confirmation error:', err);
      return { error: err };
    }
  };

  const confirmEmail = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token,
        type: 'email'
      });
      return { data, error };
    } catch (err) {
      console.error('Confirm email error:', err);
      return { data: null, error: err };
    }
  };

  return { user, loading, signIn, signUp, signOut, resendConfirmation, confirmEmail };
};


