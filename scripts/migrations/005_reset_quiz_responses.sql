-- Drop existing objects if they exist
DROP FUNCTION IF EXISTS public.save_quiz_response(UUID, INTEGER, INTEGER, INTEGER);
DROP TABLE IF EXISTS public.quiz_responses;

-- Create the quiz_responses table to store user quiz attempts
CREATE TABLE public.quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answered_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES auth.users(id)
);

-- Add a unique constraint to prevent a user from submitting multiple scores for the same day.
ALTER TABLE public.quiz_responses
ADD CONSTRAINT unique_user_day UNIQUE (user_id, day_number);

-- Enable Row Level Security
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Allow users to insert their own quiz responses"
ON public.quiz_responses
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to view their own quiz responses"
ON public.quiz_responses
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own quiz responses"
ON public.quiz_responses
FOR UPDATE USING (auth.uid() = user_id);

-- Function to save a user's quiz response
CREATE OR REPLACE FUNCTION public.save_quiz_response(
    p_user_id UUID,
    p_day_number INTEGER,
    p_score INTEGER,
    p_total_questions INTEGER
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.quiz_responses (user_id, day_number, score, total_questions, answered_at)
    VALUES (p_user_id, p_day_number, p_score, p_total_questions, now())
    ON CONFLICT (user_id, day_number)
    DO UPDATE SET
        score = EXCLUDED.score,
        total_questions = EXCLUDED.total_questions,
        answered_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the authenticated role
GRANT EXECUTE ON FUNCTION public.save_quiz_response(UUID, INTEGER, INTEGER, INTEGER) TO authenticated;
