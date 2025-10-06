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
    console.log('🔍 useQuiz: useEffect triggered with dayNumber:', dayNumber);
    console.log('🔍 useQuiz: dayNumber type:', typeof dayNumber);
    console.log('🔍 useQuiz: dayNumber value:', dayNumber);
    
    // Clear previous quiz data immediately when dayNumber changes
    setQuiz(null);
    setError(null);
    
    const fetchQuiz = async () => {
      try {
        console.log('🔍 useQuiz: Starting fetch for dayNumber:', dayNumber);
        setLoading(true);
        setError(null);
        
        if (dayNumber) {
          // Fetch quiz for specific day
          console.log('🔍 useQuiz: Fetching quiz for day', dayNumber);
          console.log('🔍 useQuiz: Making API call with day_number =', dayNumber);
          const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('day_number', dayNumber)
            .single();
          
          console.log('🔍 useQuiz: API response for day', dayNumber, ':', { data, error });
          
          if (error) throw error;
          
          // Parse the questions JSON if it's a string
          if (data && typeof data.questions === 'string') {
            console.log('🔍 useQuiz: Parsing string questions');
            data.questions = JSON.parse(data.questions);
          }
          
          // Handle nested questions structure: {questions: {questions: [...]}}
          // This happens when the quiz generator stores questions in a nested format
          if (data && data.questions && typeof data.questions === 'object' && 'questions' in data.questions) {
            console.log('🔍 useQuiz: Handling nested questions structure');
            data.questions = data.questions.questions;
          }
          
          console.log('🔍 useQuiz: Final quiz data for day', dayNumber, ':', data);
          console.log('🔍 useQuiz: First question:', data?.questions?.[0]?.question);
          setQuiz(data);
        } else {
          console.log('🔍 useQuiz: Fetching all quizzes');
          // Fetch all quizzes
          const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .order('day_number');
          
          if (error) throw error;
          
          // Parse questions for each quiz
          const parsedData = data?.map(quiz => ({
            ...quiz,
            questions: typeof quiz.questions === 'string' 
              ? JSON.parse(quiz.questions) 
              : quiz.questions
          }));
          
          setQuiz(parsedData);
        }
      } catch (err) {
        console.error('🔍 useQuiz: Error fetching quiz:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [dayNumber, supabase]);

  // Additional effect to clear state when dayNumber changes
  useEffect(() => {
    console.log('🔍 useQuiz: Day number changed to', dayNumber, '- clearing previous state');
    setQuiz(null);
    setError(null);
  }, [dayNumber]);

  return { quiz, loading, error };
};
