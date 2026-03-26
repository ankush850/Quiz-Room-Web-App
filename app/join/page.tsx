'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function JoinQuizPage() {
  const router = useRouter();
  const [quizId, setQuizId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!quizId.trim()) {
      setError('Quiz ID is required');
      return;
    }

    setLoading(true);

    try {
      // Navigate to the quiz entry page with the quiz ID
      router.push(`/quiz/${quizId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold">Quiz Room</CardTitle>
          <CardDescription>Join a Quiz</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Field>
              <FieldLabel htmlFor="quiz-id">Quiz ID</FieldLabel>
              <Input
                id="quiz-id"
                placeholder="Enter 8-character quiz ID"
                value={quizId}
                onChange={(e) => setQuizId(e.target.value.toUpperCase())}
                maxLength={8}
                required
                disabled={loading}
                className="text-center text-lg tracking-widest"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Ask your instructor for the quiz ID
              </p>
            </Field>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Joining...' : 'Continue'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline font-medium">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
