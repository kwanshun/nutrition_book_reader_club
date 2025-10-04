'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { useQuiz } from '@/lib/hooks/useQuiz';
import Link from 'next/link';

export default function QuizPage() {
  const searchParams = useSearchParams();
  const day = searchParams.get('day') ? parseInt(searchParams.get('day')!) : 1;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  
  const { quiz, loading, error } = useQuiz(day);

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < (quiz as any)?.questions.length - 1) {
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

  if (loading) {
    return (
      <div>
        <DashboardHeader period={21} />
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
        <DashboardHeader period={21} />
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

  const quizData = quiz as { questions: any[] };
  const questions = quizData.questions || [];

  if (showResults) {
    return (
      <div>
        <DashboardHeader period={21} />
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
        <DashboardHeader period={21} />
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
        <DashboardHeader period={21} />
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
    <div>
      <DashboardHeader period={21} />
      <main className="max-w-md mx-auto px-4 py-6">
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
          
          <div className="space-y-3">
            {Object.entries(currentQ.options).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleAnswerSelect(key)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedAnswers[currentQuestion] === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium text-gray-900">
                  {key}. {value}
                </span>
              </button>
            ))}
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
