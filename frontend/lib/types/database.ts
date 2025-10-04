// Database Types for Supabase Tables

export interface DailyContent {
  id: string;
  day_number: number;
  title: string;
  content: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  day_number: number;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface QuizResponse {
  id: string;
  user_id: string;
  quiz_id: string;
  question_index: number;
  answer: string;
  is_correct: boolean;
  answered_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  invite_code: string | null;
  leader_id: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'member' | 'leader';
  joined_at: string;
}

export interface TextShare {
  id: string;
  user_id: string;
  group_id: string;
  content: string;
  created_at: string;
  user?: {
    name: string;
  };
}

export interface FoodLog {
  id: string;
  user_id: string;
  group_id: string;
  image_url: string;
  detected_foods: unknown;
  user_input: string | null;
  created_at: string;
  user?: {
    name: string;
  };
}

export interface ChatMessage {
  id: string;
  group_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user?: {
    name: string;
  };
}


