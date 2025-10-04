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
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        
        if (dayNumber) {
          // Fetch quiz for specific day
          const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('day_number', dayNumber)
            .single();
          
          if (error) throw error;
          
          // Parse the questions JSON if it's a string
          if (data && typeof data.questions === 'string') {
            data.questions = JSON.parse(data.questions);
          }
          
          // Handle nested questions structure: {questions: {questions: [...]}}
          // This happens when the quiz generator stores questions in a nested format
          if (data && data.questions && typeof data.questions === 'object' && 'questions' in data.questions) {
            data.questions = data.questions.questions;
          }
          
          setQuiz(data);
        } else {
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
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [dayNumber, supabase]);

  return { quiz, loading, error };
};
