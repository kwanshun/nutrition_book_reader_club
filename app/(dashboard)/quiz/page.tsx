'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuiz } from '@/lib/hooks/useQuiz';
import { useCurrentDay } from '@/lib/hooks/useCurrentDay';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function QuizPage() {
  const router = useRouter(); // Initialize router
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { currentDay: todayDay } = useCurrentDay(); // Get today's actual day number
  
  // Use day from URL parameter, or fallback to calculated current day, or default to 1
  // But only if currentDay is available (not null)
  const day = searchParams.get('day') ? parseInt(searchParams.get('day')!) : (todayDay ?? 1);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Only call useQuiz when we have a valid day (not null)
  const { quiz, loading, error } = useQuiz(todayDay !== null ? day : undefined);
  
  // Reset quiz state when day changes
  useEffect(() => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setScore(0);
  }, [day]);

  const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newDay = event.target.value;
    router.push(`/quiz?day=${newDay}`);
  };

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      questions.forEach((question: any, index: number) => {
        if (selectedAnswers[index] === question.correct_answer) {
          correctCount++;
        }
      });
      setScore(correctCount);
      setShowResults(true);
      saveQuizResult(correctCount);
    }
  };

  const saveQuizResult = async (finalScore: number) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const resultData = {
        p_user_id: user.id,
        p_day_number: day,
        p_score: finalScore,
        p_total_questions: questions.length,
      };

      const { error } = await supabase.rpc('save_quiz_response', resultData);

      if (error) {
        throw error;
      }
      console.log('Quiz result saved successfully!');
    } catch (error: any) {
      console.error('Error saving quiz result:');
      if (error) {
        console.error('  - Message:', error.message);
        console.error('  - Details:', error.details);
        console.error('  - Code:', error.code);
      } else {
        console.error('  - An unknown error occurred.');
      }
      // Optionally, show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setScore(0);
  };

  if (loading || todayDay === null || !quiz) {
    return (
      <div>
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">載入測驗中...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div>
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">載入測驗時發生錯誤</p>
            <Link href="/content/today" className="mt-4 text-blue-600 hover:text-blue-500 block">
              返回內容頁面
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Handle both single quiz object and array of quizzes
  let quizData: { questions: any[], day_number?: number };
  
  if (Array.isArray(quiz)) {
    // If quiz is an array, find the quiz for the current day
    const dayQuiz = quiz.find((q: any) => q.day_number === day);
    quizData = dayQuiz || { questions: [], day_number: day };
  } else {
    // If quiz is a single object
    quizData = quiz as { questions: any[], day_number?: number };
  }
  
  // Handle nested questions structure
  let questions = quizData.questions || [];
  if (questions && typeof questions === 'object' && 'questions' in questions) {
    questions = questions.questions;
  }

  // Validate that the quiz data matches the expected day, but only if not loading
  if (!loading && quizData.day_number && quizData.day_number !== day) {
    return (
      <div>
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">測驗資料不匹配：期望第 {day} 天，但載入的是第 {quizData.day_number} 天</p>
            <Link href="/content/today" className="mt-4 text-blue-600 hover:text-blue-500 block">
              返回內容頁面
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (showResults) {
    return (
      <div>
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">測驗完成！</h1>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {score}/{questions.length}
            </div>
            <p className="text-gray-600 mb-6">
              正確率: {Math.round((score / questions.length) * 100)}%
            </p>
            
            <div className="space-y-3">
              <Link
                href="/content/today"
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                返回內容頁面
              </Link>
              
              <button
                onClick={resetQuiz}
                className="block w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                重新測驗
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div>
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">第 {day} 天還沒有測驗題目</p>
            <Link href="/content/today" className="mt-4 text-blue-600 hover:text-blue-500 block">
              返回內容頁面
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  // Safety check: if currentQ is undefined, reset to first question
  if (!currentQ && currentQuestion !== 0) {
    setCurrentQuestion(0);
    return null;
  }

  // If still no question, show error
  if (!currentQ) {
    return (
      <div>
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">無法載入測驗題目</p>
            <Link href="/content/today" className="mt-4 text-blue-600 hover:text-blue-500 block">
              返回內容頁面
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div key={`quiz-page-${day}`}>
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="mb-4">
          <label htmlFor="day-select" className="block text-sm font-medium text-gray-700 mb-1">
            選擇測驗日期:
          </label>
          <select
            id="day-select"
            value={day}
            onChange={handleDayChange}
            disabled={!todayDay || todayDay <= 1}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {todayDay && Array.from({ length: todayDay }, (_, i) => i + 1)
              .sort((a, b) => b - a) // Sort in descending order
              .map(d => (
                <option key={d} value={d}>
                  第 {d} 天
                </option>
            ))}
          </select>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              第 {day} 天測驗
            </span>
            <span className="text-sm text-gray-600">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            {currentQ.question}
          </h2>
          
          <div className="space-y-4">
            {currentQ.options.map((optionText: string, index: number) => {
              const answerKey = optionText.charAt(0);
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(answerKey)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedAnswers[currentQuestion] === answerKey
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span className="font-medium text-gray-900">{optionText}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一題
          </button>
          
          <button
            onClick={handleNextQuestion}
            disabled={!selectedAnswers[currentQuestion]}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === questions.length - 1 ? '完成測驗' : '下一題'}
          </button>
        </div>
      </main>
    </div>
  );
}
