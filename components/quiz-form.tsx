'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuiz } from '@/hooks/use-quiz';

interface Question {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
}

export function QuizForm() {
  const router = useRouter();
  const { createQuiz, addQuestions, loading: quizLoading } = useQuiz();
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [timer, setTimer] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'a',
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'a',
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Quiz title is required');
      return;
    }

    if (!password.trim()) {
      setError('Quiz password is required');
      return;
    }

    if (questions.length === 0) {
      setError('At least one question is required');
      return;
    }

    // Validate all questions have required fields
    for (const q of questions) {
      if (!q.question.trim()) {
        setError('All questions must have text');
        return;
      }
      if (!q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
        setError('All options must be filled for each question');
        return;
      }
    }

    setLoading(true);

    try {
      const quiz = await createQuiz(title, password, timer ? parseInt(timer) : undefined);

      if (!quiz) {
        setError('Failed to create quiz');
        setLoading(false);
        return;
      }

      // Add questions to the quiz
      const questionsWithQuizId = questions.map((q) => ({
        ...q,
        quiz_id: quiz.id,
      }));

      const success = await addQuestions(quiz.id, questionsWithQuizId);

      if (success) {
        router.push('/admin/dashboard');
      } else {
        setError('Failed to add questions to quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quiz Details */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
          <CardDescription>Create a new quiz for your students</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field>
            <FieldLabel htmlFor="title">Quiz Title *</FieldLabel>
            <Input
              id="title"
              placeholder="e.g., Biology Chapter 5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading || quizLoading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Quiz Password *</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Students will use this to join"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || quizLoading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="timer">Time Limit (minutes)</FieldLabel>
            <Input
              id="timer"
              type="number"
              placeholder="Optional - leave blank for no time limit"
              value={timer}
              onChange={(e) => setTimer(e.target.value)}
              min="1"
              max="180"
              disabled={loading || quizLoading}
            />
          </Field>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Questions</h3>
            <p className="text-sm text-muted-foreground">Add and edit quiz questions</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddQuestion}
            disabled={loading || quizLoading}
          >
            Add Question
          </Button>
        </div>

        {questions.map((question, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Question {index + 1}</CardTitle>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveQuestion(index)}
                    disabled={loading || quizLoading}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel htmlFor={`question-${index}`}>Question Text *</FieldLabel>
                <Input
                  id={`question-${index}`}
                  placeholder="Enter the question"
                  value={question.question}
                  onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                  disabled={loading || quizLoading}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4">
                {['a', 'b', 'c', 'd'].map((option) => (
                  <Field key={option}>
                    <FieldLabel htmlFor={`option-${index}-${option}`}>
                      Option {option.toUpperCase()} *
                    </FieldLabel>
                    <Input
                      id={`option-${index}-${option}`}
                      placeholder={`Option ${option.toUpperCase()}`}
                      value={question[`option_${option}` as keyof Question]}
                      onChange={(e) =>
                        handleQuestionChange(index, `option_${option}` as keyof Question, e.target.value)
                      }
                      disabled={loading || quizLoading}
                    />
                  </Field>
                ))}
              </div>

              <Field>
                <FieldLabel htmlFor={`correct-${index}`}>Correct Answer *</FieldLabel>
                <select
                  id={`correct-${index}`}
                  value={question.correct_answer}
                  onChange={(e) =>
                    handleQuestionChange(
                      index,
                      'correct_answer',
                      e.target.value as 'a' | 'b' | 'c' | 'd'
                    )
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  disabled={loading || quizLoading}
                >
                  <option value="a">Option A</option>
                  <option value="b">Option B</option>
                  <option value="c">Option C</option>
                  <option value="d">Option D</option>
                </select>
              </Field>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-6">
        <Button type="submit" size="lg" disabled={loading || quizLoading}>
          {loading || quizLoading ? 'Creating Quiz...' : 'Create Quiz'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.back()}
          disabled={loading || quizLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
