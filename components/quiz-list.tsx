'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Empty } from '@/components/ui/empty';

interface Quiz {
  id: string;
  quiz_id: string;
  title: string;
  created_at: string;
  status: string;
  timer?: number;
}

export function QuizList() {
  const supabase = createClient();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setQuizzes(data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [supabase]);

  if (loading) {
    return <div className="text-center py-8">Loading quizzes...</div>;
  }

  if (quizzes.length === 0) {
    return (
      <Empty
        title="No Quizzes Yet"
        description="Create your first quiz to get started"
        action={
          <Link href="/admin/quiz/create">
            <Button>Create Quiz</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl">{quiz.title}</CardTitle>
                <CardDescription>ID: {quiz.quiz_id}</CardDescription>
              </div>
              <Badge variant={quiz.status === 'published' ? 'default' : 'secondary'}>
                {quiz.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{new Date(quiz.created_at).toLocaleDateString()}</p>
              </div>
              {quiz.timer && (
                <div>
                  <p className="text-muted-foreground">Time Limit</p>
                  <p>{quiz.timer} minutes</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Link href={`/admin/quiz/${quiz.id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
              <Link href={`/admin/quiz/${quiz.id}/results`}>
                <Button variant="outline" size="sm">
                  View Results
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
