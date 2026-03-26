-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id VARCHAR(8) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  timer INTEGER,
  status VARCHAR(50) DEFAULT 'draft',
  CONSTRAINT quiz_id_length CHECK (LENGTH(quiz_id) = 8)
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer VARCHAR(1) NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_answer VARCHAR(1) NOT NULL CHECK (selected_answer IN ('a', 'b', 'c', 'd')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, question_id)
);

-- Create results table
CREATE TABLE IF NOT EXISTS public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON public.quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_quizzes_quiz_id ON public.quizzes(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON public.questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_students_quiz_id ON public.students(quiz_id);
CREATE INDEX IF NOT EXISTS idx_answers_student_id ON public.answers(student_id);
CREATE INDEX IF NOT EXISTS idx_answers_quiz_id ON public.answers(quiz_id);
CREATE INDEX IF NOT EXISTS idx_results_student_id ON public.results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_quiz_id ON public.results(quiz_id);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quizzes - allow all operations for authenticated users
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users"
  ON public.quizzes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for questions
CREATE POLICY IF NOT EXISTS "Enable all for questions"
  ON public.questions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for students
CREATE POLICY IF NOT EXISTS "Enable all for students"
  ON public.students
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for answers
CREATE POLICY IF NOT EXISTS "Enable all for answers"
  ON public.answers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for results
CREATE POLICY IF NOT EXISTS "Enable all for results"
  ON public.results
  FOR ALL
  USING (true)
  WITH CHECK (true);
