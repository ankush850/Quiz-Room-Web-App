'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Quiz {
  id: string;
  quiz_id: string;
  title: string;
  password: string;
  created_by: string;
  created_at: string;
  timer?: number;
  status: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  created_at: string;
}

export interface Student {
  id: string;
  quiz_id: string;
  name: string;
  joined_at: string;
}

export interface Answer {
  id: string;
  student_id: string;
  quiz_id: string;
  question_id: string;
  selected_answer: string;
  created_at: string;
}

export interface Result {
  id: string;
  student_id: string;
  quiz_id: string;
  score: number;
  submitted_at: string;
}

export function useQuiz() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new quiz
  const createQuiz = useCallback(
    async (title: string, password: string, timer?: number): Promise<Quiz | null> => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error: err } = await supabase
          .from('quizzes')
          .insert([
            {
              quiz_id: generateQuizId(),
              title,
              password,
              created_by: user.id,
              timer,
              status: 'draft',
            },
          ])
          .select()
          .single();

        if (err) throw err;
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create quiz');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Get quiz by ID
  const getQuiz = useCallback(
    async (quizId: string): Promise<Quiz | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('quizzes')
          .select('*')
          .eq('quiz_id', quizId)
          .single();

        if (err) throw err;
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quiz');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Add questions to quiz
  const addQuestions = useCallback(
    async (quizId: string, questions: Omit<Question, 'id' | 'created_at'>[]): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const { error: err } = await supabase.from('questions').insert(questions);
        if (err) throw err;
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add questions');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Get questions for a quiz
  const getQuestions = useCallback(
    async (quizId: string): Promise<Question[]> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('created_at', { ascending: true });

        if (err) throw err;
        return data || [];
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch questions');
        return [];
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Register a student
  const registerStudent = useCallback(
    async (quizId: string, name: string): Promise<Student | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('students')
          .insert([{ quiz_id: quizId, name }])
          .select()
          .single();

        if (err) throw err;
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to register student');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Submit an answer
  const submitAnswer = useCallback(
    async (studentId: string, quizId: string, questionId: string, answer: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const { error: err } = await supabase.from('answers').insert([
          {
            student_id: studentId,
            quiz_id: quizId,
            question_id: questionId,
            selected_answer: answer,
          },
        ]);

        if (err) throw err;
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit answer');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Get student answers
  const getStudentAnswers = useCallback(
    async (studentId: string): Promise<Answer[]> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('answers')
          .select('*')
          .eq('student_id', studentId);

        if (err) throw err;
        return data || [];
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch answers');
        return [];
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Submit results
  const submitResults = useCallback(
    async (studentId: string, quizId: string, score: number): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const { error: err } = await supabase.from('results').insert([
          {
            student_id: studentId,
            quiz_id: quizId,
            score,
          },
        ]);

        if (err) throw err;
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit results');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  return {
    loading,
    error,
    createQuiz,
    getQuiz,
    addQuestions,
    getQuestions,
    registerStudent,
    submitAnswer,
    getStudentAnswers,
    submitResults,
  };
}

// Helper function to generate quiz ID
function generateQuizId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
