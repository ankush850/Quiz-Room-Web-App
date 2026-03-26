'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuiz, Question } from '@/hooks/use-quiz';
import { calculateScore, getGrade } from '@/lib/quiz-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function QuizResultsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const { getQuestions, submitResults, loading: quizLoading } = useQuiz();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<{ score: number; percentage: number } | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const sid = sessionStorage.getItem('studentId');
        const name = sessionStorage.getItem('studentName');
        const quizData = sessionStorage.getItem('quizData');
        const answersData = sessionStorage.getItem('answers');

        if (!sid) {
          router.push('/join');
          return;
        }

        setStudentId(sid);
        setStudentName(name || 'Student');

        if (quizData) {
          const data = JSON.parse(quizData);
          setQuizTitle(data.title || 'Quiz');
        }

        // Load questions
        const questionsData = await getQuestions(quizId);
        setQuestions(questionsData);

        // Load answers
        if (answersData) {
          const answersArray = JSON.parse(answersData);
          const answersMap = new Map(answersArray);
          setAnswers(answersMap);

          // Calculate score
          const questionsWithAnswers = questionsData.map((q) => ({
            question_id: q.id,
            correct_answer: q.correct_answer,
            selected_answer: answersMap.get(q.id) || '',
          }));

          const calcScore = calculateScore(questionsWithAnswers, questionsData.length);
          setScore(calcScore);

          // Submit results
          if (!submitted && sid) {
            await submitResults(sid, quizId, calcScore.score);
            setSubmitted(true);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      loadResults();
    }
  }, [quizId, getQuestions, submitResults, router, submitted]);

  const handleNewQuiz = () => {
    // Clear session storage and go to home
    sessionStorage.clear();
    router.push('/join');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg">Calculating results...</p>
        </div>
      </div>
    );
  }

  const grade = score ? getGrade(score.percentage) : 'N/A';
  const questionsAnswered = answers.size;
  const questionsSkipped = questions.length - questionsAnswered;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Quiz Complete!</h1>
          <p className="text-xl text-muted-foreground">
            Great job, <span className="font-semibold">{studentName}</span>!
          </p>
        </div>

        {/* Main Score Card */}
        {score && (
          <Card className="mb-8 shadow-lg border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-3 gap-6 text-center">
                {/* Score */}
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm font-medium">SCORE</p>
                  <p className="text-4xl font-bold">{score.score}</p>
                  <p className="text-xs text-muted-foreground">out of {questions.length}</p>
                </div>

                {/* Percentage */}
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm font-medium">PERCENTAGE</p>
                  <p className="text-4xl font-bold">{Math.round(score.percentage)}%</p>
                  <div className="w-full bg-muted rounded-full h-2 mt-4">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${score.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Grade */}
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm font-medium">GRADE</p>
                  <Badge variant="default" className="text-3xl py-2 px-6 w-fit mx-auto">
                    {grade}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quiz Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Questions Answered</p>
                <p className="text-2xl font-bold">{questionsAnswered}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Questions Skipped</p>
                <p className="text-2xl font-bold text-amber-600">{questionsSkipped}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer Review */}
        {questions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Answer Review</CardTitle>
              <CardDescription>See which questions you got right and wrong</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {questions.map((question, index) => {
                  const studentAnswer = answers.get(question.id);
                  const isCorrect = studentAnswer === question.correct_answer;
                  const isUnanswered = !studentAnswer;

                  return (
                    <div
                      key={question.id}
                      className={`p-4 rounded-lg border ${
                        isUnanswered
                          ? 'bg-amber-50 border-amber-200 dark:bg-amber-900 dark:border-amber-700'
                          : isCorrect
                            ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700'
                            : 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm">
                          Question {index + 1}: {question.question}
                        </p>
                        {isUnanswered && (
                          <Badge variant="secondary" className="bg-amber-200">
                            Unanswered
                          </Badge>
                        )}
                        {!isUnanswered && isCorrect && (
                          <Badge className="bg-green-600">Correct</Badge>
                        )}
                        {!isUnanswered && !isCorrect && (
                          <Badge variant="destructive">Incorrect</Badge>
                        )}
                      </div>
                      {!isUnanswered && (
                        <div className="text-xs space-y-1">
                          <p>
                            Your answer: <span className="font-semibold">{studentAnswer?.toUpperCase()}</span>
                          </p>
                          {!isCorrect && (
                            <p className="text-green-700 dark:text-green-300">
                              Correct answer: <span className="font-semibold">{question.correct_answer.toUpperCase()}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleNewQuiz} className="flex-1" size="lg">
            Take Another Quiz
          </Button>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
