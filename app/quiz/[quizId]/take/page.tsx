'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuiz, Question } from '@/hooks/use-quiz';
import { QuestionCard } from '@/components/question-card';
import { QuizTimer } from '@/components/quiz-timer';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function QuizTakePage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const { getQuestions, submitAnswer, loading: quizLoading } = useQuiz();

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const initQuiz = async () => {
      try {
        const sid = sessionStorage.getItem('studentId');
        const quizData = sessionStorage.getItem('quizData');

        if (!sid) {
          router.push('/join');
          return;
        }

        setStudentId(sid);

        // Get questions for the quiz
        const questionsData = await getQuestions(quizId);
        setQuestions(questionsData);

        // Parse stored quiz data
        if (quizData) {
          setQuiz(JSON.parse(quizData));
        }
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      initQuiz();
    }
  }, [quizId, getQuestions, router]);

  const handleAnswerSelect = async (answer: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questions[currentIndex].id, answer);
    setAnswers(newAnswers);

    // Submit answer immediately
    if (studentId) {
      await submitAnswer(studentId, quizId, questions[currentIndex].id, answer);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      // Make sure all answers are submitted
      sessionStorage.setItem('answers', JSON.stringify(Array.from(answers.entries())));
      router.push(`/quiz/${quizId}/results`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription>No questions found for this quiz.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = answers.size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {sessionStorage.getItem('studentName') ? `Welcome, ${sessionStorage.getItem('studentName')}!` : 'Quiz'}
          </h1>
          <p className="text-muted-foreground">
            Answer all questions. Progress: {answeredCount}/{questions.length}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Timer if quiz has one */}
            {quiz?.timer && (
              <QuizTimer
                minutes={quiz.timer}
                onTimeUp={() => {
                  handleFinish();
                }}
              />
            )}

            {/* Question */}
            <QuestionCard
              question={currentQuestion}
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              selectedAnswer={answers.get(currentQuestion.id) || null}
              onAnswerSelect={handleAnswerSelect}
              onNext={isLastQuestion ? handleFinish : handleNext}
              onPrevious={handlePrevious}
              canGoPrevious={currentIndex > 0}
              canGoNext={currentIndex < questions.length - 1}
              isLastQuestion={isLastQuestion}
            />
          </div>

          {/* Sidebar - Question Progress */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-4">
                <p className="font-semibold text-sm mb-4">Questions</p>
                <div className="grid grid-cols-4 gap-2">
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`aspect-square rounded-lg text-xs font-semibold transition-colors ${
                        index === currentIndex
                          ? 'bg-primary text-primary-foreground'
                          : answers.has(q.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-6 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-muted" />
                    <span>Unanswered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
