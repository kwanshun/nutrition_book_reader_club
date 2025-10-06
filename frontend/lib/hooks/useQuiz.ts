// Quiz Fetching Hook
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Quiz } from '@/lib/types/database';

export const useQuiz = (dayNumber?: number) => {
  const [quiz, setQuiz] = useState<Quiz | Quiz[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Clear previous quiz data immediately when dayNumber changes
    setQuiz(null);
    setError(null);
    
    const fetchQuiz = async () => {
      if (dayNumber === undefined) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        if (dayNumber) {
          // Fetch quiz for specific day
          const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('day_number', dayNumber)
            .single();
          
          if (error) {
            throw error;
          }

          if (data && data.questions && typeof data.questions === 'string') {
            try {
              data.questions = JSON.parse(data.questions);
              if (data.questions.questions) {
                  data.questions = data.questions.questions;
              }
            } catch (e) {
              console.error('Failed to parse questions JSON:', e);
              throw new Error('Failed to parse questions.');
            }
          }
          setQuiz(data);
        } else {
          // Fetch all quizzes
          const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .order('day_number');
          
          if (error) {
            throw error;
          }
          
          // Parse questions for each quiz
          const parsedData = data?.map(quiz => ({
            ...quiz,
            questions: typeof quiz.questions === 'string' 
              ? JSON.parse(quiz.questions) 
              : quiz.questions
          }));
          
          setQuiz(parsedData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [dayNumber]);

  // Additional effect to clear state when dayNumber changes
  useEffect(() => {
    console.log('🔍 useQuiz: Day number changed to', dayNumber, '- clearing previous state');
    setQuiz(null);
    setError(null);
  }, [dayNumber]);

  return { quiz, loading, error };
};
