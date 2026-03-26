'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
}

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  canGoPrevious,
  canGoNext,
  isLastQuestion,
}: QuestionCardProps) {
  const options = [
    { key: 'a', text: question.option_a },
    { key: 'b', text: question.option_b },
    { key: 'c', text: question.option_c },
    { key: 'd', text: question.option_d },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          Question {currentIndex + 1} of {totalQuestions}
        </CardTitle>
        <CardDescription className="text-base mt-2">{question.question}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Options */}
        <div className="grid gap-3">
          {options.map((option) => (
            <button
              key={option.key}
              onClick={() => onAnswerSelect(option.key)}
              className={`p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswer === option.key
                  ? 'border-primary bg-primary/10'
                  : 'border-muted-foreground/20 hover:border-muted-foreground/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                    selectedAnswer === option.key
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-muted-foreground'
                  }`}
                >
                  {selectedAnswer === option.key && '✓'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{option.key.toUpperCase()}.</p>
                  <p className="text-muted-foreground">{option.text}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="flex-1"
          >
            ← Previous
          </Button>
          <Button
            onClick={onNext}
            disabled={!canGoNext || selectedAnswer === null}
            className="flex-1"
          >
            {isLastQuestion ? 'Finish' : 'Next →'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
