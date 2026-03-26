'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuiz } from '@/hooks/use-quiz';

export default function QuizEntryPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const supabase = createClient();
  const { getQuiz, registerStudent, loading: quizLoading } = useQuiz();

  const [quiz, setQuiz] = useState<any>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingQuiz, setFetchingQuiz] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await getQuiz(quizId);
        if (!quizData) {
          setError('Quiz not found');
        } else {
          setQuiz(quizData);
        }
      } finally {
        setFetchingQuiz(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId, getQuiz]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    // Verify password
    if (password !== quiz.password) {
      setError('Incorrect quiz password');
      return;
    }

    setLoading(true);

    try {
      const student = await registerStudent(quiz.id, name);

      if (student) {
        // Store student ID and quiz ID in session storage for the quiz
        sessionStorage.setItem('studentId', student.id);
        sessionStorage.setItem('quizId', quiz.id);
        sessionStorage.setItem('studentName', name);
        
        router.push(`/quiz/${quiz.id}/take`);
      } else {
        setError('Failed to register for quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Quiz Not Found</CardTitle>
            <CardDescription>The quiz ID you entered does not exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/join')} className="w-full">
              Try Another Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          <CardDescription>Enter your details to begin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Field>
              <FieldLabel htmlFor="name">Your Name</FieldLabel>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading || quizLoading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Quiz Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || quizLoading}
              />
            </Field>

            <Button type="submit" className="w-full" disabled={loading || quizLoading}>
              {loading || quizLoading ? 'Starting Quiz...' : 'Start Quiz'}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-1">Quiz Information:</p>
            {quiz.timer && <p>Time Limit: {quiz.timer} minutes</p>}
            <p>Questions: Fetching...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
